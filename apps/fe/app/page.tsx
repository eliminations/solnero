'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { generateWallet, getBalance, type WalletData } from '@/lib/solana'
import { Shield, Send, Wallet, History, Eye, EyeOff, MessageSquare, QrCode } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { PublicKey } from '@solana/web3.js'
import { useMemo, useCallback, memo } from 'react'
import { AddressDisplay } from '@/components/address-display'
import { QRCodeModal } from '@/components/qr-code-modal'
import { CopyButton } from '@/components/copy-button'
import { BalanceSkeleton, TransactionSkeleton } from '@/components/loading-skeleton'
import { useDebounce } from '@/hooks/useDebounce'
import { TransactionItem } from '@/components/transaction-item'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Transaction {
  id: string
  type: 'send' | 'receive'
  amount: number
  timestamp: Date
  status: 'pending' | 'confirmed' | 'failed'
  txHash?: string
}

function Home() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [solPrice, setSolPrice] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [sendAmount, setSendAmount] = useState('')
  const [sendTo, setSendTo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isBalanceLoading, setIsBalanceLoading] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [password, setPassword] = useState('')
  const [transactionPage, setTransactionPage] = useState(1)
  
  // Debounce send amount for USD calculation
  const debouncedAmount = useDebounce(sendAmount, 300)
  
  // Memoized USD value
  const usdValue = useMemo(() => {
    if (!debouncedAmount || !solPrice) return 0
    return parseFloat(debouncedAmount) * solPrice
  }, [debouncedAmount, solPrice])
  
  // Memoized balance in USD
  const balanceUSD = useMemo(() => {
    return balance * solPrice
  }, [balance, solPrice])
  
  // Poll for transaction updates if there are pending transactions
  const hasPendingTransactions = useMemo(() => {
    return transactions.some(tx => tx.status === 'pending')
  }, [transactions])
  
  const handleTransactionUpdate = useCallback((updatedTransactions: Transaction[]) => {
    setTransactions(updatedTransactions)
  }, [])
  
  useTransactionPolling(
    wallet?.publicKey || null,
    handleTransactionUpdate,
    hasPendingTransactions ? 10000 : 0 // Only poll if there are pending transactions
  )

  useEffect(() => {
    // Load wallet from localStorage
    const savedWallet = localStorage.getItem('solnero_wallet')
    if (savedWallet) {
      try {
        const walletData = JSON.parse(savedWallet)
        setWallet(walletData)
        loadBalance(walletData.publicKey)
        loadTransactions(walletData.publicKey)
        
        // Auto-refresh balance every 15 seconds
        const balanceInterval = setInterval(() => {
          loadBalance(walletData.publicKey)
        }, 15000)
        
        return () => clearInterval(balanceInterval)
      } catch (error) {
        console.error('Error loading wallet:', error)
      }
    }
  }, [])

  const loadBalance = useCallback(async (publicKey: string, showLoading = false) => {
    if (showLoading) setIsBalanceLoading(true)
    try {
      // Try backend API first (more reliable)
      try {
        const response = await axios.get(`${API_URL}/api/balance/${publicKey}`, {
          timeout: 10000,
        })
        if (response.data.success) {
          setBalance(response.data.balance)
          if (showLoading) setIsBalanceLoading(false)
          return
        }
      } catch (apiError) {
        console.log('Backend API failed, trying direct connection')
      }
      
      // Fallback to direct Solana connection
      const bal = await getBalance(publicKey)
      setBalance(bal)
    } catch (error) {
      console.error('Error loading balance:', error)
    } finally {
      if (showLoading) setIsBalanceLoading(false)
    }
  }, [])

  useEffect(() => {
    // Load SOL price for USD conversion
    const fetchSolPrice = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/sol-price`)
        if (response.data.success) {
          setSolPrice(response.data.price)
        }
      } catch (error) {
        console.error('Error fetching SOL price:', error)
      }
    }
    fetchSolPrice()
    const priceInterval = setInterval(fetchSolPrice, 60000) // Update every minute
    return () => clearInterval(priceInterval)
  }, [])

  const loadTransactions = useCallback(async (publicKey: string, page = 1) => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions/${publicKey}`, {
        params: { page, limit: 20 },
        timeout: 10000,
      })
      if (response.data.success && Array.isArray(response.data.transactions)) {
        setTransactions(response.data.transactions)
        setTransactionPage(page)
      } else if (Array.isArray(response.data)) {
        setTransactions(response.data)
      } else {
        setTransactions([])
      }
    } catch (error) {
      console.error('Error loading transactions:', error)
      setTransactions([])
    }
  }, []), [])

  const handleCreateWallet = useCallback(() => {
    const newWallet = generateWallet()
    setWallet(newWallet)
    localStorage.setItem('solnero_wallet', JSON.stringify(newWallet))
    loadBalance(newWallet.publicKey)
    loadTransactions(newWallet.publicKey)
  }, [loadBalance, loadTransactions])

  const handleSend = async () => {
    if (!wallet || !sendAmount || !sendTo) return

    setIsLoading(true)
    try {
      // Validate amount
      const amount = parseFloat(sendAmount)
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount')
        setIsLoading(false)
        return
      }

      // Validate recipient address
      try {
        new PublicKey(sendTo)
      } catch (e) {
        alert('Invalid recipient address. Please check the Solana address.')
        setIsLoading(false)
        return
      }

      // Check balance
      if (amount > balance) {
        alert(`Insufficient balance. You have ${balance.toFixed(4)} SOL but trying to send ${amount.toFixed(4)} SOL`)
        setIsLoading(false)
        return
      }

      console.log('Sending transaction:', {
        from: wallet.publicKey,
        to: sendTo,
        amount,
      })

      const response = await axios.post(`${API_URL}/api/transactions/send`, {
        fromPublicKey: wallet.publicKey,
        fromSecretKey: wallet.secretKey,
        toPublicKey: sendTo,
        amount: amount,
      }, {
        timeout: 60000, // 60 second timeout
      })

      console.log('Transaction response:', response.data)

      if (response.data.success) {
        setSendAmount('')
        setSendTo('')
        // Wait a bit for transaction to be confirmed
        setTimeout(async () => {
          await loadBalance(wallet.publicKey)
          await loadTransactions(wallet.publicKey)
        }, 2000)
        alert(`Transaction sent successfully! Signature: ${response.data.signature?.substring(0, 16)}...`)
      } else {
        const errorMsg = response.data.error || 'Unknown error'
        console.error('Transaction failed:', errorMsg)
        alert(`Transaction failed: ${errorMsg}`)
      }
    } catch (error: any) {
      console.error('Error sending transaction:', error)
      let errorMessage = 'Unknown error occurred'
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Is the backend running?'
      } else {
        // Something else happened
        errorMessage = error.message || 'Network error'
      }
      
      alert(`Error sending transaction: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportWallet = () => {
    if (!wallet) return
    const dataStr = JSON.stringify(wallet, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'solnero-wallet.json'
    link.click()
  }

  if (!wallet) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <div className="absolute inset-0 gradient-mesh opacity-50"></div>
        <div className="absolute inset-0 grid-pattern opacity-30"></div>
        <Card className="w-full max-w-md glass-dark border-white/20 shadow-2xl relative z-10">
          <CardHeader className="text-center space-y-6">
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <Shield className="h-20 w-20 text-primary relative z-10" />
              </div>
            </div>
            <div>
              <CardTitle className="text-4xl font-bold text-gradient mb-2">Solnero</CardTitle>
              <CardDescription className="text-base text-muted-foreground/80">
                Private Solana Transactions with Zero-Knowledge Proofs
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground/70 text-center leading-relaxed">
              Create a new wallet to start sending and receiving private transactions on Solana.
              Your transactions will be obfuscated using zero-knowledge proofs, making them
              invisible to blockchain explorers.
            </p>
            <Button 
              onClick={handleCreateWallet} 
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 border-0 h-12 text-base font-semibold shine" 
              size="lg"
            >
              <Wallet className="mr-2 h-5 w-5" />
              Create New Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 pt-24">
      <div className="absolute inset-0 gradient-mesh opacity-30"></div>
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold text-gradient flex items-center gap-3 mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-lg"></div>
                <Shield className="h-10 w-10 text-primary relative z-10" />
              </div>
              Solnero
            </h1>
            <p className="text-muted-foreground/70 text-lg">Private Solana Transactions</p>
          </div>
          <div className="flex gap-3">
            <Link href="/posts">
              <Button variant="outline" className="glass border-white/10 hover:border-white/20 hover:bg-white/5 backdrop-blur-xl">
                <MessageSquare className="mr-2 h-4 w-4" />
                Forum
              </Button>
            </Link>
            <Button variant="outline" onClick={handleExportWallet} className="glass border-white/10 hover:border-white/20 hover:bg-white/5 backdrop-blur-xl">
              Export Wallet
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="glass border-white/10 hover:border-white/20 hover:bg-white/5 backdrop-blur-xl">
                  {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-dark border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-gradient">Wallet Details</DialogTitle>
                  <DialogDescription className="text-muted-foreground/70">
                    Your wallet public key. Keep your private key secure.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Public Key</Label>
                    <Input value={wallet.publicKey} readOnly className="font-mono text-xs mt-2 glass border-white/10" />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-dark border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isBalanceLoading ? (
                  <BalanceSkeleton />
                ) : (
                  <>
                    <div className="text-4xl font-bold text-gradient">{balance.toFixed(4)} SOL</div>
                    {solPrice > 0 && (
                      <div className="text-sm text-muted-foreground/70">
                        ≈ ${balanceUSD.toFixed(2)} USD
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Public Key</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono break-all text-muted-foreground/80 bg-black/20 p-3 rounded border border-white/5">{wallet.publicKey}</div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-500/20 blur-lg rounded-full"></div>
                  <Shield className="h-6 w-6 text-green-400 relative z-10" />
                </div>
                <span className="text-sm font-medium">Zero-Knowledge Enabled</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="send" className="w-full space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="inline-flex h-12 items-center justify-center rounded-lg glass-dark border-white/10 p-1.5 gap-1">
              <TabsTrigger 
                value="send" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-purple-600/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/30 px-6 h-9 transition-all"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Transaction
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-purple-600/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border data-[state=active]:border-primary/30 px-6 h-9 transition-all"
              >
                <History className="mr-2 h-4 w-4" />
                Transaction History
              </TabsTrigger>
            </TabsList>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => wallet && loadBalance(wallet.publicKey, true)}
              disabled={isBalanceLoading}
              className="text-xs hover:bg-white/5 glass border-white/10 disabled:opacity-50"
            >
              {isBalanceLoading ? (
                <>
                  <div className="mr-2 h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Refreshing...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-3 w-3" />
                  Refresh Balance
                </>
              )}
            </Button>
          </div>

          <TabsContent value="send" className="mt-6">
            <Card className="glass-dark border-white/10 shadow-2xl">
              <CardHeader className="space-y-3 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Send className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gradient">Send Private Transaction</CardTitle>
                    <CardDescription className="text-muted-foreground/70 mt-1">
                      Send SOL using zero-knowledge proofs. Transaction details will be obfuscated.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="to" className="text-sm font-medium flex items-center gap-2">
                    <span>Recipient Public Key</span>
                    <span className="text-xs text-muted-foreground/50">(Solana address)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="to"
                      placeholder="GSUT1R98tgjW1mMDRvpC71N7yjBj5umjhx63nWjNFjgU"
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                      className="font-mono text-sm glass border-white/10 h-12 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 pr-12"
                    />
                    {sendTo && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <CopyButton text={sendTo} size="sm" variant="ghost" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-sm font-medium flex items-center justify-between">
                    <span>Amount (SOL)</span>
                    {debouncedAmount && solPrice > 0 && (
                      <span className="text-xs text-muted-foreground/70">
                        ≈ ${usdValue.toFixed(2)} USD
                      </span>
                    )}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.0001"
                    min="0"
                    placeholder="0.0"
                    value={sendAmount}
                    onChange={(e) => setSendAmount(e.target.value)}
                    className="text-lg font-semibold glass border-white/10 h-12 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                  {balance > 0 && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground/70 px-1">
                      <span>Available: {balance.toFixed(4)} SOL</span>
                      <button
                        type="button"
                        onClick={() => setSendAmount((balance * 0.99).toFixed(4))}
                        className="hover:text-primary transition-colors underline"
                      >
                        Use Max
                      </button>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !sendAmount || !sendTo || parseFloat(sendAmount) <= 0 || parseFloat(sendAmount) > balance}
                  className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 border-0 h-12 text-base font-semibold shine disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="mr-2 h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing Transaction...
                    </>
                  ) : (
                    'Send Private Transaction'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="glass-dark border-white/10 shadow-2xl">
              <CardHeader className="space-y-3 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gradient">Transaction History</CardTitle>
                    <CardDescription className="text-muted-foreground/70 mt-1">
                      Your private transaction history. Only visible to you.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6 border border-white/10">
                      <History className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <p className="text-muted-foreground/70 text-lg mb-2">
                      No transactions yet
                    </p>
                    <p className="text-muted-foreground/50 text-sm">
                      Your transaction history will appear here once you start sending or receiving SOL
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <TransactionItem key={tx.id} transaction={tx} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default memo(Home)
