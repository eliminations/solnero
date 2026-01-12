'use client'

import { ForumAccordion } from '@/components/forum-accordion'
import { CounterNumber } from '@/components/counter-number'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Clock, User, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'

interface Post {
  id: string
  title: string
  content: string
  author: string
  authorUsername: string
  createdAt: string
  replies: number
  views: number
}

// Mock data - replace with API call
const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Understanding Zero-Knowledge Proofs on Solana',
    content: 'Zero-knowledge proofs allow us to verify transactions without revealing sensitive information...',
    author: 'Alice',
    authorUsername: 'alice_crypto',
    createdAt: '2024-01-15T10:30:00Z',
    replies: 12,
    views: 245,
  },
  {
    id: '2',
    title: 'Best Practices for Private Transactions',
    content: 'When sending private transactions, always verify the recipient address and use sufficient fees...',
    author: 'Bob',
    authorUsername: 'bob_trader',
    createdAt: '2024-01-14T15:20:00Z',
    replies: 8,
    views: 189,
  },
  {
    id: '3',
    title: 'Solnero vs Traditional Solana Transactions',
    content: 'The key difference is privacy - Solnero transactions are obfuscated using zk-proofs...',
    author: 'Charlie',
    authorUsername: 'charlie_dev',
    createdAt: '2024-01-13T09:15:00Z',
    replies: 15,
    views: 312,
  },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function PostsPage() {
  const [solPrice, setSolPrice] = useState(0)
  const [solChange, setSolChange] = useState(0)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch SOL price
        const priceResponse = await axios.get(`${API_URL}/api/sol-price`)
        
        if (priceResponse.data.success) {
          setSolPrice(priceResponse.data.price)
          setSolChange(priceResponse.data.change24h || 0)
        }
        
        // Fetch stats
        const statsResponse = await axios.get(`${API_URL}/api/stats`)
        
        if (statsResponse.data.success) {
          setTotalUsers(statsResponse.data.totalUsers)
          setTotalTransactions(statsResponse.data.totalTransactions)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 pt-24">
      <div className="absolute inset-0 gradient-mesh opacity-30"></div>
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="glass-dark border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                SOL Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground/70">Loading...</span>
                </div>
              ) : (
                <CounterNumber
                  value={solPrice}
                  currency="USD"
                  decimalPlaces={2}
                  size="xl"
                  className="text-gradient font-bold"
                />
              )}
            </CardContent>
          </Card>

          <Card className="glass-dark border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                24h Change
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground/70">Loading...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {solChange >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  )}
                  <CounterNumber
                    value={Math.abs(solChange)}
                    prefix={solChange >= 0 ? "+" : "-"}
                    suffix="%"
                    size="xl"
                    decimalPlaces={1}
                    className={`font-bold ${solChange >= 0 ? "text-green-400" : "text-red-400"}`}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-dark border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground/70">Loading...</span>
                </div>
              ) : (
                <CounterNumber value={totalUsers} size="xl" className="text-gradient font-bold" />
              )}
            </CardContent>
          </Card>

          <Card className="glass-dark border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 group">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
                Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground/70">Loading...</span>
                </div>
              ) : (
                <CounterNumber value={totalTransactions} size="xl" className="text-gradient font-bold" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Forum Section */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gradient mb-3">Forum Posts</h1>
          <p className="text-muted-foreground/70 text-lg">
            Community discussions about private Solana transactions
          </p>
        </div>

        <ForumAccordion posts={mockPosts} />
      </div>
    </div>
  )
}
