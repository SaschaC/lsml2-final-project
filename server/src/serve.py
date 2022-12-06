"""
Simple flask server to serve the model that is running in triton
"""
import os
import json
import numpy as np

from functools import wraps

from flask import Flask, request, jsonify, send_file
import flask_cors

import threading
import inference

import yaml
import pymongo
import bcrypt
import uuid
import time
import jwt
import datetime

import db_utils

config = yaml.load(open('config.yaml', 'r'), Loader=yaml.FullLoader)

app = Flask(__name__)
cors = flask_cors.CORS(app)

upload_folder = config.get('upload_folder', '/tmp')

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

# bcrypt password hashing
def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


# create jwt token with expiry 
def create_token(user_id, username, password_hash):
    secret_key = os.environ.get('SECRET_KEY')
    token_expire_time = int(os.environ.get('TOKEN_EXPIRE_TIME'))
    payload = {
        'uid': user_id,
        'username': username,
        'password_hash': password_hash,
        'exp': int(time.time() + token_expire_time)
    }
    return {
        'idToken': jwt.encode(payload, secret_key, algorithm='HS256'),
    }

# 
def verify_token(token):
    secret_key = os.environ.get('SECRET_KEY')
    try:
        decoded = jwt.decode(token, secret_key, algorithms=['HS256'])
        # check if token is expired
        if time.time() > decoded['exp']:
            return False
        return decoded
    except Exception as e:
        print('Token not valid: ', str(e))
        return False

def create_mongo_user_with_email_and_password(email, password):
    try:
        password_hash = hash_password(password)
        user_id = str(uuid.uuid4())
        data = {
            'email': email,
            'password_hash': password_hash,
            'uid': user_id
        }
        db_utils.insert_record_into_db(mongo_db, 'auth', user_id, data)
        return user_id
    except Exception as e:
        print(e)
        return None

def sign_in_with_mongo(username, password):
    print('sigin in with mongo')
    user_doc = db_utils.get_record_from_db(mongo_db, 'auth', 'email', username)
    if user_doc is None:
        return False
    print(user_doc, 'user_doc')
    db_password_hash = user_doc['password_hash']
    # check password
    if check_password(password, db_password_hash):
        # create token
        print('creating token')
        token = create_token(user_doc['uid'], username, db_password_hash)
        return token
    else:
        return False

@app.route('/api/v1/login', methods=['POST'])
@flask_cors.cross_origin()
def login():
    data = request.get_json()
    email = data['email']
    password = data['password']
    token = sign_in_with_mongo(email, password)
    if token:
        return jsonify(token)
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/v1/signup', methods=['POST'])
@flask_cors.cross_origin()
def signup():
    print('signup', request.get_json(), request.json)
    email = request.json.get('email')
    password = request.json.get('password')
    print(email, password)
    user_id = create_mongo_user_with_email_and_password(email, password)
    if user_id:
        token = create_token(user_id, email, password)
        return jsonify(token)
    else:
        return jsonify({'error': 'Could not create user'}), 401

@app.route('/api/v1/verify', methods=['POST'])
@flask_cors.cross_origin()
def verify():
    data = request.get_json()
    token = data['token']
    if verify_token(token):
        return jsonify({'success': True})
    else:
        return jsonify({'success': False})

def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        token = token.replace('Bearer ', '')
        verified = verify_token(token)
        if not verified:
            return jsonify({'error': 'Token is invalid'}), 401
        request.user_id = verified['uid']
        return f(*args, **kwargs)
    return decorated_function


# upload either 4 nifti files or a single zip file
@app.route('/api/v1/upload', methods=['POST'])
@flask_cors.cross_origin()
@auth_required
def upload():
    if 'zip_file' not in request.files and 'files' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    if 'zip_file' in request.files:
        zip_file = request.files['zip_file']
        if zip_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        if zip_file:
            job_id = str(uuid.uuid4())
            zip_file.save(os.path.join(upload_folder, job_id + '.zip'))      
            db_utils.insert_record(mongo_col, job_id, {'jobId': job_id, 'status': 'uploaded', 'receivedAt': datetime.datetime.now(), 'predictedAt': '', 'userId': request.user_id, 'fileName': zip_file.filename})
            # send for inference in different thread
            threading.Thread(target=inference.run_inference_on_zip, args=(zip_file.filename, job_id)).start()
            return jsonify({'success': True, 'job_id': job_id})
    else:
        files = request.files.getlist('files')
        if len(files) != 4:
            return jsonify({'error': 'Please upload 4 files'}), 400
        job_id = str(uuid.uuid4())
        os.mkdir(os.path.join(upload_folder, job_id))
        for file in files:
            if file.filename == '':
                return jsonify({'error': 'No selected file'}), 400
            if file:
                file.save(os.path.join(upload_folder, job_id, file.filename))
        print("saved files")
        payload_folder = os.path.join(upload_folder, job_id)
        db_utils.insert_record(mongo_col, job_id, {'jobId': job_id, 'status': 'uploaded', 'receivedAt': datetime.datetime.now(), 'predictedAt': '', 'userId': request.user_id, 'fileName': files[0].filename})
        # send for inference in different thread
        thread = threading.Thread(target=inference.run_inference, args=(payload_folder, job_id))
        thread.daemon = True
        thread.start()

        return jsonify({'success': True, 'job_id': job_id})

