// src/repositories/in-memory/in-memory-contacts-repository.ts
import { Contact } from "@prisma/client";
import { ContactsRepository, ContactCreateData, ContactFilters } from "../contacts-repository";

export class InMemoryContactsRepository implements ContactsRepository {
    public items: Contact[] = []
    private currentId = 1

    async create(data: ContactCreateData): Promise<Contact> {
        const contact: Contact = {
            id: `contact-${this.currentId++}`,
            name: data.name,
            address: data.address,
            email: data.email,
            userId: data.userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
        }
        
        this.items.push(contact)
        return contact
    }

    async findByEmail(email: string): Promise<Contact | null> {
        return this.items.find(c => c.email === email && !c.deletedAt) || null
    }

    async findById(id: string): Promise<Contact | null> {
        return this.items.find(c => c.id === id) || null
    }

    async findByIdAndUserId(id: string, userId: string): Promise<Contact | null> {
        return this.items.find(c => c.id === id && c.userId === userId && !c.deletedAt) || null
    }

    async findMany(filters: ContactFilters): Promise<Contact[]> {
        return this.items.filter(c => {
            if (c.deletedAt || c.userId !== filters.userId) return false
            if (filters.name && !c.name.toLowerCase().includes(filters.name.toLowerCase())) return false
            if (filters.address && !c.address.toLowerCase().includes(filters.address.toLowerCase())) return false
            if (filters.email && !c.email.toLowerCase().includes(filters.email.toLowerCase())) return false
            return true
        })
    }

    async update(id: string, data: Partial<ContactCreateData>): Promise<Contact> {
        const contact = this.items.find(c => c.id === id)
        if (!contact) throw new Error('Contact not found')
        
        Object.assign(contact, data, { updatedAt: new Date() })
        return contact
    }

    async softDelete(id: string): Promise<void> {
        const contact = this.items.find(c => c.id === id)
        if (contact) contact.deletedAt = new Date()
    }

    async checkDuplicatePhone(contactId: string, phone: string): Promise<boolean> {
        return false
    }
}