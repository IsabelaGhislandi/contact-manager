import z, { ZodError } from "zod"
import { Request, Response } from "express"
import { ContactNotFoundError } from "../../services/errors/contact-not-found-error"
import { makeGetContactUseCase } from "../../services/factories/make-get-contact-use-case"

export async function getContact(req: Request, res: Response) {
    try {
        const getContactQuerySchema = z.object({
            userId: z.string().uuid('Invalid user ID format')
        })

        const getContactParamsSchema = z.object({
            id: z.string().min(1, 'Contact ID is required')
        })

        const { id } = getContactParamsSchema.parse(req.params)
        const { userId } = getContactQuerySchema.parse(req.query)
      
        const getContactUseCase = makeGetContactUseCase()
        
        const { contact } = await getContactUseCase.execute({
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
            }
        })
        
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            })
        }
        
        if (error instanceof ContactNotFoundError) {
            return res.status(404).json({
                message: 'Contact not found'
            })
        }

        console.error('Unexpected error:', error)
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}
