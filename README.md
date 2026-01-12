# Solnero

A privacy-focused Solana transaction system that enables fully private transactions using zero-knowledge proofs. Solnero functions like Monero but operates on the Solana blockchain, ensuring that no blockchain explorers can detect or trace transaction details, amounts, or participants.

## Features

- 🔒 **Private Transactions**: Send and receive SOL using zero-knowledge proofs
- 💼 **Wallet Management**: Create and manage Solana wallets securely
- 📊 **Transaction History**: View your private transaction history (user-only visibility)
- 🎨 **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- 🌐 **Forum**: Community discussions about private Solana transactions
- 📈 **Real-time Stats**: Live SOL price tracking and platform statistics

## Tech Stack

### Frontend
- **Next.js 14** (TypeScript, App Router)
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Solana Web3.js** for blockchain interactions

### Backend
- **Elysia.js** for API endpoints
- **Prisma** with PostgreSQL for database
- **Solana Web3.js** for blockchain interactions

## Project Structure

```
solnero/
├── apps/
│   ├── fe/          # Next.js frontend
│   └── be/          # Elysia.js backend
├── pnpm-workspace.yaml
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/eliminations/solnero.git
cd solnero
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:

**Backend** (`apps/be/.env`):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/solnero"
SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
```

**Frontend** (`apps/fe/.env.local`):
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
```

4. Set up the database:
```bash
cd apps/be
pnpm prisma migrate dev
pnpm prisma generate
```

5. Start the development servers:
```bash
# From the root directory
pnpm dev
```

This will start:
- Frontend on `http://localhost:3000`
- Backend on `http://localhost:3001`

## Usage

1. **Create a Wallet**: Click "Create Wallet" to generate a new Solana wallet
2. **View Balance**: Your SOL balance is displayed and auto-refreshes every 15 seconds
3. **Send Transactions**: Use the "Send Transaction" tab to send private SOL transactions
4. **View History**: Check your transaction history in the "Transaction History" tab
5. **Forum**: Browse and participate in community discussions

## Privacy Features

- **Zero-Knowledge Proofs**: Transactions are obfuscated using zk-SNARKs
- **Private Balances**: Only you can see your balance
- **Untraceable Transactions**: Transaction details are hidden from blockchain explorers
- **Secure Key Management**: Private keys are encrypted and stored locally

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
```

### Database Migrations
```bash
cd apps/be
pnpm prisma migrate dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Disclaimer

This is experimental software. Use at your own risk. Always verify transactions and test thoroughly before using with real funds.

## Author

Built by [eliminations](https://github.com/eliminations)
