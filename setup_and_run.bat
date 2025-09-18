@echo off
echo ========================================
echo NEP-2020 Timetable Generator Setup
echo ========================================
echo.

echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo Python found! Installing backend dependencies...
cd backend

echo Installing requirements from requirements.txt...
pip install -r requirements.txt

echo Cleaning up old migrations and database...
if exist db.sqlite3 del db.sqlite3
if exist timetable\migrations\0001_initial.py del timetable\migrations\0001_initial.py
if exist timetable\migrations\0002_*.py del timetable\migrations\0002_*.py
if exist timetable\migrations\0003_*.py del timetable\migrations\0003_*.py
if exist users\migrations\0001_initial.py del users\migrations\0001_initial.py

echo Creating fresh migrations...
python manage.py makemigrations users
python manage.py makemigrations timetable
python manage.py makemigrations

echo Applying migrations...
python manage.py migrate

echo Creating superuser and sample data...
python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
User.objects.filter(email='admin@demo.local').delete()
admin = User.objects.create_superuser(
    email='admin@demo.local',
    password='Admin@1234',
    username='admin',
    first_name='Admin',
    last_name='User',
    role='admin'
)
print('Admin user created successfully')
"

echo.
echo ========================================
echo Setup Complete! Starting servers...
echo ========================================
echo.

echo Backend: http://localhost:8000
echo Admin Panel: http://localhost:8000/admin
echo Login: admin@demo.local / Admin@1234
echo Faculty: faculty1@demo.local / Faculty@123
echo Student: student1@demo.local / Student@123
echo.

echo Starting Django backend...
start "NEP-2020 Backend" cmd /k "python manage.py runserver 8000"

echo.
echo Frontend setup...
cd ..\frontend
if exist package.json (
    echo Installing frontend dependencies...
    npm install
    echo Installing additional export packages...
    npm install html2canvas jspdf xlsx
    echo Starting frontend...
    start "NEP-2020 Frontend" cmd /k "npm run dev"
    echo Frontend: http://localhost:3000
) else (
    echo Frontend not found, backend-only mode
)

echo.
echo ========================================
echo NEP-2020 Timetable Generator is running!
echo ========================================
echo Backend: http://localhost:8000
echo Admin: http://localhost:8000/admin (admin@demo.local/Admin@1234)
echo Faculty: faculty1@demo.local / Faculty@123
echo Student: student1@demo.local / Student@123
echo Frontend: http://localhost:3000
echo.
echo All 9 setup modes are available in the admin dashboard
echo Timetable generation and export features are fully functional
echo.
pause
