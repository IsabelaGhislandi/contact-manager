import z from "zod"
import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { InvalidCredentialErrors } from "../../../services/errors/invalid-credential-errors"
import { makeAuthenticateUseCase } from "../../../services/factories/users/make-authenticate-use-case"
import { env } from "../../../env"

export async function authenticate(req: Request, res: Response) {
    try {
        const autheticateBodySchema = z.object({
            email: z.string().email(),
            password: z.string().min(6, 'Password must have at least 6 characters')
        })

        const { email, password } = autheticateBodySchema.parse(req.body)
      
        const authenticateUseCase = makeAuthenticateUseCase()
        
        const { user } = await authenticateUseCase.execute({ email, password })
        

        const token = jwt.sign({ 
            sub: user.id 
        }, 
            env.JWT_SECRET,
            { expiresIn: '7d' }
        )
        
        return res.status(200).json({
            message: 'User authenticated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation error',
                errors: error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }))
            })
        }
        if (error instanceof InvalidCredentialErrors) {
            return res.status(401).json({
                message: 'Email or password incorrect'
            })
        }
        
        console.error('Authentication error:', error)
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}