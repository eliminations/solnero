#!/bin/bash

# Solnero Setup Script

echo "🚀 Setting up Solnero..."

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup backend
echo "🔧 Setting up backend..."
cd apps/be

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update apps/be/.env with your PostgreSQL connection string"
fi

# Run Prisma migrations
echo "🗄️  Running database migrations..."
pnpm prisma:generate

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update apps/be/.env with your PostgreSQL DATABASE_URL"
echo "2. Run 'pnpm --filter be prisma:migrate' to create database tables"
echo "3. Run 'pnpm dev' from the root to start both frontend and backend"
