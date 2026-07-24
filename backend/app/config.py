import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'cybershield-secret-key-181284')
    FIREBASE_PROJECT_ID = os.environ.get('FIREBASE_PROJECT_ID', 'cybershield-999bc')
    # Can set path to service-account.json explicitly, otherwise falls back to environment/ADC
    FIREBASE_CREDENTIALS_PATH = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'service-account.json')

    # SMTP Configuration
    SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
    SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')  # Add Gmail or work email here
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')  # Add SMTP App Password here
    SMTP_SENDER = os.environ.get('SMTP_SENDER', 'cybershield-security@cybershield.gov.in')
