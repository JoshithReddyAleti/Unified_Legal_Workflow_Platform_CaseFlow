$base = Split-Path $PSScriptRoot -Parent
$backendPath = Join-Path $base "backend"

Write-Host "Starting CaseFlow MCP Backend..." -ForegroundColor Cyan

# Check if venv exists
$venvPath = Join-Path $backendPath "venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv $venvPath
}

# Activate and install
$activateScript = Join-Path $venvPath "Scripts\Activate.ps1"
& $activateScript

Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r (Join-Path $backendPath "requirements.txt") -q

# Copy .env if needed
$envFile = Join-Path $backendPath ".env"
$envExample = Join-Path $backendPath ".env.example"
if (-not (Test-Path $envFile)) {
    Copy-Item $envExample $envFile
    Write-Host "Created .env from .env.example - edit it to add your ANTHROPIC_API_KEY" -ForegroundColor Yellow
}

Write-Host "Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
Write-Host "API docs available at http://localhost:8000/docs" -ForegroundColor Green
Set-Location $backendPath
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
