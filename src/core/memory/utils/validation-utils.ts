import { BaseMemoryItem } from '../types/memory-items.js';
import { ValidationResult } from '../types/memory-types.js';

export function validateMemoryItem(item: BaseMemoryItem): ValidationResult {
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
// Consider extracting this duplicated code into a shared function

export function validateQuery(query: unknown): ValidationResult {
  const errors: string[] = [];
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

  if (!query || typeof query !== 'object') {
    errors.push('Query must be an object');
    return { valid: false, errors };
  }

  const { type, term } = query as { type?: string; term?: string };

  if (!type) {
    errors.push('Query must have a type');
  }

  if (!term) {
    errors.push('Query must have a search term');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}