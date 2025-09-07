# 🚀 Complete Setup Guide
## AI Academic Timetable Scheduler - Smart India Hackathon 2025

This guide will help you set up the complete AI Academic Timetable Scheduler on your local machine.

## 📋 Prerequisites

### System Requirements
- **Python**: 3.9 or higher
- **Node.js**: 18.0 or higher
- **Git**: Latest version
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux

### Optional (Recommended)
- **PostgreSQL**: For production database
- **Redis**: For caching and background tasks
- **Docker**: For containerized deployment

## 🔧 Backend Setup (Django)

### Step 1: Clone and Navigate
```bash
git clone <repository-url>
cd AI-Academic-Timetable-Scheduler/backend
```

### Step 2: Create Virtual Environment

**Windows:**
```cmd
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

**Option A: Automated Setup (Recommended)**
```bash
python setup_backend.py
```

**Option B: Manual Setup**
```bash
# Install core packages
pip install Django>=4.2.0
pip install djangorestframework>=3.14.0
pip install django-cors-headers>=4.0.0
pip install djangorestframework-simplejwt>=5.0.0

# Install optional packages (may fail on some systems)
pip install ortools>=9.0.0
pip install openpyxl>=3.0.0
pip install reportlab>=4.0.0
pip install Pillow>=10.0.0
pip install python-decouple>=3.0.0
pip install dj-database-url>=2.0.0
```

### Step 4: Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 5: Create Superuser
```bash
python manage.py createsuperuser
# Or use the automated script which creates: admin/admin123
```

### Step 6: Seed Demo Data
```bash
python manage.py seed_demo
```

### Step 7: Run Development Server
```bash
python manage.py runserver
```

**Backend should now be running at: http://localhost:8000**

## 🎨 Frontend Setup (Next.js)

### Step 1: Navigate to Frontend
```bash
cd ../frontend
```

### Step 2: Install Dependencies

**Option A: Automated Setup (Recommended)**
```bash
node setup_frontend.js
```

**Option B: Manual Setup**
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### Step 3: Environment Configuration
Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_THEME=dark
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### Step 4: Run Development Server
```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

**Frontend should now be running at: http://localhost:3000**

## 🧪 Testing the Setup

### 1. Backend API Test
Visit: http://localhost:8000/api/
- Should show Django REST Framework browsable API

### 2. Admin Panel Test
Visit: http://localhost:8000/admin/
- Login with: admin / admin123

### 3. Frontend Test
Visit: http://localhost:3000/
- Should show the landing page with theme toggle

### 4. Full Integration Test
1. Go to http://localhost:3000/
2. Click "Login as Admin"
3. Use credentials: admin@demo.com / admin123
4. Should redirect to admin dashboard

## 🎯 Demo Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@demo.com | admin123 | Full system access |
| Faculty | faculty@demo.com | faculty123 | Faculty dashboard |
| Student | student@demo.com | student123 | Student view |

## 🔍 Troubleshooting

### Backend Issues

**Issue: ModuleNotFoundError**
```bash
# Solution: Install missing packages
pip install <missing-package>
```

**Issue: Database errors**
```bash
# Solution: Reset database
rm db.sqlite3
python manage.py migrate
python manage.py seed_demo
```

**Issue: OR-Tools installation fails**
```bash
# Solution: Skip OR-Tools for basic functionality
# The system will work without it (with reduced optimization)
```

### Frontend Issues

**Issue: Module not found errors**
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: Theme not working**
```bash
# Solution: The system includes fallback theme handling
# Check browser console for errors
```

**Issue: API connection errors**
```bash
# Solution: Ensure backend is running on port 8000
# Check NEXT_PUBLIC_API_URL in .env.local
```

## 🚀 Production Deployment

### Backend (Django)
1. Set `DEBUG=False` in settings
2. Configure PostgreSQL database
3. Set up static file serving
4. Use Gunicorn or similar WSGI server

### Frontend (Next.js)
1. Run `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Set production environment variables

## 📊 Features to Test

### 1. Timetable Generation
- Go to Admin Dashboard
- Click "Generate Timetable"
- Wait for AI optimization to complete

### 2. Export Functionality
- Generate a timetable
- Test PDF, Excel, ICS exports
- Verify file downloads work

### 3. Analytics Dashboard
- View faculty workload analytics
- Check room utilization reports
- Analyze student density data

### 4. Theme System
- Toggle between light and dark themes
- Verify all components adapt properly
- Check accessibility in both modes

### 5. NEP 2020 Features
- Visit /nep-2020 page
- Review compliance features
- Test flexible credit system

## 🎓 Smart India Hackathon 2025 Demo

### Presentation Flow
1. **Landing Page**: Show modern UI and role selection
2. **NEP 2020 Page**: Demonstrate compliance features
3. **Admin Setup**: Show institution setup wizard
4. **Timetable Generation**: Live AI optimization demo
5. **Analytics**: Real-time insights and reports
6. **Export**: Multi-format export demonstration
7. **Theme System**: Light/dark mode switching

### Key Selling Points
- ✅ AI-powered optimization with OR-Tools
- ✅ NEP 2020 compliant scheduling
- ✅ Modern, responsive UI with glassmorphism
- ✅ Comprehensive analytics and reporting
- ✅ Multi-format export capabilities
- ✅ Role-based access control
- ✅ Real-time conflict resolution

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Review console logs for errors
3. Ensure all prerequisites are installed
4. Try the automated setup scripts first

## 🏆 Success Criteria

Your setup is successful when:
- ✅ Backend runs without errors on port 8000
- ✅ Frontend loads properly on port 3000
- ✅ Theme toggle works in both modes
- ✅ Demo login works for all roles
- ✅ Timetable generation completes successfully
- ✅ Export functions produce valid files
- ✅ Analytics display meaningful data

---

**Built with ❤️ for Smart India Hackathon 2025**
