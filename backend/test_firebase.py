from app.services.firebase_config import db

doc = db.collection("test").document("connection")

doc.set({
    "status": "Connected",
    "message": "Flask connected successfully!"
})

print("Firebase Connected Successfully!")