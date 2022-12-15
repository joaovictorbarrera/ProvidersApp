
from flask import Flask, send_file, session, request, jsonify, url_for, redirect
from flask_session import Session
from flask_cors import CORS

import os
from datetime import timedelta, datetime

from src.services.util import initializeSessionIfAbsent

from src.routes.File import *
from src.routes.Result import *
from src.routes.Create import *
from src.routes.Excel import *
from dotenv import load_dotenv

load_dotenv()

DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_FOLDER_PATH = os.path.join(DIR, "client/build")

# inject react env vars
react_var_names = list(filter(lambda key: key.startswith("REACT_APP_"), [key for key in os.environ.keys()]))

react_html_file = open(os.path.join(PUBLIC_FOLDER_PATH, "index.html"), mode='r')
html_content = react_html_file.read()
react_html_file.close()

if html_content.find(f"window.{react_var_names[0]}") < 0:
    end_of_body = html_content.find("</body>")
    vars_string = "".join([f"window.{name} = \"{os.environ.get(name)}\";" for name in react_var_names])
    script_tag = f"<script>{vars_string}</script>"
    new_content = html_content[0:end_of_body] + script_tag + html_content[end_of_body:]

    react_html_file = open(os.path.join(PUBLIC_FOLDER_PATH, "index.html"), mode='w')
    react_html_file.write(new_content)
    react_html_file.close()

app = Flask(__name__, static_folder=None)
CORS(app, origins=["http://192.168.0.3:3000"], supports_credentials=True)

# app.config["SESSION_COOKIE_DOMAIN"] = "http://127.0.0.1"
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_FILE_DIR"] = os.path.join(DIR, "sessions")
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=3650)
app.secret_key = str(datetime.now())

Session(app)

# API

# GET: GET FILE LIST
# POST: POST A CSV FILE
@app.route("/file", methods=["GET", "POST"])
def file():
    initializeSessionIfAbsent(session)
    if not session or "uuid" not in session:
        return jsonify(error=True, message="No session"), 400

    sessionID = session["uuid"]
    userFolder = os.path.join(DIR, "filesystem", str(sessionID))

    if request.method == "GET":
        return file_get(userFolder)

    if request.method == "POST":
        return file_post(request, userFolder)


# GET: GETS A FILE
# DELETE: DELETES A FILE
@app.route("/file/<filename>", methods=["GET", "DELETE"])
def file_dynamic(filename):
    initializeSessionIfAbsent(session)
    if not session or "uuid" not in session:
        return jsonify(error=True, message="No session"), 400

    sessionID = session["uuid"]
    userFolder = os.path.join(DIR, "filesystem", str(sessionID))

    if not filename or filename == '':
        return jsonify(error=True, message="No filename included in request"), 400

    file_path = os.path.join(userFolder, filename)
    if not os.path.exists(file_path):
        return jsonify(error=True, message="No file exists with that name"), 400

    if request.method == "GET":
       return selected_file_get(userFolder, filename)
    if request.method == "DELETE":
        return selected_file_delete(file_path)


# GET: PROCESSES AND GETS RESULT FOR A FILE
@app.route("/r/<filename>", methods=["GET"])
def result(filename):
    initializeSessionIfAbsent(session)
    if not session or "uuid" not in session:
        return jsonify(error=True, message="No session"), 400

    if not filename or filename == '':
        return jsonify(error=True, message="no file given"), 400

    sessionID = session["uuid"]
    userFolder = os.path.join(DIR, "filesystem", str(sessionID))
    file_path = os.path.join(userFolder, filename)

    return result_get(file_path)

# GET: CREATES EXCEL VERSION OF RESULT
@app.route("/excel/<filename>", methods=["GET"])
def excel(filename):
    initializeSessionIfAbsent(session)
    if not session or "uuid" not in session:
        return jsonify(error=True, message="No session"), 400

    if not filename or filename == '':
        return jsonify(error=True, message="no file given"), 400

    sessionID = session["uuid"]
    userFolder = os.path.join(DIR, "filesystem", str(sessionID))
    file_path = os.path.join(userFolder, filename)

    return excel_get(file_path, userFolder)

# GET: GET ALL LINES
# POST: APPEND NEW LINE
# DELETE: DELETE LINE BY INDEX
@app.route("/create/<filename>", methods=["GET", "POST", "DELETE"])
def create_dynamic(filename):
    initializeSessionIfAbsent(session)
    if not session or "uuid" not in session:
        return jsonify(error=True, message="No session"), 400

    if not filename or filename == '':
            return jsonify(error=True, message="no file given"), 400

    sessionID = session["uuid"]
    userFolder = os.path.join(DIR, "filesystem", str(sessionID))
    file_path = os.path.join(userFolder, filename)

    if not os.path.exists(file_path):
        return jsonify(error=True, message="file not found"), 400

    if request.method == "GET":
        return create_get(file_path)

    if request.method == "POST":
        return create_post(request, file_path)

    if request.method == "DELETE":
        return create_delete(request, file_path)

# CLIENT

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    try:
        try:
            return send_file(os.path.join(PUBLIC_FOLDER_PATH, path))
        except:
            return send_from_directory(PUBLIC_FOLDER_PATH, "index.html")
    except:
        return "Internal server error", 500

if __name__ == "__main__":
    app.run(port=os.environ.get("PORT") if os.environ.get("PORT") else 6060, host="0.0.0.0")
