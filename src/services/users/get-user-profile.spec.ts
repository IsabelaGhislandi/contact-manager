import { describe, it, expect, beforeEach} from 'vitest'    
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcrypt'
import { GetUserProfileUseCase } from './get-user-profile'
import { ResourceNotFoundError } from '../errors/resource-not-found'

let usersRepository: InMemoryUsersRepository
let sut: GetUserProfileUseCase

describe('Get User Profile Use Case', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new GetUserProfileUseCase(usersRepository)
    })

    it('should be able to get user profile', async () => {
        const createdUser = await usersRepository.create({
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: await hash('123456', 6)
        })

        const { user } = await sut.execute({
            userId: createdUser.id,
        })
        expect(user.name).toEqual(expect.any(String))
    })

    it('should not be able to get user profile with wrong id', async () => {
        expect(() => sut.execute({
            userId: 'wrong-id',
        })).rejects.toBeInstanceOf(ResourceNotFoundError)
    })

   
})