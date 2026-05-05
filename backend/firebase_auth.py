import firebase_admin
from firebase_admin import credentials, auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import json
import base64
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path)

security = HTTPBearer()

def load_firebase_credentials():
    cred_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
    if cred_json:
        try:
            return credentials.Certificate(json.loads(cred_json))
        except json.JSONDecodeError as error:
            raise RuntimeError(
                "FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON."
            ) from error

    cred_base64 = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64")
    if cred_base64:
        try:
            decoded = base64.b64decode(cred_base64).decode("utf-8")
            return credentials.Certificate(json.loads(decoded))
        except Exception as error:
            raise RuntimeError(
                "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 could not be decoded."
            ) from error

    cred_path = os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY")
    if cred_path and os.path.exists(cred_path):
        return credentials.Certificate(cred_path)

    return None

def init_firebase():
    if not firebase_admin._apps:
        cred = load_firebase_credentials()
        if cred:
            firebase_admin.initialize_app(cred)
        else:
            print(
                "Warning: Firebase Admin credentials not found. "
                "Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_SERVICE_ACCOUNT_JSON_BASE64, "
                "or FIREBASE_SERVICE_ACCOUNT_KEY."
            )

# Initialize when the module is imported
init_firebase()

def get_current_user(auth_cred: HTTPAuthorizationCredentials = Security(security)):
    token = auth_cred.credentials
    try:
        # Verify the ID token using Firebase Admin
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Invalid authentication credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
