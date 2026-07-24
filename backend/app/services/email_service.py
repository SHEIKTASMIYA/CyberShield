import smtplib
from email.mime.text import MIMEText
from app.config import Config

def send_otp_email(recipient_email, otp_code):
    """
    Sends a 6-digit OTP verification code to the recipient's email.
    If SMTP credentials are not configured, it prints the code directly
    to the Flask terminal so developers do not get locked out.
    """
    subject = "CyberShield Security Verification Code"
    body = f"""Hello,

Your CyberShield Multi-Factor Authentication (MFA) verification code is:

👉 {otp_code}

This code is valid for 5 minutes. Do not share this code with anyone.

Regards,
CyberShield Security Operations Team
"""

    # If SMTP_USERNAME/PASSWORD are not set, fallback to simulated terminal logging
    if not Config.SMTP_USERNAME or not Config.SMTP_PASSWORD:
        print("\n" + "="*60)
        print(f"✉️  [SIMULATED EMAIL SENT] TO: {recipient_email}")
        print(f"🔑  [SECURITY MFA OTP CODE]: {otp_code}")
        print("="*60 + "\n")
        return True

    try:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = Config.SMTP_SENDER
        msg['To'] = recipient_email

        with smtplib.SMTP(Config.SMTP_SERVER, Config.SMTP_PORT) as server:
            server.starttls()
            server.login(Config.SMTP_USERNAME, Config.SMTP_PASSWORD)
            server.sendmail(Config.SMTP_SENDER, [recipient_email], msg.as_string())
        print(f"SUCCESS: Verification email sent to {recipient_email}.")
        return True
    except Exception as e:
        print(f"ERROR: Failed to send verification email via SMTP: {e}")
        # Always print fallback to console so the developer/user can see the code
        print("\n" + "="*60)
        print(f"✉️  [FALLBACK EMAIL LOG] TO: {recipient_email}")
        print(f"🔑  [SECURITY MFA OTP CODE]: {otp_code}")
        print("="*60 + "\n")
        return False
