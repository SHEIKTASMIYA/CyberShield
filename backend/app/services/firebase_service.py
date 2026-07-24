import os
import logging
import firebase_admin
from firebase_admin import credentials, firestore, auth
from app.config import Config
from app.firebase import db

logger = logging.getLogger(__name__)

class FirebaseService:
    _initialized = True
    db = db

    @classmethod
    def initialize(cls):
        pass



    # --- Authentication Services ---
    @staticmethod
    def verify_token(token):
        try:
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            logger.error(f"ID token verification failed: {e}")
            return None

    @staticmethod
    def create_firebase_user(email, password, display_name=None):
        try:
            user = auth.create_user(
                email=email,
                password=password,
                display_name=display_name
            )
            return user
        except Exception as e:
            logger.error(f"Firebase user creation failed: {e}")
            raise e

    @staticmethod
    def set_user_role(uid, role):
        """Sets a custom role claim. Non-fatal — logs error but does NOT raise."""
        try:
            auth.set_custom_user_claims(uid, {'role': role})
            logger.info(f"Custom role claim '{role}' set for user UID: {uid}")
        except Exception as e:
            # Custom claims failure must NOT block the Firestore profile save
            logger.warning(f"set_user_role non-fatal warning for uid={uid}: {e}")

    # --- Firestore Database Services ---
    @classmethod
    def get_document(cls, collection_name, doc_id):
        if not cls.db:
            logger.error("Firestore database client not initialized.")
            return None
        try:
            doc_ref = cls.db.collection(collection_name).document(doc_id)
            doc = doc_ref.get()
            if doc.exists:
                return {**doc.to_dict(), 'id': doc.id}
            return None
        except Exception as e:
            logger.error(f"Error getting Firestore doc {collection_name}/{doc_id}: {e}")
            return None

    @classmethod
    def set_document(cls, collection_name, doc_id, data, merge=True):
        if not cls.db:
            logger.error("Firestore database client not initialized.")
            return False
        try:
            doc_ref = cls.db.collection(collection_name).document(doc_id)
            doc_ref.set(data, merge=merge)
            return True
        except Exception as e:
            logger.error(f"Error setting Firestore doc {collection_name}/{doc_id}: {e}")
            return False

    @classmethod
    def add_document(cls, collection_name, data):
        if not cls.db:
            logger.error("Firestore database client not initialized.")
            return None
        try:
            update_time, doc_ref = cls.db.collection(collection_name).add(data)
            return doc_ref.id
        except Exception as e:
            logger.error(f"Error adding Firestore doc in {collection_name}: {e}")
            return None

    @classmethod
    def list_documents(cls, collection_name, filters=None):
        if not cls.db:
            logger.error("Firestore database client not initialized.")
            return []
        try:
            ref = cls.db.collection(collection_name)
            if filters:
                for field, op, value in filters:
                    ref = ref.where(field, op, value)
            docs = ref.stream()
            return [{**doc.to_dict(), 'id': doc.id} for doc in docs]
        except Exception as e:
            logger.error(f"Error querying Firestore collection {collection_name}: {e}")
            return []

    @classmethod
    def delete_document(cls, collection_name, doc_id):
        if not cls.db:
            logger.error("Firestore database client not initialized.")
            return False
        try:
            cls.db.collection(collection_name).document(doc_id).delete()
            return True
        except Exception as e:
            logger.error(f"Error deleting Firestore doc {collection_name}/{doc_id}: {e}")
            return False
