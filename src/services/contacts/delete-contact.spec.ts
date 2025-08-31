import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryContactsRepository } from '../../repositories/in-memory/in-memory-contacts-repository'
import { DeleteContactUseCase } from './delete-contact'
import { ContactNotFoundError } from '../errors/contact-not-found-error'

let contactsRepository: InMemoryContactsRepository
let sut: DeleteContactUseCase

describe('Delete Contact Use Case', () => {
    beforeEach(() => {
        contactsRepository = new InMemoryContactsRepository()
        sut = new DeleteContactUseCase(contactsRepository)
    })

    it('should be able to delete a contact (soft delete)', async () => {
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

        await sut.execute({
            contactId: createdContact.id,
            userId: 'user-1'
        })

        const deletedContact = await contactsRepository.findById(createdContact.id)
        expect(deletedContact).toBeNull()
    })

    it('should not be able to delete a non-existent contact', async () => {
        await expect(() =>
            sut.execute({
                contactId: 'non-existent-id',
                userId: 'user-1'
            })
        ).rejects.toBeInstanceOf(ContactNotFoundError)
    })

    it('should not be able to delete a contact from another user', async () => {
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

        await expect(() =>
            sut.execute({
                contactId: createdContact.id,
                userId: 'user-2' 
            })
        ).rejects.toBeInstanceOf(ContactNotFoundError)
    })

    it('should not be able to delete an already deleted contact', async () => {
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

        await sut.execute({
            contactId: createdContact.id,
            userId: 'user-1'
        })

        await expect(() =>
            sut.execute({
                contactId: createdContact.id,
                userId: 'user-1'
            })
        ).rejects.toBeInstanceOf(ContactNotFoundError)
    })

    it('should verify that deleted contacts do not appear in listings', async () => {
        const contact1 = await contactsRepository.create({
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

        const contact2 = await contactsRepository.create({
            name: 'Jane Doe',
            address: '890 Main St',
            city: 'Chicago',
            email: 'jane@example.com',
            user: {
                connect: {
                    id: 'user-1'
                }
            }
        })

        let contacts = await contactsRepository.findByUserId('user-1')
        expect(contacts).toHaveLength(2)

        await sut.execute({
            contactId: contact1.id,
            userId: 'user-1'
        })

        contacts = await contactsRepository.findByUserId('user-1')
        expect(contacts).toHaveLength(1)
        expect(contacts[0].id).toEqual(contact2.id)
    })
})
