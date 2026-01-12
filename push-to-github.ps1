# Script to push Solnero to GitHub
# Make sure you've created the repository at https://github.com/new first

Write-Host "`n=== Pushing Solnero to GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Check if remote is set
$remote = git remote get-url origin 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Setting up remote..." -ForegroundColor Yellow
    git remote add origin https://github.com/eliminations/solnero.git
}

# Verify we're on main branch
$branch = git branch --show-current
if ($branch -ne "main") {
    Write-Host "Switching to main branch..." -ForegroundColor Yellow
    git branch -M main
}

Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository: https://github.com/eliminations/solnero" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Push failed. Make sure:" -ForegroundColor Red
    Write-Host "1. Repository exists at https://github.com/eliminations/solnero" -ForegroundColor Yellow
    Write-Host "2. You have push access to the repository" -ForegroundColor Yellow
    Write-Host "3. You're authenticated with GitHub" -ForegroundColor Yellow
}
