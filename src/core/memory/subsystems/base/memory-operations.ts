import { BaseMemoryItem } from "../../types/memory-items.js";
import { MemoryQuery, MemoryResponse } from "../../types/base-types.js";
import { MemoryValidator } from "../../utils/memory-validation.js";
import { logger } from "../../../utils/logger.js";

export abstract class MemoryOperations<T extends BaseMemoryItem> {
  protected items: Map<string, T> = new Map();
  protected validator: MemoryValidator;

  constructor() {
    this.validator = new MemoryValidator();
  }

  async store(item: T): Promise<void> {
    const validation = this.validator.validateItem(item);
    if (!validation.isValid) {
      throw new Error(`Invalid item: ${validation.errors.join(", ")}`);
    }

    this.items.set(item.id, item);
    logger.info(`Stored item ${item.id}`, { type: item.type });
  }

  async update(id: string, updates: Partial<T>): Promise<void> {
    const item = this.items.get(id);
    if (!item) {
      throw new Error(`Item ${id} not found`);
    }

    const updatedItem = { ...item, ...updates } as T;
    const validation = this.validator.validateItem(updatedItem);
    if (!validation.isValid) {
      throw new Error(`Invalid update: ${validation.errors.join(", ")}`);
    }

    this.items.set(id, updatedItem);
    logger.info(`Updated item ${id}`, { type: item.type });
  }

  async delete(id: string): Promise<void> {
    if (this.items.delete(id)) {
      logger.info(`Deleted item ${id}`);
    }
  }

  async query(query: MemoryQuery): Promise<MemoryResponse<T>> {
    const validation = this.validator.validateQuery(query);
    if (!validation.isValid) {
      throw new Error(`Invalid query: ${validation.errors.join(", ")}`);
    }

    const matchingItems = Array.from(this.items.values()).filter(item =>
      this.matchesQuery(item, query)
    );

    return {
      items: matchingItems,
      total: matchingItems.length,
      itemCount: matchingItems.length,
      executionTime: Date.now(),
      stats: {
        itemsSearched: this.items.size,
        itemsMatched: matchingItems.length
      }
    };
  }

  protected abstract matchesQuery(item: T, query: MemoryQuery): boolean;
}