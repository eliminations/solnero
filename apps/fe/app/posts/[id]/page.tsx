'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MessageSquare, Clock, User, Eye } from 'lucide-react'

interface Post {
  id: string
  title: string
  content: string
  fullContent: string
  author: string
  authorUsername: string
  createdAt: string
  replies: number
  views: number
}

// Mock data - replace with API call
const mockPost: Post = {
  id: '1',
  title: 'Understanding Zero-Knowledge Proofs on Solana',
  content: 'Zero-knowledge proofs allow us to verify transactions without revealing sensitive information...',
  fullContent: `Zero-knowledge proofs allow us to verify transactions without revealing sensitive information. This is crucial for privacy-focused applications like Solnero.

In a zero-knowledge proof system, a prover can demonstrate to a verifier that they know a value (like a transaction amount) without revealing the actual value itself. This is achieved through cryptographic protocols that ensure:

1. **Completeness**: If the statement is true, an honest verifier will be convinced
2. **Soundness**: If the statement is false, no prover can convince an honest verifier
3. **Zero-knowledge**: The verifier learns nothing beyond the validity of the statement

On Solana, we can implement zero-knowledge proofs using libraries like zk-SNARKs to create private transactions that are verifiable but not traceable by blockchain explorers.

The key advantage is that while the transaction is recorded on-chain, the details (amount, participants) remain hidden, providing true privacy similar to Monero but on the Solana blockchain.`,
  author: 'Alice',
  authorUsername: 'alice_crypto',
  createdAt: '2024-01-15T10:30:00Z',
  replies: 12,
  views: 245,
}

export default function PostPage({ params }: { params: { id: string } }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 pt-24">
      <div className="absolute inset-0 gradient-mesh opacity-30"></div>
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/posts">
          <Button variant="ghost" className="mb-6 glass border-white/10 hover:bg-white/5">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
        </Link>

        <Card className="glass-dark border-white/10 shadow-2xl">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl font-bold mb-2 text-gradient">{mockPost.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground/70 mt-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <Link
                      href={`/profile/${mockPost.authorUsername}`}
                      className="hover:text-foreground transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {mockPost.authorUsername}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(mockPost.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{mockPost.replies} replies</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{mockPost.views} views</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                {mockPost.fullContent}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Replies section - can be expanded later */}
        <Card className="mt-6 glass-dark border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-gradient">Replies ({mockPost.replies})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground/70">
                No replies yet. Be the first to reply!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
