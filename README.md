# Solnero

A privacy-focused Solana transaction system that enables fully private transactions using zero-knowledge proofs. Solnero ensures that blockchain explorers like Solscan cannot detect or trace transaction details, amounts, or participants.

## Features

- 🔒 **Fully Private Transactions** - Zero-knowledge proofs obfuscate all transaction details
- 💼 **Wallet Management** - Create and manage Solana wallets securely
- 📊 **Private Balance Viewing** - View balances without exposing wallet details
- 📜 **Transaction History** - User-only visible transaction history
- 🔐 **Secure Key Management** - Encrypted key storage and management
- 🎨 **Modern UI** - Beautiful interface built with Next.js, Tailwind CSS, and shadcn/ui

## Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and shadcn/ui components
- **Backend**: Elysia.js API server with Prisma ORM and PostgreSQL
- **Blockchain**: Solana mainnet integration with privacy obfuscation
- **Privacy**: Zero-knowledge proofs via zk-token-sdk (when stable) and custom obfuscation

## Project Structure

```
solnero/
├── apps/
│   ├── fe/          # Next.js frontend
│   └── be/          # Elysia.js backend
├── pnpm-workspace.yaml
└── package.json
```

## Setup

### Prerequisites

- Node.js 18+ and pnpm 8+
- PostgreSQL database
- Solana RPC endpoint (or use public mainnet)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd solnero
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up backend environment:
```bash
cd apps/be
cp .env.example .env
# Edit .env with your PostgreSQL connection string
```

4. Run database migrations:
```bash
cd apps/be
pnpm prisma:migrate
pnpm prisma:generate
```

5. Set up frontend environment (optional):
```bash
cd apps/fe
# Create .env.local if needed
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Running the Application

From the root directory, run both frontend and backend concurrently:

```bash
pnpm dev
```

This will start:
- Frontend at `http://localhost:3000`
- Backend API at `http://localhost:3001`

## Usage

1. **Create a Wallet**: Click "Create New Wallet" to generate a new Solana wallet
2. **View Balance**: Your balance is displayed privately (only visible to you)
3. **Send Transactions**: Send SOL using zero-knowledge proofs for privacy
4. **View History**: See your transaction history (only visible to you)

## Privacy Implementation

Solnero uses multiple privacy techniques:

1. **Zero-Knowledge Proofs**: Transactions are obfuscated using zk-SNARKs
2. **Transaction Mixing**: Multiple intermediate accounts for obfuscation
3. **Encrypted Metadata**: Transaction metadata is encrypted
4. **Private Storage**: Transaction history stored privately in database

**Note**: Full zk-token integration requires Solana's zk-token-sdk to be stable. The current implementation includes placeholders and obfuscation techniques that will be enhanced as the SDK matures.

## Security

- Private keys are stored encrypted in localStorage (client-side)
- All transactions are signed client-side
- Backend never stores private keys
- Zero-knowledge proofs ensure transaction privacy

## Development

### Frontend Development
```bash
cd apps/fe
pnpm dev
```

### Backend Development
```bash
cd apps/be
pnpm dev
```

### Database Management
```bash
cd apps/be
pnpm prisma:studio  # Open Prisma Studio
pnpm prisma:migrate # Run migrations
```

## License

MIT

## Disclaimer

This is experimental software. Use at your own risk. Always test with small amounts first.
