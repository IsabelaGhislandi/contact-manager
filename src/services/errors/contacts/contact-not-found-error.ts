import { AppError } from '../base/app-error'

export class ContactNotFoundError extends AppError {
  constructor() {
    super('Contact not found', 404, 'CONTACT_NOT_FOUND')
  }
}