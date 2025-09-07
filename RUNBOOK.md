# 🚀 AI Academic Timetable Scheduler - Quick Start Runbook

This runbook provides exact commands to get the AI Academic Timetable Scheduler running on a fresh Windows machine.

## ✅ Prerequisites Check

Before starting, ensure you have:
- **Python 3.11 or 3.12** (recommended for best compatibility)
- **Node.js 18+** and npm
- **Git** for version control

### Quick Compatibility Check

```powershell
# Run this to check your system compatibility
python scripts/check-compatibility.py
```

## 🪟 Windows Setup (Exact Commands)

### Step 1: Clone and Navigate

```powershell
git clone https://github.com/your-repo/AI-Academic-Timetable-Scheduler.git
cd AI-Academic-Timetable-Scheduler
```

### Step 2: Automated Setup (Recommended)

```powershell
# If you get execution policy errors, run this first:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Run the automated setup script
.\scripts\setup_windows.ps1
```

### Step 3: Manual Setup (If Automated Fails)

```powershell
# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Upgrade pip and install backend dependencies
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..

# Setup database
cd backend
python manage.py migrate
python manage.py create_demo_admin
cd ..
```

### Step 4: Start Development Servers

**Option A: Use Convenience Script**
```powershell
.\scripts\start-dev.ps1
```

**Option B: Manual Start (Two Terminals)**

Terminal 1 (Backend):
```powershell
cd backend
.\.venv\Scripts\Activate.ps1  # If not already activated
python manage.py runserver
```

Terminal 2 (Frontend):
```powershell
cd frontend
npm run dev
```

## 🌐 Access Your Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin

## 🔑 Demo Credentials

- **Username**: `admin`
- **Password**: `Admin@1234`

⚠️ **Important**: These are demo credentials for development only!

## 🛠️ Troubleshooting

### "The system cannot find the file specified"

This is the most common issue on Windows. Solutions:

1. **Always use `python -m pip` instead of `pip`**:
   ```powershell
   python -m pip install -r backend/requirements.txt
   ```

2. **Ensure Python is in PATH**:
   - Reinstall Python with "Add to PATH" option checked
   - Or use: `py -3.11 -m pip install ...`

3. **Run PowerShell as Administrator** if needed

### Virtual Environment Issues

```powershell
# If activation fails
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again
.\.venv\Scripts\Activate.ps1
```

### Port Already in Use

```powershell
# Backend - use different port
python manage.py runserver 8001

# Frontend will automatically try 3001, 3002, etc.
```

### Python 3.13 Compatibility

If you're using Python 3.13 and encounter issues:

```powershell
# Use Python 3.11 or 3.12 instead
py -3.11 -m venv .venv
```

## 📊 Validation Commands

Run these to verify everything is working:

```powershell
# Check compatibility
python scripts/check-compatibility.py

# Test backend
cd backend
.\.venv\Scripts\Activate.ps1
python manage.py check
python manage.py migrate --check

# Test frontend
cd frontend
npm run build  # This will fail if there are issues
```

## 🎯 Success Indicators

You know everything is working when:

1. ✅ Compatibility checker shows all green
2. ✅ `python manage.py migrate` completes without errors
3. ✅ `python manage.py runserver` starts without issues
4. ✅ `npm run dev` starts and shows "Ready in X.Xs"
5. ✅ You can access http://localhost:3000 and see the landing page
6. ✅ You can login with admin/Admin@1234

## 🚨 If Nothing Works

1. **Delete everything and start fresh**:
   ```powershell
   # Remove virtual environment
   Remove-Item -Recurse -Force .venv
   
   # Remove node_modules
   Remove-Item -Recurse -Force frontend/node_modules
   
   # Start over with manual setup
   ```

2. **Check your Python and Node versions**:
   ```powershell
   python --version  # Should be 3.11 or 3.12
   node --version    # Should be 18+
   ```

3. **Try the compatibility checker**:
   ```powershell
   python scripts/check-compatibility.py
   ```

## 📞 Getting Help

If you're still having issues:

1. Check the main README.md for detailed troubleshooting
2. Look at the logs in `backend/logs/django.log`
3. Ensure all prerequisites are properly installed
4. Try running commands one by one manually

---

**🎉 Once everything is running, you'll have a fully functional AI-powered timetable scheduling system!**
