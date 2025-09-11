# 🎓 AI Academic Timetable Scheduler

An intelligent, AI-powered academic timetable management system with advanced constraint programming using OR-Tools CP-SAT Solver.

## ✨ Features

### 🚀 **9 Setup Modes**
- **Quick Setup**: Fast setup for small institutions (5-10 minutes)
- **Smart Setup**: AI-powered intelligent setup with recommendations
- **Batch Setup**: Bulk setup for large institutions with multiple branches
- **Unified Setup**: Comprehensive setup wizard with all features
- **Simple Creator**: Visual drag-and-drop timetable builder
- **Excel Import**: Import existing data from Excel spreadsheets
- **Advanced Setup**: Advanced configuration with custom constraints
- **Template Based**: Use pre-built templates for common scenarios
- **Setup Wizard**: Guided step-by-step setup process

### 🎯 **Core Features**
- **OR-Tools CP-SAT Solver**: Advanced constraint programming for optimal scheduling
- **Intelligent Conflict Resolution**: Automatic detection and resolution of scheduling conflicts
- **Multi-Format Export**: PNG, PDF, Excel, CSV, JSON export options
- **Real-time Editing**: Drag-and-drop timetable editor with live preview
- **Sample Data Integration**: Quick demo setup with realistic sample data
- **Mandatory Lunch Breaks**: Configurable lunch break timing in all setups
- **Multi-Campus Support**: Enterprise-scale multi-branch management
- **Analytics Dashboard**: Comprehensive reporting and optimization metrics

### 🎨 **User Experience**
- **Beautiful Violet Theme**: Original purple/violet glass morphism design
- **Todo List & Event Planner**: Integrated productivity tools
- **Responsive Design**: Works perfectly on all device sizes
- **Dark/Light Mode**: Automatic theme switching with proper contrast
- **Interactive Animations**: Smooth Framer Motion animations throughout

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://python.org/)
- **Git** - [Download here](https://git-scm.com/)

### 🎯 **One-Click Setup**

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Timetable-generator
   ```

2. **Run the automatic setup:**
   ```bash
   # On Windows - Just double-click this file!
   START_SERVERS.bat
   ```

That's it! The script will:
- ✅ Check for Node.js and Python installation
- ✅ Install all frontend dependencies automatically
- ✅ Create Python virtual environment
- ✅ Install all backend dependencies
- ✅ Run database migrations
- ✅ Start both servers in separate windows
- ✅ Open the application in your browser

### 🌐 **Access the Application**
- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:8000

## 📁 Project Structure

```
Timetable-generator/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable React components
│   │   ├── lib/            # Utility functions and API clients
│   │   └── types/          # TypeScript type definitions
│   ├── .env.local          # Frontend environment variables
│   └── package.json        # Frontend dependencies
├── backend/                 # Django REST API
│   ├── apps/               # Django applications
│   ├── config/             # Django settings
│   ├── .env               # Backend environment variables
│   ├── requirements.txt   # Python dependencies
│   └── manage.py          # Django management script
├── START_SERVERS.bat      # One-click startup script
└── README.md             # This file
```

## 🛠️ Manual Setup (Alternative)

If you prefer manual setup:

### Frontend Setup
```bash
cd frontend
npm install
npm run dev -- --port 3002
```

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate    # On Windows
# source venv/bin/activate  # On macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

## 🎯 **Usage Guide**

### 1. **First Time Setup**
- Start with **Quick Setup** or **Setup Wizard** for guided configuration
- Use **Sample Data** buttons for instant demo experience

### 2. **Large Institutions**
- Use **Batch Setup** for comprehensive multi-branch configuration
- **Smart Setup** provides AI recommendations and optimization

### 3. **Existing Data**
- Use **Excel Import** to upload your existing timetable data
- **Template Based** setup for common educational scenarios

### 4. **Visual Building**
- **Simple Creator** offers drag-and-drop timetable building
- Real-time conflict detection and resolution

## 🔧 **Configuration**

### Environment Variables

**Frontend (.env.local):**
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)
- `NEXT_PUBLIC_DEMO_MODE`: Enable demo mode with sample data
- `NEXT_PUBLIC_ENABLE_EXPORT`: Enable export functionality

**Backend (.env):**
- `DEBUG`: Django debug mode (True for development)
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: Database connection string
- `CORS_ALLOWED_ORIGINS`: Allowed frontend origins

## 🎨 **Customization**

### Theme Colors
The violet theme can be customized in `frontend/src/app/globals.css`:
```css
:root {
  --gradient-from: #0f0f23;  /* Dark slate */
  --gradient-via: #581c87;   /* Violet */
  --gradient-to: #1e1b4b;    /* Indigo */
}
```

### OR-Tools Configuration
Adjust solver parameters in `frontend/src/lib/intelligentTimetableGenerator.ts`:
```typescript
const solver = new CpSolver();
solver.parameters.max_time_in_seconds = 300;  // 5 minutes
solver.parameters.num_search_workers = 4;     // Parallel workers
```

## 🚀 **Deployment**

### Production Build
```bash
# Frontend
cd frontend
npm run build
npm start

# Backend
cd backend
pip install gunicorn
gunicorn config.wsgi:application
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

If you encounter any issues:

1. **Check Prerequisites**: Ensure Node.js and Python are installed
2. **Run START_SERVERS.bat**: This handles most setup automatically
3. **Check Logs**: Server windows show detailed error messages
4. **Port Conflicts**: Ensure ports 3002 and 8000 are available

## 🎉 **Acknowledgments**

- **OR-Tools**: Google's optimization tools for constraint programming
- **Next.js**: React framework for production-ready applications
- **Django**: High-level Python web framework
- **Framer Motion**: Animation library for React
- **Tailwind CSS**: Utility-first CSS framework

---

**Ready to revolutionize academic scheduling? Just run `START_SERVERS.bat` and get started! 🚀**
