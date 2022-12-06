import tritonclient.grpc as grpcclient
import os
import nibabel as nib
import numpy as np
import db_utils
import yaml
import pymongo
import datetime
import SimpleITK as sitk
import cv2

config = yaml.load(open('config.yaml', 'r'), Loader=yaml.FullLoader)


upload_folder = config.get('upload_folder', '/tmp')

# Create the inference context for the model.
triton_configs = config.get('triton_configs', {})
triton_model_name = triton_configs.get('triton_model_name', 'unet')
triton_model_version = str(triton_configs.get('triton_model_version', 1))

triton_host = triton_configs.get('triton_host', 'localhost')
triton_port = triton_configs.get('triton_port', 8000)

triton_client = grpcclient.InferenceServerClient(url=f'{triton_host}:{triton_port}', verbose=False)
print('Starting inference service')
print('Model metadata:')
print(triton_client.get_model_metadata(model_name=triton_model_name, model_version=triton_model_version))

# mongo 
mongo_configs = config.get('mongo_configs', {})
mongo_url = mongo_configs.get('mongo_host', 'localhost')
mongo_port = mongo_configs.get('mongo_port', 27017)
mongo_db = mongo_configs.get('mongo_db', 'brain_tumor')
mongo_collection = mongo_configs.get('mongo_collection', 'predictions')
mongo_user = mongo_configs.get('mongo_user', 'user')
mongo_password = mongo_configs.get('mongo_password', 'password')

mongo_client = pymongo.MongoClient(mongo_url, int(mongo_port), username=mongo_user, password=mongo_password)
mongo_db = mongo_client[mongo_db]
mongo_col = mongo_db[mongo_collection]

def make_pngs(payload_folder):
    nii_files = os.listdir(payload_folder)
    nii_files = [os.path.join(payload_folder, f) for f in nii_files if f.endswith('.nii.gz')]
    for nii_file in nii_files:
        img = sitk.ReadImage(nii_file)
        img_array = sitk.GetArrayFromImage(img)
        img_array = np.rot90(img_array, axes=(1, 0), k=2)
        if 'prediction' not in nii_file:
            # low byte and high byte
            img_array1 = img_array // 256
            img_array2 = img_array % 256
            img_array = np.stack([img_array2, img_array1, np.zeros_like(img_array1)], axis=-1)
        else:
            img_array = np.stack([img_array, img_array, img_array], axis=-1)
        # concat and save single png
        img_array = np.concatenate(img_array, axis=0)
        # save png
        cv2.imwrite(nii_file.replace('.nii.gz', '.png'), img_array)


def get_img(payload_folder, nii_files):
    flair_path = os.path.join(payload_folder, [f for f in nii_files if 'flair' in f][0])
    t1_path = os.path.join(payload_folder, [f for f in nii_files if 't1' in f][0])
    t1ce_path = os.path.join(payload_folder, [f for f in nii_files if 't1ce' in f][0])
    t2_path = os.path.join(payload_folder, [f for f in nii_files if 't2' in f][0])
    # read
    img_flair = nib.load(flair_path).get_fdata()
    img_t1 = nib.load(t1_path).get_fdata()
    img_t1ce = nib.load(t1ce_path).get_fdata()
    img_t2 = nib.load(t2_path).get_fdata()
    affine = nib.load(flair_path).affine
    # normalize
    img_flair = (img_flair - img_flair.mean()) / img_flair.std()
    img_t1 = (img_t1 - img_t1.mean()) / img_t1.std()
    img_t1ce = (img_t1ce - img_t1ce.mean()) / img_t1ce.std()
    img_t2 = (img_t2 - img_t2.mean()) / img_t2.std()
    # concatenate
    img = np.stack([img_flair, img_t1, img_t1ce, img_t2], axis=0)
    # transpose
    img = np.transpose(img, (3, 0, 1, 2))
    # pad
    shape = img.shape
    img = np.pad(img, ((0, 0), (0, 0), (0, 256 - img.shape[2]), (0, 256 - img.shape[3])), 'constant')
    return img, affine, shape

def run_inference(payload_folder, job_id):
    nii_files = os.listdir(payload_folder)
     # get image
    img, affine, shape = get_img(payload_folder, nii_files)
    db_utils.update_record(mongo_col, job_id, {'status': 'image_prepared'})
    print('Image prepared')
    # Run inference
    pred_imgs = []
    for i in range(img.shape[0]):
        inputs = [
            grpcclient.InferInput('input', [4, 256, 256], "FP32"),
        ]
        inputs[0].set_data_from_numpy(img[i].astype(np.float32))
        outputs = [
            grpcclient.InferRequestedOutput('output')
        ]
        # run inference in same thread
        response = triton_client.infer(triton_model_name, inputs, outputs=outputs, model_version=triton_model_version)
        pred_img = response.as_numpy('output')
        pred_imgs.append(pred_img)
        db_utils.update_record(mongo_col, job_id, {'progress': i / img.shape[0] * 100})
    print('Inference done')
    db_utils.update_record(mongo_col, job_id, {'status': 'inference_done'})

    pred_img = np.stack(pred_imgs)
    pred_img = np.squeeze(pred_img)
    pred_img = np.argmax(pred_img, axis=1)
    print("Prediction shape: ", pred_img.shape)
    # depad
    pred_img = pred_img[:, :shape[2], :shape[3]]
    # transpose
    pred_img = np.transpose(pred_img, (1, 2, 0))
    # save prediction
    pred_img = nib.Nifti1Image(pred_img.astype('uint8'), affine)
    pred_img_path = os.path.join(payload_folder, 'prediction.nii.gz')
    nib.save(pred_img, pred_img_path)
    # save all images in png format
    make_pngs(payload_folder)
    db_utils.update_record(mongo_col, job_id, {'predictedAt': datetime.datetime.utcnow(), 'status': 'Completed', 'payload': payload_folder, 'imgShape': shape[2:]})

    return pred_img_path

def run_inference_on_zip(zip_file, job_id):
    # unzip file
    unzipped_folder = zip_file.replace('.zip', '')
    os.system(f"cd {upload_folder} && unzip {zip_file} -d {unzipped_folder} && rm {zip_file} && cd -")
    db_utils.update_record(mongo_col, job_id, {'status': 'unzipped'})
    # get all files in unzipped folder
    unzipped_folder_path = os.path.join(upload_folder, unzipped_folder)
    files = os.listdir(unzipped_folder_path)
    # run inference
    return run_inference(payload_folder, job_id)
   






