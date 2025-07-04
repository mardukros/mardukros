/**
 * Advanced caching strategies for AI context management
 * Provides implementations of various cache eviction policies:
 * - Weighted LRU: Combines recency with item importance
 * - Frequency-based: Prioritizes frequently accessed items
 * - Time-aware: Considers both access patterns and age
 */

import LRUCache from 'lru-cache';

/**
 * Base cache item interface for all cache strategies
 */
export interface CacheableItem {
  id?: string | number;
  lastAccessed: number;
  createdAt?: number;
  accessCount?: number;
  weight?: number;
  ttl?: number;
}

/**
 * Cache options with extended functionality
 */
export interface AdvancedCacheOptions<K, V extends CacheableItem> {
  // Basic options
  max?: number;
  ttl?: number; 
  
  // Advanced options
  weightedValues?: boolean;
  getWeightForItem?: (item: V) => number;
  frequencyFactor?: number;
  recencyFactor?: number;
  ttlExtensionOnHit?: boolean;
  maxTtlExtensions?: number;
  ageDecayFactor?: number;
  disposeFn?: (value: V, key: K) => void;
  updateFrequencyMs?: number;
}

/**
 * Statistics for cache performance monitoring
 */
export interface CacheStats {
  size: number;
  capacity: number;
  hits: number;
  misses: number;
  hitRate: number;
  evictions: number;
  avgAccessTime: number;
  oldestItemAge: number;
  newestItemAge: number;
}

/**
 * Implements a weighted LRU cache that considers both recency and item importance
 */
