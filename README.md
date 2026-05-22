Smart AI Interview System

An AI-powered web application that helps users prepare for interviews through mock interview sessions, resume analysis, and intelligent feedback. The project is built using React for the frontend and Python for the backend.

Features
AI-based mock interviews
Resume analysis
Real-time feedback
User-friendly dashboard
Authentication system
Responsive UI
Backend API integration
Tech Stack
Frontend
React
HTML
CSS
JavaScript
Backend
Python
Flask / FastAPI
REST API
Project Structure
smart-ai-interview/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── app.py / main.py
│   ├── requirements.txt
│   └── models/
│
└── README.md
Installation
Clone the Repository
git clone <your-repository-url>
cd smart-ai-interview
Backend Setup
Move to Backend Folder
cd backend
Create Virtual Environment
Windows
python -m venv venv
venv\Scripts\activate
Linux / Mac
python3 -m venv venv
source venv/bin/activate
Install Dependencies
pip install -r requirements.txt
Run Backend Server
Flask
python app.py
FastAPI
uvicorn main:app --reload

Backend will run on:

http://127.0.0.1:5000

or

http://127.0.0.1:8000
Frontend Setup
Open New Terminal
cd frontend
Install Dependencies
npm install
Run Frontend
npm start

Frontend will run on:

http://localhost:3000
Environment Variables

Create a .env file in both frontend and backend folders if required.

Example:

OPENAI_API_KEY=your_api_key
MONGO_URI=your_database_url
JWT_SECRET=your_secret_key
API Integration

Make sure the frontend API URL matches the backend server URL.

Example:

http://127.0.0.1:5000/api
Future Improvements
Voice-based interviews
AI emotion detection
Interview performance analytics
Multi-language support
Video interview support
Author

Developed by Devang Kashyap
