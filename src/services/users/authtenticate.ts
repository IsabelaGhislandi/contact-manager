import { User } from "@prisma/client"
import { UsersRepository } from "../../repositories/users-repository"
import { InvalidCredentialErrors } from "../errors/invalid-credential-errors"
import { compare } from "bcrypt"
import jwt from 'jsonwebtoken'
import { env } from "../../env"

interface AuthenticateUseCaseRequest {
    email: string
    password: string
}

interface AuthenticateUseCaseResponse {
    user: {
        id: string
        name: string
        email: string
        createdAt: Date
        updatedAt: Date
    }
    token: string
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

        // Generate JWT token
        const token = jwt.sign(
            { sub: user.id },
            env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        return { 
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            token 
        }
    }
}
