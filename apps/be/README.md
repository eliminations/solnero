# Solnero Backend

Backend API for Solnero - Private Solana Transactions.

## Features

- RESTful API with Elysia.js
- Prisma ORM with PostgreSQL
- Solana transaction handling
- Zero-knowledge proof integration (placeholder)
- Private transaction obfuscation

## Prerequisites

- **Bun** runtime ([Install Bun](https://bun.sh)) - Elysia.js requires Bun
- **PostgreSQL** database
- **Node.js** 18+ (for pnpm and other tools)

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Set up PostgreSQL database and create `.env` file:
```bash
# Create .env file in apps/be/
DATABASE_URL="postgresql://user:password@localhost:5432/solnero?schema=public"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
PORT=3001
```

3. Run Prisma migrations:
```bash
pnpm prisma:migrate dev
pnpm prisma:generate
```

4. Start the server:
```bash
pnpm dev
# Or directly with Bun:
bun run src/index.ts
```

The API will be available at `http://localhost:3001`

## API Endpoints

- `POST /api/users` - Create or get user
- `POST /api/transactions/send` - Send private transaction
- `GET /api/transactions/:publicKey` - Get transaction history
- `GET /api/balance/:publicKey` - Get balance
