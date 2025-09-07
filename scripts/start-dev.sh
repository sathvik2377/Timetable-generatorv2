#!/bin/bash
# AI Academic Timetable Scheduler - Development Server Starter
# This script starts both backend and frontend servers concurrently

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
SKIP_BACKEND=false
SKIP_FRONTEND=false
BACKEND_PORT="8000"
FRONTEND_PORT="3000"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-backend)
            SKIP_BACKEND=true
            shift
            ;;
        --skip-frontend)
            SKIP_FRONTEND=true
            shift
            ;;
        --backend-port)
            BACKEND_PORT="$2"
            shift 2
            ;;
        --frontend-port)
            FRONTEND_PORT="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --skip-backend       Skip starting backend server"
            echo "  --skip-frontend      Skip starting frontend server"
            echo "  --backend-port PORT  Backend port (default: 8000)"
            echo "  --frontend-port PORT Frontend port (default: 3000)"
            echo "  -h, --help           Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to print colored output
print_status() {
    echo -e "${CYAN}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Function to check if port is available
check_port() {
    local port=$1
    if command -v nc >/dev/null 2>&1; then
        ! nc -z localhost "$port" 2>/dev/null
    elif command -v netstat >/dev/null 2>&1; then
        ! netstat -tuln 2>/dev/null | grep -q ":$port "
    else
        # Fallback: assume port is available
        true
    fi
}

# Function to start backend server
start_backend() {
    print_info "Starting Django backend server on port $BACKEND_PORT..."
    
    if [ ! -f "backend/manage.py" ]; then
        print_error "Backend not found! Make sure you're in the project root directory."
        return 1
    fi
    
    # Check if virtual environment should be activated
    if [ -z "$VIRTUAL_ENV" ] && [ -d ".venv" ]; then
        print_info "Activating virtual environment..."
        source .venv/bin/activate
    fi
    
    # Check if port is available
    if ! check_port "$BACKEND_PORT"; then
        print_warning "Port $BACKEND_PORT is already in use. Backend may already be running."
        return 1
    fi
    
    # Start backend in background
    cd backend
    python manage.py runserver "127.0.0.1:$BACKEND_PORT" &
    BACKEND_PID=$!
    cd ..
    
    print_success "Backend server started (PID: $BACKEND_PID)"
    return 0
}

# Function to start frontend server
start_frontend() {
    print_info "Starting Next.js frontend server..."
    
    if [ ! -f "frontend/package.json" ]; then
        print_error "Frontend not found! Make sure you're in the project root directory."
        return 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "frontend/node_modules" ]; then
        print_info "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    # Start frontend in background
    cd frontend
    PORT="$FRONTEND_PORT" npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    print_success "Frontend server started (PID: $FRONTEND_PID)"
    return 0
}

# Function to cleanup on exit
cleanup() {
    print_info "Stopping servers..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
        print_success "Backend server stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
        print_success "Frontend server stopped"
    fi
    
    # Kill any remaining processes
    pkill -f "manage.py runserver" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    
    print_success "All servers stopped."
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

print_status "AI Academic Timetable Scheduler - Development Servers"

# Start servers
BACKEND_PID=""
FRONTEND_PID=""

if [ "$SKIP_BACKEND" = false ]; then
    start_backend
fi

if [ "$SKIP_FRONTEND" = false ]; then
    start_frontend
fi

# Check if any servers were started
if [ -z "$BACKEND_PID" ] && [ -z "$FRONTEND_PID" ]; then
    print_error "No servers started!"
    exit 1
fi

# Wait a moment for servers to start
sleep 3

print_status "Servers Started Successfully!"
echo ""
print_info "Access your application at:"

if [ "$SKIP_FRONTEND" = false ]; then
    echo -e "${NC}🌐 Frontend: http://localhost:$FRONTEND_PORT"
fi

if [ "$SKIP_BACKEND" = false ]; then
    echo -e "${NC}🔧 Backend API: http://localhost:$BACKEND_PORT"
    echo -e "${NC}⚙️  Django Admin: http://localhost:$BACKEND_PORT/admin"
fi

echo ""
print_info "Demo Credentials:"
echo -e "${NC}   Username: admin"
echo -e "${NC}   Password: Admin@1234"

echo ""
print_warning "To stop servers, press Ctrl+C"
print_info "Server logs will appear below..."

# Wait for servers to finish (or until interrupted)
wait
