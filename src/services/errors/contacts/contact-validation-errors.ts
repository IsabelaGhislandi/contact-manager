import { ValidationError } from '../base/validation-error'

export class InvalidEmailFormatError extends ValidationError {
  constructor(email?: string) {
    const message = email 
      ? `Invalid email format: ${email}`
      : 'Invalid email format'
    super(message, [{ field: 'email', message }])
  }
}

export class InvalidPhoneFormatError extends ValidationError {
  constructor(phone?: string) {
    const message = phone 
      ? `Invalid phone format: ${phone}. Phone must have 10-11 digits`
      : 'Invalid phone format. Phone must have 10-11 digits'
    super(message, [{ field: 'phones', message }])
  }
}

export class InvalidCityFormatError extends ValidationError {
  constructor(city?: string) {
    const message = city 
      ? `Invalid city format: ${city}. City must contain only letters, spaces and accents`
      : 'Invalid city format. City must contain only letters, spaces and accents'
    super(message, [{ field: 'city', message }])
  }
}

export class DuplicatePhoneError extends ValidationError {
  constructor() {
    const message = 'Duplicate phone numbers are not allowed'
    super(message, [{ field: 'phones', message }])
  }
}

export class PhoneRequiredError extends ValidationError {
  constructor() {
    const message = 'At least one phone number is required'
    super(message, [{ field: 'phones', message }])
  }
}

export class DuplicateEmailError extends ValidationError {
  constructor(email: string) {
    const message = `Email '${email}' is already in use`
    super(message, [{ field: 'email', message }])
  }
}