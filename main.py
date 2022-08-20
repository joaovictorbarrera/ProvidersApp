import os
from flask import Flask, render_template, flash, request, redirect, url_for, send_from_directory, jsonify, abort
from engine import handle_csv_file
from csv_tools import get_csv_data, delete_csv_line, update_csv
from werkzeug.utils import secure_filename
from datetime import datetime
import socket
import json

DIR = os.path.dirname(os.path.abspath(__file__))
config = None
try:
    f = open(os.path.join(DIR, "config.json"))
    config = json.load(f)
    print("Config file loaded succesfully")
except Exception as e:
    print(e)
    print("Warning: Could not load config file!")

app = Flask(__name__)
    
app.config['UPLOAD_FOLDER'] = config['UPLOAD_FOLDER'] if config and config['UPLOAD_FOLDER'] is not '' else 'csvs'
app.config['TEMPORARY_FOLDER'] = config['TEMPORARY_FOLDER'] if config and config['TEMPORARY_FOLDER'] is not '' else 'temp'

UPLOAD_FOLDER_FULLPATH = os.path.join(DIR, app.config['UPLOAD_FOLDER'])
TEMPORARY_FOLDER_FULLPATH = os.path.join(DIR, app.config['TEMPORARY_FOLDER'])

ALLOWED_EXTENSIONS = {'csv'}
FILE_PATH = None

@app.route("/")
def index():
    delete_temp()
    return render_template("index.html")

@app.route("/" + app.config['TEMPORARY_FOLDER'] + "/<path:filename>")
def getMetaFile(filename):
    return send_from_directory(app.config['TEMPORARY_FOLDER'], filename)

@app.route("/result")
def result():
    global FILE_PATH

    # if no file was ever uploaded, redirect to index
    if FILE_PATH == None:
        return redirect("/")

    return render_template("result.html")

@app.route("/result-content", methods=["GET"])
def create_tables():
    response = None
    try:
        response = handle_csv_file(FILE_PATH, TEMPORARY_FOLDER_FULLPATH)
    except Exception as e:
        print("Unexpected Error. Failed to process csv. Traceback:", e)
        abort(500)
    if response is None:
        abort(400)
    else:
        return jsonify(
        message=json.dumps(response, indent=4),
        status=200
        )

@app.errorhandler(404)
def error_404(e):
    return render_template("404.html"), 404

@app.errorhandler(500)
def error_500(e):
    return render_template("generic_error.html"), 500

@app.route("/create")
def create():
    return render_template("create.html")

@app.route("/format")
def format():
    return render_template("format.html")

@app.route("/uploaded-files", methods=["GET", "POST", "DELETE", "PUT"])
def uploaded_files():
    if request.method == 'POST':
        return save_file()
    
    if request.method == "GET":
        try:
            response = json.dumps(os.listdir(UPLOAD_FOLDER_FULLPATH))
            return jsonify(
            message=response,
            status=200
            )
        except Exception as e:
            print(e)
            # error getting file list
            abort(500)
            
    if request.method == "DELETE":
        try:
            os.remove(os.path.join(UPLOAD_FOLDER_FULLPATH, request.json))
            return jsonify(
            message="Deleted file succesfully",
            status=200)
        except Exception as e:
            print(e)
            # could not delete file
            abort(404)
            
    if request.method == "PUT":
        try:
            global FILE_PATH
            FILE_PATH = os.path.join(DIR, app.config['UPLOAD_FOLDER'], request.json)
            # delete_temp()
            return jsonify(
            message="Succesfully selected file",
            status=200
            )
        except Exception as e:
            print(e)
            # failed to select file that should be available
            abort(500)

def save_file():
    print("Log: Post in Result.")
    global FILE_PATH
    # If the file was not transmitted, redirect back
    if 'file-db' not in request.files:
        flash('No file part')
        return redirect(request.url)
    # get the file
    file = request.files['file-db']
    # if form + file input was submitted empty, an empty file would be transmitted.
    # redirect back if file is empty.
    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)
    # if file exists and its extension is allowed, proceed
    if file and allowed_file(file.filename):
        # secures file name (abort scripts)
        filename = secure_filename(file.filename)
        # makes this file path
        FILE_PATH = os.path.join(UPLOAD_FOLDER_FULLPATH, filename)
        # saves to temp
        file.save(FILE_PATH)
        # re-access this method on a GET method
        return redirect(url_for('result'))

@app.route("/csv-data/<id>", methods=["GET", "POST", "DELETE"])
def csv_data(id):
    path = os.path.join(UPLOAD_FOLDER_FULLPATH, id)
    if request.method == "GET":
        try:
            lines = get_csv_data(path)
            return jsonify(
                message=lines,
                status=200
            )
        except Exception as e:
            print(e)
            # could not find any csv with that name
            abort(404)
    if request.method == "POST":
        try:
            update_csv(path, request.json)
            return jsonify(
                message="Added line to csv succefully",
                status=200
            )
        except Exception as e:
            print(e)
            # problem adding line to this csv
            # either bad line or csv doesnt exist
            # bad request
            abort(404)
    if request.method == "DELETE":
        try:
            delete_csv_line(path, request.json)
            return jsonify(
                message="Deleted line from csv succesfully",
                status=200
            )
        except Exception as e:
            print(e)
            # problem delete line from this csv
            # bad request or csv doesnt exist
            abort(404)
            
def delete_temp():
    for f in os.listdir(TEMPORARY_FOLDER_FULLPATH):
        os.remove(os.path.join(TEMPORARY_FOLDER_FULLPATH, f))
    global FILE_PATH
    FILE_PATH = None

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_ipv4():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.settimeout(0)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

if __name__ == "__main__":
    app.secret_key = str(datetime.now())
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    
    hostVal = config['DOMAIN'] if config and config['DOMAIN'] is not '' else 'localhost'
    if hostVal == "ipv4":
        hostVal = get_ipv4()
    
    debugVal = bool(config['DEBUG']) if config and config['DEBUG'] is not '' else False
    
    app.run(debug=debugVal, host=hostVal)