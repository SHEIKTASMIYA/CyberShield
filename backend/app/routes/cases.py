from flask import Blueprint, request, jsonify
from app.services.firebase_service import FirebaseService
from datetime import datetime

cases_bp = Blueprint('cases', __name__)

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

@cases_bp.route('', methods=['GET'])
def list_cases():
    user = verify_and_get_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    role = user.get('role')
    name = user.get('name')

    filters = []
    # If the user is a citizen, only show their own reported cases
    if role == 'citizen':
        filters.append(('victim', '==', name))

    cases = FirebaseService.list_documents('cases', filters)
    return jsonify({'cases': cases}), 200

@cases_bp.route('', methods=['POST'])
def create_case():
    user = verify_and_get_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    case_id = data.get('id')
    amount = data.get('amount')
    channel = data.get('channel')
    source_bank = data.get('sourceBank')
    dest_bank = data.get('destBank')
    telecom = data.get('telecom')
    summary = data.get('summary', '')
    tags = data.get('tags', [])
    source_account = data.get('sourceAccount', '')
    beneficiary_account = data.get('beneficiaryAccount', '')
    beneficiary_upi = data.get('beneficiaryUpi', '')

    if not case_id or not amount or not source_bank or not dest_bank:
        return jsonify({'error': 'Missing case details (id, amount, sourceBank, destBank)'}), 400

    case_data = {
        'id': case_id,
        'priority': 'Critical' if amount >= 100000 else 'High' if amount >= 50000 else 'Medium',
        'status': 'Pending',
        'victim': user.get('name'),
        'amount': amount,
        'filedOn': datetime.utcnow().isoformat(),
        'channel': channel,
        'sourceBank': source_bank,
        'destBank': dest_bank,
        'telecom': telecom,
        'officer': 'Unassigned',
        'district': data.get('district', 'General Jurisdiction'),
        'summary': summary,
        'tags': tags,
        'anomalyScore': int(data.get('anomalyScore', 50)),
        'sourceAccount': source_account,
        'beneficiaryAccount': beneficiary_account,
        'beneficiaryUpi': beneficiary_upi
    }

    success = FirebaseService.set_document('cases', case_id, case_data)
    if not success:
        return jsonify({'error': 'Failed to save case'}), 500

    # Add initial timeline node
    timeline_node = {
        'caseId': case_id,
        'time': datetime.utcnow().strftime('%Y-%m-%d %H:%M'),
        'title': 'Fraud reported by victim',
        'desc': f'Citizen filed complaint via CyberShield. Auto-flagged based on amount.',
        'done': True
    }
    FirebaseService.add_document('timelines', timeline_node)

    # Log audit trail
    audit_data = {
        'actor': f"{user.get('name')} (Citizen)",
        'action': f"Reported new fraud case {case_id} for amount ₹{amount:,}",
        'time': datetime.utcnow().strftime('%Y-%m-%d %H:%M'),
        'ip': request.remote_addr
    }
    FirebaseService.add_document('audit_logs', audit_data)

    return jsonify({'message': 'Case reported successfully', 'case': case_data}), 201

@cases_bp.route('/<case_id>', methods=['GET'])
def get_case_details(case_id):
    user = verify_and_get_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    case = FirebaseService.get_document('cases', case_id)
    if not case:
        return jsonify({'error': 'Case not found'}), 404

    # Ensure citizens can only view their own cases
    if user.get('role') == 'citizen' and case.get('victim') != user.get('name'):
        return jsonify({'error': 'Access denied'}), 403

    # Load linked timeline and evidence
    timeline = FirebaseService.list_documents('timelines', [('caseId', '==', case_id)])
    evidence = FirebaseService.list_documents('evidence', [('caseId', '==', case_id)])

    # Sort timeline chronologically
    timeline.sort(key=lambda x: x.get('time', ''))

    return jsonify({
        'case': case,
        'timeline': timeline,
        'evidence': evidence
    }), 200

@cases_bp.route('/<case_id>/assign', methods=['POST'])
def assign_officer(case_id):
    user = verify_and_get_user()
    if not user or user.get('role') not in ['admin', 'cybercrime']:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    officer_name = data.get('officer')

    if not officer_name:
        return jsonify({'error': 'Missing officer field'}), 400

    case = FirebaseService.get_document('cases', case_id)
    if not case:
        return jsonify({'error': 'Case not found'}), 404

    case['officer'] = officer_name
    if case['status'] in ['Pending', 'Under Review']:
        case['status'] = 'Investigation'

    FirebaseService.set_document('cases', case_id, case)

    # Add timeline step
    timeline_node = {
        'caseId': case_id,
        'time': datetime.utcnow().strftime('%Y-%m-%d %H:%M'),
        'title': 'Case assigned to officer',
        'desc': f'Routed to {officer_name} for direct investigation.',
        'done': True
    }
    FirebaseService.add_document('timelines', timeline_node)

    # Log audit log
    audit_data = {
        'actor': f"{user.get('name')} ({user.get('role')})",
        'action': f"Assigned case {case_id} to {officer_name}",
        'time': datetime.utcnow().strftime('%Y-%m-%d %H:%M'),
        'ip': request.remote_addr
    }
    FirebaseService.add_document('audit_logs', audit_data)

    return jsonify({'message': 'Officer assigned successfully', 'case': case}), 200

@cases_bp.route('/<case_id>/close', methods=['POST'])
def close_case(case_id):
    user = verify_and_get_user()
    if not user or user.get('role') not in ['admin', 'cybercrime']:
        return jsonify({'error': 'Unauthorized'}), 401

    case = FirebaseService.get_document('cases', case_id)
    if not case:
        return jsonify({'error': 'Case not found'}), 404

    case['status'] = 'Resolved'
    FirebaseService.set_document('cases', case_id, case)

    # Add timeline step
    timeline_node = {
        'caseId': case_id,
        'time': datetime.utcnow().strftime('%Y-%m-%d %H:%M'),
        'title': 'Case Resolved & Closed',
        'desc': 'All recovery and validation processes completed.',
        'done': True
    }
    FirebaseService.add_document('timelines', timeline_node)

    return jsonify({'message': 'Case resolved successfully', 'case': case}), 200
