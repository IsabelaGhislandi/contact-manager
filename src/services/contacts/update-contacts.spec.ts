import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryContactsRepository } from '../../repositories/in-memory/in-memory-contacts-repository'
import { UpdateContactUseCase } from './update-contact'
import { ContactNotFoundError } from '../errors/contact-not-found-error'
import { InvalidEmailFormatError } from '../errors/invalid-email-format-error'
import { DuplicatePhoneError } from '../errors/duplicate-phone-error'

let contactsRepository: InMemoryContactsRepository
let sut: UpdateContactUseCase

describe('Update Contact Use Case', () => {
    beforeEach(() => {
        contactsRepository = new InMemoryContactsRepository()
        sut = new UpdateContactUseCase(contactsRepository)
    })

    it('should be able to update a contact', async () => {
        const createdContact = await contactsRepository.create({
            name: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            email: 'jd@example.com',
            user: {
                connect: {
                    id: 'user-1'
                }
            },
            phones: {
                create: [
                    { number: '11999999999' }
                ]
            }
        })

        const { contact } = await sut.execute({
            contactId: createdContact.id,
            userId: 'user-1',
            name: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            email: 'jd@example.com',
            phones: ['11888888888', '11777777777']
        })

        expect(contact.id).toEqual(createdContact.id)
        expect(contact.name).toEqual('John Doe')
        expect(contact.address).toEqual('123 Main St')
        expect(contact.city).toEqual('New York')
        expect(contact.email).toEqual('jd@example.com')
        expect(contact.phones).toHaveLength(2)
        expect(contact.phones[0].number).toEqual('11888888888')
        expect(contact.phones[1].number).toEqual('11777777777')
    })

    it('should not be able to update a non-existent contact', async () => {
        await expect(() =>
            sut.execute({
                contactId: 'non-existent-id',
                userId: 'user-1',
                name: 'John Doe'
            })
        ).rejects.toBeInstanceOf(ContactNotFoundError)
    })

    it('should not be able to update a contact with invalid email', async () => {
        const createdContact = await contactsRepository.create({
            name: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            email: 'jd@example.com',
            user: {
                connect: {
                    id: 'user-1'
                }
            }
        })

        await expect(() =>
            sut.execute({
                contactId: createdContact.id,
                userId: 'user-1',
                email: 'invalid-email'
            })
        ).rejects.toBeInstanceOf(InvalidEmailFormatError)
    })

    it('should not be able to update a contact with duplicate phone numbers', async () => {
        const createdContact = await contactsRepository.create({
            name: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            email: 'jd@example.com',
            user: {
                connect: {
                    id: 'user-1'
                }
            }
        })

        await expect(() =>
            sut.execute({
                contactId: createdContact.id,
                userId: 'user-1',
                phones: ['11999999999', '11999999999']
            })
        ).rejects.toBeInstanceOf(DuplicatePhoneError)
    })

    it('should not be able to update contact from another user', async () => {
        const createdContact = await contactsRepository.create({
            name: 'John Doe',
            address: '123 Main St',
            city: 'New York',
            email: 'jd@example.com',
            user: {
                connect: {
                    id: 'user-1'
                }
            }
        })

        await expect(() =>
            sut.execute({
                contactId: createdContact.id,
                userId: 'user-2',
                name: 'John Doe'
            })
        ).rejects.toBeInstanceOf(ContactNotFoundError)
    })
})
