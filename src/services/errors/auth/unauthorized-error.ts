import { AppError } from '../base/app-error'

export class UnauthorizedError extends AppError {
  constructor(message = 'Access token required') {
    super(message, 401, 'UNAUTHORIZED')
  }
}