import z from "zod"
import { Request, Response } from "express"
import { InvalidEmailFormatError } from "../../services/errors/invalid-email-format-error"
import { InvalidPhoneFormatError } from "../../services/errors/invalid-phone-error"
import { makeCreateContactUseCase } from "../../services/factories/make-create-use-case"

export async function createContact(req: Request, res: Response) {
    try {
        const createContactBodySchema = z.object({
            userId: z.string().uuid('Invalid user ID format'),
            name: z.string().min(1, 'Name is required'),
            address: z.string().min(1, 'Address is required'),
            email: z.string().email('Invalid email format'),
            phones: z.array(z.string()).min(1, 'At least one phone number is required'),
            city: z.string().min(1, 'City is required')
        })

        const { userId, name, address, email, phones, city } = createContactBodySchema.parse(req.body)
      
        const createContactUseCase = makeCreateContactUseCase()
        
        const { contact } = await createContactUseCase.execute({
            userId,
            name,
            address,
            email,
            phones,
            city
        })
        
        return res.status(201).json({
            message: 'Contact created successfully',
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
        if (error instanceof z.ZodError) {
            console.log('Validation errors:', error.issues)
            return res.status(400).json({
                message: 'Validation error?',
                errors: error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }))
            })
        }
        
        if (error instanceof InvalidEmailFormatError) {
            return res.status(400).json({
                message: 'Invalid email format'
            })
        }
        
        if (error instanceof InvalidPhoneFormatError) {
            return res.status(400).json({
                message: 'Invalid phone format'
            })
        }

        if (error instanceof Error) {
            // TO DO: Improve ERRORS!!
            if (error.message === 'Email already exists') {
                return res.status(409).json({
                    message: 'Email already exists'
                })
            }
            
            if (error.message === 'City must contain only letters, spaces and accents') {
                return res.status(400).json({
                    message: 'City must contain only letters, spaces and accents'
                })
            }
            
            if (error.message === 'Contact must have at least one phone number') {
                return res.status(400).json({
                    message: 'Contact must have at least one phone number'
                })
            }
            
            if (error.message === 'Duplicate phone numbers are not allowed') {
                return res.status(400).json({
                    message: 'Duplicate phone numbers are not allowed'
                })
            }
        }

        console.error('Unexpected error:', error)
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}