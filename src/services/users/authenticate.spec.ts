import { describe, it, expect, beforeEach } from 'vitest'
import { AuthenticateUseCase } from './authtenticate'
import { InMemoryUsersRepository } from '../../repositories/in-memory/in-memory-users-repository'
import { InvalidCredentialsError } from "../errors"
import { hash } from 'bcrypt'

let usersRepository: InMemoryUsersRepository
let sut: AuthenticateUseCase

describe('Authenticate Use Case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    sut = new AuthenticateUseCase(usersRepository)
  })

  it('it should be able to authenticate', async () => {
    const passwordHash = await hash('123456', 6)
    await usersRepository.create({
      name: 'João Silva',
      email: 'joao@email.com',
      password: passwordHash
    })

    const { user, token } = await sut.execute({
      email: 'joao@email.com',
      password: '123456'
    })

    expect(user.id).toEqual(expect.any(String))
    expect(user.name).toEqual('João Silva')
    expect(user.email).toEqual('joao@email.com')
    expect(token).toEqual(expect.any(String))
  })

  it('it should not be able to authenticate with wrong email', async () => {
    await expect(() =>
      sut.execute({
        email: 'email-inexistente@email.com',
        password: '123456'
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to authenticate with wrong password', async () => {
    const passwordHash = await hash('123456', 6)
    await usersRepository.create({
      name: 'João Silva',
      email: 'joao@email.com',
      password: passwordHash
    })

    await expect(() =>
      sut.execute({
        email: 'joao@email.com',
        password: 'senha-errada'
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError)
  })

  it('it should throw InvalidCredentialErrors with correct message', async () => {
    try {
      await sut.execute({
        email: 'email-inexistente@email.com',
        password: '123456'
      })
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidCredentialsError)
    }
  })
})