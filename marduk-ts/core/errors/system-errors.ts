import { MardukError } from './base-error.js';

export class SystemError extends MardukError {
  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message, `SYSTEM_${code}`, details);
  }
}

export class ConfigurationError extends SystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', details);
  }
}

export class InitializationError extends SystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INIT_ERROR', details);
  }
}

export class ResourceError extends SystemError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'RESOURCE_ERROR', details);
  }
}