export class DuplicatePhoneNumbersError extends Error {
    constructor() {
        super('Duplicate phone numbers are not allowed')
    }
}