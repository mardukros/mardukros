import { BaseMemoryItem } from '../types/memory-items.js';

export interface FilterOptions {
  confidence?: { min?: number; max?: number };
  importance?: { min?: number; max?: number };
  complexity?: { min?: number; max?: number };
  timestamp?: { start?: number; end?: number };
  tags?: string[];
  categories?: string[];
}

export function applyMemoryFilters<T extends BaseMemoryItem>(
  items: T[],
  filters: FilterOptions
): T[] {
  return items.filter(item => {
    // Check confidence
    if (filters.confidence) {
      const confidence = (item.metadata as any).confidence;
      if (confidence !== undefined) {
        if (filters.confidence.min !== undefined && confidence < filters.confidence.min) {
          return false;
        }
        if (filters.confidence.max !== undefined && confidence > filters.confidence.max) {
          return false;
        }
      }
    }

    // Check importance
    if (filters.importance) {
      const importance = (item.metadata as any).importance;
      if (importance !== undefined) {
        if (filters.importance.min !== undefined && importance < filters.importance.min) {
          return false;
        }
        if (filters.importance.max !== undefined && importance > filters.importance.max) {
          return false;
        }
      }
    }

    // Check complexity
    if (filters.complexity) {
      const complexity = (item.metadata as any).complexity;
      if (complexity !== undefined) {
        if (filters.complexity.min !== undefined && complexity < filters.complexity.min) {
          return false;
        }
        if (filters.complexity.max !== undefined && complexity > filters.complexity.max) {
          return false;
        }
      }
    }

    // Check timestamp range
    if (filters.timestamp) {
      if (!searchByTimestamp(item, filters.timestamp.start, filters.timestamp.end)) {
        return false;
      }
    }

    // Check tags
    if (filters.tags?.length) {
      if (!item.metadata.tags.some(tag => filters.tags!.includes(tag))) {
        return false;
      }
    }

    // Check categories
    if (filters.categories?.length) {
      const itemCategories = (item.metadata as any).category;
      if (Array.isArray(itemCategories)) {
        if (!itemCategories.some(cat => filters.categories!.includes(cat))) {
          return false;
        }
      }
    }

    return true;
  });
}

function searchByTimestamp(
  item: BaseMemoryItem,
  startTime?: number,
  endTime?: number
): boolean {
  const timestamp = item.metadata.lastAccessed;
  
  if (startTime && timestamp < startTime) {
    return false;
  }
  
  if (endTime && timestamp > endTime) {
    return false;
  }
  
  return true;
}