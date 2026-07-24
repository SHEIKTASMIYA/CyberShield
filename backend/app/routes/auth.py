from flask import Blueprint, request, jsonify
from app.services.firebase_service import FirebaseService

auth_bp = Blueprint('auth', __name__)

def get_auth_token():
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header.split(' ')[1]
    return None

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    name = data.get('name')
    role = data.get('role')  # e.g., 'citizen', 'source-bank', etc.
    org = data.get('org', '')

    if not email or not name or not role:
        return jsonify({'error': 'Missing required fields: email, name, role'}), 400

    # The user was ALREADY created in Firebase Auth by the frontend SDK.
    # We just need to get the uid from the Bearer token and save the Firestore profile.
    id_token = get_auth_token()
    if not id_token:
        return jsonify({'error': 'Missing Firebase ID token in Authorization header'}), 401

    decoded = FirebaseService.verify_token(id_token)
    if not decoded:
        return jsonify({'error': 'Invalid or expired Firebase ID token'}), 401

    uid = decoded['uid']

    from datetime import datetime

    # Generate initials
    initials = ''.join([n[0] for n in name.split()]).upper()[:2]

    # Attempt to set custom role claim — non-fatal if it fails
    FirebaseService.set_user_role(uid, role)

    # Build profile document
    profile_data = {
        'uid': uid,
        'name': name,
        'email': email,
        'role': role,
        'org': org,
        'initials': initials,
        'status': 'Active',
        'createdAt': datetime.utcnow().isoformat()
    }

    # Save to Firestore — this is the critical step
    saved = FirebaseService.set_document('users', uid, profile_data)
    if not saved:
        return jsonify({'error': 'Failed to save user profile to Firestore. Check Firebase credentials.'}), 500

    return jsonify({
        'message': 'User profile saved successfully',
        'profile': profile_data
    }), 201



@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    id_token = data.get('id_token')

    if not id_token:
        return jsonify({'error': 'Missing Firebase ID Token'}), 400

    decoded = FirebaseService.verify_token(id_token)
    if not decoded:
        return jsonify({'error': 'Invalid or expired authentication token'}), 401

    uid = decoded['uid']
    user_doc = FirebaseService.get_document('users', uid)
    if not user_doc:
        # User exists in Firebase Auth but has no Firestore profile yet —
        # auto-create a minimal profile so login always works
        from datetime import datetime
        email_from_token = decoded.get('email', '')
        name_from_token  = decoded.get('name', email_from_token.split('@')[0].title())
        initials = ''.join([n[0] for n in name_from_token.split()]).upper()[:2]
        user_doc = {
            'uid': uid,
            'name': name_from_token,
            'email': email_from_token,
            'role': 'citizen',
            'org': '',
            'initials': initials,
            'status': 'Active',
            'createdAt': datetime.utcnow().isoformat()
        }
        # Persist the auto-created profile so future logins find it
        FirebaseService.set_document('users', uid, user_doc)

    return jsonify({
        'message': 'Login successful',
        'profile': user_doc
    }), 200

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json() or {}
    uid = data.get('uid')
    otp_code = data.get('otp')

    if not uid or not otp_code:
        return jsonify({'error': 'Missing required fields: uid, otp'}), 400

    user_doc = FirebaseService.get_document('users', uid)
    if not user_doc:
        return jsonify({'error': 'User profile not found'}), 404

    stored_otp = user_doc.get('otp')
    stored_expiry = user_doc.get('otp_expiry')

    if not stored_otp or not stored_expiry:
        return jsonify({'error': 'No active OTP verification process found'}), 400

    # Parse and check expiry
    try:
        from datetime import datetime
        expiry_dt = datetime.fromisoformat(stored_expiry)
        if datetime.utcnow() > expiry_dt:
            return jsonify({'error': 'Verification code has expired'}), 400
    except Exception:
        return jsonify({'error': 'Failed to validate expiry'}), 500

    if str(stored_otp) != str(otp_code):
        return jsonify({'error': 'Invalid verification code'}), 400

    # Clear OTP state from Firestore
    user_doc.pop('otp', None)
    user_doc.pop('otp_expiry', None)
    FirebaseService.set_document('users', uid, user_doc)

    return jsonify({
        'status': 'success',
        'message': 'OTP verified successfully',
        'profile': user_doc
    }), 200

@auth_bp.route('/resend-otp', methods=['POST'])
def resend_otp():
    data = request.get_json() or {}
    uid = data.get('uid')

    if not uid:
        return jsonify({'error': 'Missing required field: uid'}), 400

    user_doc = FirebaseService.get_document('users', uid)
    if not user_doc:
        return jsonify({'error': 'User profile not found'}), 404

    import random
    from datetime import datetime, timedelta
    otp_code = f"{random.randint(100000, 999999)}"
    otp_expiry = (datetime.utcnow() + timedelta(minutes=5)).isoformat()

    user_doc['otp'] = otp_code
    user_doc['otp_expiry'] = otp_expiry
    FirebaseService.set_document('users', uid, user_doc)

    from app.services.email_service import send_otp_email
    send_otp_email(user_doc['email'], otp_code)

    return jsonify({'message': 'New OTP sent successfully'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_profile():
    token = get_auth_token()
    if not token:
        return jsonify({'error': 'Unauthorized, missing Bearer token'}), 401

    decoded = FirebaseService.verify_token(token)
    if not decoded:
        return jsonify({'error': 'Invalid or expired token'}), 401

    uid = decoded['uid']
    user_doc = FirebaseService.get_document('users', uid)
    if not user_doc:
        return jsonify({'error': 'User profile not found'}), 404

    return jsonify({'profile': user_doc}), 200
