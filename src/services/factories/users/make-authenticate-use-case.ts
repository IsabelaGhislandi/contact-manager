import { AuthenticateUseCase } from "../../users/authtenticate"
import { usersRepository } from "./make-users-repository"

export function makeAuthenticateUseCase() {
    const authenticateUseCase = new AuthenticateUseCase(usersRepository)
    return authenticateUseCase
}