
/**
 * Validates memory items and queries
 */
export class MemoryValidator {
  /**
   * Validates a memory item
   */
  static validateItem(item) {
    if (!item) {
      throw new Error('Memory item cannot be null or undefined');
    }
    
    if (!item.id) {
      throw new Error('Memory item must have an id');
    }
    
    if (!item.type) {
      throw new Error('Memory item must have a type');
    }
    
    if (item.content === undefined || item.content === null) {
      throw new Error('Memory item must have content');
    }
    
    // Add more validation as needed
    return true;
  }
  
  /**
   * Validates a memory query
   */
  static validateQuery(query) {
    if (!query) {
      return true; // Empty query is valid - return all items
    }
    
    // Add specific query validation as needed
    return true;
  }
  
  /**
   * Validates memory types
   */
  static validateType(type, allowedTypes) {
    if (!type) {
      throw new Error('Type cannot be null or undefined');
    }
    
    if (allowedTypes && !allowedTypes.includes(type)) {
      throw new Error(`Invalid type: ${type}. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    return true;
  }
}
