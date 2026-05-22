# Quick Start - Run Both Services

## 🚀 Start in 30 Seconds

### Terminal 1: Backend
```powershell
cd "c:\projects\Smart interview\backend"
venv\Scripts\Activate.ps1
python run.py
```
→ Runs on `http://localhost:5000`

### Terminal 2: Frontend
```powershell
cd "c:\projects\Smart interview\frontend"
npm run dev
```
→ Runs on `http://localhost:5173`

---

## ✅ That's It!

Open browser: **http://localhost:5173**

Backend API: **http://localhost:5000/api**

Test: `curl http://localhost:5000/api/health`

---

## Other Commands

### Build Frontend for Production
```powershell
cd "c:\projects\Smart interview\frontend"
npm run build
```

### Production Backend
```powershell
cd "c:\projects\Smart interview\backend"
venv\Scripts\Activate.ps1
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

### Reset Database
```powershell
cd "c:\projects\Smart interview\backend"
venv\Scripts\Activate.ps1
flask drop-db
flask init-db
```

### Both Services with Docker
```powershell
docker-compose up --build
```

---

## 🆘 Issues?

See `COMMANDS.md` for detailed troubleshooting
