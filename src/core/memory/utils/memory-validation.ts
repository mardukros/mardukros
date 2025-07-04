import { MemoryQuery } from '../types/base-types.js';

/**
 * Memory Validator
 * Validates memory items and queries
 */
export class MemoryValidator {
  /**
   * Validate a memory query
   */
  validateQuery(query: MemoryQuery): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    // Generic validation without assuming specific fields
    if (Object.keys(query).length === 0) {
      errors.push("Query cannot be empty");
    }

    return { 
      isValid: errors.length === 0, 
      errors 
    };
  }

  /**
   * Validate a memory item
   */
  validateItem(item: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.id) {
      errors.push('Memory item must have an id');
    }

    if (!item.type) {
      errors.push('Memory item must have a type');
    }

    return { 
      isValid: errors.length === 0, 
      errors 
    };
  }
}