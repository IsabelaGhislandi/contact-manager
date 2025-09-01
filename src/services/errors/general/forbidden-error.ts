import { AppError } from '../base/app-error'

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}
