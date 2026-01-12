// Centralized error handling

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export function errorHandler(error: any) {
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Log error for monitoring
  console.error('Error:', {
    message: error.message,
    stack: isDevelopment ? error.stack : undefined,
    name: error.name,
  })

  // Handle known error types
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      ...(isDevelopment && { details: error.stack }),
    }
  }

  // Handle validation errors
  if (error.name === 'ZodError') {
    return {
      success: false,
      error: 'Validation error',
      details: error.errors,
    }
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    return {
      success: false,
      error: 'Duplicate entry',
    }
  }

  // Generic error response
  return {
    success: false,
    error: isDevelopment 
      ? error.message 
      : 'An unexpected error occurred. Please try again later.',
  }
}
