This is a simple project for training a DL model on big data and then serving using docker and triton inference server.

# Dataset Description
The data used is the BRATS2021 dataset. It has 4 modalities: T1, T1c, T2 and FLAIR. The task is to segment the tumor from the brain. You can refer https://www.rsna.org/education/ai-resources-and-training/ai-image-challenge/brain-tumor-ai-challenge-2021 for more details.

In short, the data has 4 MRI sequences for each patient. We can use all 4 to predict 3 classes (enhancing tumour, edema and non-enchancing tumour). Each sequence is in 3 dimensions:
- axial (155)
- coronal (240)
- sagittal (240)
We use a 2D model (U-Net) to predict the 3 classes for each slice. So, the input to the model is 4x240x240 and the output is 4x240x240 (including background). We could have
gone with a 3D model but that would have been very computationally expensive.

# Requirements
- Docker
- Nvidia-docker (optional)
- Python 3.8+
- Pytorch 1.8+
- Nvidia GPU (optional)

# Usage
## Training
- Download the Brats2021 dataset from `https://www.synapse.org/#!Synapse:syn25829067/wiki/612109`
- Extract the dataset 
- Use train.ipynb to train the model
- Convert the model to ONNX format (bottom of the notebook)
- Copy the model to the `triton_models` folder

## Serving
- Build the docker image using `docker build -t brats2021_server .`
- Run the docker-compose file using `docker-compose up -d`
- The server will be available at `http://localhost:5000`
- Run the frontend using `npm start` in the `client` folder. You need to install the dependencies using `npm install` first.
- The frontend will be available at `http://localhost:3000`