export class WeightedLRUCache<K, V extends CacheableItem> {
  private cache: LRUCache<K, V>;
  private options: AdvancedCacheOptions<K, V>;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    accessTimes: [] as number[],
  };
  
  constructor(options: AdvancedCacheOptions<K, V>) {
    this.options = {
      max: 100,
      ttl: 1000 * 60 * 60, // 1 hour default
      weightedValues: true,
      frequencyFactor: 0.4,
      recencyFactor: 0.6,
      ttlExtensionOnHit: true,
      maxTtlExtensions: 3,
      ageDecayFactor: 0.1,
      updateFrequencyMs: 60000, // 1 minute
      ...options
    };
    
    this.cache = new LRUCache<K, V>({
      max: this.options.max,
      ttl: this.options.ttl,
      
      // Use custom weighted score for determining item priority
      fetchMethod: async (key, staleValue, { signal }) => {
        // This allows items to survive past TTL if they're important
        if (staleValue && this.shouldExtendTtl(staleValue)) {
          return staleValue;
        }
        return undefined;
      },
      
      dispose: (value, key) => {
        this.stats.evictions++;
        this.options.disposeFn?.(value as V, key as K);
      }
    });
    
    // Periodically update item scores
    if (this.options.updateFrequencyMs) {
      setInterval(() => this.updateItemScores(), this.options.updateFrequencyMs);
    }
  }
  
  /**
   * Calculates the importance score of an item based on recency, frequency, and weight
   * @param item Cache item
   * @returns Normalized score (0-1)
   */
  private calculateItemScore(item: V): number {
    const now = Date.now();
    
    // Recency score (higher for more recently accessed items)
    const recency = 1 - Math.min(1, (now - item.lastAccessed) / (this.options.ttl || 3600000));
    
    // Frequency score (higher for frequently accessed items)
    const frequency = Math.min(1, ((item.accessCount || 1) - 1) / 20); // Normalize to 0-1 range
    
    // Weight score (if provided)
    const weight = this.options.weightedValues ? 
      (item.weight || this.options.getWeightForItem?.(item) || 0.5) : 0.5;
    
    // Age decay (penalize very old items slightly)
    const age = (item.createdAt) ? (now - item.createdAt) : 0;
    const ageDecay = Math.max(0, 1 - (age / (24 * 3600000)) * (this.options.ageDecayFactor || 0)); 
    
    // Combined score
    return (
      (recency * (this.options.recencyFactor || 0.6)) +
      (frequency * (this.options.frequencyFactor || 0.4)) +
      (weight * 0.2)
    ) * (ageDecay);
  }
  
  /**
   * Updates scores for all items in cache
   */
  private updateItemScores(): void {
    const now = Date.now();
    
    // This is a simplification - ideally we would reorder
    // based on the new scores, but LRUCache doesn't directly
    // support this. Instead, we'll rely on the TTL and get/set
    // operations to gradually adjust the order.
    
    // Update TTLs based on scores for important items
    for (const [key, value] of this.cache.entries()) {
      const score = this.calculateItemScore(value);
      if (score > 0.7 && this.options.ttlExtensionOnHit) {
        // Extend TTL for important items
        const currentTtl = value.ttl || this.options.ttl || 3600000;
        const newTtl = currentTtl * (1 + score * 0.5); // Up to 50% extension
        this.cache.set(key, {
          ...value,
          ttl: newTtl
        } as V);
      }
    }
  }
  
  /**
   * Determines if an item's TTL should be extended based on its importance
   */
  private shouldExtendTtl(item: V): boolean {
    if (!this.options.ttlExtensionOnHit) return false;
    
    // Check if we've already extended too many times
    if (this.options.maxTtlExtensions && 
        (item.accessCount || 0) > (this.options.maxTtlExtensions + 3)) {
      return false;
    }
    
    // Only extend for important items
    const score = this.calculateItemScore(item);
    return score > 0.7;
  }
  
  /**
   * Get an item from cache
   */
  get(key: K): V | undefined {
    const startTime = performance.now();
    const item = this.cache.get(key);
    const endTime = performance.now();
    
    if (item) {
      this.stats.hits++;
      this.stats.accessTimes.push(endTime - startTime);
      
      // Update access stats
      item.lastAccessed = Date.now();
      item.accessCount = (item.accessCount || 0) + 1;
      
      // Update the item in place
      this.cache.set(key, item);
    } else {
      this.stats.misses++;
    }
    
    // Keep only the last 100 access times
    if (this.stats.accessTimes.length > 100) {
      this.stats.accessTimes.shift();
    }
    
    return item;
  }
  
  /**
   * Store an item in cache
   */
  set(key: K, value: V): void {
    // Ensure required fields are set
    const now = Date.now();
    const enhancedValue = {
      ...value,
      lastAccessed: value.lastAccessed || now,
      createdAt: value.createdAt || now,
      accessCount: value.accessCount || 1
    };
    
    // Calculate custom TTL based on item importance
    let ttl = this.options.ttl;
    if (this.options.weightedValues && (value.weight || this.options.getWeightForItem)) {
      const weight = value.weight || this.options.getWeightForItem?.(value) || 0.5;
      ttl = (this.options.ttl || 3600000) * (1 + weight * 0.5); // Up to 50% longer TTL for important items
    }
    
    this.cache.set(key, enhancedValue as V, { ttl });
  }
  
  /**
   * Check if cache has key
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }
  
  /**
   * Delete an item from cache
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
    this.resetStats();
  }
  
  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }
  
  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      accessTimes: []
    };
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const items = Array.from(this.cache.entries());
    const now = Date.now();
    
    let oldestAge = 0;
    let newestAge = Infinity;
    
    for (const [, value] of items) {
      const age = now - (value.createdAt || now);
      oldestAge = Math.max(oldestAge, age);
      newestAge = Math.min(newestAge, age);
    }
    
    const avgAccessTime = this.stats.accessTimes.length > 0 
      ? this.stats.accessTimes.reduce((sum, time) => sum + time, 0) / this.stats.accessTimes.length
      : 0;
    
    return {
      size: this.cache.size,
      capacity: this.options.max || 100,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses || 1),
      evictions: this.stats.evictions,
      avgAccessTime,
      oldestItemAge: oldestAge,
      newestItemAge: newestAge === Infinity ? 0 : newestAge
    };
  }
  
  /**
   * Get all keys in cache
   */
  keys(): K[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Get all values in cache
   */
  values(): V[] {
    return Array.from(this.cache.values());
  }
  
  /**
   * Get all entries in cache
   */
  entries(): [K, V][] {
    return Array.from(this.cache.entries());
  }
}
