import { ContactsRepository } from "../../repositories/contacts-repository"
import { ContactNotFoundError } from "../errors"

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
    }: DeleteContactUseCaseRequest): Promise<{ deletedAt: Date }> {
        
        const contact = await this.contactsRepository.findById(contactId)

        if (!contact || contact.userId !== userId) {
            throw new ContactNotFoundError()
        }

        const deletedAt = new Date()
        await this.contactsRepository.delete(contactId)
        
        return { deletedAt }
    }
}
