import { Request, Response } from "express"
import { z } from "zod"
import { makeRegisterUseCase } from "../../../services/factories/contacts/make-register-use-case"
import { ErrorHandler } from "../../../utils/error-handler"

const registerBodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must have at least 6 characters")
})

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = registerBodySchema.parse(req.body)

    const registerUseCase = makeRegisterUseCase()
    const user = await registerUseCase.execute({ name, email, password })

    return res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return ErrorHandler.handle(error, req, res)
  }
}