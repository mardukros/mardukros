import { MemoryItem } from '../../types/base-types.js';
import { MemoryStats } from '../../types/memory-interface.js';
import { MemoryCompressor } from './compression.js';
import { MemoryDeduplicator } from './deduplication.js';
import { calculateMemoryUsage } from '../memory-cleanup.js';

export class MemoryOptimizer {
  private readonly COMPRESSION_THRESHOLD = 0.8;
  private readonly compressor: MemoryCompressor;
  private readonly deduplicator: MemoryDeduplicator;

  constructor() {
    this.compressor = new MemoryCompressor();
    this.deduplicator = new MemoryDeduplicator();
  }

  async optimizeMemory(
    items: Map<string | number, MemoryItem>,
    capacity: number,
    stats: MemoryStats
  ): Promise<void> {
    const memoryUsage = calculateMemoryUsage(items);
    const usageRatio = memoryUsage / capacity;

    if (usageRatio > this.COMPRESSION_THRESHOLD) {
      await this.compressor.compressItems(items);
    }

    if (stats.itemCount > capacity * 0.9) {
      await this.deduplicator.deduplicateItems(items);
    }
  }
}