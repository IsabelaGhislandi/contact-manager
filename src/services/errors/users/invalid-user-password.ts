import { AppError } from '../base/app-error'

export class InvalidUserPassword extends AppError {
  constructor(password?: string) {
    const message = password
      ? `Invalid user password`
      : 'Invalid user password'
    super(message, 400, 'INVALID_USER_PASSWORD')
  }
}