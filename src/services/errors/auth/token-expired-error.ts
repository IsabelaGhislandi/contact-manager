import { AppError } from '../base/app-error'

export class TokenExpiredError extends AppError {
  constructor() {
    super('Access token expired', 401, 'TOKEN_EXPIRED')
  }
}