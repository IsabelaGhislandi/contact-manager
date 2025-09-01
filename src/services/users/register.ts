import { UsersRepository } from "../../repositories/users-repository"
import { InvalidUserPassword, UserAlreadyExistsError } from "../errors"
import { hash } from "bcrypt"

interface RegisterUseCaseRequest {
    name: string
    email: string
    password: string
}

export class RegisterUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute({ 
        name, email, password}: RegisterUseCaseRequest) {
        
        if (password.length < 6) {
            throw new InvalidUserPassword()
        }
        
        const userWithSameEmail = await this.usersRepository.findByEmail(email)
    
        if (userWithSameEmail) {
            throw new UserAlreadyExistsError()
        }

        const passwordHash = await hash(password, 6)
    
        const user = await this.usersRepository.create({
            name,
            email,
            password: passwordHash
        })

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }
    }

}

