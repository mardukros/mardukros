import { MemoryCache, CacheConfig } from '../memory-cache.js';
import { BaseMemoryItem } from '../../types/memory-items.js';

describe('Memory Cache', () => {
  const createTestItem = (id: string): BaseMemoryItem => ({
    id,
    type: 'test',
    content: `Test content ${id}`,
    metadata: {
      lastAccessed: Date.now(),
      tags: ['test']
    }
  });

  it('should store and retrieve items', () => {
    const cache = new MemoryCache<BaseMemoryItem>();
    const item = createTestItem('1');

    cache.set('key1', item);
    const retrieved = cache.get('key1');

    expect(retrieved).toEqual(item);
  });

  it('should respect TTL', async () => {
    const config: Partial<CacheConfig> = {
      ttl: 100 // 100ms
    };
    const cache = new MemoryCache<BaseMemoryItem>(config);
    const item = createTestItem('1');

    cache.set('key1', item);
    expect(cache.get('key1')).toBeDefined();

    await new Promise(resolve => setTimeout(resolve, 150));
    expect(cache.get('key1')).toBeUndefined();
  });

  it('should respect max size', () => {
    const config: Partial<CacheConfig> = {
      maxSize: 2
    };
    const cache = new MemoryCache<BaseMemoryItem>(config);
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    cache.set('key1', createTestItem('1'));
    cache.set('key2', createTestItem('2'));
    cache.set('key3', createTestItem('3'));
// Consider extracting this duplicated code into a shared function

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeDefined();
    expect(cache.get('key3')).toBeDefined();
  });

  it('should clear cache', () => {
    const cache = new MemoryCache<BaseMemoryItem>();

    cache.set('key1', createTestItem('1'));
    cache.set('key2', createTestItem('2'));
    cache.clear();

    expect(cache.get('key1')).toBeUndefined();
    expect(cache.get('key2')).toBeUndefined();
  });

  it('should provide stats', () => {
    const config: Partial<CacheConfig> = {
      maxSize: 100,
      ttl: 5000
    };
    const cache = new MemoryCache<BaseMemoryItem>(config);

    cache.set('key1', createTestItem('1'));
    const stats = cache.getStats();

    expect(stats.size).toBe(1);
    expect(stats.maxSize).toBe(100);
    expect(stats.ttl).toBe(5000);
  });
});