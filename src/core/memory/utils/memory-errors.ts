
/**
 * Base error class for Marduk cognitive system
 * Implements standardized error handling pattern
 */
export class MardukError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;
  
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Memory subsystem specific errors
 */
export class MemoryError extends MardukError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, `MEMORY_${code}`, details);
  }
}

/**
 * System level errors not specific to any subsystem
 */
export class SystemError extends MardukError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, `SYSTEM_${code}`, details);
  }
}

/**
 * Validation errors for input/model validation
 */
export class ValidationError extends MardukError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

/**
 * AI subsystem specific errors
 */
export class AIError extends MardukError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, `AI_${code}`, details);
  }
}

/**
 * Task subsystem specific errors
 */
export class TaskError extends MardukError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, `TASK_${code}`, details);
  }
}
