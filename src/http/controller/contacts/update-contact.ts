import { Request, Response } from "express"
import { z } from "zod"
import { makeUpdateContactUseCase } from "../../../services/factories/contacts/make-update-contact-use-case"
import { ErrorHandler } from "../../../utils/error-handler"

const updateContactParamsSchema = z.object({
  id: z.string().min(1, "Contact ID is required"),
})

const updateContactBodySchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phones: z.array(z.string()).min(1).optional(),
  city: z.string().min(1).optional(),
})

export async function updateContact(req: Request, res: Response) {
  try {
    const { id } = updateContactParamsSchema.parse(req.params)
    const validatedData = updateContactBodySchema.parse(req.body)
    const userId = req.userId!

    const updateContactUseCase = makeUpdateContactUseCase()
    const { contact } = await updateContactUseCase.execute({
      contactId: id,
      userId,
      ...validatedData
    })

    return res.status(200).json({
      message: "Contact updated successfully",
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
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return ErrorHandler.handle(error, req, res)
  }
}