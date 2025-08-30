import { describe, it, expect, test, beforeEach } from 'vitest'
import { RegisterUseCase } from './register'
import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users-repository'
import { UserAlreadyExistsError } from './errors/user-already-exists-error'

describe('Register Use Case', () => {
    it('should be able to register', async () => {
        const usersRepository = new InMemoryUsersRepository()
        const registerUseCase = new RegisterUseCase(usersRepository)
        const user = await registerUseCase.execute({
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: '123456'
        })
        expect(user.id).toEqual(expect.any(String))
        expect(user.email).toBe('john.doe@example.com')
        expect(user.name).toBe('John Doe')
       
    })

    it('should not be able to register with same email twice', async () => {
        const usersRepository = new InMemoryUsersRepository()
        const registerUseCase = new RegisterUseCase(usersRepository)
        const email = 'john.doe@example.com'

       await registerUseCase.execute({
        name: 'John Doe',
        email,
        password: '123456'
       })

        await expect(() =>
            registerUseCase.execute({
                name: 'John Doe',
                email,
                password: '123456'
            })
        ).rejects.toBeInstanceOf(UserAlreadyExistsError)
    })

    it('should not be able to register with password less than 6 characters', async () => {
        const usersRepository = new InMemoryUsersRepository()
        const registerUseCase = new RegisterUseCase(usersRepository)

        await expect(() =>
            registerUseCase.execute({
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: '123'
            })
        ).rejects.toThrow('Password must have at least 6 characters')
    })
})