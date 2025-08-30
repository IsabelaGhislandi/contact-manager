import { describe, it, expect, beforeEach} from 'vitest'    
import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users-repository'
import { AuthenticateUseCase } from './authtenticate'
import { hash } from 'bcrypt'
import { InvalidCredentialErrors } from './errors/invalid-credential-errors'

let usersRepository: InMemoryUsersRepository
let sut: AuthenticateUseCase

describe('Authenticate Use Case', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new AuthenticateUseCase(usersRepository)
    })
    it('should be able to authenticate', async () => {
 
        await usersRepository.create({
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: await hash('123456', 6)
        })

        const { user } = await sut.execute({
            email: 'john.doe@example.com',
            password: '123456'
        })
        expect(user.id).toEqual(expect.any(String))
    })

    it('should not be able to authenticate with wrong email', async () => {
        //Authenticate without created user
        expect(() => sut.execute({
            email: 'john.doe@example.com',
            password: '123456'
        })).rejects.toBeInstanceOf(InvalidCredentialErrors)
       
    })

    it('should not be able to authenticate with wrong password', async () => {

        await usersRepository.create({
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: await hash('123456', 6)
        })

        expect(() => sut.execute({
            email: 'john.doe@example.com',
            password: '123123',
        })).rejects.toBeInstanceOf(InvalidCredentialErrors)
       
    })
})