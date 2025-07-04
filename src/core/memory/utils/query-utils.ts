import { MemoryQuery } from '../types/memory-types.js';
import { BaseMemoryItem } from '../types/memory-items.js';

export function matchesSearchTerm(text: string, searchTerm: string): boolean {
  return text.toLowerCase().includes(searchTerm.toLowerCase());
}

export function matchesTags(tags: string[], searchTerm: string): boolean {
  return tags.some(tag => matchesSearchTerm(tag, searchTerm));
}

export function applyFilters<T extends BaseMemoryItem>(
  items: T[],
  filters: Record<string, unknown>
): T[] {
  return items.filter(item => {
    for (const [key, value] of Object.entries(filters)) {
      if (typeof value === 'object' && value !== null) {
        const range = value as { min?: number; max?: number };
        const itemValue = getNestedValue(item, key) as number;
        
        if (range.min !== undefined && itemValue < range.min) return false;
        if (range.max !== undefined && itemValue > range.max) return false;
      } else {
        const itemValue = getNestedValue(item, key);
        if (itemValue !== value) return false;
      }
    }
    return true;
  });
}

export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => 
    current && current[key], obj);
}