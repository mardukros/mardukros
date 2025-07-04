import { sortMemoryItems, SortOptions } from '../memory-sorting.js';
import { BaseMemoryItem } from '../../types/memory-items.js';

describe('Memory Sorting Utils', () => {
  const testItems: BaseMemoryItem[] = [
    {
      id: '1',
      type: 'test',
      content: 'Test 1',
      metadata: {
        lastAccessed: 100,
        tags: ['tag1'],
        confidence: 0.8,
        importance: 0.7,
        complexity: 3
      }
    },
    {
      id: '2',
      type: 'test',
      content: 'Test 2',
      metadata: {
        lastAccessed: 200,
        tags: ['tag2'],
        confidence: 0.5,
        importance: 0.4,
        complexity: 2
      }
    }
  ];

  it('should sort by lastAccessed ascending', () => {
    const options: SortOptions = {
      field: 'lastAccessed',
      order: 'asc'
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
    };
    const sorted = sortMemoryItems(testItems, options);
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
  });

  it('should sort by confidence descending', () => {
    const options: SortOptions = {
      field: 'confidence',
      order: 'desc'
    };
    const sorted = sortMemoryItems(testItems, options);
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
  });

  it('should sort by importance ascending', () => {
    const options: SortOptions = {
      field: 'importance',
      order: 'asc'
    };
    const sorted = sortMemoryItems(testItems, options);
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
  });

  it('should sort by complexity descending', () => {
    const options: SortOptions = {
      field: 'complexity',
      order: 'desc'
    };
    const sorted = sortMemoryItems(testItems, options);
    expect(sorted[0].id).toBe('1');
    expect(sorted[1].id).toBe('2');
  });

  it('should handle missing fields gracefully', () => {
    const itemsWithMissingFields = [
      { ...testItems[0] },
      { ...testItems[1], metadata: { ...testItems[1].metadata, complexity: undefined } }
    ];
    
    const options: SortOptions = {
      field: 'complexity',
      order: 'desc'
    };
    
    const sorted = sortMemoryItems(itemsWithMissingFields, options);
    expect(sorted).toHaveLength(2);
  });
});