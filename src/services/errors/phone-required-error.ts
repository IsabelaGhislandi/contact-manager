export class PhoneRequiredError extends Error {
  constructor() {
    super('Contact must have at least one phone number')
  }
}