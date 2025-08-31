import { describe, it, expect, beforeEach } from 'vitest'
import { GetContactUseCase } from './get-contact'
import { InMemoryContactsRepository } from '../../repositories/in-memory/in-memory-contacts-repository'
import { ContactNotFoundError } from '../errors/contact-not-found-error'
import { WeatherService } from '../weather/weather-service'

let contactsRepository: InMemoryContactsRepository
let sut: GetContactUseCase

describe('Get Contact Use Case', () => {
    beforeEach(() => {
        contactsRepository = new InMemoryContactsRepository()
        sut = new GetContactUseCase(contactsRepository, new WeatherService())
    })

    it('should be able to get a contact by id', async () => {
            const createdContact = await contactsRepository.create({
                name: 'John Doe',
                address: 'Rua das Flores, 123',
                email: 'john@example.com',
                city: 'São Paulo',
                user: {
                    connect: { id: 'user-1' }
                },
                phones: {
                    create: [
                        { number: '11999887766' },
                        { number: '11888777666' }
                    ]
                }
            })

            const { contact } = await sut.execute({
                contactId: createdContact.id,
                userId: 'user-1'
            })

            expect(contact.id).toEqual(createdContact.id)
            expect(contact.name).toEqual('John Doe')
            expect(contact.email).toEqual('john@example.com')
            expect(contact.userId).toEqual('user-1')
            expect(contact.phones).toHaveLength(2)
            expect(contact.phones[0].number).toEqual('11999887766')
            expect(contact.phones[1].number).toEqual('11888777666')
        })

    it('should not be able to get a non-existent contact', async () => {
            await expect(() =>
                sut.execute({
                    contactId: 'non-existent-id',
                    userId: 'user-1'
                })
            ).rejects.toBeInstanceOf(ContactNotFoundError)
        })

        it('should not be able to get a contact from another user', async () => {
            const createdContact = await contactsRepository.create({
                name: 'John Doe',
                address: 'Rua das Flores, 123',
                email: 'john@example.com',
                city: 'São Paulo',
                user: {
                    connect: { id: 'user-1' }
                },
                phones: {
                    create: [{ number: '11999887766' }]
                }
            })

            await expect(() =>
                sut.execute({
                    contactId: createdContact.id,
                    userId: 'user-2'
                })
            ).rejects.toBeInstanceOf(ContactNotFoundError)
        })

        it('should not be able to get a soft deleted contact', async () => {
            const createdContact = await contactsRepository.create({
                name: 'John Doe',
                address: 'Rua das Flores, 123',
                email: 'john@example.com',
                city: 'São Paulo',
                user: {
                    connect: { id: 'user-1' }
                },
                phones: {
                    create: [{ number: '11999887766' }]
                }
            })

            await contactsRepository.update(createdContact.id, {
                deletedAt: new Date()
            })

            await expect(() =>
                sut.execute({
                    contactId: createdContact.id,
                    userId: 'user-1'
                })
            ).rejects.toBeInstanceOf(ContactNotFoundError)
        })
})

