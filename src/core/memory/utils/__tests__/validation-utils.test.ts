import { validateMemoryItem, validateQuery } from '../validation-utils.js';
import { BaseMemoryItem } from '../../types/memory-items.js';

describe('Validation Utilities', () => {
  describe('validateMemoryItem', () => {
    it('should validate valid memory item', () => {
      const item: BaseMemoryItem = {
        id: '1',
        type: 'test',
        metadata: {
          lastAccessed: Date.now(),
          tags: ['tag1', 'tag2']
        }
      };
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

      const result = validateMemoryItem(item);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch missing required fields', () => {
      const item = {
        id: '1',
        type: 'test'
      } as BaseMemoryItem;

      const result = validateMemoryItem(item);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Item must have metadata');
    });

    it('should validate metadata structure', () => {
      const item: BaseMemoryItem = {
        id: '1',
        type: 'test',
        metadata: {
          lastAccessed: 'invalid' as any,
          tags: 'not-an-array' as any
        }
      };

      const result = validateMemoryItem(item);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Metadata must have tags array');
      expect(result.errors).toContain('Metadata must have lastAccessed timestamp');
    });
  });

  describe('validateQuery', () => {
    it('should validate valid query', () => {
      const query = {
        type: 'test',
        term: 'search term'
      };

      const result = validateQuery(query);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should catch missing required fields', () => {
      const query = {
        type: 'test'
      };

      const result = validateQuery(query);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Query must have a search term');
    });

    it('should handle invalid input', () => {
      const result = validateQuery('not-an-object');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Query must be an object');
    });
  });
});