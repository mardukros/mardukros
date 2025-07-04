import { BaseMemoryItem } from '../types/memory-items.js';

export type SortField = 'lastAccessed' | 'confidence' | 'importance' | 'complexity';
export type SortOrder = 'asc' | 'desc';

export interface SortOptions {
  field: SortField;
  order: SortOrder;
}

export function sortMemoryItems<T extends BaseMemoryItem>(
  items: T[],
  options: SortOptions
): T[] {
  return [...items].sort((a, b) => {
    const valueA = getFieldValue(a, options.field);
    const valueB = getFieldValue(b, options.field);
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
    
    if (valueA === undefined || valueB === undefined) {
      return 0;
    }
// Consider extracting this duplicated code into a shared function
    
    const comparison = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    return options.order === 'asc' ? comparison : -comparison;
  });
}

function getFieldValue(item: BaseMemoryItem, field: SortField): number | undefined {
  switch (field) {
    case 'lastAccessed':
      return item.metadata.lastAccessed;
    case 'confidence':
      return (item.metadata as any).confidence;
    case 'importance':
      return (item.metadata as any).importance;
    case 'complexity':
      return (item.metadata as any).complexity;
    default:
      return undefined;
  }
}