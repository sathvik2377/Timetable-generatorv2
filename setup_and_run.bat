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

echo Installing Django and basic packages...
pip install Django==4.2.7 djangorestframework==3.14.0 django-cors-headers==4.3.1

echo Installing data processing packages...
pip install pandas==2.1.4 openpyxl==3.1.2 python-dateutil==2.8.2 pytz==2023.3 requests==2.31.0

echo Installing optimization packages (may take a few minutes)...
pip install ortools==9.8.3296
pip install scikit-learn==1.3.2 joblib==1.3.2
pip install numpy==1.24.4

echo Setting up database...
python manage.py makemigrations
python manage.py migrate

echo Loading demo data...
python manage.py loaddata indian_demo_data.json

echo Creating admin user...
echo from django.contrib.auth.models import User; User.objects.filter(username='admin').delete(); User.objects.create_superuser('admin', 'admin@bit.edu.in', 'admin123') | python manage.py shell

echo.
echo ========================================
echo Setup Complete! Starting servers...
echo ========================================
echo.

echo Backend: http://localhost:8000
echo Admin Panel: http://localhost:8000/admin
echo Login: admin / admin123
echo.

echo Starting Django backend...
start "NEP-2020 Backend" cmd /k "python manage.py runserver 8000"

echo.
echo Frontend setup (optional)...
cd ..\frontend
if exist package.json (
    echo Installing frontend dependencies...
    npm install
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
echo Admin: http://localhost:8000/admin (admin/admin123)
echo.
pause
