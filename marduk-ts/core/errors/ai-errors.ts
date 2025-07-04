import { MardukError } from './base-error.js';

export class AiError extends MardukError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, `AI_${code}`, details);
  }
}

export class AiApiError extends AiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'API_ERROR', details);
  }
}

export class AiValidationError extends AiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

export class AiContextError extends AiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONTEXT_ERROR', details);
  }
}