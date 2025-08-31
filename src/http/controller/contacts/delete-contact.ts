import { Request, Response } from "express";
import { z } from "zod";
import { makeDeleteContactUseCase } from "../../../services/factories/contacts/make-delete-contact-use-case";
import { ContactNotFoundError } from "../../../services/errors/contact-not-found-error";

export async function deleteContact(req: Request, res: Response) {
  try {
    const schema = z.object({
      id: z.string().min(1, "Contact ID is required"),
    });
    const { id } = schema.parse(req.params);

    const userId = req.userId!;

    const deleteContactUseCase = makeDeleteContactUseCase();

    await deleteContactUseCase.execute({ contactId: id, userId });

    return res.status(200).json({
      message: "Contact deleted successfully",
      contactId: id,
      deletedAt: new Date().toISOString(),
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.issues.map(issue => ({
          field: issue.path.join("."),
          message: issue.message
        })),
      });
    }

    if (error instanceof ContactNotFoundError) {
      return res.status(404).json({ message: "Contact not found" });
    }

    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}