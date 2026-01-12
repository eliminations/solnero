import { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

export interface WalletData {
  publicKey: string;
  secretKey: string;
  encrypted?: boolean;
}

export function generateWallet(): WalletData {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    secretKey: bs58.encode(keypair.secretKey),
  };
}

export function getKeypairFromSecret(secretKey: string): Keypair {
  const secretKeyBytes = bs58.decode(secretKey);
  return Keypair.fromSecretKey(secretKeyBytes);
}

export async function getBalance(publicKey: string): Promise<number> {
  try {
    const pubKey = new PublicKey(publicKey);
    const balance = await connection.getBalance(pubKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
}

export function encryptSecretKey(secretKey: string, password: string): string {
  // Simple encryption - in production, use proper encryption like AES-256-GCM
  // This is a placeholder - implement proper encryption
  return btoa(secretKey + ':' + password);
}

export function decryptSecretKey(encrypted: string, password: string): string {
  // Simple decryption - in production, use proper decryption
  const decrypted = atob(encrypted);
  const [secretKey] = decrypted.split(':');
  return secretKey;
}
