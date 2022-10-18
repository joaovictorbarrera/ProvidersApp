from uuid import uuid4
import os

ALLOWED_EXTENSIONS = "csv"
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
def initializeUserFolderIfAbsent(userFolder):
    if not os.path.exists(userFolder):
        os.makedirs(userFolder)

def initializeSessionIfAbsent(session):
    session.permanent = True
    if "uuid" not in session:
        session["uuid"] = uuid4()