$ErrorActionPreference = 'Stop'
$port = 8000
$url = "http://localhost:$port/"

Write-Host "Starting local game server at $url" -ForegroundColor Cyan
Write-Host "Open: $url" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor DarkGray

python -m http.server $port --bind 127.0.0.1
