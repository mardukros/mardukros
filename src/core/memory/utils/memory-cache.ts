import { BaseMemoryItem } from '../types/memory-items.js';
import { logger } from '../../utils/logger.js';

export interface CacheConfig {
  maxSize: number;
  ttl: number;
}

export class MemoryCache<T extends BaseMemoryItem> {
  private cache: Map<string, { item: T; expires: number }> = new Map();
  private readonly config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      ttl: 5 * 60 * 1000, // 5 minutes
      ...config
    };
  }

  set(key: string, item: T): void {
    this.cleanup();

    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      item,
      expires: Date.now() + this.config.ttl
    });
  }

  get(key: string): T | undefined {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return undefined;
    }

    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return undefined;
    }

    return cached.item;
  }

  private cleanup(): void {
    const now = Date.now();
    let expired = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now > value.expires) {
        this.cache.delete(key);
        expired++;
      }
    }

    if (expired > 0) {
      logger.debug(`Cleaned up ${expired} expired cache entries`);
    }
  }

  private evictOldest(): void {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, value] of this.cache.entries()) {
      if (value.expires < oldestTime) {
        oldestTime = value.expires;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug('Evicted oldest cache entry', { key: oldestKey });
    }
  }

  clear(): void {
    this.cache.clear();
    logger.debug('Cache cleared');
  }

  getStats(): { size: number; maxSize: number; ttl: number } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      ttl: this.config.ttl
    };
  }
}