import { AppError } from '../base/app-error'

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid email or password', 401, 'INVALID_CREDENTIALS')
  }
}
