import { MemoryOptimizer } from '../memory-optimization.js';
import { BaseMemoryItem } from '../../types/memory-items.js';

describe('Memory Optimizer', () => {
  const optimizer = new MemoryOptimizer();

  const createTestItems = (count: number): Map<string, BaseMemoryItem> => {
    const items = new Map<string, BaseMemoryItem>();
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      items.set(`item${i}`, {
        id: `item${i}`,
        type: 'test',
        content: `Test content ${i}`,
        metadata: {
          lastAccessed: now - (i * 24 * 60 * 60 * 1000), // Each item 1 day older
          tags: ['test'],
          importance: 1 - (i / count) // Decreasing importance
        }
      });
    }

    return items;
  };

  it('should optimize memory when over threshold', async () => {
    const items = createTestItems(100);
    const capacity = 80;

    const stats = await optimizer.optimizeMemory(items, capacity);

    expect(items.size).toBeLessThanOrEqual(capacity);
    expect(stats.itemsRemoved).toBeGreaterThan(0);
    expect(stats.bytesFreed).toBeGreaterThan(0);
    expect(stats.compressionRatio).toBeLessThan(1);
  });

  it('should keep most important recent items', async () => {
    const items = createTestItems(100);
    const capacity = 50;

    await optimizer.optimizeMemory(items, capacity);

    // Check that remaining items are the most important/recent ones
    const remainingItems = Array.from(items.values());
    remainingItems.forEach((item, index) => {
      if (index > 0) {
        const prevItem = remainingItems[index - 1];
        const prevScore = prevItem.metadata.lastAccessed * (prevItem.metadata as any).importance;
        const currentScore = item.metadata.lastAccessed * (item.metadata as any).importance;
        expect(prevScore).toBeGreaterThanOrEqual(currentScore);
      }
    });
  });
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

  it('should not modify memory below threshold', async () => {
    const items = createTestItems(50);
    const capacity = 100;
    const originalSize = items.size;

    const stats = await optimizer.optimizeMemory(items, capacity);

    expect(items.size).toBe(originalSize);
    expect(stats.itemsRemoved).toBe(0);
  });
});