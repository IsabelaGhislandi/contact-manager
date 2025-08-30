export class ContactEmailError extends Error {
    constructor() {
        super('Contact with same email already exists')
      
    }
}