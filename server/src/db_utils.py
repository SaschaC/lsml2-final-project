import pymongo

def get_record(col, job_id):
    return col.find_one({'jobId': job_id})
    
def get_records_of_user(col, user_id):
    return col.find({'userId': user_id}).sort('receivedAt', pymongo.DESCENDING).limit(100)

def delete_record(col, job_id):
    col.delete_one({'jobId': job_id})

def update_record(col, job_id, data):
    col.update_one({'jobId': job_id}, {'$set': data})

def insert_record(col, job_id, data):
    col.insert_one(data)

def get_record_from_db(db, col_name, find_key, find_value):
    return db[col_name].find_one({find_key: find_value}, {'_id': False})

def insert_record_into_db(db, col_name, uid, data):
    db[col_name].insert_one(data)

def update_record_into_db(db, col_name, unique_key, unique_value, data):
    db[col_name].update_one({unique_key: unique_value}, {'$set': data})