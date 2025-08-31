import { CreateContactUseCase } from "../contacts/create-contact"
import { contactsRepository } from "./make-contacts-repository" 

export function makeCreateContactUseCase() {
    const createContactUseCase = new CreateContactUseCase(contactsRepository)
    return createContactUseCase 
}