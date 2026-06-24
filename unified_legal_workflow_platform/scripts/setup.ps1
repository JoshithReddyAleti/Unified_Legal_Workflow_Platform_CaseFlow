Write-Host "=== CaseFlow MCP Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check Python
$pythonFound = $false
$pythonExe = ""

$candidates = @(
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe",
    "$env:LOCALAPPDATA\Programs\Python\Python310\python.exe",
    "C:\Python312\python.exe",
    "C:\Python311\python.exe"
)

foreach ($p in $candidates) {
    if (Test-Path $p) {
        $pythonFound = $true
        $pythonExe = $p
        Write-Host "✓ Found Python at: $p" -ForegroundColor Green
        & $p --version
        break
    }
}

if (-not $pythonFound) {
    Write-Host "✗ Python not found. Please install Python 3.11+ from https://python.org" -ForegroundColor Red
    Write-Host "  Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    Write-Host "  After installing, re-run this script" -ForegroundColor Yellow
    Write-Host ""
}

# Check Node.js
$nodeFound = $false
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $nodeFound = $true
        Write-Host "✓ Found Node.js: $nodeVersion" -ForegroundColor Green
    }
} catch { }

if (-not $nodeFound) {
    $nvmPath = "$env:APPDATA\nvm\nvm.exe"
    $nodePath = "C:\Program Files\nodejs\node.exe"
    if (Test-Path $nodePath) {
        $nodeFound = $true
        Write-Host "✓ Found Node.js at: $nodePath" -ForegroundColor Green
    } else {
        Write-Host "✗ Node.js not found. Please install from https://nodejs.org (LTS version)" -ForegroundColor Red
        Write-Host ""
    }
}

if ($pythonFound -and $nodeFound) {
    Write-Host ""
    Write-Host "All dependencies found! Setting up..." -ForegroundColor Green

    $base = Split-Path $PSScriptRoot -Parent

    # Backend setup
    Write-Host ""
    Write-Host "Setting up Backend..." -ForegroundColor Cyan
    $backendPath = Join-Path $base "backend"
    Set-Location $backendPath

    & $pythonExe -m venv venv
    $activate = Join-Path $backendPath "venv\Scripts\Activate.ps1"
    & $activate
    pip install -r requirements.txt

    if (-not (Test-Path ".env")) {
        Copy-Item ".env.example" ".env"
        Write-Host ""
        Write-Host "Created .env file. To enable AI features, edit backend\.env and add:" -ForegroundColor Yellow
        Write-Host "  ANTHROPIC_API_KEY=sk-ant-your-key-here" -ForegroundColor Yellow
    }

    # Frontend setup
    Write-Host ""
    Write-Host "Setting up Frontend..." -ForegroundColor Cyan
    $frontendPath = Join-Path $base "frontend"
    Set-Location $frontendPath
    npm install

    Write-Host ""
    Write-Host "=== Setup Complete! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start the platform, open TWO terminal windows:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Terminal 1 (Backend):" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  venv\Scripts\activate" -ForegroundColor White
    Write-Host "  uvicorn app.main:app --reload" -ForegroundColor White
    Write-Host ""
    Write-Host "Terminal 2 (Frontend):" -ForegroundColor Yellow
    Write-Host "  cd frontend" -ForegroundColor White
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Then open: http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Install missing dependencies and re-run this script." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Quick install links:" -ForegroundColor Cyan
    Write-Host "  Python: https://www.python.org/downloads/" -ForegroundColor White
    Write-Host "  Node.js: https://nodejs.org/en/download" -ForegroundColor White
}
