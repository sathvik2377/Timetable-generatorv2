#!/bin/bash
# AI Academic Timetable Scheduler - Unix Setup Script
# This script sets up the development environment on Unix-like systems (Linux/macOS)

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
PYTHON_VERSION="3.11"
SKIP_VENV=false
FORCE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --python-version)
            PYTHON_VERSION="$2"
            shift 2
            ;;
        --skip-venv)
            SKIP_VENV=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --python-version VERSION  Specify Python version (default: 3.11)"
            echo "  --skip-venv              Skip virtual environment creation"
            echo "  --force                  Force recreate virtual environment"
            echo "  -h, --help               Show this help message"
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run command with error handling
run_command() {
    local cmd="$1"
    local description="$2"
    
    print_info "Running: $description"
    echo -e "${YELLOW}Command: $cmd${NC}"
    
    if eval "$cmd"; then
        print_success "$description completed successfully"
    else
        print_error "$description failed"
        exit 1
    fi
}

print_status "AI Academic Timetable Scheduler - Unix Setup"
echo -e "${GREEN}Setting up development environment...${NC}"

# Check Python installation
print_status "1. Checking Python installation"

PYTHON_CMD=""
if command_exists "python$PYTHON_VERSION"; then
    PYTHON_CMD="python$PYTHON_VERSION"
elif command_exists "python3"; then
    PYTHON_CMD="python3"
elif command_exists "python"; then
    PYTHON_CMD="python"
else
    print_error "Python not found! Please install Python $PYTHON_VERSION or later"
    echo "On Ubuntu/Debian: sudo apt-get install python$PYTHON_VERSION python$PYTHON_VERSION-venv python$PYTHON_VERSION-pip"
    echo "On macOS: brew install python@$PYTHON_VERSION"
    exit 1
fi

print_success "Found Python command: $PYTHON_CMD"

# Check Python version
PYTHON_VERSION_OUTPUT=$($PYTHON_CMD --version 2>&1)
print_success "Python version: $PYTHON_VERSION_OUTPUT"

# Check Node.js installation
print_status "2. Checking Node.js installation"
if command_exists "node"; then
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
else
    print_error "Node.js not found! Please install Node.js from https://nodejs.org"
    echo "On Ubuntu/Debian: curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs"
    echo "On macOS: brew install node"
    exit 1
fi

# Setup Python virtual environment
if [ "$SKIP_VENV" = false ]; then
    print_status "3. Setting up Python virtual environment"
    
    if [ -d ".venv" ] && [ "$FORCE" = false ]; then
        print_warning "Virtual environment already exists. Use --force to recreate."
    else
        if [ -d ".venv" ] && [ "$FORCE" = true ]; then
            print_info "Removing existing virtual environment..."
            rm -rf .venv
        fi
        
        run_command "$PYTHON_CMD -m venv .venv" "Creating virtual environment"
    fi
    
    # Activate virtual environment
    print_info "Activating virtual environment..."
    if [ -f ".venv/bin/activate" ]; then
        source .venv/bin/activate
        print_success "Virtual environment activated"
    else
        print_error "Virtual environment activation script not found"
        exit 1
    fi
fi

# Upgrade pip and install backend dependencies
print_status "4. Installing backend dependencies"

run_command "python -m pip install --upgrade pip setuptools wheel" "Upgrading pip, setuptools, and wheel"

if [ -f "backend/requirements.txt" ]; then
    run_command "python -m pip install -r backend/requirements.txt" "Installing backend requirements"
else
    print_error "backend/requirements.txt not found!"
    exit 1
fi

# Install frontend dependencies
print_status "5. Installing frontend dependencies"

if [ -f "frontend/package.json" ]; then
    cd frontend
    run_command "npm install" "Installing Node.js dependencies"
    cd ..
else
    print_error "frontend/package.json not found!"
    exit 1
fi

# Run Django migrations
print_status "6. Setting up database"
cd backend
run_command "python manage.py migrate" "Running Django migrations"
cd ..

# Create demo admin user
print_status "7. Creating demo admin user"
cd backend
if python manage.py create_demo_admin; then
    print_success "Demo admin user created"
else
    print_warning "Demo admin creation failed - this is optional and can be done later"
fi
cd ..

# Final instructions
print_status "Setup Complete!"
echo ""
print_info "To start the development servers:"
echo -e "${NC}1. Backend (Django):"
echo -e "${YELLOW}   cd backend${NC}"
echo -e "${YELLOW}   python manage.py runserver${NC}"
echo ""
echo -e "${NC}2. Frontend (Next.js) - in a new terminal:"
echo -e "${YELLOW}   cd frontend${NC}"
echo -e "${YELLOW}   npm run dev${NC}"
echo ""
echo -e "${NC}3. Access the application:"
echo -e "${YELLOW}   Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}   Backend API: http://localhost:8000${NC}"
echo -e "${YELLOW}   Django Admin: http://localhost:8000/admin${NC}"
echo ""
echo -e "${NC}4. Demo credentials (for testing only):"
echo -e "${YELLOW}   Username: admin${NC}"
echo -e "${YELLOW}   Password: Admin@1234${NC}"

if [ "$SKIP_VENV" = false ]; then
    echo ""
    print_warning "Remember to activate the virtual environment in new terminals:"
    echo -e "${YELLOW}   source .venv/bin/activate${NC}"
fi

echo ""
print_success "Happy coding! 🚀"
