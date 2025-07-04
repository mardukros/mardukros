import { MardukError } from './base-error.js';

export class MemoryError extends MardukError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, `MEMORY_${code}`, details);
  }
}

export class MemoryValidationError extends MemoryError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

export class MemoryCapacityError extends MemoryError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CAPACITY_ERROR', details);
  }
}

export class MemoryOptimizationError extends MemoryError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'OPTIMIZATION_ERROR', details);
  }
}