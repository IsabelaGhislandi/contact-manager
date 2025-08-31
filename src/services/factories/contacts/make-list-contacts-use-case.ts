import { ListContactsUseCase } from "../../contacts/list-contacts"
import { contactsRepository } from "./make-contacts-repository"

export function makeListContactsUseCase() {
    const listContactsUseCase = new ListContactsUseCase(contactsRepository)
    return listContactsUseCase
}


