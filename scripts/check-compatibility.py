#!/usr/bin/env python3
"""
AI Academic Timetable Scheduler - Compatibility Checker
This script checks system compatibility and requirements
"""

import sys
import subprocess
import platform
import os
from pathlib import Path

# Colors for output
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_colored(text, color=Colors.WHITE):
    """Print colored text"""
    print(f"{color}{text}{Colors.END}")

def print_status(text):
    """Print status message"""
    print_colored(f"=== {text} ===", Colors.CYAN)

def print_success(text):
    """Print success message"""
    print_colored(f"✓ {text}", Colors.GREEN)

def print_error(text):
    """Print error message"""
    print_colored(f"✗ {text}", Colors.RED)

def print_warning(text):
    """Print warning message"""
    print_colored(f"⚠ {text}", Colors.YELLOW)

def print_info(text):
    """Print info message"""
    print_colored(f"ℹ {text}", Colors.BLUE)

def run_command(command, capture_output=True):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            capture_output=capture_output, 
            text=True,
            timeout=10
        )
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

def check_python_version():
    """Check Python version compatibility"""
    print_status("Checking Python Version")
    
    version = sys.version_info
    version_str = f"{version.major}.{version.minor}.{version.micro}"
    
    print_info(f"Python version: {version_str}")
    print_info(f"Platform: {platform.platform()}")
    
    # Check if version is supported
    if version.major != 3:
        print_error("Python 3 is required!")
        return False
    
    if version.minor < 11:
        print_error("Python 3.11 or higher is required!")
        print_info("Please upgrade Python: https://python.org/downloads/")
        return False
    
    if version.minor == 13:
        print_warning("Python 3.13 detected. Some dependencies may not be available yet.")
        print_info("Consider using Python 3.11 or 3.12 for best compatibility.")
    
    print_success(f"Python {version_str} is compatible")
    return True

def check_pip():
    """Check pip installation"""
    print_status("Checking pip")
    
    # Try different pip commands
    pip_commands = ["python -m pip", "pip3", "pip"]
    
    for cmd in pip_commands:
        success, output, error = run_command(f"{cmd} --version")
        if success:
            print_success(f"pip found: {output}")
            return True, cmd
    
    print_error("pip not found or not working!")
    print_info("Try: python -m ensurepip --upgrade")
    return False, None

def check_node():
    """Check Node.js installation"""
    print_status("Checking Node.js")
    
    success, output, error = run_command("node --version")
    if not success:
        print_error("Node.js not found!")
        print_info("Install from: https://nodejs.org/")
        return False
    
    version = output.replace('v', '')
    major_version = int(version.split('.')[0])
    
    print_info(f"Node.js version: {output}")
    
    if major_version < 18:
        print_error("Node.js 18 or higher is required!")
        print_info("Please upgrade Node.js")
        return False
    
    # Check npm
    success, npm_output, error = run_command("npm --version")
    if success:
        print_info(f"npm version: {npm_output}")
    else:
        print_warning("npm not found, but Node.js is available")
    
    print_success("Node.js is compatible")
    return True

def check_git():
    """Check Git installation"""
    print_status("Checking Git")
    
    success, output, error = run_command("git --version")
    if not success:
        print_warning("Git not found!")
        print_info("Install from: https://git-scm.com/")
        return False
    
    print_success(f"Git found: {output}")
    return True

def check_project_structure():
    """Check if we're in the correct project directory"""
    print_status("Checking Project Structure")
    
    required_files = [
        "backend/manage.py",
        "backend/requirements.txt",
        "frontend/package.json",
        "scripts/setup_windows.ps1",
        "scripts/setup_unix.sh"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print_error("Project structure incomplete!")
        print_info("Missing files:")
        for file_path in missing_files:
            print_info(f"  - {file_path}")
        print_info("Make sure you're in the project root directory")
        return False
    
    print_success("Project structure is correct")
    return True

def check_dependencies():
    """Check if dependencies can be installed"""
    print_status("Checking Dependencies")
    
    # Check if we can import key packages
    try:
        import sqlite3
        print_success("SQLite support available")
    except ImportError:
        print_warning("SQLite support not available")
    
    # Check if virtual environment is recommended
    if not os.environ.get('VIRTUAL_ENV'):
        print_warning("Not in a virtual environment")
        print_info("Consider using: python -m venv .venv")
    else:
        print_success(f"Virtual environment active: {os.environ.get('VIRTUAL_ENV')}")
    
    return True

def check_ports():
    """Check if required ports are available"""
    print_status("Checking Port Availability")
    
    ports_to_check = [3000, 8000]
    
    for port in ports_to_check:
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            result = sock.connect_ex(('localhost', port))
            sock.close()
            
            if result == 0:
                print_warning(f"Port {port} is in use")
            else:
                print_success(f"Port {port} is available")
        except Exception:
            print_info(f"Could not check port {port}")
    
    return True

def main():
    """Main compatibility check function"""
    print_colored("🎓 AI Academic Timetable Scheduler - Compatibility Check", Colors.BOLD + Colors.CYAN)
    print()
    
    checks = [
        ("Python Version", check_python_version),
        ("pip Installation", lambda: check_pip()[0]),
        ("Node.js Installation", check_node),
        ("Git Installation", check_git),
        ("Project Structure", check_project_structure),
        ("Dependencies", check_dependencies),
        ("Port Availability", check_ports),
    ]
    
    results = []
    
    for check_name, check_func in checks:
        try:
            result = check_func()
            results.append((check_name, result))
        except Exception as e:
            print_error(f"Error during {check_name}: {e}")
            results.append((check_name, False))
        print()
    
    # Summary
    print_status("Compatibility Check Summary")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for check_name, result in results:
        if result:
            print_success(f"{check_name}: PASS")
        else:
            print_error(f"{check_name}: FAIL")
    
    print()
    if passed == total:
        print_success(f"All checks passed! ({passed}/{total})")
        print_info("You can proceed with the setup:")
        if platform.system() == "Windows":
            print_info("  .\\scripts\\setup_windows.ps1")
        else:
            print_info("  ./scripts/setup_unix.sh")
    else:
        print_warning(f"Some checks failed ({passed}/{total})")
        print_info("Please address the issues above before proceeding")
    
    return passed == total

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print_colored("\n\nCompatibility check interrupted by user", Colors.YELLOW)
        sys.exit(1)
    except Exception as e:
        print_colored(f"\n\nUnexpected error: {e}", Colors.RED)
        sys.exit(1)
