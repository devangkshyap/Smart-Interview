@echo off
REM Smart Interview Project Launcher
REM This script sets up and runs both frontend and backend

setlocal enabledelayedexpansion

echo ========================================
echo  Smart Interview Project Launcher
echo ========================================
echo.

if "%1"=="" (
    echo Usage: run.bat [backend^|frontend^|both^|docker^|help]
    echo.
    echo Commands:
    echo   run.bat backend     - Start Flask backend only
    echo   run.bat frontend    - Start React frontend only
    echo   run.bat both        - Start both services ^(requires 2 terminals^)
    echo   run.bat docker      - Start with Docker Compose
    echo   run.bat help        - Show this help message
    echo.
    goto :eof
)

if "%1"=="help" (
    echo ========================================
    echo  Smart Interview - Available Commands
    echo ========================================
    echo.
    echo Backend Commands:
    echo   run.bat backend      - Start Flask backend ^(http://localhost:5000^)
    echo   run.bat backend-prod - Start with Gunicorn
    echo   run.bat db-init      - Initialize database
    echo   run.bat db-reset     - Reset database
    echo.
    echo Frontend Commands:
    echo   run.bat frontend     - Start React dev server ^(http://localhost:5173^)
    echo   run.bat build-frontend - Build for production
    echo.
    echo Combined:
    echo   run.bat both         - Instructions to run both ^(manual in 2 terminals^)
    echo   run.bat docker       - Start all with Docker
    echo.
    goto :eof
)

if "%1"=="backend" (
    echo.
    echo Starting Flask Backend...
    echo ========================================
    cd /d "%~dp0backend"
    call venv\Scripts\Activate.ps1
    python run.py
    goto :eof
)

if "%1"=="backend-prod" (
    echo.
    echo Starting Flask Backend ^(Production^)...
    echo ========================================
    cd /d "%~dp0backend"
    call venv\Scripts\Activate.ps1
    gunicorn -w 4 -b 0.0.0.0:5000 run:app
    goto :eof
)

if "%1"=="frontend" (
    echo.
    echo Starting React Frontend...
    echo ========================================
    cd /d "%~dp0frontend"
    call npm run dev
    goto :eof
)

if "%1"=="build-frontend" (
    echo.
    echo Building React Frontend...
    echo ========================================
    cd /d "%~dp0frontend"
    call npm run build
    goto :eof
)

if "%1"=="both" (
    echo.
    echo ========================================
    echo  To Run Both Services:
    echo ========================================
    echo.
    echo Terminal 1 - Backend:
    echo   cd "%~dp0backend"
    echo   venv\Scripts\Activate.ps1
    echo   python run.py
    echo.
    echo Terminal 2 - Frontend:
    echo   cd "%~dp0frontend"
    echo   npm run dev
    echo.
    echo Backend will run on:  http://localhost:5000
    echo Frontend will run on: http://localhost:5173
    echo.
    goto :eof
)

if "%1"=="db-init" (
    echo.
    echo Initializing Database...
    echo ========================================
    cd /d "%~dp0backend"
    call venv\Scripts\Activate.ps1
    flask init-db
    echo Database initialized!
    goto :eof
)

if "%1"=="db-reset" (
    echo.
    echo Resetting Database...
    echo ========================================
    cd /d "%~dp0backend"
    call venv\Scripts\Activate.ps1
    flask drop-db
    flask init-db
    echo Database reset!
    goto :eof
)

if "%1"=="docker" (
    echo.
    echo Starting with Docker Compose...
    echo ========================================
    docker-compose up --build
    goto :eof
)

echo Unknown command: %1
echo Use "run.bat help" for available commands
