import { DeleteContactUseCase } from "../../contacts/delete-contact"
import { contactsRepository } from "./make-contacts-repository"

export function makeDeleteContactUseCase() {
    const deleteContactUseCase = new DeleteContactUseCase(contactsRepository)
    
    return deleteContactUseCase
}
