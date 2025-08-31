import z from "zod"
import { Request, Response } from "express"
import { makeUpdateContactUseCase } from "../../../services/factories/contacts/make-update-contact-use-case"
import { ContactNotFoundError } from "../../../services/errors/contact-not-found-error"
import { InvalidEmailFormatError } from "../../../services/errors/invalid-email-format-error"
import { InvalidPhoneFormatError } from "../../../services/errors/invalid-phone-error"
import { InvalidCityFormatError } from "../../../services/errors/invalid-city-format-error"
import { DuplicatePhoneError } from "../../../services/errors/duplicate-phone-error"
import { PhoneRequiredError } from "../../../services/errors/phone-required-error"

const updateContactParamsSchema = z.object({
    id: z.string().min(1, "Contact ID is required"),
  });
  
  const updateContactBodySchema = z.object({
    name: z.string().min(1).optional(),
    address: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phones: z.array(z.string()).min(1).optional(),
    city: z.string().min(1).optional(),
  });
  
  function mapErrorToResponse(error: unknown, res: Response) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
  
    if (error instanceof ContactNotFoundError) return res.status(404).json({ message: "Contact not found" });
    if (error instanceof InvalidEmailFormatError) return res.status(400).json({ message: "Invalid email format" });
    if (error instanceof InvalidPhoneFormatError) return res.status(400).json({ message: "Invalid phone format" });
    if (error instanceof InvalidCityFormatError) return res.status(400).json({ message: "Invalid city format" });
    if (error instanceof DuplicatePhoneError) return res.status(400).json({ message: "Duplicate phone numbers are not allowed" });
    if (error instanceof PhoneRequiredError) return res.status(400).json({ message: "At least one phone number is required" });
    if (error instanceof Error) return res.status(400).json({ message: error.message });
  
    console.error("Unexpected error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
  
  export async function updateContact(req: Request, res: Response) {
    try {
      const { id } = updateContactParamsSchema.parse(req.params);
      const data = updateContactBodySchema.parse(req.body);
  
      const updateContactUseCase = makeUpdateContactUseCase();
  
      const { contact } = await updateContactUseCase.execute({
        contactId: id,
        userId: req.userId!,
        ...data,
      });
  
      return res.status(200).json({
        message: "Contact updated successfully",
        contact: {
          id: contact.id,
          name: contact.name,
          address: contact.address,
          email: contact.email,
          city: contact.city,
          phones: contact.phones.map((phone: any) => ({
            id: phone.id,
            number: phone.number,
          })),
        },
      });
    } catch (error) {
      return mapErrorToResponse(error, res);
    }
  }