import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { InvalidEmailFormatError } from "../../services/errors/invalid-email-format-error";
import { InvalidPhoneFormatError } from "../../services/errors/invalid-phone-error";

export function errorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.issues.map(issue => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (error instanceof InvalidEmailFormatError) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (error instanceof InvalidPhoneFormatError) {
    return res.status(400).json({ message: "Invalid phone format" });
  }

  if (error instanceof Error) {
    switch (error.message) {
      case "User with same email already exists":
        return res.status(409).json({ message: error.message });
      case "City must contain only letters, spaces and accents":
      case "Contact must have at least one phone number":
      case "Duplicate phone numbers are not allowed":
        return res.status(400).json({ message: error.message });
    }
  }

  console.error("Unexpected error:", error);
  return res.status(500).json({ message: "Internal server error" });
}