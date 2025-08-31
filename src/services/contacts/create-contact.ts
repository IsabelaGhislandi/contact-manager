// src/services/create-contact.ts
import { ContactsRepository, ContactWithPhones } from "../../repositories/contacts-repository"
import { InvalidCityFormatError } from "../errors/invalid-city-format-error"
import { InvalidEmailFormatError } from "../errors/invalid-email-format-error"
import { InvalidPhoneFormatError } from "../errors/invalid-phone-error"
import { DuplicatePhoneError } from "../errors/duplicate-phone-error"
import { PhoneRequiredError } from "../errors/phone-required-error"

interface CreateContactUseCaseRequest {
    userId: string
    name: string
    address: string
    email: string
    phones: string[]
    city: string
}

interface CreateContactUseCaseResponse {
    contact: ContactWithPhones
}

export class CreateContactUseCase {
    constructor(
        private contactsRepository: ContactsRepository
    ) {}


    async execute({ 
        userId, 
        name, 
        address, 
        email, 
        phones,
        city
    }: CreateContactUseCaseRequest): Promise<CreateContactUseCaseResponse> {

        if (!this.isValidEmail(email)) {
            throw new InvalidEmailFormatError()
        }

        const contactWithSameEmail = await this.contactsRepository.findByEmail(email)
        if (contactWithSameEmail) {
            throw new Error('User with same email already exists')
        }

        if (!this.isValidCity(city)) {
            throw new InvalidCityFormatError()
        }

        if (!phones || phones.length === 0) {
            throw new PhoneRequiredError()
        }

        const uniquePhones = [...new Set(phones)]
        if (uniquePhones.length !== phones.length) {
            throw new DuplicatePhoneError()
        }

        phones.forEach(phone => {
            if (!this.isValidPhoneFormat(phone)) {
                throw new InvalidPhoneFormatError()
            }
        })

        const createContact = await this.contactsRepository.create({
            name,
            address,
            email,
            city,
            user: {
                connect: { id: userId }
            },
            phones: {
                create: phones.map(phone => ({
                    number: this.cleanPhoneNumber(phone)
                }))
            }
        })
        
        return {
            contact: createContact
        }
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    private isValidCity(city: string): boolean {
        const cityRegex = /^[a-zA-ZÀ-ÿ\s\-]+$/
        return cityRegex.test(city.trim()) && city.trim().length > 0
    }

    private isValidPhoneFormat(phone: string): boolean {
        const cleanPhone = phone.replace(/\D/g, '')
        return cleanPhone.length >= 10 && cleanPhone.length <= 11
    }

    //TODO: Remove this method and use the isValidPhoneFormat method
    private cleanPhoneNumber(phone: string): string {
        return phone.replace(/\D/g, '')
    }
}