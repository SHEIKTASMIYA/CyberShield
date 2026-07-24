from flask import Blueprint, request, jsonify
from app.services.firebase_service import FirebaseService
from datetime import datetime

fraud_bp = Blueprint('fraud', __name__)

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

@fraud_bp.route('/alerts', methods=['GET'])
def get_alerts():
    user = verify_and_get_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    alerts = FirebaseService.list_documents('fraud_alerts')
    # Sort alerts by date desc
    alerts.sort(key=lambda x: x.get('date', ''), reverse=True)
    return jsonify({'alerts': alerts}), 200

@fraud_bp.route('/alerts', methods=['POST'])
def create_alert():
    user = verify_and_get_user()
    if not user or user.get('role') not in ['admin', 'cybercrime']:
        return jsonify({'error': 'Unauthorized to publish alerts'}), 403

    data = request.get_json() or {}
    title = data.get('title')
    desc = data.get('desc')

    if not title or not desc:
        return jsonify({'error': 'Missing title or desc'}), 400

    alert_id = f"FA-{int(datetime.utcnow().timestamp())}"
    alert_data = {
        'id': alert_id,
        'title': title,
        'desc': desc,
        'date': datetime.utcnow().strftime('%d %b %Y'),
        'unread': True
    }

    FirebaseService.set_document('fraud_alerts', alert_id, alert_data)
    return jsonify({'message': 'Fraud alert published successfully', 'alert': alert_data}), 201

@fraud_bp.route('/evidence', methods=['POST'])
def add_evidence():
    user = verify_and_get_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    case_id = data.get('caseId')
    name = data.get('name')
    file_type = data.get('type')
    size = data.get('size')
    sha256 = data.get('sha256', '')

    if not case_id or not name or not file_type or not size:
        return jsonify({'error': 'Missing required fields (caseId, name, type, size)'}), 400

    evidence_id = f"EV-{int(datetime.utcnow().timestamp())}"
    evidence_data = {
        'id': evidence_id,
        'caseId': case_id,
        'name': name,
        'type': file_type,
        'size': size,
        'uploadedOn': datetime.utcnow().isoformat(),
        'by': user.get('name'),
        'sha256': sha256
    }

    FirebaseService.set_document('evidence', evidence_id, evidence_data)

    # Log in timeline
    timeline_node = {
        'caseId': case_id,
        'time': datetime.utcnow().strftime('%Y-%m-%d %H:%M'),
        'title': 'New evidence submitted',
        'desc': f"File '{name}' ({size}) uploaded by {user.get('name')}.",
        'done': True
    }
    FirebaseService.add_document('timelines', timeline_node)

    return jsonify({'message': 'Evidence registered successfully', 'evidence': evidence_data}), 201
