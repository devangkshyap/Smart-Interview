# Quick Start - 5 Minutes

## On Windows (PowerShell)

```powershell
# 1. Navigate to backend folder
cd c:\projects\Smart interview\backend

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\Activate.ps1

# 3. Install dependencies
pip install -r requirements.txt

# 4. Initialize database
flask init-db

# 5. Run the server
python run.py
```

Server is running at: **http://localhost:5000**

## Test the API

```powershell
# In a new PowerShell window:
curl -X GET http://localhost:5000/api/health
```

Expected response:
```json
{"status": "healthy"}
```

## Register & Login

```powershell
# Register
curl -X POST http://localhost:5000/api/auth/register `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@example.com","password":"Test1234","first_name":"John","last_name":"Doe"}'

# Login
curl -X POST http://localhost:5000/api/auth/login `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@example.com","password":"Test1234"}'
```

Response includes: `access_token` and `refresh_token`

## Create Interview

```powershell
# Replace TOKEN with access_token from login
curl -X POST http://localhost:5000/api/interviews `
  -Headers @{"Authorization"="Bearer TOKEN";"Content-Type"="application/json"} `
  -Body '{
    "interview_type":"behavioral",
    "job_role":"Software Engineer",
    "company":"Google",
    "num_questions":10
  }'
```

## Upload Resume

```powershell
# Replace TOKEN with access_token
$formData = @{
    file = Get-Item "C:\path\to\resume.pdf"
}

curl -X POST http://localhost:5000/api/resumes/upload `
  -Headers @{"Authorization"="Bearer TOKEN"} `
  -Form $formData
```

## Configuration

Create `.env` file (copy from `.env.example`):
```
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///smart_interview.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## Using Docker (Alternative)

```bash
docker-compose up --build
```

Both frontend and backend will start:
- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## Useful Commands

```bash
# View database
sqlite3 smart_interview.db

# Reset database
rm smart_interview.db
flask init-db

# Run in production mode
gunicorn -w 4 -b 0.0.0.0:5000 run:app

# View logs
tail -f smart_interview.log
```

## API Documentation

See `API.md` for complete endpoint reference.

## Frontend Integration

See `SETUP_GUIDE.md` for how to connect React frontend to this backend.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 already in use | `python run.py --port 5001` |
| ModuleNotFoundError | Run `pip install -r requirements.txt` |
| Database locked | Delete `smart_interview.db` and run `flask init-db` |
| CORS errors | Check `.env` CORS_ORIGINS setting |

## Directory Structure

```
backend/
├── app/                 # Application code
├── uploads/            # Resume uploads
├── smart_interview.db  # Database (auto-created)
├── run.py             # Start server
├── config.py          # Configuration
└── requirements.txt   # Dependencies
```

---

**Enjoy building!** 🚀

For detailed info: See `README.md`, `API.md`, or `SETUP_GUIDE.md`
