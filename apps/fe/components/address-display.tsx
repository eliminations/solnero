'use client'

import { CopyButton } from './copy-button'
import { cn } from '@/lib/utils'

interface AddressDisplayProps {
  address: string
  className?: string
  showCopy?: boolean
  truncate?: boolean
}

export function AddressDisplay({ 
  address, 
  className,
  showCopy = true,
  truncate = true 
}: AddressDisplayProps) {
  const displayAddress = truncate 
    ? `${address.substring(0, 4)}...${address.substring(address.length - 4)}`
    : address

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <code className="text-xs font-mono break-all bg-black/20 px-2 py-1 rounded border border-white/5">
        {displayAddress}
      </code>
      {showCopy && (
        <CopyButton 
          text={address} 
          size="sm"
          variant="ghost"
          className="shrink-0"
        />
      )}
    </div>
  )
}
