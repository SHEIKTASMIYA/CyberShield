from flask import Blueprint, request, jsonify
from app.services.firebase_service import FirebaseService

notifications_bp = Blueprint('notifications', __name__)

def verify_and_get_user():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    token = auth_header.split(' ')[1]
    decoded = FirebaseService.verify_token(token)
    if not decoded:
        return None
    uid = decoded['uid']
    return FirebaseService.get_document('users', uid)

@notifications_bp.route('', methods=['GET'])
def get_notifications():
    user = verify_and_get_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    notifs = FirebaseService.list_documents('notifications')
    return jsonify({'notifications': notifs}), 200

@notifications_bp.route('/<notif_id>/read', methods=['POST'])
def mark_read(notif_id):
    user = verify_and_get_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    notif = FirebaseService.get_document('notifications', notif_id)
    if not notif:
        return jsonify({'error': 'Notification not found'}), 404

    notif['unread'] = False
    FirebaseService.set_document('notifications', notif_id, notif)

    return jsonify({'message': 'Notification marked as read'}), 200
