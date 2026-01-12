'use client'

import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-white/5', className)}
    />
  )
}

export function BalanceSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}

export function TransactionSkeleton() {
  return (
    <div className="flex justify-between items-center p-5 glass border-white/10 rounded-lg">
      <div className="flex items-center gap-4 flex-1">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-dark border-white/10 rounded-lg p-6 space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-24" />
    </div>
  )
}
