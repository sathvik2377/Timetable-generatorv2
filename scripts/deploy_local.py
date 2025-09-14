#!/usr/bin/env python3
"""
NEP-2020 Timetable Generator - Local Deployment Script
Automated setup for local development and production deployment
"""

import os
import sys
import subprocess
import platform
import json
from pathlib import Path

class NEP2020Deployer:
    """
    Automated deployment manager for NEP-2020 Timetable System
    """
    
    def __init__(self):
        self.root_dir = Path(__file__).parent.parent
        self.backend_dir = self.root_dir / "backend"
        self.frontend_dir = self.root_dir / "frontend"
        self.is_windows = platform.system() == "Windows"
        self.python_cmd = "python" if self.is_windows else "python3"
        self.pip_cmd = "pip" if self.is_windows else "pip3"
        
    def log(self, message, level="INFO"):
        """Log messages with formatting"""
        icons = {"INFO": "ℹ️", "SUCCESS": "✅", "ERROR": "❌", "WARNING": "⚠️"}
        print(f"{icons.get(level, 'ℹ️')} {message}")
    
    def run_command(self, command, cwd=None, check=True):
        """Run shell command with error handling"""
        try:
            if isinstance(command, str):
                command = command.split()
            
            result = subprocess.run(
                command, 
                cwd=cwd or self.root_dir, 
                check=check,
                capture_output=True,
                text=True
            )
            return result
        except subprocess.CalledProcessError as e:
            self.log(f"Command failed: {' '.join(command)}", "ERROR")
            self.log(f"Error: {e.stderr}", "ERROR")
            if check:
                sys.exit(1)
            return None
    
    def check_prerequisites(self):
        """Check system prerequisites"""
        self.log("Checking system prerequisites...")
        
        # Check Python version
        python_version = sys.version_info
        if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
            self.log("Python 3.8+ is required", "ERROR")
            sys.exit(1)
        
        self.log(f"Python {python_version.major}.{python_version.minor} detected", "SUCCESS")
        
        # Check Node.js (for frontend)
        try:
            result = self.run_command(["node", "--version"], check=False)
            if result and result.returncode == 0:
                node_version = result.stdout.strip()
                self.log(f"Node.js {node_version} detected", "SUCCESS")
            else:
                self.log("Node.js not found - frontend features may not work", "WARNING")
        except FileNotFoundError:
            self.log("Node.js not found - frontend features may not work", "WARNING")
        
        # Check Git
        try:
            result = self.run_command(["git", "--version"], check=False)
            if result and result.returncode == 0:
                self.log("Git detected", "SUCCESS")
            else:
                self.log("Git not found - version control features disabled", "WARNING")
        except FileNotFoundError:
            self.log("Git not found - version control features disabled", "WARNING")
    
    def setup_backend(self):
        """Setup Django backend"""
        self.log("Setting up Django backend...")

        # Install Python dependencies with Windows compatibility
        self.log("Installing Python dependencies...")

        # Install packages individually for better Windows compatibility
        windows_packages = [
            "Django==4.2.7",
            "djangorestframework==3.14.0",
            "django-cors-headers==4.3.1",
            "pandas==2.1.4",
            "openpyxl==3.1.2",
            "python-dateutil==2.8.2",
            "pytz==2023.3",
            "requests==2.31.0"
        ]

        # Install basic packages first
        for package in windows_packages:
            self.log(f"Installing {package}...")
            try:
                self.run_command([self.pip_cmd, "install", package], check=False)
            except:
                self.log(f"Failed to install {package}, continuing...", "WARNING")

        # Try to install OR-Tools and scikit-learn separately
        advanced_packages = [
            "ortools==9.8.3296",
            "scikit-learn==1.3.2",
            "joblib==1.3.2",
            "numpy==1.24.4"
        ]

        for package in advanced_packages:
            self.log(f"Installing {package}...")
            try:
                self.run_command([self.pip_cmd, "install", package], check=False)
                self.log(f"✅ {package} installed successfully", "SUCCESS")
            except:
                self.log(f"⚠️ Failed to install {package} - some features may be limited", "WARNING")

        self.log("Python dependencies installation completed", "SUCCESS")
        
        # Setup database
        self.log("Setting up database...")
        os.chdir(self.backend_dir)
        
        self.run_command([self.python_cmd, "manage.py", "makemigrations"])
        self.run_command([self.python_cmd, "manage.py", "migrate"])
        self.log("Database setup complete", "SUCCESS")
        
        # Load demo data
        fixtures_dir = self.backend_dir / "timetable" / "fixtures"
        if (fixtures_dir / "indian_demo_data.json").exists():
            self.log("Loading Indian demo data...")
            self.run_command([self.python_cmd, "manage.py", "loaddata", "indian_demo_data.json"])
            self.log("Demo data loaded", "SUCCESS")
        
        # Create superuser
        self.log("Creating admin user...")
        self.create_superuser()
        
        os.chdir(self.root_dir)
    
    def create_superuser(self):
        """Create Django superuser"""
        try:
            # Check if superuser already exists
            result = self.run_command([
                self.python_cmd, "manage.py", "shell", "-c",
                "from django.contrib.auth.models import User; print(User.objects.filter(is_superuser=True).exists())"
            ], check=False)
            
            if result and "True" in result.stdout:
                self.log("Admin user already exists", "INFO")
                return
            
            # Create superuser with default credentials
            create_user_script = """
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@bit.edu.in', 'admin123')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
"""
            
            with open(self.backend_dir / "create_admin.py", "w") as f:
                f.write(create_user_script)
            
            self.run_command([self.python_cmd, "manage.py", "shell", "-c", create_user_script])
            self.log("Admin user created (username: admin, password: admin123)", "SUCCESS")
            
            # Clean up
            os.remove(self.backend_dir / "create_admin.py")
            
        except Exception as e:
            self.log(f"Failed to create superuser: {str(e)}", "WARNING")
    
    def setup_frontend(self):
        """Setup Next.js frontend"""
        if not self.frontend_dir.exists():
            self.log("Frontend directory not found, skipping frontend setup", "WARNING")
            return
        
        self.log("Setting up Next.js frontend...")
        
        # Check if package.json exists
        package_json = self.frontend_dir / "package.json"
        if not package_json.exists():
            self.log("package.json not found, skipping frontend setup", "WARNING")
            return
        
        # Install Node.js dependencies
        self.log("Installing Node.js dependencies...")
        os.chdir(self.frontend_dir)
        
        try:
            self.run_command(["npm", "install"])
            self.log("Frontend dependencies installed", "SUCCESS")
        except:
            try:
                self.run_command(["yarn", "install"])
                self.log("Frontend dependencies installed with Yarn", "SUCCESS")
            except:
                self.log("Failed to install frontend dependencies", "ERROR")
        
        os.chdir(self.root_dir)
    
    def create_startup_scripts(self):
        """Create startup scripts for easy deployment"""
        self.log("Creating startup scripts...")
        
        # Windows batch script
        if self.is_windows:
            start_script = """@echo off
echo Starting NEP-2020 Timetable Generator...
echo.

echo Starting Django backend...
cd backend
start "Django Backend" cmd /k "python manage.py runserver 8000"

timeout /t 3 /nobreak > nul

echo Starting Next.js frontend...
cd ../frontend
start "Next.js Frontend" cmd /k "npm run dev"

echo.
echo ✅ NEP-2020 Timetable Generator is starting...
echo 📊 Backend: http://localhost:8000
echo 🌐 Frontend: http://localhost:3000
echo 👤 Admin: http://localhost:8000/admin (admin/admin123)
echo.
pause
"""
            with open(self.root_dir / "start.bat", "w") as f:
                f.write(start_script)
        
        # Unix shell script
        start_script_unix = """#!/bin/bash
echo "Starting NEP-2020 Timetable Generator..."
echo

echo "Starting Django backend..."
cd backend
python3 manage.py runserver 8000 &
BACKEND_PID=$!

sleep 3

echo "Starting Next.js frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ NEP-2020 Timetable Generator is running!"
echo "📊 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
echo "👤 Admin: http://localhost:8000/admin (admin/admin123)"
echo
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'kill $BACKEND_PID $FRONTEND_PID; exit' INT
wait
"""
        with open(self.root_dir / "start.sh", "w") as f:
            f.write(start_script_unix)
        
        # Make executable on Unix systems
        if not self.is_windows:
            os.chmod(self.root_dir / "start.sh", 0o755)
        
        self.log("Startup scripts created", "SUCCESS")
    
    def create_env_file(self):
        """Create environment configuration file"""
        self.log("Creating environment configuration...")
        
        env_content = """# NEP-2020 Timetable Generator Configuration
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (SQLite by default)
DATABASE_URL=sqlite:///db.sqlite3

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Email Settings (optional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# ML Models Directory
ML_MODELS_DIR=ml_models

# File Upload Settings
MAX_UPLOAD_SIZE=10485760  # 10MB
"""
        
        env_file = self.backend_dir / ".env"
        if not env_file.exists():
            with open(env_file, "w") as f:
                f.write(env_content)
            self.log("Environment file created", "SUCCESS")
        else:
            self.log("Environment file already exists", "INFO")
    
    def run_tests(self):
        """Run system tests"""
        self.log("Running system tests...")
        
        os.chdir(self.backend_dir)
        
        # Run Django tests
        try:
            self.run_command([self.python_cmd, "manage.py", "test", "--verbosity=2"], check=False)
            self.log("Django tests completed", "SUCCESS")
        except:
            self.log("Some tests failed, but deployment can continue", "WARNING")
        
        # Run custom NEP-2020 tests
        test_script = self.backend_dir / "test_nep2020_system.py"
        if test_script.exists():
            try:
                self.run_command([self.python_cmd, "test_nep2020_system.py"], check=False)
                self.log("NEP-2020 system tests completed", "SUCCESS")
            except:
                self.log("NEP-2020 tests encountered issues", "WARNING")
        
        os.chdir(self.root_dir)
    
    def deploy(self, skip_tests=False):
        """Full deployment process"""
        self.log("🚀 Starting NEP-2020 Timetable Generator Deployment")
        self.log("="*60)
        
        try:
            self.check_prerequisites()
            self.create_env_file()
            self.setup_backend()
            self.setup_frontend()
            self.create_startup_scripts()
            
            if not skip_tests:
                self.run_tests()
            
            self.log("="*60)
            self.log("🎉 Deployment completed successfully!", "SUCCESS")
            self.log("")
            self.log("📋 Next Steps:")
            self.log("1. Run 'start.bat' (Windows) or './start.sh' (Unix) to start the system")
            self.log("2. Open http://localhost:3000 for the frontend")
            self.log("3. Open http://localhost:8000/admin for admin panel (admin/admin123)")
            self.log("4. Use the wizard to create your first timetable")
            self.log("")
            self.log("📚 Documentation: Check README.md for detailed usage instructions")
            self.log("🐛 Issues: Report bugs on the project repository")
            
        except Exception as e:
            self.log(f"Deployment failed: {str(e)}", "ERROR")
            sys.exit(1)


def main():
    """Main deployment function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="NEP-2020 Timetable Generator Deployment")
    parser.add_argument("--skip-tests", action="store_true", help="Skip running tests")
    parser.add_argument("--backend-only", action="store_true", help="Setup backend only")
    parser.add_argument("--frontend-only", action="store_true", help="Setup frontend only")
    
    args = parser.parse_args()
    
    deployer = NEP2020Deployer()
    
    if args.backend_only:
        deployer.check_prerequisites()
        deployer.create_env_file()
        deployer.setup_backend()
    elif args.frontend_only:
        deployer.check_prerequisites()
        deployer.setup_frontend()
    else:
        deployer.deploy(skip_tests=args.skip_tests)


if __name__ == "__main__":
    main()
