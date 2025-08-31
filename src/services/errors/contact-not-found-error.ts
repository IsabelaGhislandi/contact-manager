export class ContactNotFoundError extends Error {
    constructor() {
        super('Contact not found')
    }
}