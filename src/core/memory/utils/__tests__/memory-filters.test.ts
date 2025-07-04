import { applyMemoryFilters, FilterOptions } from '../memory-filters.js';
import { BaseMemoryItem } from '../../types/memory-items.js';

describe('Memory Filter Utils', () => {
  const now = Date.now();
  
  const testItems: BaseMemoryItem[] = [
    {
      id: '1',
      type: 'test',
      content: 'Test 1',
      metadata: {
        lastAccessed: now,
        tags: ['tag1'],
        confidence: 0.8,
        importance: 0.7,
        complexity: 3,
        category: ['category1']
      }
    },
    {
      id: '2',
      type: 'test',
      content: 'Test 2',
      metadata: {
        lastAccessed: now - 1000,
        tags: ['tag2'],
        confidence: 0.5,
        importance: 0.4,
        complexity: 2,
        category: ['category2']
      }
    }
  ];

  it('should filter by confidence range', () => {
    const filters: FilterOptions = {
      confidence: { min: 0.7 }
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
    };
    const filtered = applyMemoryFilters(testItems, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should filter by importance range', () => {
    const filters: FilterOptions = {
      importance: { min: 0.5 }
    };
    const filtered = applyMemoryFilters(testItems, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should filter by complexity range', () => {
    const filters: FilterOptions = {
      complexity: { max: 2 }
    };
    const filtered = applyMemoryFilters(testItems, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('should filter by timestamp range', () => {
    const filters: FilterOptions = {
      timestamp: { start: now - 500 }
    };
    const filtered = applyMemoryFilters(testItems, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should filter by tags', () => {
    const filters: FilterOptions = {
      tags: ['tag1']
    };
    const filtered = applyMemoryFilters(testItems, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should filter by categories', () => {
    const filters: FilterOptions = {
      categories: ['category2']
    };
    const filtered = applyMemoryFilters(testItems, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('2');
  });

  it('should combine multiple filters', () => {
    const filters: FilterOptions = {
      confidence: { min: 0.7 },
      tags: ['tag1'],
      categories: ['category1']
    };
    const filtered = applyMemoryFilters(testItems, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('1');
  });
});