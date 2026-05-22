# Smart Interview - Backend Setup & Integration Guide

## What Has Been Created

I've built a complete Flask backend for your Smart Interview application with the following components:

### 1. **Project Structure**
```
backend/
├── app/
│   ├── models/          # Database models (User, Interview, Question, Resume, etc.)
│   ├── routes/          # API endpoints (auth, interviews, resumes)
│   ├── services/        # Business logic (interview generation, resume analysis)
│   └── utils/           # Validators and decorators
├── config.py            # Configuration management
├── run.py              # Application entry point
├── requirements.txt    # Python dependencies
├── .env.example        # Environment variables template
├── Dockerfile          # Container configuration
├── docker-compose.yml  # Full stack orchestration
├── Makefile           # Development commands
└── README.md          # Full documentation
```

### 2. **Database Models**

**User**
- Email-based authentication with password hashing
- Profile information (first_name, last_name, profile_picture)
- Relationships to interviews and resumes

**Interview**
- Tracks interview sessions with type (behavioral/technical)
- Stores job role, company, number of questions
- Includes score, status, duration, and feedback
- Links to multiple Question records

**Question**
- Each interview has multiple questions
- Stores question text, user's answer, confidence score
- Tracks time spent and allows bookmarking
- Includes notes for user annotations

**Resume**
- File storage and analysis metadata
- Calculated scores (overall, ATS)
- Detected skills, experience data, keywords
- Multiple resumes per user with primary selection

**InterviewTemplate**
- Pre-configured questions by job role and type
- Allows customization by company
- Difficulty levels for scaling complexity

**InterviewFeedback**
- Detailed scoring for each answer
- Communication, technical, and relevance scores
- AI-generated suggestions for improvement

### 3. **API Endpoints**

#### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login with JWT tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

#### Interviews
- `GET /api/interviews` - List user's interviews (paginated)
- `GET /api/interviews/<id>` - Get interview details with all questions
- `POST /api/interviews` - Create new interview session
- `PUT /api/interviews/<id>` - Update interview (status, score)
- `PUT /api/interviews/<id>/questions/<q_id>` - Update answer/notes
- `DELETE /api/interviews/<id>` - Delete interview
- `GET /api/interviews/templates` - Get available question templates

#### Resumes
- `GET /api/resumes` - List user's resumes
- `GET /api/resumes/<id>` - Get resume with full analysis
- `POST /api/resumes/upload` - Upload and analyze resume
- `PUT /api/resumes/<id>` - Update settings (set as primary)
- `DELETE /api/resumes/<id>` - Delete resume

### 4. **Key Features**

✅ **JWT Authentication**
- Secure token-based authentication
- Access and refresh tokens
- Token expiration and renewal

✅ **Resume Analysis**
- PDF text extraction
- Technical skill detection (Python, React, AWS, etc.)
- Soft skill identification (Leadership, Communication, etc.)
- ATS compatibility scoring
- Keyword matching and suggestions
- Strengths and improvement recommendations

✅ **Interview Management**
- Dynamic question generation based on role/company
- Progress tracking (status, duration)
- Question-level metadata (time spent, confidence)
- Bookmarking for review
- Note-taking during interviews

✅ **Database Flexibility**
- Currently SQLite for development
- Easy switch to PostgreSQL for production
- Automatic database initialization

## Installation & Setup

### Quick Start (Windows)

1. **Open PowerShell in the backend directory**
```powershell
cd c:\projects\Smart interview\backend
```

2. **Create virtual environment**
```powershell
python -m venv venv
venv\Scripts\Activate.ps1
```

3. **Install dependencies**
```powershell
pip install -r requirements.txt
```

4. **Setup environment**
```powershell
Copy-Item .env.example .env
# Edit .env if needed
```

5. **Run the server**
```powershell
python run.py
```

Server starts at `http://localhost:5000`

### Alternative Setup (Using Makefile on Unix/Linux/Mac)

```bash
make install
make db-init
make dev
```

### Docker Setup (Recommended)

1. **Build and run with Docker Compose**
```bash
docker-compose up --build
```

This starts:
- Backend on `http://localhost:5000`
- Frontend on `http://localhost:5173` (if Dockerfile exists)

