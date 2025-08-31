import { GetContactUseCase } from "../../contacts/get-contact"
import { contactsRepository } from "./make-contacts-repository"


export function makeGetContactUseCase() {
    const getContactUseCase = new GetContactUseCase(contactsRepository)
    return getContactUseCase
}
