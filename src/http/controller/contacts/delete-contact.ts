import { Request, Response } from "express";
import { z } from "zod";
import { makeDeleteContactUseCase } from "../../../services/factories/contacts/make-delete-contact-use-case";
import { ErrorHandler } from "../../../utils/error-handler";

const deleteContactSchema = z.object({
  id: z.string().min(1, "Contact ID is required"),
})

export async function deleteContact(req: Request, res: Response) {
  try {
    const { id } = deleteContactSchema.parse(req.params)
    const userId = req.userId!

    const deleteContactUseCase = makeDeleteContactUseCase()
    const { deletedAt } = await deleteContactUseCase.execute({ 
      contactId: id, 
      userId 
    })

    return res.status(200).json({
      message: "Contact deleted successfully",
      contactId: id,
      deletedAt: deletedAt.toISOString()
    })

  } catch (error) {
    return ErrorHandler.handle(error, req, res)
  }
}