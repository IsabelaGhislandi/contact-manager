import { prisma } from "../../lib/prisma"
import { Prisma, Phone } from "@prisma/client"
import { ContactsRepository, ContactWithPhones, ContactFilters } from "../contacts-repository"

export class PrismaContactsRepository implements ContactsRepository {
    async create(data: Prisma.ContactCreateInput): Promise<ContactWithPhones> {
        const contact = await prisma.contact.create({
            data,
            include: {
                phones: true
            }
        })
        return contact
    }

    async update(id: string, data: Prisma.ContactUpdateInput): Promise<ContactWithPhones> {
        const contact = await prisma.contact.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date()
            },
            include: {
                phones: true
            }
        })
        return contact
    }

    async delete(id: string): Promise<void> {
        await prisma.contact.update({
            where: { id },
            data: {
                deletedAt: new Date()
            }
        })
    }

    async findById(id: string): Promise<ContactWithPhones | null> {
        const contact = await prisma.contact.findFirst({
            where: {
                id,
                deletedAt: null
            },
            include: {
                phones: true
            }
        })
        return contact
    }

    async findByEmail(email: string): Promise<ContactWithPhones | null> {
        const contact = await prisma.contact.findFirst({
            where: {
                email,
                deletedAt: null
            },
            include: {
                phones: true
            }
        })
        return contact
    }

    async findByUserId(userId: string): Promise<ContactWithPhones[]> {
        const contacts = await prisma.contact.findMany({
            where: {
                userId,
                deletedAt: null
            },
            include: {
                phones: true
            },
            orderBy: {
                name: 'asc'
            }
        })
        return contacts
    }

    async findManyWithFilters(userId: string, filters: ContactFilters): Promise<ContactWithPhones[]> {
        const whereClause: any = {
            userId,
            deletedAt: null
        }

        if (filters.name) {
            whereClause.name = {
                contains: filters.name,
                mode: 'insensitive'
            }
        }

        if (filters.address) {
            whereClause.address = {
                contains: filters.address,
                mode: 'insensitive'
            }
        }

        if (filters.email) {
            whereClause.email = {
                contains: filters.email,
                mode: 'insensitive'
            }
        }

        if (filters.city) {
            whereClause.city = {
                contains: filters.city,
                mode: 'insensitive'
            }
        }

        if (filters.phone) {
            whereClause.phones = {
                some: {
                    number: {
                        contains: filters.phone
                    }
                }
            }
        }

        const contacts = await prisma.contact.findMany({
            where: whereClause,
            include: {
                phones: true
            },
            orderBy: {
                name: 'asc'
            }
        })
        return contacts
    }

    async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
        const whereClause: any = {
            email,
            deletedAt: null
        }

        if (excludeId) {
            whereClause.NOT = { id: excludeId }
        }

        const contact = await prisma.contact.findFirst({
            where: whereClause
        })
        return !!contact
    }

    async findByPhoneNumber(phoneNumber: string): Promise<ContactWithPhones | null> {
        const contact = await prisma.contact.findFirst({
            where: {
                phones: {
                    some: {
                        number: phoneNumber
                    }
                },
                deletedAt: null
            },
            include: {
                phones: true
            }
        })
        return contact
    }

    async addPhone(contactId: string, phoneNumber: string): Promise<Phone> {
        // Verificar se o contato existe e não está deletado
        const contact = await prisma.contact.findFirst({
            where: {
                id: contactId,
                deletedAt: null
            }
        })

        if (!contact) {
            throw new Error("Contact not found")
        }

        // Verificar se o telefone já existe para este contato
        const existingPhone = await prisma.phone.findFirst({
            where: {
                contactId,
                number: phoneNumber
            }
        })

        if (existingPhone) {
            throw new Error("Phone number already exists for this contact")
        }

        const phone = await prisma.phone.create({
            data: {
                number: phoneNumber,
                contactId
            }
        })
        return phone
    }

    async removePhone(contactId: string, phoneNumber: string): Promise<void> {
        const phone = await prisma.phone.findFirst({
            where: {
                contactId,
                number: phoneNumber
            }
        })

        if (!phone) {
            throw new Error("Phone not found")
        }

        await prisma.phone.delete({
            where: {
                id: phone.id
            }
        })
    }

    async getContactPhones(contactId: string): Promise<Phone[]> {
        const phones = await prisma.phone.findMany({
            where: {
                contactId
            },
            orderBy: {
                createdAt: 'asc'
            }
        })
        return phones
    }

    async phoneExistsForContact(contactId: string, phoneNumber: string): Promise<boolean> {
        const phone = await prisma.phone.findFirst({
            where: {
                contactId,
                number: phoneNumber
            }
        })
        return !!phone
    }
}