import { Request, Response } from "express";
import { ErrorHandler } from "../../../utils/error-handler";
import { makeGetContactUseCase } from "../../../services/factories/contacts/make-get-contact-use-case";
import { z } from "zod";

const getContactParamsSchema = z.object({
  id: z.string().min(1, "Contact ID is required"),
})

export async function getContact(req: Request, res: Response) {
  try {
    const { id } = getContactParamsSchema.parse(req.params)
    const userId = req.userId!

    const getContactUseCase = makeGetContactUseCase()
    const { contact, weatherSuggestion } = await getContactUseCase.execute({
      contactId: id,
      userId
    })

    return res.status(200).json({
      contact: {
        id: contact.id,
        name: contact.name,
        address: contact.address,
        email: contact.email,
        city: contact.city,
        phones: contact.phones.map(phone => ({
          id: phone.id,
          number: phone.number
        })),
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      },
      weather: weatherSuggestion.weather ? {
        temperature: weatherSuggestion.weather.temperature,
        condition: weatherSuggestion.weather.condition,
        description: weatherSuggestion.weather.description,
        city: weatherSuggestion.weather.city
      } : null,
      suggestion: weatherSuggestion.message,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return ErrorHandler.handle(error, req, res)
  }
}