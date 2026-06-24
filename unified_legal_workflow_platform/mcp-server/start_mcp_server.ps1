# Start the CaseFlow MCP server (stdio transport — used by Claude Desktop)
# The server connects to the same SQLite database as the FastAPI backend.

$base = Split-Path $PSScriptRoot -Parent
$backendPath = Join-Path $base "backend"
$venvPython = Join-Path $backendPath "venv\Scripts\python.exe"

if (-not (Test-Path $venvPython)) {
    Write-Host "No venv found. Run .\scripts\setup.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "Starting CaseFlow MCP Server (stdio)..." -ForegroundColor Cyan
Write-Host "Connect via Claude Desktop using mcp-server\claude_desktop_config.json" -ForegroundColor Green
Write-Host ""

& $venvPython "$PSScriptRoot\server.py"
