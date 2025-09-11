@echo off
echo ========================================
echo   AI Academic Timetable Scheduler
echo   Starting Development Servers...
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)

echo Node.js and Python are installed. Proceeding...
echo.

REM Navigate to project root
cd /d "%~dp0"

REM Install frontend dependencies if node_modules doesn't exist
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo Frontend dependencies installed successfully!
    echo.
)

REM Install backend dependencies if venv doesn't exist
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    if %errorlevel% neq 0 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    
    echo Activating virtual environment and installing dependencies...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo Backend dependencies installed successfully!
    echo.
)

REM Create log directory if it doesn't exist
if not exist "logs" mkdir logs

echo ========================================
echo   Starting Servers...
echo ========================================
echo.

REM Start backend server in a new window
echo Starting Django backend server on http://localhost:8000...
start "Django Backend" cmd /k "cd /d "%~dp0backend" && venv\Scripts\activate.bat && python manage.py migrate && python manage.py runserver 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server in a new window
echo Starting Next.js frontend server on http://localhost:3002...
start "Next.js Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --port 3002"

REM Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   Servers Started Successfully!
echo ========================================
echo.
echo Frontend: http://localhost:3002
echo Backend:  http://localhost:8000
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
echo Press any key to open the application in your browser...
pause >nul

REM Open the application in default browser
start http://localhost:3002

echo.
echo Application opened in browser!
echo Keep the server windows open to continue using the application.
echo.
pause
