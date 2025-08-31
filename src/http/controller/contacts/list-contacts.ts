import z, { ZodError } from "zod";
import { Request, Response } from "express";
import { makeListContactsUseCase } from "../../../services/factories/contacts/make-list-contacts-use-case";

export async function listContacts(req: Request, res: Response) {
  try {
    const listContactsQuerySchema = z.object({
      name: z.string().optional(),
      address: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      city: z.string().optional(),
    });

    const { name, address, email, phone, city } = listContactsQuerySchema.parse(req.query);

    const userId = req.userId!;

    const listContactsUseCase = makeListContactsUseCase();

    const filters = { name, address, email, phone, city };
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );

    const { contacts } = await listContactsUseCase.execute({
      userId,
      filters: Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined,
    });

    return res.status(200).json({
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
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    console.error('Unexpected error:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
}
