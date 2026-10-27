$ErrorActionPreference = "Stop"

Write-Host "=== AuraLeaderboard V2 Publisher ===" -ForegroundColor Cyan

git --version

if (-not (Test-Path ".git")) {
    git init
}

git add index.html admin.html app.js admin.js style.css config.js README.md

git status

git commit -m "Publish AuraLeaderboard V2"

Write-Host ""
Write-Host "Now connect your GitHub repository." -ForegroundColor Yellow