## Frontend Integration

### Step 1: Update Frontend API Configuration

In `frontend/src/`, create an `api.ts` file:

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Step 2: Update Login Component

Replace the hardcoded navigation in `LoginPage.tsx`:

```typescript
import api from '../api';

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    navigate('/dashboard');
  } catch (error) {
    setError('Invalid credentials');
  }
};
```

### Step 3: Update Dashboard

Replace mock data with API calls:

```typescript
import { useEffect, useState } from 'react';
import api from '../api';

const [interviews, setInterviews] = useState([]);

useEffect(() => {
  const fetchInterviews = async () => {
    try {
      const response = await api.get('/interviews');
      setInterviews(response.data.interviews);
    } catch (error) {
      console.error('Failed to fetch interviews');
    }
  };
  
  fetchInterviews();
}, []);
```

### Step 4: Interview Configuration Integration

```typescript
const handleLaunch = async () => {
  try {
    const response = await api.post('/interviews', {
      interview_type: interviewType,
      job_role: jobRole,
      company: company,
      num_questions: numQuestions,
    });
    
    navigate(`/interview?id=${response.data.interview.id}`);
  } catch (error) {
    console.error('Failed to create interview');
  }
};
```

### Step 5: Resume Upload Integration

```typescript
const handleFileUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    
    setAnalysis(response.data.resume);
  } catch (error) {
    console.error('Upload failed');
  }
};
```

## Environment Variables

Create a `.env` file in the backend folder:

```env
# Flask Configuration
FLASK_ENV=development
FLASK_APP=run.py

# Security (CHANGE THESE IN PRODUCTION)
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database
DATABASE_URL=sqlite:///smart_interview.db
# For PostgreSQL: postgresql://user:password@localhost/smart_interview

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload
MAX_CONTENT_LENGTH=52428800  # 50MB
```

## Running Both Frontend & Backend

### Option 1: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 2: Docker Compose (Easiest)

```bash
docker-compose up
```

### Option 3: Makefile

```bash
make docker-up   # Start both services
make docker-down # Stop both services
```

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'

# Create interview (replace TOKEN)
curl -X POST http://localhost:5000/api/interviews \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "interview_type":"behavioral",
    "job_role":"Software Engineer",
    "company":"Google",
    "num_questions":10
  }'
```

### Using Postman

1. Import the API endpoints
2. Set `Authorization` header: `Bearer {access_token}`
3. Test each endpoint

## Common Issues & Solutions

### Issue: "Connection refused" on localhost:5000
**Solution:** Make sure backend is running: `python run.py`

### Issue: CORS errors in frontend
**Solution:** Check `.env` CORS_ORIGINS includes frontend URL

### Issue: Database locked error
**Solution:** Delete `smart_interview.db` and reinitialize: `flask init-db`

### Issue: Upload file limit exceeded
**Solution:** Increase MAX_CONTENT_LENGTH in `.env`

## Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Using Heroku

```bash
heroku login
heroku create smart-interview-api
git push heroku main
```

### Using AWS/DigitalOcean

See `Dockerfile` for containerization. Deploy using:
- Docker registry (ECR, Docker Hub)
- Container orchestration (ECS, Kubernetes)

## Next Steps

1. ✅ Backend is ready
2. 📝 Update frontend to use API endpoints
3. 🔐 Add authentication guards to frontend routes
4. 📊 Implement frontend error handling
5. 🧪 Add comprehensive testing
6. 🚀 Deploy to production

## Support & Documentation

- **API Docs**: See `API.md`
- **Backend README**: See `README.md`
- **Database Schema**: Models in `app/models/__init__.py`
- **Configuration**: `config.py`

## Key Files to Reference

| File | Purpose |
|------|---------|
| `app/models/__init__.py` | Database schema definition |
| `app/routes/auth.py` | Authentication endpoints |
| `app/routes/interviews.py` | Interview management |
| `app/routes/resumes.py` | Resume upload/analysis |
| `app/services/interview_service.py` | Interview logic |
| `app/services/resume_service.py` | Resume analysis |
| `config.py` | Configuration settings |
| `run.py` | Application entry point |
