import { ContactsRepository, ContactWithPhones, ContactFilters } from "../../repositories/contacts-repository"

interface ListContactsUseCaseRequest {
    userId: string
    filters?: {
        name?: string
        address?: string
        email?: string
        phone?: string
        city?: string
    }
}

interface ListContactsUseCaseResponse {
    contacts: ContactWithPhones[]
}

export class ListContactsUseCase {
    constructor(
        private contactsRepository: ContactsRepository
    ) {}

    async execute({ 
        userId, 
        filters 
    }: ListContactsUseCaseRequest): Promise<ListContactsUseCaseResponse> {

        let contacts: ContactWithPhones[]

        if (filters && Object.keys(filters).length > 0) {
            contacts = await this.contactsRepository.findManyWithFilters(userId, filters)
        } else {
            contacts = await this.contactsRepository.findByUserId(userId)
        }

        return {
            contacts
        }
    }
}