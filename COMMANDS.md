# Commands to Run the Smart Interview Project

## Quick Start (Recommended)

### Option 1: Run Both Services in Separate Terminals (Easiest)

#### Terminal 1 - Backend (Flask)
```powershell
cd "c:\projects\Smart interview\backend"
venv\Scripts\Activate.ps1
python run.py
```
**Backend runs on:** `http://localhost:5000`

#### Terminal 2 - Frontend (React)
```powershell
cd "c:\projects\Smart interview\frontend"
npm run dev
```
**Frontend runs on:** `http://localhost:5173`

---

## Frontend Commands

### Navigate to Frontend
```powershell
cd "c:\projects\Smart interview\frontend"
```

### Development Server
```powershell
npm run dev
```
- Starts Vite development server
- Hot reload enabled
- Available at: `http://localhost:5173`

### Build for Production
```powershell
npm run build
```
- Creates optimized production build
- Output in `dist/` folder

### Preview Production Build
```powershell
npm run preview
```
- Preview the production build locally

### Check Dependencies
```powershell
npm list
```

### Update Dependencies
```powershell
npm update
```

### Audit Security
```powershell
npm audit
```

---

## Backend Commands

### Navigate to Backend
```powershell
cd "c:\projects\Smart interview\backend"
```

### Activate Virtual Environment
```powershell
venv\Scripts\Activate.ps1
```

### Start Development Server
```powershell
python run.py
```
- Runs Flask development server
- Auto-reloads on code changes
- Available at: `http://localhost:5000`

### Run with Gunicorn (Production)
```powershell
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```
- 4 worker processes
- Production-ready server

### Initialize Database
```powershell
flask init-db
```
- Creates database tables
- Only needed on first setup

### Drop Database (Reset)
```powershell
flask drop-db
```
- Deletes all tables
- Useful for testing/development

### Flask Shell (Interactive)
```powershell
flask shell
```
- Python REPL with app context
- Can query database directly

### Check Installed Packages
```powershell
pip list
```

### Upgrade Packages
```powershell
pip install --upgrade -r requirements.txt
```

---

## Docker Commands (Alternative)

### Build and Run Both Services
```powershell
docker-compose up --build
```
- Builds and starts both frontend and backend
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

### Stop Services
```powershell
docker-compose down
```

### View Logs
```powershell
docker-compose logs -f backend
```
or
```powershell
docker-compose logs -f frontend
```

### Rebuild Containers
```powershell
docker-compose up --build
```

---

## Testing the API

### Health Check
```powershell
curl http://localhost:5000/api/health
```

### Register User
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@example.com","password":"Test1234","first_name":"John","last_name":"Doe"}'
```

### Login
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"test@example.com","password":"Test1234"}'
```

### Create Interview (replace TOKEN)
```powershell
curl -X POST http://localhost:5000/api/interviews `
  -Headers @{"Authorization"="Bearer TOKEN";"Content-Type"="application/json"} `
  -Body '{
    "interview_type":"behavioral",
    "job_role":"Software Engineer",
    "company":"Google",
    "num_questions":10
  }'
```

---

## Complete Setup Flow

### Step 1: Clone/Navigate to Project
```powershell
cd "c:\projects\Smart interview"
```

### Step 2: Install Frontend Dependencies (one-time)
```powershell
cd frontend
npm install
```

### Step 3: Install Backend Dependencies (one-time)
```powershell
cd ..\backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Step 4: Run Both Services

**Terminal 1 - Backend:**
```powershell
cd "c:\projects\Smart interview\backend"
venv\Scripts\Activate.ps1
python run.py
```

**Terminal 2 - Frontend:**
```powershell
cd "c:\projects\Smart interview\frontend"
npm run dev
```

---

## Common Issues & Solutions

### Issue: Port Already in Use
**Backend (5000):**
```powershell
python run.py --port 5001
```

**Frontend (5173):**
```powershell
npm run dev -- --port 5174
```

### Issue: Virtual Environment Not Activated
Check for `(venv)` prefix in terminal. If missing:
```powershell
venv\Scripts\Activate.ps1
```

### Issue: npm Not Found
Make sure Node.js is installed:
```powershell
node --version
npm --version
```

### Issue: Python Not Found
Check Python installation:
```powershell
python --version
python -c "import sys; print(sys.executable)"
```

### Issue: Database Locked
Reset database:
```powershell
# In backend directory with venv activated
flask drop-db
flask init-db
```

### Issue: CORS Errors
Ensure backend URL in frontend matches. Update in:
- Frontend API client configuration
- Backend `.env` CORS_ORIGINS

---

## Environment Variables

### Backend (.env)
Located at: `c:\projects\Smart interview\backend\.env`

Key variables:
```env
FLASK_ENV=development
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///smart_interview.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend
Located at: `c:\projects\Smart interview\frontend\.env`

Key variables (create if needed):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Useful Scripts (Makefile - Unix/Mac)

If on Linux/Mac, use:
```bash
make dev              # Run both
make install          # Install deps
make db-init          # Init database
make docker-up        # Start with Docker
make docker-down      # Stop Docker
```

---

## Project Structure for Commands

```
c:\projects\Smart interview\
├── frontend/                  # React + Vite
│   ├── npm run dev           # Start dev server
│   ├── npm run build         # Production build
│   └── node_modules/         # Dependencies
│
└── backend/                  # Flask
    ├── venv/                 # Virtual environment
    ├── python run.py         # Start server
    ├── flask init-db         # Initialize DB
    └── smart_interview.db    # Database file
```

---

## Ports Used

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (Flask) | 5000 | http://localhost:5000 |
| PostgreSQL (if used) | 5432 | localhost |

---

## First Time Running Project

1. **Install Frontend (one-time):**
   ```powershell
   cd "c:\projects\Smart interview\frontend"
   npm install
   ```

2. **Install Backend (one-time):**
   ```powershell
   cd "c:\projects\Smart interview\backend"
   python -m venv venv
   venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

3. **Start Backend (Terminal 1):**
   ```powershell
   cd "c:\projects\Smart interview\backend"
   venv\Scripts\Activate.ps1
   python run.py
   ```

4. **Start Frontend (Terminal 2):**
   ```powershell
   cd "c:\projects\Smart interview\frontend"
   npm run dev
   ```

5. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api/health

---

## Quick Reference Card

```powershell
# Frontend
cd frontend ; npm run dev        # Dev server
cd frontend ; npm run build      # Production build

# Backend  
cd backend ; venv\Scripts\Activate.ps1 ; python run.py      # Dev server
cd backend ; venv\Scripts\Activate.ps1 ; gunicorn -w 4 run:app # Production

# Docker
docker-compose up --build        # Start all services
docker-compose down              # Stop all services

# Database
flask init-db                    # Create tables
flask drop-db                    # Reset database

# Testing
curl http://localhost:5000/api/health   # Test backend
curl http://localhost:5173              # Test frontend
```

---

## Production Build & Deployment

### Build Frontend
```powershell
cd "c:\projects\Smart interview\frontend"
npm run build
```
Creates optimized build in `dist/` folder

### Deploy Backend
```powershell
cd "c:\projects\Smart interview\backend"
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Docker Production
```powershell
docker build -t smart-interview-backend .
docker run -p 5000:5000 smart-interview-backend
```

---

**Ready to develop! Start with the "Quick Start" section above.** 🚀
