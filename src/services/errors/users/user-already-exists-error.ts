import { AppError } from '../base/app-error'

export class UserAlreadyExistsError extends AppError {
  constructor(email?: string) {
    const message = email 
      ? `User with email '${email}' already exists`
      : 'User already exists'
    super(message, 409, 'USER_ALREADY_EXISTS')
  }
}