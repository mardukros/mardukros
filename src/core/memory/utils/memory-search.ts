import { BaseMemoryItem } from '../types/memory-items.js';

export function searchByContent(item: BaseMemoryItem, term: string): boolean {
  const searchTerm = term.toLowerCase();
  
  // Search in content
  if (typeof item.content === 'string') {
    if (item.content.toLowerCase().includes(searchTerm)) {
      return true;
    }
  } else if (typeof item.content === 'object' && item.content !== null) {
    const contentStr = JSON.stringify(item.content).toLowerCase();
    if (contentStr.includes(searchTerm)) {
      return true;
    }
  }
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

  return false;
}
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

export function searchByMetadata(item: BaseMemoryItem, term: string): boolean {
  const searchTerm = term.toLowerCase();
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
  
  // Search in tags
  if (item.metadata.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) {
    return true;
  }

  // Search in categories if they exist
  if ('category' in item.metadata && Array.isArray(item.metadata.category)) {
    if (item.metadata.category.some(cat => cat.toLowerCase().includes(searchTerm))) {
      return true;
    }
  }

  return false;
}

export function searchByTimestamp(
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