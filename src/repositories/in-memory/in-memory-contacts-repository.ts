import { Contact, Phone, Prisma } from "@prisma/client"
import { ContactsRepository, ContactWithPhones, ContactFilters } from "../contacts-repository"

export class InMemoryContactsRepository implements ContactsRepository {
    public items: ContactWithPhones[] = []
    private nextContactId = 1
    private nextPhoneId = 1

    async create(data: Prisma.ContactCreateInput): Promise<ContactWithPhones> {
      const contactId = this.nextContactId.toString()
      this.nextContactId++
        
        if (!data.user?.connect?.id) {
            throw new Error("User ID is required")
        }
        
        const contact: ContactWithPhones = {
            id: contactId,
            name: data.name,
            address: data.address || "",
            city: data.city || "",
            email: data.email,
            userId: data.user.connect.id, 
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            phones: []
        }

        if (data.phones?.create) {
          const phonesData = Array.isArray(data.phones.create) ? data.phones.create : [data.phones.create]
          contact.phones = []
          
          phonesData.forEach(phoneData => {
              contact.phones.push({
                  id: this.nextPhoneId.toString(),
                  number: phoneData.number,
                  contactId: contactId,
                  createdAt: new Date(),
                  updatedAt: new Date(),
              })
              this.nextPhoneId++ 
          })
        }
        this.items.push(contact)
        return contact
    }

    async findById(id: string): Promise<ContactWithPhones | null> {
        const contact = this.items.find(item => item.id === id && !item.deletedAt)

        if (!contact) {
            return null
        }

        return contact
    }

    async findByEmail(email: string): Promise<ContactWithPhones | null> {
        const contact = this.items.find(item => item.email === email && !item.deletedAt)

        if (!contact) {
            return null
        }

        return contact
    }

    async findByUserId(userId: string): Promise<ContactWithPhones[]> {
        return this.items.filter(item => item.userId === userId && !item.deletedAt)
    }

    async findManyWithFilters(userId: string, filters: ContactFilters): Promise<ContactWithPhones[]> {
        let contacts = this.items.filter(item => item.userId === userId && !item.deletedAt)

        if (filters.name) {
            contacts = contacts.filter(contact => 
                contact.name.toLowerCase().includes(filters.name!.toLowerCase())
            )
        }

        if (filters.address) {
            contacts = contacts.filter(contact => 
                contact.address.toLowerCase().includes(filters.address!.toLowerCase())
            )
        }

        if (filters.email) {
            contacts = contacts.filter(contact => 
                contact.email.toLowerCase().includes(filters.email!.toLowerCase())
            )
        }

        if (filters.city) {
            contacts = contacts.filter(contact => 
                contact.city.toLowerCase().includes(filters.city!.toLowerCase())
            )
        }

        if (filters.phone) {
            contacts = contacts.filter(contact => 
                contact.phones.some(phone => phone.number.includes(filters.phone!))
            )
        }

        return contacts
    }

    async update(id: string, data: Prisma.ContactUpdateInput): Promise<ContactWithPhones> {
        const contactIndex = this.items.findIndex(item => item.id === id && !item.deletedAt)
        
        if (contactIndex === -1) {
            throw new Error("Contact not found")
        }

        const contact = this.items[contactIndex]

        if (data.name) contact.name = data.name as string
        if (data.address) contact.address = data.address as string
        if (data.city) contact.city = data.city as string
        if (data.email) contact.email = data.email as string
        if (data.deletedAt !== undefined) contact.deletedAt = data.deletedAt as Date | null
        contact.updatedAt = new Date()

        // Update phones if provided
        if (data.phones) {
            // Se há deleteMany, limpar telefones existentes
            if (data.phones.deleteMany !== undefined) {
                contact.phones = []
            }
            
            // Se há create, adicionar novos telefones
            if (data.phones.create) {
                const phonesData = Array.isArray(data.phones.create) ? data.phones.create : [data.phones.create]
                const newPhones = phonesData.map(phoneData => ({
                    id: this.nextPhoneId.toString(),
                    number: phoneData.number,
                    contactId: id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }))
                
                contact.phones = [...contact.phones, ...newPhones]
                this.nextPhoneId += newPhones.length
            }
        }

        return contact
    }

    async delete(id: string): Promise<void> {
        const contactIndex = this.items.findIndex(item => item.id === id && !item.deletedAt)
        
        if (contactIndex === -1) {
            throw new Error("Contact not found")
        }

        // Soft delete - marcar como deletado
        this.items[contactIndex].deletedAt = new Date()
    }
}
