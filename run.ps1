# Smart Interview Project Launcher (PowerShell)
# Usage: .\run.ps1 backend|frontend|both|docker|help

param(
    [Parameter(Position = 0)]
    [ValidateSet('backend', 'frontend', 'both', 'docker', 'backend-prod', 'db-init', 'db-reset', 'build-frontend', 'help')]
    [string]$Command = 'help'
)

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPath = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "frontend"

function Show-Banner {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Smart Interview Project Launcher" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Help {
    Show-Banner
    Write-Host "Available Commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Backend:" -ForegroundColor Green
    Write-Host "  .\run.ps1 backend       - Start Flask backend (http://localhost:5000)" -ForegroundColor White
    Write-Host "  .\run.ps1 backend-prod  - Start with Gunicorn (production)" -ForegroundColor White
    Write-Host "  .\run.ps1 db-init       - Initialize database" -ForegroundColor White
    Write-Host "  .\run.ps1 db-reset      - Reset database" -ForegroundColor White
    Write-Host ""
    Write-Host "Frontend:" -ForegroundColor Green
    Write-Host "  .\run.ps1 frontend      - Start React dev server (http://localhost:5173)" -ForegroundColor White
    Write-Host "  .\run.ps1 build-frontend - Build for production" -ForegroundColor White
    Write-Host ""
    Write-Host "Combined:" -ForegroundColor Green
    Write-Host "  .\run.ps1 both          - Show instructions for running both" -ForegroundColor White
    Write-Host "  .\run.ps1 docker        - Start all with Docker Compose" -ForegroundColor White
    Write-Host ""
}

function Start-Backend {
    Show-Banner
    Write-Host "Starting Flask Backend..." -ForegroundColor Yellow
    Write-Host "Server will be available at: http://localhost:5000" -ForegroundColor Cyan
    Write-Host ""
    
    Push-Location $BackendPath
    & .\venv\Scripts\Activate.ps1
    python run.py
    Pop-Location
}

function Start-BackendProd {
    Show-Banner
    Write-Host "Starting Flask Backend (Production Mode)..." -ForegroundColor Yellow
    Write-Host "Server will be available at: http://localhost:5000" -ForegroundColor Cyan
    Write-Host ""
    
    Push-Location $BackendPath
    & .\venv\Scripts\Activate.ps1
    gunicorn -w 4 -b 0.0.0.0:5000 run:app
    Pop-Location
}

function Start-Frontend {
    Show-Banner
    Write-Host "Starting React Frontend..." -ForegroundColor Yellow
    Write-Host "Server will be available at: http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
    
    Push-Location $FrontendPath
    npm run dev
    Pop-Location
}

function Build-Frontend {
    Show-Banner
    Write-Host "Building React Frontend for Production..." -ForegroundColor Yellow
    Write-Host ""
    
    Push-Location $FrontendPath
    npm run build
    Pop-Location
    
    Write-Host ""
    Write-Host "Build complete! Output in 'frontend/dist/'" -ForegroundColor Green
}

function Init-Database {
    Show-Banner
    Write-Host "Initializing Database..." -ForegroundColor Yellow
    
    Push-Location $BackendPath
    & .\venv\Scripts\Activate.ps1
    flask init-db
    Pop-Location
    
    Write-Host "Database initialized!" -ForegroundColor Green
}

function Reset-Database {
    Show-Banner
    Write-Host "Resetting Database..." -ForegroundColor Yellow
    Write-Host ""
    
    Push-Location $BackendPath
    & .\venv\Scripts\Activate.ps1
    flask drop-db
    flask init-db
    Pop-Location
    
    Write-Host "Database reset!" -ForegroundColor Green
}

function Show-Both-Instructions {
    Show-Banner
    Write-Host "To Run Both Services:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "TERMINAL 1 - Backend:" -ForegroundColor Green
    Write-Host '  cd "' + $BackendPath + '"' -ForegroundColor White
    Write-Host '  .\venv\Scripts\Activate.ps1' -ForegroundColor White
    Write-Host '  python run.py' -ForegroundColor White
    Write-Host ""
    Write-Host "TERMINAL 2 - Frontend:" -ForegroundColor Green
    Write-Host '  cd "' + $FrontendPath + '"' -ForegroundColor White
    Write-Host '  npm run dev' -ForegroundColor White
    Write-Host ""
    Write-Host "Backend will run on:  " -NoNewline
    Write-Host "http://localhost:5000" -ForegroundColor Cyan
    Write-Host "Frontend will run on: " -NoNewline
    Write-Host "http://localhost:5173" -ForegroundColor Cyan
    Write-Host ""
}

function Start-Docker {
    Show-Banner
    Write-Host "Starting with Docker Compose..." -ForegroundColor Yellow
    Write-Host ""
    
    Push-Location $ProjectRoot
    docker-compose up --build
    Pop-Location
}

# Main execution
switch ($Command) {
    'backend' { Start-Backend }
    'backend-prod' { Start-BackendProd }
    'frontend' { Start-Frontend }
    'build-frontend' { Build-Frontend }
    'both' { Show-Both-Instructions }
    'docker' { Start-Docker }
    'db-init' { Init-Database }
    'db-reset' { Reset-Database }
    'help' { Show-Help }
    default { Show-Help }
}
