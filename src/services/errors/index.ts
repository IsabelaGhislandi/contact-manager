// Base errors
export { AppError } from './base/app-error'
export { ValidationError } from './base/validation-error'

// Auth errors
export { InvalidCredentialsError } from './auth/invalid-credentials-error'
export { UnauthorizedError } from './auth/unauthorized-error'
export { TokenExpiredError } from './auth/token-expired-error'

// User errors
export { UserAlreadyExistsError } from './users/user-already-exists-error'
export { UserNotFoundError } from './users/user-not-found-error'
export { InvalidUserPassword } from './users/invalid-user-password'
export { EmailAlreadyInUse } from './users/email-already-in-use'

// Contact errors
export { ContactNotFoundError } from './contacts/contact-not-found-error'
export { 
  InvalidEmailFormatError,
  InvalidPhoneFormatError,
  InvalidCityFormatError,
  DuplicatePhoneError,
  PhoneRequiredError,
  DuplicateEmailError
} from './contacts/contact-validation-errors'

// Generic errors
export { NotFoundError } from './general/not-found-error'
export { ForbiddenError } from './general/forbidden-error'
export { InternalServerError } from './general/internal-server-error'