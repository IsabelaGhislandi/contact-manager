export class DuplicatePhoneError extends Error {
  constructor() {
    super('Duplicate phone numbers are not allowed')
  }
}