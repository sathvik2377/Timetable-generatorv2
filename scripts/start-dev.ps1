# AI Academic Timetable Scheduler - Development Server Starter
# This script starts both backend and frontend servers concurrently

param(
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [string]$BackendPort = "8000",
    [string]$FrontendPort = "3000"
)

Write-Host "=== AI Academic Timetable Scheduler - Development Servers ===" -ForegroundColor Cyan

# Function to check if port is available
function Test-Port {
    param([string]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $false  # Port is in use
    }
    catch {
        return $true   # Port is available
    }
}

# Function to start backend server
function Start-Backend {
    Write-Host "`nStarting Django backend server on port $BackendPort..." -ForegroundColor Green
    
    if (-not (Test-Path "backend/manage.py")) {
        Write-Host "✗ Backend not found! Make sure you're in the project root directory." -ForegroundColor Red
        return $false
    }
    
    # Check if virtual environment is activated
    if (-not $env:VIRTUAL_ENV -and (Test-Path ".venv")) {
        Write-Host "Activating virtual environment..." -ForegroundColor Yellow
        try {
            & ".\.venv\Scripts\Activate.ps1"
        }
        catch {
            Write-Host "⚠ Could not activate virtual environment. Continuing anyway..." -ForegroundColor Yellow
        }
    }
    
    # Check if port is available
    if (-not (Test-Port $BackendPort)) {
        Write-Host "⚠ Port $BackendPort is already in use. Backend may already be running." -ForegroundColor Yellow
        return $false
    }
    
    # Start backend in background
    $backendJob = Start-Job -ScriptBlock {
        param($BackendPort)
        Set-Location "backend"
        python manage.py runserver "127.0.0.1:$BackendPort"
    } -ArgumentList $BackendPort
    
    Write-Host "✓ Backend server started (Job ID: $($backendJob.Id))" -ForegroundColor Green
    return $backendJob
}

# Function to start frontend server
function Start-Frontend {
    Write-Host "`nStarting Next.js frontend server..." -ForegroundColor Green
    
    if (-not (Test-Path "frontend/package.json")) {
        Write-Host "✗ Frontend not found! Make sure you're in the project root directory." -ForegroundColor Red
        return $false
    }
    
    # Check if node_modules exists
    if (-not (Test-Path "frontend/node_modules")) {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        Push-Location "frontend"
        npm install
        Pop-Location
    }
    
    # Start frontend in background
    $frontendJob = Start-Job -ScriptBlock {
        param($FrontendPort)
        Set-Location "frontend"
        $env:PORT = $FrontendPort
        npm run dev
    } -ArgumentList $FrontendPort
    
    Write-Host "✓ Frontend server started (Job ID: $($frontendJob.Id))" -ForegroundColor Green
    return $frontendJob
}

# Main execution
$jobs = @()

if (-not $SkipBackend) {
    $backendJob = Start-Backend
    if ($backendJob) {
        $jobs += $backendJob
    }
}

if (-not $SkipFrontend) {
    $frontendJob = Start-Frontend
    if ($frontendJob) {
        $jobs += $frontendJob
    }
}

if ($jobs.Count -eq 0) {
    Write-Host "✗ No servers started!" -ForegroundColor Red
    exit 1
}

# Wait a moment for servers to start
Start-Sleep -Seconds 3

Write-Host "`n=== Servers Started Successfully! ===" -ForegroundColor Green
Write-Host "`nAccess your application at:" -ForegroundColor Cyan

if (-not $SkipFrontend) {
    Write-Host "🌐 Frontend: http://localhost:$FrontendPort" -ForegroundColor White
}

if (-not $SkipBackend) {
    Write-Host "🔧 Backend API: http://localhost:$BackendPort" -ForegroundColor White
    Write-Host "⚙️  Django Admin: http://localhost:$BackendPort/admin" -ForegroundColor White
}

Write-Host "`n📋 Demo Credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor Gray
Write-Host "   Password: Admin@1234" -ForegroundColor Gray

Write-Host "`n🛑 To stop servers, press Ctrl+C or close this window" -ForegroundColor Yellow
Write-Host "📊 Server logs will appear below..." -ForegroundColor Gray

# Monitor jobs and display output
try {
    while ($jobs | Where-Object { $_.State -eq "Running" }) {
        foreach ($job in $jobs) {
            if ($job.State -eq "Running") {
                $output = Receive-Job -Job $job -Keep
                if ($output) {
                    Write-Host $output
                }
            }
        }
        Start-Sleep -Seconds 1
    }
}
finally {
    # Cleanup jobs on exit
    Write-Host "`n🛑 Stopping servers..." -ForegroundColor Yellow
    $jobs | Stop-Job
    $jobs | Remove-Job
    Write-Host "✓ All servers stopped." -ForegroundColor Green
}
