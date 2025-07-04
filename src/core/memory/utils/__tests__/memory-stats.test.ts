import { MemoryStatsCollector } from '../memory-stats.js';
import { BaseMemoryItem } from '../../types/memory-items.js';

describe('Memory Stats Collector', () => {
  const collector = new MemoryStatsCollector();
  const now = Date.now();

  const createTestItems = (count: number): Map<string, BaseMemoryItem> => {
    const items = new Map<string, BaseMemoryItem>();
    
    for (let i = 0; i < count; i++) {
      items.set(`item${i}`, {
        id: `item${i}`,
        type: i % 2 === 0 ? 'typeA' : 'typeB',
        content: `Test content ${i}`,
        metadata: {
          lastAccessed: now - (i * 3600000), // Each item 1 hour older
          tags: [`tag${i % 3}`]
        }
      });
    }
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    return items;
  };
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

  it('should collect basic stats correctly', () => {
    const items = createTestItems(10);
    const stats = collector.collectStats(items);
// Consider extracting this duplicated code into a shared function

    expect(stats.totalItems).toBe(10);
    expect(stats.totalSize).toBeGreaterThan(0);
    expect(stats.averageItemSize).toBeGreaterThan(0);
  });

  it('should track type distribution', () => {
    const items = createTestItems(10);
    const stats = collector.collectStats(items);

    expect(stats.typeDistribution.typeA).toBe(5);
    expect(stats.typeDistribution.typeB).toBe(5);
  });

  it('should track tag distribution', () => {
    const items = createTestItems(6);
    const stats = collector.collectStats(items);

    expect(stats.tagDistribution.tag0).toBe(2);
    expect(stats.tagDistribution.tag1).toBe(2);
    expect(stats.tagDistribution.tag2).toBe(2);
  });

  it('should track access patterns', () => {
    const items = createTestItems(24);
    const stats = collector.collectStats(items);

    expect(stats.accessPatterns.lastHour).toBe(1);
    expect(stats.accessPatterns.lastDay).toBe(24);
    expect(stats.accessPatterns.lastWeek).toBe(24);
  });
});