def format_job(job):
    return {
        'jobId': job['jobId'],
        'status': job['status'],
        'receivedAt': job['receivedAt'],
        'predictedAt': job['predictedAt'],
        'fileName': job['fileName']
    }

@app.route('/api/v1/jobs', methods=['GET'])
@flask_cors.cross_origin()
@auth_required
def get_jobs():
    # return all jobs from mongo
    jobs = db_utils.get_records_of_user(mongo_col, request.user_id)
    jobs = [format_job(job) for job in jobs]
    return jsonify(jobs)

@app.route('/api/v1/prediction/<job_id>', methods=['GET'])
@flask_cors.cross_origin()
@auth_required
def get_prediction(job_id):
    # return prediction for job_id
    job = db_utils.get_record(mongo_col, job_id)
    if job is None:
        return jsonify({'error': 'Job not found'}), 404
    if job['userId'] != request.user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    if job['status'] != 'Completed':
        return jsonify({'error': 'Prediction not ready'}), 404
    payload_folder = job['payload']
    images = os.listdir(payload_folder)
    image_urls = [
        {
            'image_url': '/api/v1/prediction/' + job_id + '/' + image,
            'image_type': 'label' if 'prediction' in image else 'input',
            'image_name': image
        } for image in images if image.endswith('.png') 
    ]
    return jsonify({
        'images': image_urls,
        'img_size': job['imgShape'],

    })

# get image
@app.route('/api/v1/prediction/<job_id>/<image_name>', methods=['GET'])
@flask_cors.cross_origin()
@auth_required
def get_png(job_id, image_name):
    job = db_utils.get_record(mongo_col, job_id)
    if job is None:
        return jsonify({'error': 'Job not found'}), 404
    if job['userId'] != request.user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    if job['status'] != 'Completed':
        return jsonify({'error': 'Prediction not ready'}), 404
    payload_folder = job['payload']
    img_path = os.path.join(payload_folder, image_name)
    if not os.path.exists(img_path):
        return jsonify({'error': 'Image not found'}), 404
    # read nibabel file, return array
    return send_file(img_path, mimetype='image/png')

# get image
@app.route('/api/v1/prediction_download/<job_id>', methods=['GET'])
@flask_cors.cross_origin()
@auth_required
def download_prediction(job_id):
    job = db_utils.get_record(mongo_col, job_id)
    if job is None:
        return jsonify({'error': 'Job not found'}), 404
    if job['userId'] != request.user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    if job['status'] != 'Completed':
        return jsonify({'error': 'Prediction not ready'}), 404
    payload_folder = job['payload']
    nii_path = os.path.join(payload_folder, 'prediction.nii.gz')
    if not os.path.exists(nii_path):
        return jsonify({'error': 'Image not found'}), 404
    response = send_file(nii_path, as_attachment=True, attachment_filename='prediction.nii.gz')
    response.headers['Content-Encoding'] = ''
    return response

@app.route('/api/v1/delete_prediction/<job_id>', methods=['POST'])
@flask_cors.cross_origin()
@auth_required
def delete_prediction(job_id):
    job = db_utils.get_record(mongo_col, job_id)
    if job is None:
        return jsonify({'error': 'Job not found'}), 404
    if job['userId'] != request.user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    # if job['status'] != 'Completed':
    #     return jsonify({'error': 'Prediction not ready'}), 404
    payload_folder = job['payload']
    shutil.rmtree(payload_folder)
    db_utils.delete_record(mongo_col, job_id)
    return jsonify({'success': True})
