import { UpdateContactUseCase } from "../../contacts/update-contact"
import { contactsRepository } from "./make-contacts-repository"

export function makeUpdateContactUseCase() {
    const updateContactUseCase = new UpdateContactUseCase(contactsRepository)
    
    return updateContactUseCase
}
