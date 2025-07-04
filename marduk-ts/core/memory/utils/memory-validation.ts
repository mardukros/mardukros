import { MemoryItem, MemoryQuery } from '../types/base-types.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class MemoryValidator {
  validateItem(item: MemoryItem): ValidationResult {
    const errors: string[] = [];

    if (!item.id) {
      errors.push('Item must have an id');
    }

    if (!item.type) {
      errors.push('Item must have a type');
    }

    if (item.content === undefined) {
      errors.push('Item must have content');
    }

    if (item.metadata) {
      if (typeof item.metadata !== 'object') {
        errors.push('Metadata must be an object');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateQuery(query: MemoryQuery): ValidationResult {
    const errors: string[] = [];

    if (!query.type) {
      errors.push('Query must have a type');
    }

    if (!query.term) {
      errors.push('Query must have a search term');
    }

    if (query.filters) {
      if (typeof query.filters !== 'object') {
        errors.push('Query filters must be an object');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}