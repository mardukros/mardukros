import { BaseMemoryItem } from '../types/memory-items.js';
import { logger } from '../../utils/logger.js';

export interface OptimizationStats {
  itemsRemoved: number;
  bytesFreed: number;
  compressionRatio: number;
}
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

export class MemoryOptimizer {
  private readonly CLEANUP_THRESHOLD = 0.9; // 90% capacity triggers cleanup
  private readonly CLEANUP_TARGET = 0.7; // Reduce to 70% capacity
  private readonly MIN_ACCESS_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

  async optimizeMemory<T extends BaseMemoryItem>(
    items: Map<string, T>,
    capacity: number
  ): Promise<OptimizationStats> {
    const startSize = this.calculateSize(items);
    const startCount = items.size;

    if (items.size > capacity * this.CLEANUP_THRESHOLD) {
      await this.cleanupOldItems(items, capacity);
    }

    const compressedSize = this.calculateSize(items);

    return {
      itemsRemoved: startCount - items.size,
      bytesFreed: startSize - compressedSize,
      compressionRatio: compressedSize / startSize
    };
  }

  private async cleanupOldItems<T extends BaseMemoryItem>(
    items: Map<string, T>,
    capacity: number
  ): Promise<void> {
    const targetSize = Math.floor(capacity * this.CLEANUP_TARGET);
    const now = Date.now();

    // Sort items by last accessed time and importance
    const sortedItems = Array.from(items.entries())
      .sort(([, a], [, b]) => {
        const ageA = now - a.metadata.lastAccessed;
        const ageB = now - b.metadata.lastAccessed;
        const importanceA = (a.metadata as any).importance || 0;
        const importanceB = (b.metadata as any).importance || 0;

        // Prioritize keeping important items that are accessed frequently
        return (ageA / importanceA) - (ageB / importanceB);
      });

    // Remove oldest, least important items until target size is reached
    while (items.size > targetSize) {
      const [id] = sortedItems.pop()!;
      items.delete(id);
    }

    logger.info(`Cleaned up memory to ${items.size} items`);
  }

  private calculateSize(items: Map<string, any>): number {
    return Array.from(items.values())
      .reduce((size, item) => size + JSON.stringify(item).length, 0);
  }
}