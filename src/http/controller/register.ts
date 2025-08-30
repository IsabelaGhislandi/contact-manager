import z from "zod"
import { Request, Response } from "express"
import { UserAlreadyExistsError } from "../../services/errors/user-already-exists-error"
import { makeRegisterUseCase } from "../../services/factories/make-register-use-case"

export async function register(req: Request, res: Response) {
    try {
        const registerBodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
            password: z.string().min(6, 'Password must have at least 6 characters')
        })

        const { name, email, password } = registerBodySchema.parse(req.body)
      
        const registerUseCase = makeRegisterUseCase()
        
        const user = await registerUseCase.execute({ name, email, password })
        
        return res.status(201).json({
            message: 'User created successfully',
            user
        })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: 'Validation error'
            })
        }
        if (error instanceof UserAlreadyExistsError) {
            return res.status(409).json({
                message: error.message
            })
        }
        throw error
    }
}