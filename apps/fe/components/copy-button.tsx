'use client'

import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showText?: boolean
}

export function CopyButton({ 
  text, 
  className, 
  variant = 'ghost',
  size = 'sm',
  showText = false 
}: CopyButtonProps) {
  const { copy, copied } = useCopyToClipboard()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => copy(text)}
      className={cn('transition-all', className)}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          {showText && 'Copied'}
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-2" />
          {showText && 'Copy'}
        </>
      )}
    </Button>
  )
}
