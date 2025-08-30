import { UsersRepository } from "../repositories/users-repository"
import { UserAlreadyExistsError } from "./errors/user-already-exists-error"

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
            throw new Error('Password must have at least 6 characters')
        }
        
        const userWithSameEmail = await this.usersRepository.findByEmail(email)
    
        if (userWithSameEmail) {
            throw new UserAlreadyExistsError()
        }
    
        const user = await this.usersRepository.create({
            name,
            email,
            password
        })

        return {
            id: user.id,
            name: user.name,
            email: user.email
        }
    }

}

