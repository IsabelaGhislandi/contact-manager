export class InvalidCredentialErrors extends Error {
    constructor() {
        super('E-mail ou senha incorretos')
    }
}