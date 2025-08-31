export class InvalidCityFormatError extends Error {
  constructor() {
    super('City must contain only letters, spaces and accents')
  }
}