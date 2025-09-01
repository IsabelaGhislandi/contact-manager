import { describe, it, expect, beforeEach} from 'vitest'    
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository'
import { hash } from 'bcrypt'
import { GetUserProfileUseCase } from './get-user-profile'
import { UserNotFoundError } from "../errors"

let usersRepository: InMemoryUsersRepository
let sut: GetUserProfileUseCase

describe('Get User Profile Use Case', () => {
    beforeEach(() => {
        usersRepository = new InMemoryUsersRepository()
        sut = new GetUserProfileUseCase(usersRepository)
    })

    it('it should be able to get user profile', async () => {
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

    it('it should not be able to get user profile with wrong id', async () => {
        await expect(() => sut.execute({
            userId: 'wrong-id',
        })).rejects.toBeInstanceOf(UserNotFoundError)
    })

   
})