$base = Split-Path $PSScriptRoot -Parent
$frontendPath = Join-Path $base "frontend"

Write-Host "Starting CaseFlow MCP Frontend..." -ForegroundColor Cyan
Set-Location $frontendPath

# Check node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Starting Next.js dev server on http://localhost:3000" -ForegroundColor Green
npm run dev
