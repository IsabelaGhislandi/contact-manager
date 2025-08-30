// src/services/create-contact.ts
import { Contact } from "@prisma/client"
import { ContactsRepository } from "../repositories/contacts-repository"
import { ContactEmailError } from "./errors/contact-email"
import { DuplicatedPhoneError } from "./errors/duplicated-phone-error"

interface CreateContactUseCaseRequest {
    userId: string
    name: string
    address: string
    email: string
    phones: string[]
}

interface CreateContactUseCaseResponse {
    contact: Contact
}

export class CreateContactUseCase {
    constructor(
        private contactsRepository: ContactsRepository
    ) {}

    async execute({ userId, name, address, email, phones
    }: CreateContactUseCaseRequest): Promise<CreateContactUseCaseResponse> {
        
       
        const contactWithSameEmail = await this.contactsRepository.findByEmail(email)
        if (contactWithSameEmail) {
            throw new ContactEmailError()
        }
       
        const uniquePhones = [...new Set(phones)]
        if (uniquePhones.length !== phones.length) {
            throw new DuplicatedPhoneError()
        }

        const contact = await this.contactsRepository.create({
            userId,
            name,
            address,
            email,
            phones: uniquePhones
        })

        return { contact }
    }
}
