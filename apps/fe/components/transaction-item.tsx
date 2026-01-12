'use client'

import { memo } from 'react'
import { Send, History, ExternalLink } from 'lucide-react'
import { CopyButton } from './copy-button'

interface Transaction {
  id: string
  type: 'send' | 'receive'
  amount: number
  timestamp: Date | string
  status: 'pending' | 'confirmed' | 'failed'
  txHash?: string
}

interface TransactionItemProps {
  transaction: Transaction
}

export const TransactionItem = memo(function TransactionItem({ transaction }: TransactionItemProps) {
  const date = new Date(transaction.timestamp)
  const txHashDisplay = transaction.txHash 
    ? `${transaction.txHash.substring(0, 8)}...${transaction.txHash.substring(transaction.txHash.length - 8)}`
    : null

  return (
    <div className="flex justify-between items-center p-5 glass border-white/10 rounded-lg hover:border-white/20 hover:bg-white/5 transition-all group cursor-pointer">
      <div className="flex items-center gap-4 flex-1">
        <div className={`p-2 rounded-lg ${
          transaction.type === 'send' 
            ? 'bg-red-500/10 border border-red-500/20' 
            : 'bg-green-500/10 border border-green-500/20'
        }`}>
          {transaction.type === 'send' ? (
            <Send className="h-4 w-4 text-red-400" />
          ) : (
            <History className="h-4 w-4 text-green-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-base mb-1">
            {transaction.type === 'send' ? 'Sent' : 'Received'} {transaction.amount.toFixed(4)} SOL
          </div>
          <div className="text-sm text-muted-foreground/70 flex items-center gap-2 flex-wrap">
            <span>{date.toLocaleString()}</span>
            {txHashDisplay && (
              <>
                <span className="font-mono text-xs">{txHashDisplay}</span>
                <CopyButton text={transaction.txHash!} size="sm" variant="ghost" className="h-6 w-6 p-0" />
                <a
                  href={`https://solscan.io/tx/${transaction.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-primary transition-colors"
                  title="View on Solscan"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-sm shrink-0">
        <span
          className={`px-3 py-1.5 rounded-full font-medium ${
            transaction.status === 'confirmed'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : transaction.status === 'pending'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {transaction.status}
        </span>
      </div>
    </div>
  )
})
