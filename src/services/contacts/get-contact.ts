import { ContactsRepository, ContactWithPhones } from "../../repositories/contacts-repository"
import { ContactNotFoundError } from "../errors/contact-not-found-error"

interface GetContactUseCaseRequest {
    contactId: string
    // Only Contacts by this user
    userId: string
}

interface GetContactUseCaseResponse {
    contact: ContactWithPhones
}

export class GetContactUseCase {
    constructor(
        private contactsRepository: ContactsRepository
    ) {}

    async execute({ 
        contactId, 
        userId 
    }: GetContactUseCaseRequest): Promise<GetContactUseCaseResponse> {

        const contact = await this.contactsRepository.findById(contactId)

        if (!contact) {
            throw new ContactNotFoundError()
        }

        // Only Contacts by this user
        if (contact.userId !== userId) {
            throw new ContactNotFoundError() // Do not reveal that it exists, only that it was not found
        }

        return {
            contact
        }
    }
}
