import { ContactsRepository, ContactWithPhones } from "../../repositories/contacts-repository"
import { ContactNotFoundError } from "../errors/contact-not-found-error"
import { InvalidEmailFormatError } from "../errors/invalid-email-format-error"
import { InvalidPhoneFormatError } from "../errors/invalid-phone-error"
import { InvalidCityFormatError } from "../errors/invalid-city-format-error"
import { PhoneRequiredError } from "../errors/phone-required-error"
import { DuplicatePhoneError } from "../errors/duplicate-phone-error"

interface UpdateContactUseCaseRequest {
    contactId: string
    userId: string
    name?: string
    address?: string
    email?: string
    phones?: string[]
    city?: string
}

interface UpdateContactUseCaseResponse {
    contact: ContactWithPhones
}

export class UpdateContactUseCase {
    constructor(
        private contactsRepository: ContactsRepository
    ) {}

    async execute({ 
        contactId,
        userId,
        name, 
        address, 
        email, 
        phones,
        city
    }: UpdateContactUseCaseRequest): Promise<UpdateContactUseCaseResponse> {
        
        const existingContact = await this.contactsRepository.findById(contactId)
        
        if (!existingContact || existingContact.userId !== userId) {
            throw new ContactNotFoundError()
        }

        if (email && !this.isValidEmail(email)) {
            throw new InvalidEmailFormatError()
        }

        if (email && email !== existingContact.email) {
            const contactWithSameEmail = await this.contactsRepository.findByEmail(email)
            if (contactWithSameEmail && contactWithSameEmail.id !== contactId) {
                throw new Error('User with same email already exists')
            }
        }

        if (city && !this.isValidCity(city)) {
            throw new InvalidCityFormatError()
        }

        if (phones) {
            if (phones.length === 0) {
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
        }

        const updateData: any = {}
        
        if (name) updateData.name = name
        if (address) updateData.address = address
        if (email) updateData.email = email
        if (city) updateData.city = city
        
        if (phones) {
            // Deletar telefones antigos e criar novos
            updateData.phones = {
                deleteMany: {},
                create: phones.map(phone => ({
                    number: this.cleanPhoneNumber(phone)
                }))
            }
        }

        const updatedContact = await this.contactsRepository.update(contactId, updateData)
        
        return {
            contact: updatedContact
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

    private cleanPhoneNumber(phone: string): string {
        return phone.replace(/\D/g, '')
    }
}