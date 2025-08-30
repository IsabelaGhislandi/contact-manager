import { AuthenticateUseCase } from "../authtenticate"
import { InMemoryUsersRepository } from "../../repositories/in-memory/in-memory-users-repository"

export function makeAuthenticateUseCase() {
    const usersRepository = new InMemoryUsersRepository()
    const authenticateUseCase = new AuthenticateUseCase(usersRepository)
    return authenticateUseCase
}