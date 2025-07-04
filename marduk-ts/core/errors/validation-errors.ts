import { MardukError } from './base-error.js';

export class ValidationError extends MardukError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

export class SchemaValidationError extends ValidationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { ...details, type: 'schema_validation' });
  }
}

export class DataValidationError extends ValidationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, { ...details, type: 'data_validation' });
  }
}