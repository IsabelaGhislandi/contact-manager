import { RegisterUseCase } from "../users/register"
import { usersRepository } from "./make-users-repository"

export function makeRegisterUseCase() {
    const registerUseCase = new RegisterUseCase(usersRepository)
    return registerUseCase
}
