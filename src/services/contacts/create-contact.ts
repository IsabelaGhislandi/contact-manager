import { ContactsRepository, ContactWithPhones } from "../../repositories/contacts-repository"
import { InvalidEmailFormatError, InvalidCityFormatError, InvalidPhoneFormatError, DuplicatePhoneError, PhoneRequiredError, DuplicateEmailError } from "../errors"

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
        private contactsRepository: ContactsRepository) {}

    async execute({ 
        userId, 
        name, 
        address, 
        email, 
        phones,
        city
    }: CreateContactUseCaseRequest): Promise<CreateContactUseCaseResponse> {

        if (!this.isValidEmail(email)) {
            throw new InvalidEmailFormatError(email)
        }

        const contactWithSameEmail = await this.contactsRepository.findByEmail(email)

        if (contactWithSameEmail) {
            throw new DuplicateEmailError(email)
        }

        if (!this.isValidCity(city)) {
            throw new InvalidCityFormatError(city)
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