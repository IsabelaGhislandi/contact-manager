import { describe, it, expect, beforeEach, vi } from 'vitest'    
import { CreateContactUseCase } from './create-contact'
import { InMemoryContactsRepository } from '../../repositories/in-memory/in-memory-contacts-repository'
import { InvalidEmailFormatError, InvalidCityFormatError, InvalidPhoneFormatError, DuplicatePhoneError, PhoneRequiredError, DuplicateEmailError } from "../errors"

let contactsRepository: InMemoryContactsRepository  
let sut: CreateContactUseCase

describe('Create Contact Use Case', () => {
    beforeEach(() => {
        contactsRepository = new InMemoryContactsRepository()
        sut = new CreateContactUseCase(contactsRepository)
    })

    describe('it should be able to create a contact', () => {
        it('should be able to create a contact with valid data', async () => {
            const { contact } = await sut.execute({
                userId: 'user-1', 
                name: 'John Doe',
                address: '123 Main St', 
                email: 'john.doe@example.com',
                phones: ['11999999999'],
                city: 'New York'
            })

            expect(contact.id).toEqual(expect.any(String))
            expect(contact.name).toEqual('John Doe')
            expect(contact.email).toEqual('john.doe@example.com')
            expect(contact.city).toEqual('New York')
            expect(contact.phones).toHaveLength(1)
            expect(contact.phones[0].number).toEqual('11999999999')
            expect(contact.phones[0].contactId).toEqual(contact.id)
        })

        it('should be able to create a contact with multiple phones', async () => {
            const { contact } = await sut.execute({
                userId: 'user-1', 
                name: 'John Doe',
                address: '123 Main St', 
                email: 'john.doe@example.com',
                phones: ['11999999999', '11888888888'],
                city: 'São Paulo'
            })

            expect(contact.phones).toHaveLength(2)
            expect(contact.phones[0].number).toEqual('11999999999')
            expect(contact.phones[1].number).toEqual('11888888888')
            expect(contact.phones[0].contactId).toEqual(contact.id)
            expect(contact.phones[1].contactId).toEqual(contact.id)
        })

        it('should clean and store phone numbers (remove formatting)', async () => {
            const { contact } = await sut.execute({
                userId: 'user-1', 
                name: 'John Doe',
                address: '123 Main St', 
                email: 'john.doe@example.com',
                phones: ['(11) 99999-9999'],
                city: 'Rio de Janeiro'
            })

            expect(contact.phones[0].number).toEqual('11999999999')
        })

        it('should accept city with accents and spaces', async () => {
            const { contact } = await sut.execute({
                userId: 'user-1', 
                name: 'José Silva',
                address: 'Rua das Flores, 123', 
                email: 'jose@example.com',
                phones: ['11999999999'],
                city: 'São José dos Campos'
            })

            expect(contact.city).toEqual('São José dos Campos')
            expect(contact.name).toEqual('José Silva')
        })
    })

    describe('Email Validation', () => {
        it('should not be able to create a contact with invalid email format', async () => {
            await expect(() => 
                sut.execute({
                    userId: 'user-1', 
                    name: 'John Doe',
                    address: '123 Main St', 
                    email: 'invalid-email',
                    phones: ['11999999999'],
                    city: 'New York'
                })
            ).rejects.toBeInstanceOf(InvalidEmailFormatError)
        })

        it('should not be able to create a contact with email without @', async () => {
            await expect(() => 
                sut.execute({
                    userId: 'user-1', 
                    name: 'John Doe',
                    address: '123 Main St', 
                    email: 'johndoe.com',
                    phones: ['11999999999'],
                    city: 'New York'
                })
            ).rejects.toBeInstanceOf(InvalidEmailFormatError)
        })

        it('should not be able to create a contact with duplicate email', async () => {
            await sut.execute({
                userId: 'user-1', 
                name: 'John Doe',
                address: '123 Main St', 
                email: 'john.doe@example.com',
                phones: ['11999999999'],
                city: 'New York'
            })

            await expect(() => 
                sut.execute({
                    userId: 'user-2', 
                    name: 'Jane Doe',
                    address: '456 Oak St', 
                    email: 'john.doe@example.com',
                    phones: ['11888888888'],
                    city: 'Boston'
                })
            ).rejects.toBeInstanceOf(DuplicateEmailError)
        })
    })

    describe('City Validation', () => {
        it('should not accept city with numbers', async () => {
            await expect(() => 
                sut.execute({
                    userId: 'user-1', 
                    name: 'John Doe',
                    address: '123 Main St', 
                    email: 'john.doe@example.com',
                    phones: ['11999999999'],
                    city: 'New York 123'
                })
            ).rejects.toBeInstanceOf(InvalidCityFormatError)
        })

        it('should not accept city with special characters', async () => {
            await expect(() => 
                sut.execute({
                    userId: 'user-1', 
                    name: 'John Doe',
                    address: '123 Main St', 
                    email: 'john.doe@example.com',
                    phones: ['11999999999'],
                    city: 'New York@#$'
                })
            ).rejects.toBeInstanceOf(InvalidCityFormatError)
        })

        it('should accept city with hyphens', async () => {
            const { contact } = await sut.execute({
                userId: 'user-1', 
                name: 'John Doe',
                address: '123 Main St', 
                email: 'john.doe@example.com',
                phones: ['11999999999'],
                city: 'Feira de Santana'
            })

            expect(contact.city).toEqual('Feira de Santana')
        })
    })

    describe('Phone Validation', () => {
        it('it should not be able to create a contact without phones', async () => {
            await expect(() => 
                sut.execute({
                    userId: 'user-1', 
                    name: 'John Doe',
                    address: '123 Main St', 
                    email: 'john.doe@example.com',
                    phones: [],
                    city: 'New York'
                })
            ).rejects.toBeInstanceOf(PhoneRequiredError)
        })

        it('should not be able to create a contact with duplicate phone numbers', async () => {
            await expect(() => 
                sut.execute({
                    userId: 'user-1', 
                    name: 'John Doe',
                    address: '123 Main St', 
                    email: 'john.doe@example.com',
                    phones: ['11999999999', '11999999999'],
                    city: 'New York'
                })
            ).rejects.toBeInstanceOf(DuplicatePhoneError)
        })

        it('should not accept phone with letters', async () => {
            await expect(() => 
                sut.execute({
                    userId: 'user-1', 
                    name: 'John Doe',
                    address: '123 Main St', 
                    email: 'john.doe@example.com',
                    phones: ['11abc999999'],
                    city: 'New York'
                })
            ).rejects.toBeInstanceOf(InvalidPhoneFormatError)
        })

        it('should not accept phone too short', async () => {
            await expect(() => 
                sut.execute({
                    userId: 'user-1', 
                    name: 'John Doe',
                    address: '123 Main St', 
                    email: 'john.doe@example.com',
                    phones: ['119999999'], 
                    city: 'New York'
                })
            ).rejects.toBeInstanceOf(InvalidPhoneFormatError)
        })

        it('should not accept phone too long', async () => {
            await expect(() => 
                sut.execute({
                    userId: 'user-1', 
                    name: 'John Doe',
                    address: '123 Main St', 
                    email: 'john.doe@example.com',
                    phones: ['119999999999'], 
                    city: 'New York'
                })
            ).rejects.toBeInstanceOf(InvalidPhoneFormatError)
        })

        it('should accept phone with valid formatting', async () => {
            const { contact } = await sut.execute({
                userId: 'user-1', 
                name: 'John Doe',
                address: '123 Main St', 
                email: 'john.doe@example.com',
                phones: ['(11) 99999-9999'],
                city: 'New York'
            })

            expect(contact.phones[0].number).toEqual('11999999999') 
        })
    })

    describe('Other Cases', () => {
        it('it should handle minimum valid phone (10 digits)', async () => {
            const { contact } = await sut.execute({
                userId: 'user-1', 
                name: 'John Doe',
                address: '123 Main St', 
                email: 'john.doe@example.com',
                phones: ['1199999999'], 
                city: 'New York'
            })

            expect(contact.phones[0].number).toEqual('1199999999')
        })

        it('it should handle maximum valid phone (11 digits)', async () => {
            const { contact } = await sut.execute({
                userId: 'user-1', 
                name: 'John Doe',
                address: '123 Main St', 
                email: 'john.doe@example.com',
                phones: ['11999999999'], 
                city: 'New York'
            })

            expect(contact.phones[0].number).toEqual('11999999999')
        })

        it('it should handle special characters in name and address', async () => {
            const { contact } = await sut.execute({
                userId: 'user-1', 
                name: 'José da Silva Jr.',
                address: 'Rua das Flores, 123 - Apto 45', 
                email: 'jose.silva@example.com',
                phones: ['11999999999'],
                city: 'São Paulo'
            })

            expect(contact.name).toEqual('José da Silva Jr.')
            expect(contact.address).toEqual('Rua das Flores, 123 - Apto 45')
        })
    })

})