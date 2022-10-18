import os
from flask import send_from_directory, jsonify
from src.services.processing.engine import handle_csv_file

def excel_get(file_path, userFolder):
    if not os.path.exists(file_path):
        return jsonify(error=True, message="file not found"), 400
    try:
        excel_name = handle_csv_file(file_path, excel=True)
        return send_from_directory(userFolder, excel_name)
    except Exception as err:
        return jsonify(error=True, message="Error processing file"), 500