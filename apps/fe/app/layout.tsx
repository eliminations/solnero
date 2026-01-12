import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { ErrorBoundary } from "@/components/error-boundary"
import dynamic from 'next/dynamic'

// Lazy load heavy components
const HeaderLazy = dynamic(() => import('@/components/header').then(mod => ({ default: mod.Header })), {
  ssr: true,
})

export const metadata: Metadata = {
  title: "Solnero - Private Solana Transactions",
  description: "Send and receive fully private transactions on Solana using zero-knowledge proofs",
  keywords: ["Solana", "Privacy", "Zero-Knowledge", "Blockchain", "Cryptocurrency"],
  authors: [{ name: "Solnero Team" }],
  openGraph: {
    title: "Solnero - Private Solana Transactions",
    description: "Send and receive fully private transactions on Solana using zero-knowledge proofs",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="https://api.coingecko.com" />
        <link rel="preconnect" href="https://api.mainnet-beta.solana.com" />
        <link rel="dns-prefetch" href="https://api.mainnet-beta.solana.com" />
      </head>
      <body>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <HeaderLazy />
            {children}
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
