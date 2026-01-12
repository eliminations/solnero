'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CopyButton } from './copy-button'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QRCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  address: string
  title?: string
}

export function QRCodeModal({ open, onOpenChange, address, title = 'Wallet Address' }: QRCodeModalProps) {
  const handleDownload = () => {
    const svg = document.querySelector('#qr-code svg')
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `solnero-${address.substring(0, 8)}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-dark border-white/10 max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Scan this QR code to share your wallet address
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div id="qr-code" className="p-4 bg-white rounded-lg">
            <QRCodeSVG 
              value={address}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="w-full space-y-2">
            <div className="flex items-center gap-2 p-2 bg-black/20 rounded border border-white/5">
              <code className="text-xs font-mono break-all flex-1">
                {address}
              </code>
              <CopyButton text={address} size="sm" />
            </div>
            <Button
              variant="outline"
              onClick={handleDownload}
              className="w-full"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Download QR Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
