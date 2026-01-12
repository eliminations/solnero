# Solnero Setup Guide

Complete setup instructions for the Solnero privacy-focused Solana transaction system.

## Prerequisites

- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0 or higher ([Install pnpm](https://pnpm.io/installation))
- **Bun** runtime ([Install Bun](https://bun.sh)) - Required for Elysia.js backend
- **PostgreSQL** database (local or remote)
- **Solana RPC endpoint** (can use public mainnet or your own)

## Quick Start

### 1. Install Dependencies

From the root directory:

```bash
pnpm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```bash
createdb solnero
# Or using psql:
# CREATE DATABASE solnero;
```

2. Configure backend environment:
```bash
cd apps/be
cp .env.example .env
```

3. Edit `apps/be/.env` and set your database URL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/solnero?schema=public"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
PORT=3001
```

4. Run Prisma migrations:
```bash
cd apps/be
pnpm prisma:migrate dev --name init
pnpm prisma:generate
```

### 3. Frontend Configuration (Optional)

Create `apps/fe/.env.local` if you need custom settings:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### 4. Start Development Servers

From the root directory:

```bash
pnpm dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/swagger

## Manual Setup (Step by Step)

### Backend Setup

```bash
cd apps/be

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
pnpm prisma:migrate dev
pnpm prisma:generate

# Start server
pnpm dev
```

### Frontend Setup

```bash
cd apps/fe

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Project Structure

```
solnero/
├── apps/
│   ├── fe/                 # Next.js frontend
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   └── lib/           # Utilities and Solana helpers
│   └── be/                 # Elysia.js backend
│       ├── src/           # Source code
│       ├── prisma/       # Database schema and migrations
│       └── .env          # Environment variables
├── pnpm-workspace.yaml    # pnpm workspace config
└── package.json           # Root package.json
```

## Environment Variables

### Backend (`apps/be/.env`)

- `DATABASE_URL` - PostgreSQL connection string (required)
- `SOLANA_RPC_URL` - Solana RPC endpoint (optional, defaults to mainnet)
- `PORT` - Server port (optional, defaults to 3001)

### Frontend (`apps/fe/.env.local`)

- `NEXT_PUBLIC_API_URL` - Backend API URL (optional, defaults to http://localhost:3001)
- `NEXT_PUBLIC_SOLANA_RPC_URL` - Solana RPC endpoint (optional, defaults to mainnet)

## Database Management

### View Database

```bash
cd apps/be
pnpm prisma:studio
```

This opens Prisma Studio at http://localhost:5555

### Create Migration

```bash
cd apps/be
pnpm prisma:migrate dev --name migration_name
```

### Reset Database

```bash
cd apps/be
pnpm prisma:migrate reset
```

## Testing

### Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# API documentation
open http://localhost:3001/swagger
```

### Test Frontend

1. Open http://localhost:3000
2. Click "Create New Wallet"
3. View your balance and transaction history

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format in `.env`
- Ensure database exists: `psql -l | grep solnero`

### Port Already in Use

- Change PORT in `apps/be/.env`
- Or kill the process using the port:
  - Windows: `netstat -ano | findstr :3001`
  - Mac/Linux: `lsof -ti:3001 | xargs kill`

### Prisma Issues

```bash
cd apps/be
pnpm prisma:generate
pnpm prisma:migrate reset  # WARNING: This deletes all data
```

### Solana RPC Issues

- Use a different RPC endpoint (e.g., QuickNode, Alchemy)
- Check your internet connection
- Verify the RPC URL is correct

## Production Deployment

### Backend

1. Set production environment variables
2. Run migrations: `pnpm prisma:migrate deploy`
3. Build: `pnpm build`
4. Start: `pnpm start`

### Frontend

1. Set production environment variables
2. Build: `pnpm build`
3. Start: `pnpm start`

## Security Notes

⚠️ **Important Security Considerations:**

1. **Private Keys**: Never commit private keys to version control
2. **Database**: Use strong passwords and secure connections
3. **RPC Endpoint**: Use your own RPC endpoint in production
4. **Environment Variables**: Keep `.env` files secure and never commit them
5. **Zero-Knowledge Proofs**: Current implementation uses placeholders - enhance for production

## Privacy Implementation Status

The current implementation includes:

✅ Wallet creation and management
✅ Private transaction sending
✅ Transaction history (user-only)
✅ Address obfuscation
✅ Basic privacy obfuscation

🚧 **In Progress / Future:**
- Full zk-SNARK integration (when @solana/zk-token-sdk is stable)
- Transaction mixing with intermediate accounts
- Enhanced encryption for transaction metadata

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the README.md
3. Check API documentation at `/swagger` endpoint
