import { ContactsRepository } from "../../repositories/contacts-repository"
import { ContactNotFoundError } from "../errors/contact-not-found-error"

interface DeleteContactUseCaseRequest {
    contactId: string
    userId: string
}

export class DeleteContactUseCase {
    constructor(
        private contactsRepository: ContactsRepository
    ) {}

    async execute({ 
        contactId, 
        userId 
    }: DeleteContactUseCaseRequest): Promise<void> {
        
        const contact = await this.contactsRepository.findById(contactId)

        if (!contact || contact.userId !== userId) {
            throw new ContactNotFoundError()
        }

        // Soft delete
        await this.contactsRepository.delete(contactId)
    }
}
