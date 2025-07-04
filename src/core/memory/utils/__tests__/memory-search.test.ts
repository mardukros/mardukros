import { searchByContent, searchByMetadata, searchByTimestamp } from '../memory-search.js';
import { BaseMemoryItem } from '../../types/memory-items.js';

describe('Memory Search Utils', () => {
  const now = Date.now();
  
  const testItem: BaseMemoryItem = {
    id: '1',
    type: 'test',
    content: 'Test content with searchable text',
    metadata: {
      lastAccessed: now,
      tags: ['tag1', 'tag2'],
      category: ['category1']
    }
  };

  describe('searchByContent', () => {
    it('should find matches in string content', () => {
      expect(searchByContent(testItem, 'searchable')).toBe(true);
      expect(searchByContent(testItem, 'CONTENT')).toBe(true);
      expect(searchByContent(testItem, 'nonexistent')).toBe(false);
    });

    it('should handle object content', () => {
      const itemWithObjectContent: BaseMemoryItem = {
        ...testItem,
        content: { description: 'Test content' }
      };
      expect(searchByContent(itemWithObjectContent, 'content')).toBe(true);
    });
  });

  describe('searchByMetadata', () => {
    it('should find matches in tags', () => {
      expect(searchByMetadata(testItem, 'tag1')).toBe(true);
      expect(searchByMetadata(testItem, 'TAG2')).toBe(true);
      expect(searchByMetadata(testItem, 'tag3')).toBe(false);
    });

    it('should find matches in categories', () => {
      expect(searchByMetadata(testItem, 'category1')).toBe(true);
      expect(searchByMetadata(testItem, 'category2')).toBe(false);
    });
  });

  describe('searchByTimestamp', () => {
    it('should filter by timestamp range', () => {
      expect(searchByTimestamp(testItem, now - 1000, now + 1000)).toBe(true);
      expect(searchByTimestamp(testItem, now + 1000)).toBe(false);
      expect(searchByTimestamp(testItem, undefined, now - 1000)).toBe(false);
    });
  });
});