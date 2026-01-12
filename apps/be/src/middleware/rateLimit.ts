// Simple in-memory rate limiter
// For production, use Redis or a proper rate limiting service

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
) {
  return async ({ request, set }: any) => {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    const key = `rate_limit_${ip}`
    const now = Date.now()
    const record = store[key]

    if (!record || now > record.resetTime) {
      // Create new record or reset expired one
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      }
      return
    }

    if (record.count >= maxRequests) {
      set.status = 429
      return {
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      }
    }

    record.count++
  }
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  }
}, 60000) // Cleanup every minute
