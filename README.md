# 🎓 Applicant Simulation & Recruitment Platform

A high-performance, full-stack application designed to bridge the gap between candidates and recruiters using AI-driven insights.

---

## 🌟 Core Features

### 1. 🎯 AI Mock Interview Sessions (Candidate Portal)
Practice real-world technical interviews with our AI-proctored simulation engine.
- **Vast Question Bank**: 10 high-quality questions for **Machine Learning, Python, JavaScript, ReactJs, Java, C, Deep Learning, SQL, and Frontend**.
- **Facial ML Analysis**: Real-time detection of eye contact and confidence levels using **MediaPipe**.
- **Vocal ML Analysis**: Acoustic tonality and pitch variance tracking using **Librosa** to measure expressiveness.
- **Detailed Performance Insights**: Get an overall score with separate feedback for facial and vocal performance.

### 2. 📄 Intelligent Resume Filtering (Admin Portal)
A premium tool for recruiters to shortlist the best talent efficiently.
- **Strict Matching Logic**: Candidates are only shortlisted if they meet **100%** of the specified skills and experience criteria.
- **Bulk Folder Uploads**: Support for processing multiple resumes (PDF, DOCX, TXT) simultaneously.
- **Auto-Contact Extraction**: Automatically finds and displays candidate **Email IDs** from resume text.
- **Glassmorphism UI**: High-end aesthetic with Match Intelligence score bars and dynamic role badging.

### 3. 🛡️ Role-Based Access Control (RBAC)
Secure authentication with per-role feature isolation.
- **Admin Login**: Access to Resume Filtering.
- **Candidate Login**: Access to Mock Sessions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React (Vite), Vanilla CSS (Premium Glassmorphism), Lucide Icons |
| **Backend** | FastAPI (Python), SQLAlchemy, SQLite, JWT, PyPDF2, python-docx |
| **Machine Learning** | MediaPipe (Face Mesh), Librosa (Audio Pitch/Variance Analysis) |

---

## 🚀 Setup & Installation

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Activate venv: .\venv\Scripts\activate (Windows) or source venv/bin/activate (macOS/Linux)
pip install fastapi uvicorn sqlalchemy pydantic librosa mediapipe opencv-python numpy pandas PyPDF2 python-docx scikit-learn
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📝 Usage Guide

### Getting Started:
1. Register a new account at `/login`.
2. Select your role (**Candidate** for practice, **Admin** for recruitment).
3. Log in with your new credentials.

### ML Prototypes (Legacy Demonstration Scripts):
If you want to see the underlying ML logic in isolation:
- `python face_tracking_prototype.py`: Real-time camera facial tracking.
- `python audio_analysis_prototype.py`: One-off analysis of a `.wav` file.

---

## 📂 Project Structure
- **/frontend**: React application components and styling.
- **/backend**: FastAPI routes, ML services, and database schemas.
- **/sample_resumes**: Test documents for the Resume Filtering module.

---

## 🌐 Deployment (Live Link)

### 1. Frontend (Vercel)
- **Repo Connection**: Go to [Vercel](https://vercel.com/new), import this repository, and select the `frontend` directory as the project root.
- **Framework Preset**: Select **Vite**.
- **Environment Variables**: Add a new variable:
  - **Key**: `VITE_API_URL`
  - **Value**: Your deployed backend URL (e.g., `https://your-backend.onrender.com`)
- **Deploy**: Click deploy and your live link will be generated!

### 2. Backend (Render / Railway)
- **Repo Connection**: Connect the repository and select the `backend` directory.
- **Runtime**: Python.
- **Build Command**: `pip install -r requirements.txt` (or manually install dependencies).
- **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
