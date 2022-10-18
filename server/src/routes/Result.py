import os
from flask import jsonify
from src.services.processing.engine import handle_csv_file
import json

def result_get(file_path):
    if not os.path.exists(file_path):
        return jsonify(error=True, message="file not found"), 400
    try:
        data = handle_csv_file(file_path)
        return jsonify(message="success", data=json.dumps(data)), 200
    except Exception as err:
        return jsonify(error=True, message="Error processing file. Bad format?"), 500