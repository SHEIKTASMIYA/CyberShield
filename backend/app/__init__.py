import logging
from flask import Flask, jsonify
from flask_cors import CORS
from app.config import Config
from app.services.firebase_service import FirebaseService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable Cross-Origin Resource Sharing (CORS) for local development
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize Firebase Admin connection
    try:
        FirebaseService.initialize()
        logger.info("Firebase Service initialized successfully inside app factory.")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Service: {e}")

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.cases import cases_bp
    from app.routes.fraud import fraud_bp
    from app.routes.freeze import freeze_bp
    from app.routes.notifications import notifications_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(cases_bp, url_prefix='/api/cases')
    app.register_blueprint(fraud_bp, url_prefix='/api/fraud')
    app.register_blueprint(freeze_bp, url_prefix='/api/freeze')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'firebase': 'connected' if FirebaseService._initialized else 'disconnected'
        }), 200

    return app
