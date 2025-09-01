import { Request, Response } from "express"
import { z } from "zod"
import { makeAuthenticateUseCase } from "../../../services/factories/users/make-authenticate-use-case"
import { ErrorHandler } from "../../../utils/error-handler"

const authenticateBodySchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must have at least 6 characters")
})

export async function authenticate(req: Request, res: Response) {
  try {
    const { email, password } = authenticateBodySchema.parse(req.body)

    const authenticateUseCase = makeAuthenticateUseCase()
    const { user, token } = await authenticateUseCase.execute({ email, password })

    return res.status(200).json({
      message: "User authenticated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return ErrorHandler.handle(error, req, res)
  }
}