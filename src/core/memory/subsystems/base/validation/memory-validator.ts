
import { BaseMemoryItem } from '../../../types/memory-items.js';
import { MemoryQuery } from '../../../types/base-types.js';
import { ValidationResult } from '../types.js';

export class MemoryValidator {
  validateItem(item: BaseMemoryItem): ValidationResult {
    const errors: string[] = [];

    if (!item.id) {
      errors.push('Item must have an id');
    }

    if (!item.type) {
      errors.push('Item must have a type');
    }

    if (!item.metadata) {
      errors.push('Item must have metadata');
    } else {
      if (!Array.isArray(item.metadata.tags)) {
        errors.push('Metadata must have tags array');
      }
      if (typeof item.metadata.lastAccessed !== 'number') {
        errors.push('Metadata must have lastAccessed timestamp');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

  validateQuery(query: MemoryQuery): ValidationResult {
    const errors: string[] = [];
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    if (!query.type) {
      errors.push('Query must have a type');
    }
// Consider extracting this duplicated code into a shared function

    // Check for search term using the correct property
    if (query.filters && !query.filters.searchTerm) {
      errors.push('Query must have a search term in filters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
