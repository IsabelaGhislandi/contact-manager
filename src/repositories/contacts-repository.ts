import { Prisma, Contact, Phone } from "@prisma/client"

export interface ContactWithPhones extends Contact {
    phones: Phone[]
}

export interface ContactFilters {
    name?: string
    address?: string
    email?: string
    phone?: string
    city?: string
}

export interface ContactsRepository {
    create(data: Prisma.ContactCreateInput): Promise<ContactWithPhones>
    update(id: string, data: Prisma.ContactUpdateInput): Promise<ContactWithPhones>
    delete(id: string, deletedAt?: Date): Promise<void>
    findById(id: string): Promise<ContactWithPhones | null>
    findByEmail(email: string): Promise<ContactWithPhones | null>
    findByUserId(userId: string): Promise<ContactWithPhones[]>
    findManyWithFilters(userId: string, filters: ContactFilters): Promise<ContactWithPhones[]>
}
