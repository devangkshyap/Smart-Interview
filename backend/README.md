# AI Smart Interview - Backend

This is the Flask backend for the AI Smart Interview application. It provides REST APIs for user authentication, interview management, and resume analysis.

## Features

- User authentication with JWT
- Interview creation and management
- Resume upload and analysis with AI-powered feedback
- Interview questions database
- User profile management
- Comprehensive API documentation

## Technology Stack

- **Framework**: Flask 3.0.0
- **Database**: SQLAlchemy with SQLite (can be switched to PostgreSQL)
- **Authentication**: Flask-JWT-Extended
- **File Processing**: PyPDF2 for resume parsing
- **CORS**: Flask-CORS for frontend integration

## Project Structure

```
backend/
├── app/
│   ├── __init__.py                 # App factory
│   ├── models/
│   │   └── __init__.py            # Database models
│   ├── routes/
│   │   ├── auth.py                # Authentication routes
│   │   ├── interviews.py          # Interview routes
│   │   └── resumes.py             # Resume routes
│   ├── services/
│   │   ├── interview_service.py   # Interview business logic
│   │   └── resume_service.py      # Resume analysis logic
│   └── utils/
│       ├── validators.py          # Input validation
│       └── decorators.py          # Custom decorators
├── config.py                        # Configuration
├── run.py                          # Application entry point
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment variables template
├── API.md                          # API documentation
└── README.md                       # This file
```

## Installation

### Prerequisites
- Python 3.8+
- pip or conda

### Setup

1. **Clone the repository**
```bash
cd backend
```

2. **Create virtual environment**
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup environment variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your settings
# Change SECRET_KEY and JWT_SECRET_KEY for production
```

5. **Initialize database**
```bash
flask db init  # First time only
flask db migrate
flask db upgrade
```

Or use the Flask shell:
```bash
flask init-db
```

## Running the Application

### Development
```bash
python run.py
```

The server will start at `http://localhost:5000`

### Production
```bash
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

## API Endpoints

See [API.md](API.md) for complete API documentation.

### Quick Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

#### Create Interview
```bash
POST /api/interviews
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "interview_type": "behavioral",
  "job_role": "Software Engineer",
  "company": "Google",
  "num_questions": 10
}
```

#### Upload Resume
```bash
POST /api/resumes/upload
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: <pdf_file>
```

## Database Models

### User
- id (UUID)
- email (unique)
- password_hash
- first_name
- last_name
- profile_picture
- created_at
- updated_at

### Interview
- id (UUID)
- user_id (FK)
- interview_type (behavioral/technical)
- job_role
- company
- num_questions
- score
- status (in_progress/completed/paused)
- duration_seconds
- feedback
- created_at
- updated_at

### Question
- id (UUID)
- interview_id (FK)
- question_text
- question_number
- answer_text
- answer_audio_url
- confidence_score
- time_spent_seconds
- is_bookmarked
- notes
- created_at
- updated_at

### Resume
- id (UUID)
- user_id (FK)
- file_path
- file_name
- overall_score
- ats_score
- strengths (JSON)
- improvements (JSON)
- skills_detected (JSON)
- experience_data (JSON)
- keywords (JSON)
- is_primary
- analysis_status
- created_at
- updated_at

## Configuration

### Development (.env)
```
FLASK_ENV=development
SECRET_KEY=dev-key-change-this
JWT_SECRET_KEY=jwt-dev-key-change-this
DATABASE_URL=sqlite:///smart_interview.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Production
- Use PostgreSQL for DATABASE_URL
- Set strong SECRET_KEY and JWT_SECRET_KEY
- Set FLASK_ENV=production
- Use proper CORS_ORIGINS configuration

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```

## Resume Analysis

The resume analysis feature:
1. Extracts text from PDF resumes
2. Detects technical skills (Python, React, AWS, etc.)
3. Detects soft skills (Leadership, Communication, etc.)
4. Identifies important keywords
5. Calculates ATS compatibility score
6. Provides strengths and improvement suggestions
7. Extracts experience details

## Deployment

### Docker
```bash
docker build -t smart-interview-backend .
docker run -p 5000:5000 smart-interview-backend
```

### Heroku
```bash
heroku create smart-interview-backend
git push heroku main
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For support, email support@smartinterview.com or open an issue on GitHub.

## Roadmap

- [ ] Add support for recording and storing interview videos
- [ ] Implement AI-powered answer evaluation
- [ ] Add mock interview with real-time feedback
- [ ] Integrate with video APIs for live interviews
- [ ] Add analytics dashboard
- [ ] Implement notification system
- [ ] Add email integration
