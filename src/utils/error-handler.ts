import { Request, Response } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../services/errors/base/app-error'
import { ValidationError } from '../services/errors/base/validation-error'

interface ErrorResponse {
  message: string
  code?: string
  errors?: Array<{ field: string; message: string }>
  timestamp: string
  path: string
  method: string
}

export class ErrorHandler {
  static handle(error: unknown, req: Request, res: Response): Response {
    const timestamp = new Date().toISOString()
    const path = req.originalUrl
    const method = req.method

    // Zod validation errors
    if (error instanceof ZodError) {
      const errorResponse: ErrorResponse = {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        errors: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        })),
        timestamp,
        path,
        method
      }
      return res.status(400).json(errorResponse)
    }

    // Custom validation errors
    if (error instanceof ValidationError) {
      const errorResponse: ErrorResponse = {
        message: error.message,
        code: error.code,
        errors: error.errors,
        timestamp,
        path,
        method
      }
      return res.status(error.statusCode).json(errorResponse)
    }

    // Application errors
    if (error instanceof AppError) {
      const errorResponse: ErrorResponse = {
        message: error.message,
        code: error.code,
        timestamp,
        path,
        method
      }
      return res.status(error.statusCode).json(errorResponse)
    }

    // Unexpected errors
    console.error('Unexpected error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      path,
      method,
      timestamp
    })

    const errorResponse: ErrorResponse = {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp,
      path,
      method
    }
    return res.status(500).json(errorResponse)
  }
}