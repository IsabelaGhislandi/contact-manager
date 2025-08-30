import { describe, it, expect, beforeEach} from 'vitest'    
import { CreateContactUseCase } from './create-contact'
import { InMemoryContactsRepository } from '../repositories/in-memory/in-memory-contacts-repository'
import { ContactEmailError } from './errors/contact-email'
import { DuplicatedPhoneError } from './errors/duplicated-phone-error'

let contactsRepository: InMemoryContactsRepository  
let sut: CreateContactUseCase

describe('Create Contact Use Case', () => {
    beforeEach(() => {
        contactsRepository = new InMemoryContactsRepository()
        sut = new CreateContactUseCase(contactsRepository)
    })
        it('should be able to create a contact', async () => {
 
            const { contact } = await sut.execute({
                userId: 'user-1', 
                name: 'John Doe',
                address: '123 Main St', 
                email: 'john.doe@example.com',
                phones: ['1234567890']
            })

        expect(contact.id).toEqual(expect.any(String))
    })

    it('should not be able to create a contact with wrong email', async () => {

        await sut.execute({
            userId: 'user-1', 
            name: 'John Doe',
            address: '123 Main St', 
            email: 'john.doe@example.com',
            phones: ['1234567890']
        })

        await expect(async () => {
            return sut.execute({
            userId: 'user-1', 
            name: 'John Doe',
            address: '123 Main St',
            email: 'john.doe@example.com',
            phones: ['1234567890']
        })
        }).rejects.toBeInstanceOf(ContactEmailError)
       
    })

    it('should not be able to create a contact with duplicate phone numbers', async () => {
        await sut.execute({
            userId: 'user-1', 
            name: 'John Doe',
            address: '123 Main St', 
            email: 'john.doe@example.com',
            phones: ['1234567890']
        })
    
        await expect(async () => {
            return  sut.execute({
                userId: 'user-1', 
                name: 'Jane Doe',
                address: '123 Main St',
                email: 'jane.doe@example.com',
                phones: ['1234567890', '1234567890'] 
            })
        }).rejects.toBeInstanceOf(DuplicatedPhoneError)
    })
})