// Security headers middleware

export function securityHeaders() {
  return async ({ set }: any) => {
    set.headers = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    }
  }
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 1000) // Limit length
}

// Validate Solana public key format
export function isValidSolanaAddress(address: string): boolean {
  try {
    // Solana addresses are base58 encoded, 32-44 characters
    if (!address || address.length < 32 || address.length > 44) {
      return false
    }
    // Check if it's valid base58 (only alphanumeric except 0, O, I, l)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/
    return base58Regex.test(address)
  } catch {
    return false
  }
}
