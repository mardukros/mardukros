/**
 * Advanced caching strategies for AI context management
 * Provides implementations of various cache eviction policies:
 * - Weighted LRU: Combines recency with item importance
 * - Frequency-based: Prioritizes frequently accessed items
 * - Time-aware: Considers both access patterns and age
 */
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
    max?: number;
    ttl?: number;
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
export declare class WeightedLRUCache<K, V extends CacheableItem> {
    private cache;
    private options;
    private stats;
    constructor(options: AdvancedCacheOptions<K, V>);
    /**
     * Calculates the importance score of an item based on recency, frequency, and weight
     * @param item Cache item
     * @returns Normalized score (0-1)
     */
    private calculateItemScore;
    /**
     * Updates scores for all items in cache
     */
    private updateItemScores;
    /**
     * Determines if an item's TTL should be extended based on its importance
     */
    private shouldExtendTtl;
    /**
     * Get an item from cache
     */
    get(key: K): V | undefined;
    /**
     * Store an item in cache
     */
    set(key: K, value: V): void;
    /**
     * Check if cache has key
     */
    has(key: K): boolean;
    /**
     * Delete an item from cache
     */
    delete(key: K): boolean;
    /**
     * Clear the entire cache
     */
    clear(): void;
    /**
     * Get cache size
     */
    get size(): number;
    /**
     * Reset cache statistics
     */
    resetStats(): void;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats;
    /**
     * Get all keys in cache
     */
    keys(): K[];
    /**
     * Get all values in cache
     */
    values(): V[];
    /**
     * Get all entries in cache
     */
    entries(): [K, V][];
}
//# sourceMappingURL=advanced-cache.d.ts.map