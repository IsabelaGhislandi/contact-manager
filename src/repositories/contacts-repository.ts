import { Contact, Prisma } from "@prisma/client"

export interface ContactCreateData {
    userId: string
    name: string
    address: string
    email: string
    phones: string[]
}

export interface ContactFilters {
    userId: string
    name?: string
    address?: string
    email?: string
    phone?: string
}

export interface ContactsRepository {
    create(data: ContactCreateData): Promise<Contact>
    findByEmail(email: string): Promise<Contact | null>
    findById(id: string): Promise<Contact | null>
    findByIdAndUserId(id: string, userId: string): Promise<Contact | null>
    findMany(filters: ContactFilters): Promise<Contact[]>
    update(id: string, data: Partial<ContactCreateData>): Promise<Contact>
    softDelete(id: string): Promise<void>
    checkDuplicatePhone(contactId: string, phone: string): Promise<boolean>
}
