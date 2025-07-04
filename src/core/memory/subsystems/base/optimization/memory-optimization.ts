import { BaseMemoryItem } from '../../../types/memory-items.js';
import { MemoryOptimizer } from '../../../utils/memory-optimization.js';
import { logger } from '../../../../utils/logger.js';
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

export class MemoryOptimization<T extends BaseMemoryItem> {
  private optimizer: MemoryOptimizer;
  private readonly CLEANUP_THRESHOLD = 0.9;
  protected subsystem: { items: T[], capacity?: number };

  constructor(subsystem: { items: T[], capacity?: number }) {
    this.optimizer = new MemoryOptimizer();
    this.subsystem = subsystem;
  }

  async optimizeIfNeeded(items: Map<string, T>): Promise<void> {
    const capacity = this.subsystem.capacity || 1000; // Default capacity if not set

    if (items.size >= capacity * this.CLEANUP_THRESHOLD) {
      logger.info(`Memory cleanup triggered (${items.size} items)`);
        const stats = await this.optimizer.optimizeMemory(items, capacity);
      logger.info('Memory optimization completed', { stats });
    }
  }

  async compressItems(items: Map<string, T>): Promise<void> {
    try {
      await this.optimizer.optimizeMemory(items, this.subsystem.capacity || 1000);
      logger.info('Memory compression completed');
    } catch (error) {
      logger.error('Error during memory compression:', error as Error);
      throw error;
    }
  }
}