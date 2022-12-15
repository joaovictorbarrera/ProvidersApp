from flask import jsonify, send_from_directory
import os
import json
import shutil
from pathlib import Path
from src.services.util import allowed_file, initializeUserFolderIfAbsent
from src.services.validation.csv_line_check import validateCSV, validateLine
from werkzeug.utils import secure_filename

def file_get(userFolder):
    if not os.path.exists(userFolder):
        return jsonify(files=json.dumps([])), 200

    files = os.listdir(userFolder)
    files = list(
        filter(lambda file:
            allowed_file(file) and validateCSV(os.path.join(userFolder, file))[0]
        , files)
    )
    return jsonify(data=json.dumps(files)), 200

def file_post(request, userFolder):
    initializeUserFolderIfAbsent(userFolder)

    # user uploaded a file
    if request.files and 'user-csv-input' in request.files:
        file = request.files['user-csv-input']
        filename = secure_filename(file.filename)

        if not allowed_file(filename):
            return jsonify(error=True, message="File extension not allowed"), 400

        try:
            file_path = os.path.join(userFolder, filename)
            file.save(file_path)
            try:
                valid, errors, line = validateCSV(file_path)
                if not valid:
                    os.remove(file_path)
                    return jsonify(error=True, message=f'Validation found {len(errors)} format issues in the line "{line}". Errors: {",".join(errors)}'), 400
            except:
                os.remove(file_path)
                return jsonify(error=True, message="Error validating file"), 500

            return jsonify(message="success"), 200
        except:
            return jsonify(error=True, message="Error saving file"), 500

    # user wants to creaty an empty file
    if request.form and "filename" in request.form:
        filename = request.form["filename"]

        if not filename or filename == '':
            return jsonify(error=True, message="Invalid filename"), 400

        if not filename.endswith(".csv"):
            filename += ".csv"
        try:
            open(os.path.join(userFolder, filename), 'a').close()
            return jsonify(message="success"), 200
        except:
            return jsonify(error=True, message="Error saving file"), 500

    # user wants sample csv
    if request.get_json(force=True, silent=True) != None:
        data: dict = request.get_json(force=True, silent=True)
        isSampleRequest = data.get("sample")

        if isSampleRequest:
            try:
                SAMPLE_FILE_PATH = str(Path(os.path.abspath(__file__)).parents[2].joinpath("sample csvs\\sample.csv"))
                shutil.copy2(SAMPLE_FILE_PATH, userFolder)
                return jsonify(message="success"), 200
            except:
                jsonify(error=True, message="Something went wrong."), 500

    return jsonify(error=True, message="No file"), 400

def selected_file_get(userFolder, filename):
    try:
        return send_from_directory(userFolder, filename)
    except:
        return jsonify(error=True, message="Error sending file"), 500

def selected_file_delete(file_path):
    try:
        os.remove(file_path)
        return jsonify(message="File deleted successfully"), 200
    except:
        return jsonify(error=True, message="Error deleting file"), 500
