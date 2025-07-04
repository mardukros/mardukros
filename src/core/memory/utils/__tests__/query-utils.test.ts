import { 
  matchesSearchTerm, 
  matchesTags, 
  applyFilters, 
  getNestedValue 
} from '../query-utils.js';
import { BaseMemoryItem } from '../../types/memory-items.js';

describe('Query Utilities', () => {
  describe('matchesSearchTerm', () => {
    it('should match case-insensitive substrings', () => {
      expect(matchesSearchTerm('Hello World', 'world')).toBe(true);
      expect(matchesSearchTerm('Hello World', 'HELLO')).toBe(true);
      expect(matchesSearchTerm('Hello World', 'xyz')).toBe(false);
    });
  });

  describe('matchesTags', () => {
    it('should match tags case-insensitively', () => {
      const tags = ['JavaScript', 'TypeScript', 'Node.js'];
      expect(matchesTags(tags, 'javascript')).toBe(true);
      expect(matchesTags(tags, 'TYPESCRIPT')).toBe(true);
      expect(matchesTags(tags, 'python')).toBe(false);
    });
  });

  describe('applyFilters', () => {
    const items: BaseMemoryItem[] = [
      {
        id: '1',
        type: 'test',
        metadata: {
          lastAccessed: 100,
          tags: ['tag1'],
          confidence: 0.8
        }
      },
      {
        id: '2',
        type: 'test',
        metadata: {
          lastAccessed: 200,
          tags: ['tag2'],
          confidence: 0.5
        }
      }
    ];
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    it('should filter by exact value', () => {
      const filtered = applyFilters(items, { type: 'test' });
      expect(filtered).toHaveLength(2);
    });

    it('should filter by range', () => {
      const filtered = applyFilters(items, { 
        'metadata.confidence': { min: 0.7 } 
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should handle multiple filters', () => {
      const filtered = applyFilters(items, {
        type: 'test',
        'metadata.confidence': { min: 0.7 }
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });
  });

  describe('getNestedValue', () => {
    const obj = {
      a: {
        b: {
          c: 'value'
        }
      }
    };

    it('should get nested object values', () => {
      expect(getNestedValue(obj, 'a.b.c')).toBe('value');
    });

    it('should return undefined for invalid paths', () => {
      expect(getNestedValue(obj, 'a.b.d')).toBeUndefined();
    });
  });
});