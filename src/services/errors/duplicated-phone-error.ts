export class DuplicatedPhoneError extends Error {
    constructor() {
        super('Duplicate phone numbers are not allowed')
    }
}