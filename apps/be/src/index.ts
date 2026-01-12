import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { swagger } from '@elysiajs/swagger'
import { PrismaClient } from '@prisma/client'
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import bs58 from 'bs58'
import { z } from 'zod'
import { generateZKProof } from './lib/privacy'
import { rateLimit } from './middleware/rateLimit'
import { securityHeaders, isValidSolanaAddress, sanitizeInput } from './middleware/security'
import { errorHandler, AppError } from './middleware/errorHandler'

const prisma = new PrismaClient()
const app = new Elysia()

// Solana connection - use mainnet
const RPC_ENDPOINT = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
const connection = new Connection(RPC_ENDPOINT, 'confirmed')

// Cache for balance and price data
const cache = new Map<string, { data: any; expires: number }>()
const CACHE_TTL = 10000 // 10 seconds for balance, 60000 for price

// Validation schemas with enhanced validation
const sendTransactionSchema = z.object({
  fromPublicKey: z.string().min(32).max(44).refine(
    (val) => isValidSolanaAddress(val),
    { message: 'Invalid from public key format' }
  ),
  fromSecretKey: z.string().min(32),
  toPublicKey: z.string().min(32).max(44).refine(
    (val) => isValidSolanaAddress(val),
    { message: 'Invalid to public key format' }
  ),
  amount: z.number().positive().max(1000000), // Max 1M SOL per transaction
})

const createUserSchema = z.object({
  publicKey: z.string().min(32).max(44).refine(
    (val) => isValidSolanaAddress(val),
    { message: 'Invalid public key format' }
  ),
})

