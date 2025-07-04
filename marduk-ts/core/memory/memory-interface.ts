import { MemoryItem, MemoryQuery, MemoryResponse } from './types/base-types.js';
import { MemoryStats } from './types/memory-interface.js';
import { MemoryOptimizer } from './utils/optimization/optimizer.js';
import { MemoryMonitor } from './utils/memory-monitor.js';
import { logger } from '../utils/logger.js';

export abstract class MemoryInterface<T extends MemoryItem = MemoryItem> {
  protected items: Map<string | number, T>;
  protected optimizer: MemoryOptimizer;
  protected monitor: MemoryMonitor;
  protected capacity: number;

  constructor(capacity: number = 1000) {
    this.items = new Map();
    this.optimizer = new MemoryOptimizer();
    this.monitor = new MemoryMonitor({ [this.constructor.name]: { items: this.items } });
    this.capacity = capacity;
  }

  async query(query: MemoryQuery): Promise<MemoryResponse<T>> {
    try {
      const items = await this.executeQuery(query);
      return {
        items,
        metadata: {
          total: items.length,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Error executing memory query', error as Error);
      throw error;
    }
  }

  async store(item: T): Promise<void> {
    try {
      await this.validateItem(item);
      await this.optimizeIfNeeded();
      this.items.set(item.id, item);
      await this.afterStore(item);
    } catch (error) {
      logger.error('Error storing memory item', error as Error);
      throw error;
    }
  }

  async update(id: string | number, updates: Partial<T>): Promise<void> {
    try {
      const item = this.items.get(id);
      if (!item) {
        throw new Error(`Item with id ${id} not found`);
      }

      const updatedItem = { ...item, ...updates } as T;
      await this.validateItem(updatedItem);
      this.items.set(id, updatedItem);
      await this.afterUpdate(updatedItem);
    } catch (error) {
      logger.error('Error updating memory item', error as Error);
      throw error;
    }
  }

  async delete(id: string | number): Promise<void> {
    try {
      const item = this.items.get(id);
      if (item) {
        this.items.delete(id);
        await this.afterDelete(item);
      }
    } catch (error) {
      logger.error('Error deleting memory item', error as Error);
      throw error;
    }
  }

  async getStats(): Promise<MemoryStats> {
    this.monitor.updateStats();
    return this.monitor.getStats(this.constructor.name) || {
      itemCount: 0,
      memoryUsage: 0,
      indexSize: 0,
      lastCleanup: null,
      lastPersistence: null,
      healthStatus: 'healthy'
    };
  }

  protected abstract executeQuery(query: MemoryQuery): Promise<T[]>;
  protected abstract validateItem(item: T): Promise<void>;
  protected abstract afterStore(item: T): Promise<void>;
  protected abstract afterUpdate(item: T): Promise<void>;
  protected abstract afterDelete(item: T): Promise<void>;

  private async optimizeIfNeeded(): Promise<void> {
    const stats = await this.getStats();
    if (stats.healthStatus !== 'healthy') {
      await this.optimizer.optimizeMemory(this.items, this.capacity, stats);
      this.monitor.notifyCleanup();
    }
  }
}