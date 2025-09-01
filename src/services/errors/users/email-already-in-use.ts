import { AppError } from '../base/app-error'

    export class EmailAlreadyInUse extends AppError {
  constructor(email?: string) {
    const message = email
      ? `Email already in use`
      : 'Email already in use'
    super(message, 400, 'EMAIL_ALREADY_IN_USE')
  }
}