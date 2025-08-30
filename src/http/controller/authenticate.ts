import z from "zod"
import { Request, Response } from "express"
import { InvalidCredentialErrors } from "../../services/errors/invalid-credential-errors"
import { makeAuthenticateUseCase } from "../../services/factories/make-authenticate-use-case"

export async function authenticate(req: Request, res: Response) {
    try {
        const autheticateBodySchema = z.object({
            email: z.string().email(),
            password: z.string().min(6, 'Password must have at least 6 characters')
        })

        const { email, password } = autheticateBodySchema.parse(req.body)
      
        const authenticateUseCase = makeAuthenticateUseCase()
        
        const user = await authenticateUseCase.execute({ email, password })
        
        return res.status(200).json({
            message: 'User authenticated successfully',
            user
        })
    } catch (error) {
        if (error instanceof InvalidCredentialErrors) {
            return res.status(400).json({
                message: error.message
            })
        }
        throw error
    }
}