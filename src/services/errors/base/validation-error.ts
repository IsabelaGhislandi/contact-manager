import { AppError } from "./app-error";

export class ValidationError extends AppError {
    public readonly errors: Array<{
      field: string
      message: string
    }>
  
    constructor(message: string, errors: Array<{ field: string; message: string }> = []) {
      super(message, 400, 'VALIDATION_ERROR')
      this.errors = errors
    }
  }