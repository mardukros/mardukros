import { ValidationRule } from './types.js';

export const commonRules: ValidationRule[] = [
  {
    field: 'id',
    validator: (value) => typeof value === 'string' || typeof value === 'number',
    message: 'ID must be a string or number'
  },
  {
    field: 'type',
    validator: (value) => typeof value === 'string' && value.length > 0,
    message: 'Type must be a non-empty string'
  },
  {
    field: 'content',
    validator: (value) => value !== undefined && value !== null,
    message: 'Content is required'
  }
];

export const memoryRules: ValidationRule[] = [
  ...commonRules,
  {
    field: 'metadata',
    validator: (value) => typeof value === 'object' && value !== null,
    message: 'Metadata must be an object'
  }
];

export const aiRules: ValidationRule[] = [
  {
    field: 'prompt',
    validator: (value) => typeof value === 'string' && value.length > 0,
    message: 'Prompt must be a non-empty string'
  },
  {
    field: 'temperature',
    validator: (value) => typeof value === 'number' && value >= 0 && value <= 1,
    message: 'Temperature must be between 0 and 1'
  }
];