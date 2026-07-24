import os
import firebase_admin
from firebase_admin import credentials, firestore

# Determine absolute path to the keys (expected in the backend root directory)
base_dir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
key_files = ['firebase_key.json', 'serviceAccountKey.json']

def initialize_firebase():
    """
    Initializes the Firebase Admin SDK using firebase_key.json or serviceAccountKey.json.
    """
    if not firebase_admin._apps:
        cred = None
        loaded_file = None
        
        # Search for key files
        for filename in key_files:
            path = os.path.join(base_dir, filename)
            if os.path.exists(path):
                try:
                    cred = credentials.Certificate(path)
                    loaded_file = filename
                    break
                except Exception as e:
                    print(f"ERROR: Failed to load credentials from {filename}: {e}")

        if cred:
            try:
                firebase_admin.initialize_app(cred)
                print(f"SUCCESS: Firebase Admin SDK initialized successfully using {loaded_file}.")
            except Exception as e:
                print(f"ERROR: Failed to initialize app with certificate from {loaded_file}: {e}")
                # Fallback to ADC
                firebase_admin.initialize_app()
                print("SUCCESS: Firebase Admin SDK initialized via Application Default Credentials (ADC) fallback.")
        else:
            print(f"WARNING: No service account key file found in {base_dir}. Expected one of {key_files}.")
            try:
                # Fallback to default credentials or CLI session
                firebase_admin.initialize_app()
                print("SUCCESS: Firebase Admin SDK initialized via Application Default Credentials (ADC) fallback.")
            except Exception:
                pass
    
    try:
        if firebase_admin._apps:
            return firestore.client()
    except Exception as e:
        print("ERROR: Firestore client could not be initialized due to missing or invalid credentials.")
        print(f"Please place your 'firebase_key.json' file in the 'backend/' directory.")
    
    return None

# Export Firestore client instance
db = initialize_firebase()
