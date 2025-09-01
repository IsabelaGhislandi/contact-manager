import { Request, Response } from "express";
import { z } from "zod";
import { makeCreateContactUseCase } from "../../../services/factories/contacts/make-create-use-case";
import { ErrorHandler } from "../../../utils/error-handler"

const createContactBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  email: z.string().email("Invalid email format"),
  phones: z.array(z.string()).min(1, "At least one phone number is required"),
  city: z.string().min(1, "City is required"),
});

export async function createContact(req: Request, res: Response) {
  try {
      const validatedData = createContactBodySchema.parse(req.body)
      const userId = req.userId!;
      const createContactUseCase = makeCreateContactUseCase();
      const { contact } = await createContactUseCase.execute({
        userId,
        ...validatedData
      });

  return res.status(201).json({
    message: "Contact created successfully",
    contact: {
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
      },
    });
  } catch (error) {
    return ErrorHandler.handle(error, req, res)
  }
} 