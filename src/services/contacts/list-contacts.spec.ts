import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryContactsRepository } from '../../repositories/in-memory/in-memory-contacts-repository'
import { ListContactsUseCase } from './list-contacts'

let contactsRepository: InMemoryContactsRepository
let sut: ListContactsUseCase

describe('List Contacts Use Case', () => {
    beforeEach(() => {
        contactsRepository = new InMemoryContactsRepository()
        sut = new ListContactsUseCase(contactsRepository)
    })

    it('should be able to list all contacts for a user', async () => {
            await contactsRepository.create({
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

            await contactsRepository.create({
                name: 'Jane Smith',
                address: 'Av. Paulista, 456',
                email: 'jane@example.com',
                city: 'São Paulo',
                user: {
                    connect: { id: 'user-1' }
                },
                phones: {
                    create: [{ number: '11888776655' }]
                }
            })

            await contactsRepository.create({
                name: 'Bob Wilson',
                address: 'Rua B, 789',
                email: 'bob@example.com',
                city: 'Rio de Janeiro',
                user: {
                    connect: { id: 'user-2' }
                },
                phones: {
                    create: [{ number: '21777665544' }]
                }
            })

            const { contacts } = await sut.execute({
                userId: 'user-1'
            })

            expect(contacts).toHaveLength(2)
            expect(contacts[0].name).toBe('John Doe')
            expect(contacts[1].name).toBe('Jane Smith')
            expect(contacts.every(contact => contact.userId === 'user-1')).toBe(true)
        })

        it('should return empty array when user has no contacts', async () => {
            const { contacts } = await sut.execute({
                userId: 'user-without-contacts'
            })

            expect(contacts).toHaveLength(0)
            expect(contacts).toEqual([])
        })

        it('should be able to filter contacts by name', async () => {
            await contactsRepository.create({
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

            await contactsRepository.create({
                name: 'Jane Smith',
                address: 'Av. Paulista, 456',
                email: 'jane@example.com',
                city: 'São Paulo',
                user: {
                    connect: { id: 'user-1' }
                },
                phones: {
                    create: [{ number: '11888776655' }]
                }
            })

            const { contacts } = await sut.execute({
                userId: 'user-1',
                filters: {
                    name: 'John'
                }
            })

            expect(contacts).toHaveLength(1)
            expect(contacts[0].name).toBe('John Doe')
        })

        it('should be able to filter contacts by email', async () => {
            await contactsRepository.create({
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

            await contactsRepository.create({
                name: 'Jane Smith',
                address: 'Av. Paulista, 456',
                email: 'jane@gmail.com',
                city: 'São Paulo',
                user: {
                    connect: { id: 'user-1' }
                },
                phones: {
                    create: [{ number: '11888776655' }]
                }
            })

            const { contacts } = await sut.execute({
                userId: 'user-1',
                filters: {
                    email: 'gmail'
                }
            })

            expect(contacts).toHaveLength(1)
            expect(contacts[0].email).toBe('jane@gmail.com')
        })

        it('should be able to filter contacts by phone number', async () => {
            await contactsRepository.create({
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

            await contactsRepository.create({
                name: 'Jane Smith',
                address: 'Av. Paulista, 456',
                email: 'jane@example.com',
                city: 'São Paulo',
                user: {
                    connect: { id: 'user-1' }
                },
                phones: {
                    create: [{ number: '11888776655' }]
                }
            })

            const { contacts } = await sut.execute({
                userId: 'user-1',
                filters: {
                    phone: '999'
                }
            })

            expect(contacts).toHaveLength(1)
            expect(contacts[0].phones[0].number).toBe('11999887766')
        })

        it('should be able to filter contacts by address', async () => {
            await contactsRepository.create({
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

            await contactsRepository.create({
                name: 'Jane Smith',
                address: 'Av. Paulista, 456',
                email: 'jane@example.com',
                city: 'São Paulo',
                user: {
                    connect: { id: 'user-1' }
                },
                phones: {
                    create: [{ number: '11888776655' }]
                }
            })

            const { contacts } = await sut.execute({
                userId: 'user-1',
                filters: {
                    address: 'Paulista'
                }
            })

            expect(contacts).toHaveLength(1)
            expect(contacts[0].address).toBe('Av. Paulista, 456')
        })

        it('should be able to filter contacts by city', async () => {
            await contactsRepository.create({
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

            await contactsRepository.create({
                name: 'Jane Smith',
                address: 'Av. Copacabana, 456',
                email: 'jane@example.com',
                city: 'Rio de Janeiro',
                user: {
                    connect: { id: 'user-1' }
                },
                phones: {
                    create: [{ number: '21888776655' }]
                }
            })

            const { contacts } = await sut.execute({
                userId: 'user-1',
                filters: {
                    city: 'Rio'
                }
            })

            expect(contacts).toHaveLength(1)
            expect(contacts[0].city).toBe('Rio de Janeiro')
        })

        it('should be able to combine multiple filters', async () => {
            await contactsRepository.create({
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

            await contactsRepository.create({
                name: 'John Smith',
                address: 'Av. Paulista, 456',
                email: 'johnsmith@gmail.com',
                city: 'São Paulo',
                user: {
                    connect: { id: 'user-1' }
                },
                phones: {
                    create: [{ number: '11888776655' }]
                }
            })

            const { contacts } = await sut.execute({
                userId: 'user-1',
                filters: {
                    name: 'John',
                    email: 'gmail'
                }
            })

            expect(contacts).toHaveLength(1)
            expect(contacts[0].name).toBe('John Smith')
            expect(contacts[0].email).toBe('johnsmith@gmail.com')
        })

    it('should not list soft deleted contacts', async () => {

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

            await contactsRepository.create({
                name: 'Jane Smith',
                address: 'Av. Paulista, 456',
                email: 'jane@example.com',
                city: 'São Paulo',
                user: {
                    connect: { id: 'user-1' }
                },
                phones: {
                    create: [{ number: '11888776655' }]
                }
            })


            await contactsRepository.update(createdContact.id, {
                deletedAt: new Date()
            })
            const { contacts } = await sut.execute({
                userId: 'user-1'
            })

            expect(contacts).toHaveLength(1)
            expect(contacts[0].name).toBe('Jane Smith')
            expect(contacts.every(contact => !contact.deletedAt)).toBe(true)
        })

        it('should not find soft deleted contacts even with filters', async () => {
            // Criar contato
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

            const { contacts } = await sut.execute({
                userId: 'user-1',
                filters: {
                    name: 'John'
                }
            })

            expect(contacts).toHaveLength(0)
        })
})