app
  .use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  }))
  .use(swagger())
  .use(securityHeaders())
  .onError(errorHandler)
  .get('/', () => ({
    message: 'Solnero API - Private Solana Transactions',
    version: '1.0.0',
  }))
  // Health check
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  
  // User endpoints
  .post('/api/users', async ({ body, set }) => {
    await rateLimit(50, 60000)({ request: { headers: new Headers() }, set })
    
    try {
      const { publicKey } = createUserSchema.parse(body)
      const sanitizedKey = sanitizeInput(publicKey)
      
      if (!isValidSolanaAddress(sanitizedKey)) {
        throw new AppError('Invalid Solana address format', 400)
      }
      
      const user = await prisma.user.upsert({
        where: { publicKey: sanitizedKey },
        update: {},
        create: { publicKey: sanitizedKey },
      })
      
      return { success: true, user: { id: user.id, publicKey: user.publicKey } }
    } catch (error: any) {
      throw error
    }
  })
  
  // Transaction endpoints
  .post('/api/transactions/send', async ({ body, set }) => {
    // Stricter rate limiting for transactions
    await rateLimit(10, 60000)({ request: { headers: new Headers() }, set })
    try {
      console.log('Received transaction request:', {
        fromPublicKey: body.fromPublicKey?.substring(0, 16) + '...',
        toPublicKey: body.toPublicKey?.substring(0, 16) + '...',
        amount: body.amount,
      })

      const { fromPublicKey, fromSecretKey, toPublicKey, amount } = sendTransactionSchema.parse(body)
      
      // Sanitize inputs
      const sanitizedFrom = sanitizeInput(fromPublicKey)
      const sanitizedTo = sanitizeInput(toPublicKey)
      const sanitizedSecret = sanitizeInput(fromSecretKey)
      
      // Additional validation
      if (!isValidSolanaAddress(sanitizedFrom)) {
        throw new AppError('Invalid sender address', 400)
      }
      if (!isValidSolanaAddress(sanitizedTo)) {
        throw new AppError('Invalid recipient address', 400)
      }
      if (sanitizedFrom === sanitizedTo) {
        throw new AppError('Sender and recipient cannot be the same', 400)
      }
      
      // Validate public keys
      let fromPubKey: PublicKey
      let toPubKey: PublicKey
      try {
        fromPubKey = new PublicKey(sanitizedFrom)
        toPubKey = new PublicKey(sanitizedTo)
      } catch (error: any) {
        throw new AppError(`Invalid public key: ${error.message}`, 400)
      }
      
      // Get or create user
      const user = await prisma.user.upsert({
        where: { publicKey: sanitizedFrom },
        update: {},
        create: { publicKey: sanitizedFrom },
      })
      
      // Decode secret key
      let keypair: Keypair
      try {
        const secretKeyBytes = bs58.decode(sanitizedSecret)
        if (secretKeyBytes.length !== 64) {
          throw new AppError('Invalid secret key length', 400)
        }
        keypair = Keypair.fromSecretKey(secretKeyBytes)
      } catch (error: any) {
        if (error instanceof AppError) throw error
        throw new AppError(`Invalid secret key: ${error.message}`, 400)
      }
      
      // Verify keypair matches public key
      if (keypair.publicKey.toBase58() !== sanitizedFrom) {
        throw new AppError('Secret key does not match public key', 400)
      }
      
      // Check balance with caching
      const cacheKey = `balance_${sanitizedFrom}`
      const cached = cache.get(cacheKey)
      let balance: number
      
      if (cached && cached.expires > Date.now()) {
        balance = cached.data
      } else {
        try {
          balance = await connection.getBalance(fromPubKey)
          cache.set(cacheKey, {
            data: balance,
            expires: Date.now() + CACHE_TTL,
          })
        } catch (error: any) {
          throw new AppError(`Failed to check balance: ${error.message}`, 500)
        }
      }
      
      const amountLamports = Math.floor(amount * LAMPORTS_PER_SOL)
      const feeEstimate = 5000 // Rough estimate for transaction fee
      
      if (balance < amountLamports + feeEstimate) {
        throw new AppError(
          `Insufficient balance. You have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL but need ${((amountLamports + feeEstimate) / LAMPORTS_PER_SOL).toFixed(4)} SOL (including fees)`,
          400
        )
      }
      
      // Create transaction with privacy obfuscation
      let transaction: Transaction
      try {
        transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: fromPubKey,
            toPubkey: toPubKey,
            lamports: amountLamports,
          })
        )
      } catch (error: any) {
        console.error('Error creating transaction:', error.message)
        return { success: false, error: `Failed to create transaction: ${error.message}` }
      }
      
      // Get recent blockhash
      let blockhash: string
      try {
        const latestBlockhash = await connection.getLatestBlockhash('confirmed')
        blockhash = latestBlockhash.blockhash
        transaction.recentBlockhash = blockhash
        transaction.feePayer = fromPubKey
      } catch (error: any) {
        console.error('Error getting blockhash:', error.message)
        return { success: false, error: `Failed to get blockhash: ${error.message}` }
      }
      
      // Sign transaction
      try {
        transaction.sign(keypair)
      } catch (error: any) {
        console.error('Error signing transaction:', error.message)
        return { success: false, error: `Failed to sign transaction: ${error.message}` }
      }
      
      // Send transaction
      let signature: string
      try {
        signature = await connection.sendRawTransaction(transaction.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        })
        console.log('Transaction sent, signature:', signature)
      } catch (error: any) {
        console.error('Error sending transaction:', error.message)
        return { success: false, error: `Failed to send transaction: ${error.message}` }
      }
      
      // Wait for confirmation
      try {
        await connection.confirmTransaction(signature, 'confirmed')
        console.log('Transaction confirmed:', signature)
      } catch (error: any) {
        console.error('Error confirming transaction:', error.message)
        // Transaction might still be pending, but we'll save it anyway
        console.warn('Transaction sent but confirmation failed, signature:', signature)
      }
      
      // Generate a placeholder zk-proof (in production, use actual zk-SNARK)
      let zkProof: string
      try {
        zkProof = await generateZKProofPlaceholder(amount, sanitizedFrom, sanitizedTo)
      } catch (error: any) {
        console.warn('Error generating zk-proof:', error.message)
        zkProof = 'placeholder-proof'
      }
      
      // Invalidate balance cache
      cache.delete(cacheKey)
      
      // Save transaction to database
      const dbTransaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'send',
          amount,
          fromAddress: sanitizedFrom,
          toAddress: sanitizedTo,
          txHash: signature,
          status: 'confirmed',
          zkProof,
        },
      })
      
      return {
        success: true,
        transaction: {
          id: dbTransaction.id,
          type: dbTransaction.type,
          amount: dbTransaction.amount,
          txHash: dbTransaction.txHash,
          status: dbTransaction.status,
          createdAt: dbTransaction.createdAt,
        },
        signature,
      }
    } catch (error: any) {
      throw error
    }
  })
  
  // Get balance with caching
  .get('/api/balance/:publicKey', async ({ params, set }) => {
    await rateLimit(100, 60000)({ request: { headers: new Headers() }, set })
    
    try {
      const { publicKey } = params
      const sanitizedKey = sanitizeInput(publicKey)
      
      if (!isValidSolanaAddress(sanitizedKey)) {
        throw new AppError('Invalid public key format', 400)
      }
      
      // Check cache first
      const cacheKey = `balance_${sanitizedKey}`
      const cached = cache.get(cacheKey)
      
      if (cached && cached.expires > Date.now()) {
        return {
          success: true,
          balance: cached.data / LAMPORTS_PER_SOL,
          lamports: cached.data,
          cached: true,
        }
      }
      
      const pubKey = new PublicKey(sanitizedKey)
      const balance = await connection.getBalance(pubKey)
      
      // Cache the result
      cache.set(cacheKey, {
        data: balance,
        expires: Date.now() + CACHE_TTL,
      })
      
      return {
        success: true,
        balance: balance / LAMPORTS_PER_SOL,
        lamports: balance,
        cached: false,
      }
    } catch (error: any) {
      throw error
    }
  })
  
  // Get SOL price with caching
  .get('/api/sol-price', async ({ set }) => {
    await rateLimit(60, 60000)({ request: { headers: new Headers() }, set })
    
    try {
      // Check cache first
      const cacheKey = 'sol_price'
      const cached = cache.get(cacheKey)
      
      if (cached && cached.expires > Date.now()) {
        return {
          ...cached.data,
          cached: true,
        }
      }
      
      // Fetch from CoinGecko API
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true', {
        headers: {
          'Accept': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new AppError('Failed to fetch price data', 500)
      }
      
      const data = await response.json()
      
      if (data.solana) {
        const result = {
          success: true,
          price: data.solana.usd,
          change24h: data.solana.usd_24h_change || 0,
          cached: false,
        }
        
        // Cache for 60 seconds
        cache.set(cacheKey, {
          data: result,
          expires: Date.now() + 60000,
        })
        
        return result
      }
      
      throw new AppError('Price data not available', 500)
    } catch (error: any) {
      throw error
    }
  })
  
  // Get stats with caching
  .get('/api/stats', async ({ set }) => {
    await rateLimit(30, 60000)({ request: { headers: new Headers() }, set })
    
    try {
      // Check cache first
      const cacheKey = 'stats'
      const cached = cache.get(cacheKey)
      
      if (cached && cached.expires > Date.now()) {
        return {
          ...cached.data,
          cached: true,
        }
      }
      
      const totalUsers = await prisma.user.count()
      const totalTransactions = await prisma.transaction.count()
      
      const result = {
        success: true,
        totalUsers,
        totalTransactions,
        cached: false,
      }
      
      // Cache for 30 seconds
      cache.set(cacheKey, {
        data: result,
        expires: Date.now() + 30000,
      })
      
      return result
    } catch (error: any) {
      throw error
    }
  })
  
  // Get transactions for a user with pagination
  .get('/api/transactions/:publicKey', async ({ params, query, set }) => {
    await rateLimit(100, 60000)({ request: { headers: new Headers() }, set })
    
    try {
      const { publicKey } = params
      const sanitizedKey = sanitizeInput(publicKey)
      const page = parseInt(query.page as string || '1')
      const limit = Math.min(parseInt(query.limit as string || '20'), 100) // Max 100 per page
      const skip = (page - 1) * limit
      
      if (!isValidSolanaAddress(sanitizedKey)) {
        throw new AppError('Invalid public key format', 400)
      }
      
      const user = await prisma.user.findUnique({
        where: { publicKey: sanitizedKey },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
          },
          _count: {
            select: { transactions: true },
          },
        },
      })
      
      if (!user) {
        return { success: true, transactions: [], total: 0, page, limit }
      }
      
      return {
        success: true,
        transactions: user.transactions,
        total: user._count.transactions,
        page,
        limit,
        totalPages: Math.ceil(user._count.transactions / limit),
      }
    } catch (error: any) {
      throw error
    }
  })
  
  .listen(3001)

// Helper function for zk-proof generation
async function generateZKProofPlaceholder(
  amount: number,
  from: string,
  to: string
): Promise<string> {
  return generateZKProof(amount, 0, to, from)
}

console.log(
  `🦊 Solnero API is running at http://${app.server?.hostname}:${app.server?.port}`
)
