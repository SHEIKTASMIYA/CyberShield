import os
import firebase_admin
from firebase_admin import credentials, firestore

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

key_path = os.path.join(BASE_DIR, "firebase_key.json")

db = None
if not firebase_admin._apps:
    if os.path.exists(key_path):
        try:
            cred = credentials.Certificate(key_path)
            firebase_admin.initialize_app(cred)
        except Exception as e:
            print(f"Error initializing Firebase Admin in config: {e}")
    else:
        try:
            firebase_admin.initialize_app()
        except Exception:
            pass

try:
    if firebase_admin._apps:
        db = firestore.client()
except Exception:
    pass