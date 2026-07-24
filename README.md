# 🛡️ CyberShield — Cyber Fraud Detection & Rapid Freeze Platform

CyberShield is a unified cyber crime investigation and rapid response platform designed to connect **Citizens**, **Source Banks**, **Destination Banks**, **Telecom Operators**, and **Cyber Crime Departments** on a synchronized real-time incident timeline.

---

## 🏗️ Architecture Overview

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, Custom CSS Tokens, Responsive UI Shells, Petra Wallet (Aptos Testnet) Real-Time Integration.
- **Backend**: Python Flask REST API with Flask-CORS, PyJWT authentication, and Firebase Admin SDK.
- **Database & Auth**: Firebase Firestore & Firebase Authentication (v10 Modular SDK).
- **Web3 Integration**: Aptos Testnet REST API & Petra Wallet Standard (`window.aptos`) for live transaction monitoring & automated fraud alert triggering.

---

## 🔒 Security & Environment Setup

Private Firebase keys (`firebase_key.json`), `.env` files, and local caches are ignored in `.gitignore` to prevent secret leaks to public repositories.

### 1. Backend Environment Variables (`.env`)

Copy `.env.example` to `.env` in your environment:

```bash
cp .env.example .env
```

Set the following variables:

```env
PORT=5000
FLASK_ENV=production
FIREBASE_CREDENTIALS_PATH=backend/firebase_key.json
BACKEND_API_URL=http://localhost:5000
```

### 2. Firebase Service Key Setup

For local testing or backend production deployment, place your Firebase Service Account JSON file at `backend/firebase_key.json`.

---

## 🚀 How to Run Locally

### Option A: Running Backend Server (Flask)

```bash
cd backend
pip install -r requirements.txt
python run.py
```
*Backend runs on `http://localhost:5000`*

### Option B: Running Frontend Server

```bash
python server.py
```
*Frontend runs on `http://localhost:8000` (or `http://localhost:3000`)*

---

## 🌐 Deploying to Production & Connecting Frontend

### 1. Deploy Backend (Render / Railway / Heroku / GCP)
1. Push your repository to GitHub.
2. Create a Web Service on **Render** / **Railway** pointing to the `/backend` folder.
3. Set Build Command: `pip install -r requirements.txt`
4. Set Start Command: `gunicorn run:app`
5. Upload your `firebase_key.json` contents or add `FIREBASE_CREDENTIALS` environment variable in the host dashboard.
6. Copy your deployed backend URL (e.g., `https://cybershield-api.onrender.com`).

### 2. Connect Frontend to Deployed Backend
In `frontend/auth/login.html` and `frontend/auth/signup.html`, update the backend API endpoint URL:

```javascript
// Replace localhost with your deployed backend URL:
const API_URL = "https://cybershield-api.onrender.com";
```

---

## 📦 How to Push to GitHub

Run the following commands in PowerShell or Git Bash from the project root:

```bash
# 1. Initialize Git repository (if not already initialized)
git init

# 2. Check status to ensure firebase_key.json and node_modules are ignored
git status

# 3. Add all clean project files
git add .

# 4. Commit changes
git commit -m "feat: CyberShield full multi-role platform with Petra Aptos Testnet wallet monitoring & multi-bank portal filtering"

# 5. Set main branch and remote URL (Replace with your GitHub repository link)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/CyberShield.git

# 6. Push to GitHub
git push -u origin main
```

---

## 👥 Portals Included

- **Citizen / Victim Portal**: Fraud reporting, active case tracking, Petra Wallet (Aptos Testnet) real-time transfer alerts.
- **Source Bank Portal**: Complaint verification, source account preventative freezing, freeze request generation.
- **Destination Bank Portal**: Target beneficiary account freeze approval/rejection, frozen accounts audit.
- **Telecom Operator Portal**: SIM & IMEI verification, nodal officer investigation reports.
- **Cyber Crime Dept Portal**: Priority queue, officer assignment, linked cases & fraud network graphs.
- **Administrator Portal**: System audit logs, institution management, user permissions.
