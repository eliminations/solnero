# Solnero Setup Script for Windows PowerShell

Write-Host "🚀 Setting up Solnero..." -ForegroundColor Cyan

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install

# Setup backend
Write-Host "🔧 Setting up backend..." -ForegroundColor Yellow
Set-Location apps/be

# Create .env if it doesn't exist
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please update apps/be/.env with your PostgreSQL connection string" -ForegroundColor Yellow
}

# Run Prisma generate
Write-Host "🗄️  Generating Prisma client..." -ForegroundColor Yellow
pnpm prisma:generate

Set-Location ../..

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update apps/be/.env with your PostgreSQL DATABASE_URL"
Write-Host "2. Run 'pnpm --filter be prisma:migrate' to create database tables"
Write-Host "3. Run 'pnpm dev' from the root to start both frontend and backend"
