export abstract class AppError extends Error {
    public readonly statusCode: number
    public readonly code: string
    public readonly isOperational: boolean
  
    constructor(message: string, statusCode: number, code: string, isOperational = true) {
      super(message)
      this.name = this.constructor.name
      this.statusCode = statusCode
      this.code = code
      this.isOperational = isOperational
  
      Error.captureStackTrace(this, this.constructor)
    }
  }