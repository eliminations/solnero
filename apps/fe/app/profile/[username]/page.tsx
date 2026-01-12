'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Twitter, MessageSquare } from 'lucide-react'

interface User {
  id: string
  username: string
  name: string
  bio: string
  twitterHandle?: string
  posts: number
  joinedAt: string
}

// Mock data - replace with API call
const mockUser: User = {
  id: '1',
  username: 'mambatrades_',
  name: 'Mamba Trades',
  bio: 'Crypto trader and Solana enthusiast. Sharing insights on private transactions and DeFi.',
  twitterHandle: 'mambatrades_',
  posts: 42,
  joinedAt: '2023-06-15T00:00:00Z',
}

export default function ProfilePage({ params }: { params: { username: string } }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    })
  }

  const twitterUrl = mockUser.twitterHandle
    ? `https://x.com/${mockUser.twitterHandle}`
    : null

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
                <CardTitle className="text-3xl font-bold mb-1 text-gradient">{mockUser.name}</CardTitle>
                <CardDescription className="text-base text-muted-foreground/70">@{mockUser.username}</CardDescription>
                {mockUser.bio && (
                  <p className="text-foreground/70 mt-4 leading-relaxed">{mockUser.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground/70">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{mockUser.posts} posts</span>
                  </div>
                  <span>Joined {formatDate(mockUser.joinedAt)}</span>
                </div>
              </div>
              {twitterUrl && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                  className="glass border-white/10 hover:border-white/20"
                >
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    View on X
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
        </Card>

        {/* User's posts */}
        <Card className="mt-6 glass-dark border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-gradient">Posts by {mockUser.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground/70">
                No posts yet.
              </p>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
