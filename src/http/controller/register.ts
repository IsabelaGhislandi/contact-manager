import z from "zod"

import { Request, Response } from "express"
import { RegisterUseCase } from "../../services/register"
import { PrismaUserRepository } from "../../repositories/prisma/prisma-user-repository"
import { UserAlreadyExistsError } from "../../services/errors/user-already-exists-error"

export async function register(req: Request, res: Response) {
    try {
        const registerBodySchema = z.object({
            name: z.string(),
            email: z.string().email(),
            password: z.string().min(6, 'Password must have at least 6 characters')
        })

        const { name, email, password } = registerBodySchema.parse(req.body)
      
        const prismaUserRepository = new PrismaUserRepository()
        const registerUseCase = new RegisterUseCase(prismaUserRepository)
        
        const user = await registerUseCase.execute({ name, email, password })
        
        return res.status(201).json({
            message: 'User created successfully',
            user
        })
    } catch (error) {
        if (error instanceof UserAlreadyExistsError) {
            return res.status(409).json({
                message: error.message
            })
        }
        throw error
    }
}