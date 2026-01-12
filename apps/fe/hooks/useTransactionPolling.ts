import { useEffect, useRef } from 'react'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Transaction {
  id: string
  txHash?: string
  status: 'pending' | 'confirmed' | 'failed'
}

export function useTransactionPolling(
  publicKey: string | null,
  onUpdate: (transactions: Transaction[]) => void,
  interval: number = 10000 // 10 seconds
) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!publicKey) return

    const pollTransactions = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/transactions/${publicKey}`, {
          params: { page: 1, limit: 20 },
          timeout: 5000,
        })
        
        if (response.data.success && Array.isArray(response.data.transactions)) {
          onUpdate(response.data.transactions)
          
          // Stop polling if all transactions are confirmed
          const hasPending = response.data.transactions.some(
            (tx: Transaction) => tx.status === 'pending'
          )
          if (!hasPending && intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      } catch (error) {
        console.error('Error polling transactions:', error)
      }
    }

    // Poll immediately, then set interval
    pollTransactions()
    intervalRef.current = setInterval(pollTransactions, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [publicKey, onUpdate, interval])
}
