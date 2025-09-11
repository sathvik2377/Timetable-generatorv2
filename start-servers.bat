@echo off
echo Starting AI Academic Timetable Scheduler...
echo.

echo [1/3] Starting Backend Server...
cd backend
call pip install -r requirements.txt
start "Backend Server" cmd /k "python manage.py runserver 127.0.0.1:8000"
timeout /t 5 /nobreak >nul

echo [2/3] Starting Frontend Server...
cd ..\frontend
call npm install
start "Frontend Server" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo [3/3] Opening Demo Pages...
timeout /t 10 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo   AI ACADEMIC TIMETABLE SCHEDULER
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Demo Pages:
echo - Professional Demo: http://localhost:3000/demo-simple
echo - Interactive Builder: http://localhost:3000/demo-interactive
echo - Drag-Drop Editor: http://localhost:3000/edit-timetable
echo.
echo Login Credentials:
echo - Admin: admin@demo.local / Admin@1234
echo - Faculty: john.smith@demo.local / Faculty@123
echo - Student: alice.wilson@demo.local / Student@123
echo.
echo Press any key to exit...
pause >nul
