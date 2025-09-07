# AI Academic Timetable Scheduler - Windows Setup Script
# This script sets up the development environment on Windows

param(
    [string]$PythonVersion = "3.11",
    [switch]$SkipVenv,
    [switch]$Force
)

Write-Host "=== AI Academic Timetable Scheduler - Windows Setup ===" -ForegroundColor Cyan
Write-Host "Setting up development environment..." -ForegroundColor Green

# Function to check if command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Function to run command with error handling
function Invoke-SafeCommand {
    param([string]$Command, [string]$Description)
    Write-Host "Running: $Description" -ForegroundColor Yellow
    Write-Host "Command: $Command" -ForegroundColor Gray
    
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0) {
            throw "Command failed with exit code $LASTEXITCODE"
        }
        Write-Host "✓ $Description completed successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ $Description failed: $_" -ForegroundColor Red
        Write-Host "You may need to run this script as Administrator or check your Python installation" -ForegroundColor Yellow
        exit 1
    }
}

# Check Python installation
Write-Host "`n1. Checking Python installation..." -ForegroundColor Cyan

$pythonCmd = "python"
if (Test-Command "py") {
    $pythonCmd = "py -$PythonVersion"
    Write-Host "Found Python launcher, using: $pythonCmd" -ForegroundColor Green
} elseif (Test-Command "python") {
    Write-Host "Found python command" -ForegroundColor Green
} else {
    Write-Host "✗ Python not found! Please install Python $PythonVersion or later from https://python.org" -ForegroundColor Red
    exit 1
}

# Check Python version
try {
    $pythonVersionOutput = & $pythonCmd.Split() --version 2>&1
    Write-Host "Python version: $pythonVersionOutput" -ForegroundColor Green
} catch {
    Write-Host "✗ Could not check Python version. Please ensure Python is properly installed." -ForegroundColor Red
    exit 1
}

# Check Node.js installation
Write-Host "`n2. Checking Node.js installation..." -ForegroundColor Cyan
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found! Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Setup Python virtual environment
if (-not $SkipVenv) {
    Write-Host "`n3. Setting up Python virtual environment..." -ForegroundColor Cyan
    
    if (Test-Path ".venv" -and -not $Force) {
        Write-Host "Virtual environment already exists. Use -Force to recreate." -ForegroundColor Yellow
    } else {
        if (Test-Path ".venv" -and $Force) {
            Write-Host "Removing existing virtual environment..." -ForegroundColor Yellow
            Remove-Item -Recurse -Force ".venv"
        }
        
        Invoke-SafeCommand "$pythonCmd -m venv .venv" "Creating virtual environment"
    }
    
    # Activate virtual environment
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    $activateScript = ".\.venv\Scripts\Activate.ps1"
    
    if (Test-Path $activateScript) {
        try {
            & $activateScript
            Write-Host "✓ Virtual environment activated" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to activate virtual environment. You may need to run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Red
            Write-Host "Then run this script again." -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "✗ Virtual environment activation script not found" -ForegroundColor Red
        exit 1
    }
}

# Upgrade pip and install backend dependencies
Write-Host "`n4. Installing backend dependencies..." -ForegroundColor Cyan

Invoke-SafeCommand "python -m pip install --upgrade pip setuptools wheel" "Upgrading pip, setuptools, and wheel"

if (Test-Path "backend\requirements.txt") {
    Invoke-SafeCommand "python -m pip install -r backend\requirements.txt" "Installing backend requirements"
} else {
    Write-Host "✗ backend\requirements.txt not found!" -ForegroundColor Red
    exit 1
}

# Install frontend dependencies
Write-Host "`n5. Installing frontend dependencies..." -ForegroundColor Cyan

if (Test-Path "frontend\package.json") {
    Push-Location "frontend"
    try {
        Invoke-SafeCommand "npm install" "Installing Node.js dependencies"
    } finally {
        Pop-Location
    }
} else {
    Write-Host "✗ frontend\package.json not found!" -ForegroundColor Red
    exit 1
}

# Run Django migrations
Write-Host "`n6. Setting up database..." -ForegroundColor Cyan
Push-Location "backend"
try {
    Invoke-SafeCommand "python manage.py migrate" "Running Django migrations"
} finally {
    Pop-Location
}

# Create demo admin user
Write-Host "`n7. Creating demo admin user..." -ForegroundColor Cyan
Push-Location "backend"
try {
    Invoke-SafeCommand "python manage.py create_demo_admin" "Creating demo admin user"
} catch {
    Write-Host "Demo admin creation failed - this is optional and can be done later" -ForegroundColor Yellow
} finally {
    Pop-Location
}

# Final instructions
Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "`nTo start the development servers:" -ForegroundColor Cyan
Write-Host "1. Backend (Django):" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   python manage.py runserver" -ForegroundColor Gray
Write-Host "`n2. Frontend (Next.js) - in a new terminal:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "`n3. Access the application:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor Gray
Write-Host "   Django Admin: http://localhost:8000/admin" -ForegroundColor Gray
Write-Host "`n4. Demo credentials (for testing only):" -ForegroundColor White
Write-Host "   Username: admin" -ForegroundColor Gray
Write-Host "   Password: Admin@1234" -ForegroundColor Gray

if (-not $SkipVenv) {
    Write-Host "`nNote: Remember to activate the virtual environment in new terminals:" -ForegroundColor Yellow
    Write-Host ".\.venv\Scripts\Activate.ps1" -ForegroundColor Gray
}

Write-Host "`nHappy coding! 🚀" -ForegroundColor Green
