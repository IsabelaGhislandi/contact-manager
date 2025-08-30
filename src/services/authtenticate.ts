import { User } from "@prisma/client";
import { UsersRepository } from "../repositories/users-repository";
import { InvalidCredentialErrors } from "./errors/invalid-credential-errors";
import { compare } from "bcrypt";

interface AuthenticateUseCaseRequest {
    email: string
    password: string
}

interface AuthenticateUseCaseResponse {
    user: User
}
export class AuthenticateUseCase {
        constructor(
            private usersRepository: UsersRepository
        ) {}

        async execute({ email, password }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
            const user = await this.usersRepository.findByEmail(email)
            if (!user) {
                throw new InvalidCredentialErrors()
            }
            const doesPasswordMatch = await compare(password, user.password)
            if (!doesPasswordMatch) {
                throw new InvalidCredentialErrors()
            }
            return { user }
        }
}