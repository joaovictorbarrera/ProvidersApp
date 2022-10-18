from flask import jsonify
import json
from src.services.validation.csv_line_check import validateLine
from src.services.processing.csv_tools import get_csv_data, append_line_to_csv, delete_csv_line


def create_get(file_path):
    try:
        return jsonify(message="success", data=json.dumps(get_csv_data(file_path))), 200
    except Exception as err:
        return jsonify(error=True, message="Error processing file. Bad format?"), 500
    
def create_post(request, file_path):
    jsonData = request.get_json()
    if jsonData is None:
        return jsonify(error=True, message="No json found"), 400
    
    if "line" not in jsonData:
        return jsonify(error=True, message="No line received"), 400
    
    line = jsonData["line"]
    
    if not validateLine(line):
        return jsonify(error=True, message="line has invalid format"), 400
        
    try:
        append_line_to_csv(file_path, line)
        return jsonify(message="success"), 200
    except:
        return jsonify(error=True, message="Error appending line"), 500  

def create_delete(request, file_path):
    index = request.args.get("index")
        
    if index is None:
        return jsonify(error=True, message="No index provided"), 400
    
    index = int(index)

    try:
        result = delete_csv_line(file_path, index)
        
        if result.get("error"):
            return jsonify(error=True, message=result.get("message")), 400
            
        return jsonify(message="success"), 200
    except Exception as err:
        print(err)
        return jsonify(error=True, message="Error deleting line"), 500  