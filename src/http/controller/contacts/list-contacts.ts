import { z } from "zod";
import { Request, Response } from "express";
import { makeListContactsUseCase } from "../../../services/factories/contacts/make-list-contacts-use-case";
import { ErrorHandler } from "../../../utils/error-handler"

const listContactsQuerySchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
})

export async function listContacts(req: Request, res: Response) {  
    try {
      const filters = listContactsQuerySchema.parse(req.query)
      const userId = req.userId!
  
      const listContactsUseCase = makeListContactsUseCase()
  
      // Remove undefined filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      )
  
      const { contacts } = await listContactsUseCase.execute({
        userId,
        filters: Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined,
      })
  
      return res.status(200).json({
        message: "Contacts retrieved successfully",
        contacts: contacts.map(contact => ({
          id: contact.id,
          name: contact.name,
          address: contact.address,
          email: contact.email,
          city: contact.city,
          phones: contact.phones.map(phone => ({
            id: phone.id,
            number: phone.number,
          })),
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt,
        })),
        count: contacts.length,
        timestamp: new Date().toISOString()
      })
  
    } catch (error) {
      return ErrorHandler.handle(error, req, res)
    }
  }  