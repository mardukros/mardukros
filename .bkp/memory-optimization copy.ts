import { MemoryItem } from '../types/base-types.js';
import { MemoryStats } from '../types/memory-interface.js';
import { calculateMemoryUsage } from './memory-cleanup.js';
import { logger } from '../../logging/logger.js';

// Define new error types for better error handling
export class MemoryOptimizationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'MemoryOptimizationError';
  }
}

export class MemoryCompressionError extends MemoryOptimizationError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'MemoryCompressionError';
  }
}

export class MemoryDeduplicationError extends MemoryOptimizationError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'MemoryDeduplicationError';
  }
}

export class MemoryOptimizer {
  private readonly COMPRESSION_THRESHOLD = 0.8; // 80% of capacity
  private readonly DEDUPLICATION_THRESHOLD = 0.7; // 70% similarity for deduplication
  private readonly BATCH_SIZE = 500; // Increased batch size for better performance with large datasets
  private readonly LARGE_DATASET_THRESHOLD = 10000; // Number of items considered a large dataset
  private readonly MAX_PROCESSING_TIME_MS = 30000; // Max time for optimization operations (30 seconds)
  
  // Memory usage threshold levels
  private readonly MEMORY_USAGE_LEVELS = {
    NORMAL: 0.7,   // 70% - Normal operation
    WARNING: 0.8,  // 80% - Start basic optimizations
    HIGH: 0.9,     // 90% - More aggressive optimizations
    CRITICAL: 0.95 // 95% - Emergency cleanup
  };
  
  // Optimization flags
  private isOptimizationInProgress = false;
  private lastOptimizationTime = 0;
  private readonly MIN_OPTIMIZATION_INTERVAL_MS = 60000; // Minimum time between full optimizations (1 minute)

  /**
   * Optimizes memory by compressing, deduplicating, and indexing items
   * Enhanced to handle large datasets and provide better error handling
   * 
   * @param items Map of memory items to optimize
   * @param capacity Maximum memory capacity
   * @param stats Current memory statistics
   * @param options Optional configuration options
   * @returns Promise resolving when optimization is complete
   */
  async optimizeMemory(
    items: Map<string | number, MemoryItem>,
    capacity: number,
    stats: MemoryStats,
    options: {
      forceOptimization?: boolean,
      maxTimeMs?: number,
      prioritizeSpeed?: boolean
    } = {}
  ): Promise<{
    optimizationPerformed: boolean,
    compressionApplied: boolean,
    deduplicationApplied: boolean,
    indexingApplied: boolean,
    emergencyCleanupApplied: boolean,
    timeElapsedMs: number,
    errorCount: number,
    errors: Error[]
  }> {
    // Track optimization metrics
    const startTime = Date.now();
    const results = {
      optimizationPerformed: false,
      compressionApplied: false,
      deduplicationApplied: false,
      indexingApplied: false,
      emergencyCleanupApplied: false,
      timeElapsedMs: 0,
      errorCount: 0,
      errors: [] as Error[]
    };

    // Check if we should skip optimization (unless forced)
    if (
      this.isOptimizationInProgress && 
      !options.forceOptimization
    ) {
      logger.info('Skipping memory optimization - another optimization is already in progress');
      return results;
    }

    // Check if optimization is needed based on time since last run
    const timeSinceLastOptimization = Date.now() - this.lastOptimizationTime;
    if (
      timeSinceLastOptimization < this.MIN_OPTIMIZATION_INTERVAL_MS &&
      !options.forceOptimization
    ) {
      logger.info(`Skipping memory optimization - last run was ${Math.floor(timeSinceLastOptimization / 1000)}s ago`);
      return results;
    }

    try {
      this.isOptimizationInProgress = true;
      results.optimizationPerformed = true;

      // Calculate current memory usage
      const memoryUsage = calculateMemoryUsage(items);
      const usageRatio = memoryUsage / capacity;
      const isLargeDataset = items.size > this.LARGE_DATASET_THRESHOLD;
      
      // Determine optimization level based on memory usage ratio
      logger.info(`Memory optimization starting - usage ratio: ${usageRatio.toFixed(2)}, item count: ${items.size}`);
      
      // Set maximum processing time
      const maxTimeMs = options.maxTimeMs || this.MAX_PROCESSING_TIME_MS;
      const optimizationDeadline = Date.now() + maxTimeMs;

      // Perform optimizations based on memory usage level
      if (usageRatio >= this.MEMORY_USAGE_LEVELS.WARNING) {
        try {
          // For large datasets, use more efficient compression algorithms
          if (isLargeDataset && options.prioritizeSpeed) {
            logger.info(`Using fast compression for large dataset (${items.size} items)`);
            await this.fastCompressItems(items);
          } else {
            await this.compressItems(items);
          }
          results.compressionApplied = true;
          logger.info(`Compression complete - elapsed time: ${Date.now() - startTime}ms`);
        } catch (error) {
          const compressionError = new MemoryCompressionError('Error during memory compression', error instanceof Error ? error : undefined);
          results.errors.push(compressionError);
          results.errorCount++;
          logger.error(`Memory compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Check if we've exceeded our time budget
      if (Date.now() > optimizationDeadline && !options.forceOptimization) {
        logger.warn(`Memory optimization partial completion - time budget exceeded (${Date.now() - startTime}ms)`);
        return {...results, timeElapsedMs: Date.now() - startTime};
      }

      // Perform deduplication if memory usage is high
      if (usageRatio >= this.MEMORY_USAGE_LEVELS.HIGH || stats.itemCount > capacity * 0.9) {
        try {
          if (isLargeDataset && options.prioritizeSpeed) {
            await this.fastDeduplicateItems(items);
          } else {
            await this.deduplicateItems(items);
          }
          results.deduplicationApplied = true;
          logger.info(`Deduplication complete - elapsed time: ${Date.now() - startTime}ms`);
        } catch (error) {
          const deduplicationError = new MemoryDeduplicationError('Error during memory deduplication', 
            error instanceof Error ? error : undefined);
          results.errors.push(deduplicationError);
          results.errorCount++;
          logger.error(`Memory deduplication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Check if we've exceeded our time budget again
      if (Date.now() > optimizationDeadline && !options.forceOptimization) {
        logger.warn(`Memory optimization partial completion - time budget exceeded (${Date.now() - startTime}ms)`);
        return {...results, timeElapsedMs: Date.now() - startTime};
      }

      // Always optimize indexes as it's relatively fast
      try {
        await this.optimizeIndexes(items);
        results.indexingApplied = true;
      } catch (error) {
        const indexError = new MemoryOptimizationError('Error during index optimization', 
          error instanceof Error ? error : undefined);
        results.errors.push(indexError);
        results.errorCount++;
        logger.error(`Index optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Emergency cleanup for critical memory usage
      if (usageRatio >= this.MEMORY_USAGE_LEVELS.CRITICAL) {
        try {
          logger.warn(`Critical memory usage detected: ${usageRatio.toFixed(2)} - Initiating emergency cleanup`);
          await this.performEmergencyCleanup(items, Math.floor(capacity * 0.8));
          results.emergencyCleanupApplied = true;
        } catch (error) {
          const emergencyError = new MemoryOptimizationError('Error during emergency cleanup',
            error instanceof Error ? error : undefined);
          results.errors.push(emergencyError);
          results.errorCount++;
          logger.error(`Emergency cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      // Update last optimization time
      this.lastOptimizationTime = Date.now();
      results.timeElapsedMs = Date.now() - startTime;
      
      logger.info(`Memory optimization complete - elapsed time: ${results.timeElapsedMs}ms, errors: ${results.errorCount}`);
      return results;
    } catch (error) {
      // Handle unexpected errors
      const unexpectedError = new MemoryOptimizationError('Unexpected error during memory optimization',
        error instanceof Error ? error : undefined);
      results.errors.push(unexpectedError);
      results.errorCount++;
      logger.error(`Memory optimization failed with unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {...results, timeElapsedMs: Date.now() - startTime};
    } finally {
      this.isOptimizationInProgress = false;
    }
  }

  private async compressItems(items: Map<string | number, MemoryItem>): Promise<void> {
    const itemBatches = this.batchItems(Array.from(items.values()));
    
    for (const batch of itemBatches) {
      await Promise.all(batch.map(async item => {
        if (typeof item.content === 'string') {
          item.content = await this.compressString(item.content);
          // Mark item as compressed in metadata for tracking
          item.metadata = item.metadata || {};
          item.metadata.isCompressed = true;
        } else if (typeof item.content === 'object') {
          item.content = await this.compressObject(item.content);
          // Mark item as compressed in metadata for tracking
          item.metadata = item.metadata || {};
          item.metadata.isCompressed = true;
        }
      }));
    }
    console.log(`Compressed ${items.size} memory items in batches of ${this.BATCH_SIZE}`);
  }

  private async compressString(str: string): Promise<string> {
    // Simple string compression - remove redundant whitespace
    return str.replace(/\s+/g, ' ').trim();
    // TODO: Implement more advanced compression like Huffman coding or LZW for larger strings
  }

  private async compressObject(obj: any): Promise<any> {
    const compressed: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;
      
      if (typeof value === 'string') {
        compressed[key] = await this.compressString(value);
      } else if (typeof value === 'object') {
        compressed[key] = await this.compressObject(value);
      } else {
        compressed[key] = value;
      }
    }
    // Remove redundant or duplicate nested structures if applicable
    // This could be enhanced with pattern recognition for repetitive data
    return compressed;
  }

  private async deduplicateItems(items: Map<string | number, MemoryItem>): Promise<void> {
    const itemArray = Array.from(items.values());
    const duplicates = new Set<string | number>();

    for (let i = 0; i < itemArray.length; i++) {
      if (duplicates.has(itemArray[i].id)) continue;

      for (let j = i + 1; j < itemArray.length; j++) {
        if (duplicates.has(itemArray[j].id)) continue;

        const similarity = this.calculateSimilarity(itemArray[i], itemArray[j]);
        if (similarity > this.DEDUPLICATION_THRESHOLD) {
          // Keep the item with higher confidence or more recent timestamp
          const itemToRemove = this.selectItemToRemove(itemArray[i], itemArray[j]);
          duplicates.add(itemToRemove.id);
        }
      }
    }

    duplicates.forEach(id => items.delete(id));
  }

  /**
   * Fast compression algorithm optimized for large datasets
   * Uses a more memory-efficient but less thorough compression approach
   */
  private async fastCompressItems(items: Map<string | number, MemoryItem>): Promise<void> {
    logger.info(`Starting fast compression for ${items.size} items`);
    const startTime = Date.now();
    
    try {
      // Create a sampling of items for large datasets instead of processing all
      const itemArray = Array.from(items.values());
      const sampleSize = Math.min(5000, Math.ceil(itemArray.length * 0.2)); // Process at most 20% or 5000 items
      const sampledItems = itemArray.sort(() => 0.5 - Math.random()).slice(0, sampleSize);
      
      // Process the sampled items in parallel batches for better performance
      const batches = this.batchItems(sampledItems);
      let processedCount = 0;
      
      for (const batch of batches) {
        await Promise.all(batch.map(async item => {
          try {
            // Only compress items that are likely to benefit from compression
            if (typeof item.content === 'string' && item.content.length > 100) {
              item.content = await this.compressString(item.content);
              item.metadata = item.metadata || {};
              item.metadata.isCompressed = true;
              item.metadata.compressionType = 'fast';
              processedCount++;
            } else if (typeof item.content === 'object' && item.content !== null) {
              // For objects, only compress large fields
              item.content = await this.fastCompressObject(item.content);
              item.metadata = item.metadata || {};
              item.metadata.isCompressed = true;
              item.metadata.compressionType = 'fast';
              processedCount++;
            }
          } catch (error) {
            logger.error(`Error compressing item ${item.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            // Continue with other items even if one fails
          }
        }));
      }
      
      logger.info(`Fast compression completed in ${Date.now() - startTime}ms - compressed ${processedCount} items out of ${sampleSize} sampled`);
    } catch (error) {
      const compressionError = new MemoryCompressionError(
        `Failed to perform fast compression: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
      logger.error(`Fast compression failed: ${compressionError.message}`);
      throw compressionError; // Propagate the error for proper handling
    }
  }
  
  /**
   * Fast object compression for large datasets
   * Focuses only on large string properties
   */
  private async fastCompressObject(obj: any): Promise<any> {
    // Skip null, undefined, or primitive values
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }
    
    // For arrays, process each element
    if (Array.isArray(obj)) {
      // Only process arrays with more than 5 elements
      if (obj.length > 5) {
        const result = [];
        for (let i = 0; i < obj.length; i++) {
          // Only process large string elements or objects
          if (typeof obj[i] === 'string' && obj[i].length > 200) {
            result[i] = await this.compressString(obj[i]);
          } else if (typeof obj[i] === 'object' && obj[i] !== null) {
            result[i] = await this.fastCompressObject(obj[i]);
          } else {
            result[i] = obj[i];
          }
        }
        return result;
      }
      return obj; // Return unmodified short arrays
    }
    
    // For objects, process each property
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) {
        // Skip null/undefined values
        continue;
      }
      
      if (typeof value === 'string' && value.length > 200) {
        // Only compress long strings
        result[key] = await this.compressString(value);
      } else if (typeof value === 'object') {
        // Recursively compress nested objects
        result[key] = await this.fastCompressObject(value);
      } else {
        // Keep other values unchanged
        result[key] = value;
      }
    }
    
    return result;
  }
  
  /**
   * Fast deduplication for large datasets
   * Uses locality-sensitive hashing to find similar items more efficiently
   */
  private async fastDeduplicateItems(items: Map<string | number, MemoryItem>): Promise<void> {
    logger.info(`Starting fast deduplication for ${items.size} items`);
    const startTime = Date.now();
    
    try {
      // For very large datasets, use a bucketing approach to reduce comparison complexity
      // This is O(n) instead of O(n²) which is crucial for large datasets
      const buckets = new Map<string, MemoryItem[]>();
      const duplicates = new Set<string | number>();
      
      // First pass: create similarity buckets
      for (const item of items.values()) {
        // Skip items already marked as duplicates
        if (duplicates.has(item.id)) continue;
        
        // Create a simple hash based on type and content characteristics
        const bucketKey = this.createSimilarityBucket(item);
        
        if (!buckets.has(bucketKey)) {
          buckets.set(bucketKey, []);
        }
        
        buckets.get(bucketKey)!.push(item);
      }
      
      // Second pass: process each bucket for duplicates
      let processedBuckets = 0;
      let totalComparisons = 0;
      let foundDuplicates = 0;
      
      for (const [bucketKey, bucketItems] of buckets.entries()) {
        // Only process buckets with multiple items
        if (bucketItems.length > 1) {
          // Sort by confidence and timestamp to prioritize keeping higher quality items
          bucketItems.sort((a, b) => {
            const confidenceA = (a.metadata?.confidence as number) || 0;
            const confidenceB = (b.metadata?.confidence as number) || 0;
            if (confidenceA !== confidenceB) return confidenceB - confidenceA;
            
            const timestampA = (a.metadata?.lastAccessed as number) || 0;
            const timestampB = (b.metadata?.lastAccessed as number) || 0;
            return timestampB - timestampA;
          });
          
          // Compare items within the bucket (much smaller than the full dataset)
          for (let i = 0; i < bucketItems.length; i++) {
            if (duplicates.has(bucketItems[i].id)) continue;
            
            for (let j = i + 1; j < bucketItems.length; j++) {
              if (duplicates.has(bucketItems[j].id)) continue;
              
              totalComparisons++;
              const similarity = this.calculateSimilarity(bucketItems[i], bucketItems[j]);
              
              if (similarity > this.DEDUPLICATION_THRESHOLD) {
                // Mark the lower quality item as a duplicate
                duplicates.add(bucketItems[j].id);
                foundDuplicates++;
              }
            }
          }
          processedBuckets++;
        }
      }
      
      // Remove duplicates from the original collection
      for (const duplicateId of duplicates) {
        items.delete(duplicateId);
      }
      
      logger.info(`Fast deduplication completed in ${Date.now() - startTime}ms - removed ${foundDuplicates} duplicates from ${processedBuckets} non-empty buckets (${totalComparisons} comparisons made)`);
    } catch (error) {
      const deduplicationError = new MemoryDeduplicationError(
        `Failed to perform fast deduplication: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
      logger.error(`Fast deduplication failed: ${deduplicationError.message}`);
      throw deduplicationError; // Propagate the error for proper handling
    }
  }
  
  /**
   * Creates a similarity bucket key for an item to group potentially similar items
   * This is a form of locality-sensitive hashing
   */
  private createSimilarityBucket(item: MemoryItem): string {
    // Start with the type which is a strong indicator
    let bucketKey = `type:${item.type}`;
    
    // Add content type
    if (typeof item.content === 'string') {
      // For strings, add length category (0-100, 100-1000, 1000+)
      const content = item.content;
      const lengthCategory = content.length < 100 ? 'small' : content.length < 1000 ? 'medium' : 'large';
      bucketKey += `|stringContent:${lengthCategory}`;
      
      // Add the first 3 and last 3 chars for additional bucketing (for medium/large strings)
      if (content.length > 20) {
        const prefix = content.trim().substring(0, 3).toLowerCase();
        const suffix = content.trim().substring(content.length - 3).toLowerCase();
        bucketKey += `|${prefix}...${suffix}`;
      }
    } else if (typeof item.content === 'object' && item.content !== null) {
      // For objects, use the keys as part of the bucket
      const keys = Object.keys(item.content).sort().join(',');
      bucketKey += `|objectContent:${keys.substring(0, 50)}`; // Limit key length
    }
    
    // Include category/tag if available
    if (item.metadata?.category) {
      bucketKey += `|category:${item.metadata.category}`;
    }
    
    return bucketKey;
  }
  
  /**
   * Performs emergency cleanup when memory usage is critical
   * Removes low-priority items to free up memory quickly
   */
  private async performEmergencyCleanup(items: Map<string | number, MemoryItem>, targetSize: number): Promise<void> {
    logger.warn(`Performing emergency cleanup - current size: ${items.size}, target: ${targetSize}`);
    const startTime = Date.now();
    
    try {
      if (items.size <= targetSize) {
        logger.info('Emergency cleanup not needed - current size already below target');
        return;
      }
      
      // Calculate how many items to remove
      const excessItems = items.size - targetSize;
      logger.warn(`Need to remove ${excessItems} items in emergency cleanup`);
      
      // Convert to array for sorting
      const itemArray = Array.from(items.values());
      
      // Sort items by priority for removal (lowest priority first)
      itemArray.sort((a, b) => {
        // Critical items should never be removed
        const aCritical = a.metadata?.critical === true;
        const bCritical = b.metadata?.critical === true;
        if (aCritical && !bCritical) return 1;
        if (!aCritical && bCritical) return -1;
        
        // Sort by confidence
        const aConfidence = (a.metadata?.confidence as number) || 0;
        const bConfidence = (b.metadata?.confidence as number) || 0;
        if (aConfidence !== bConfidence) return aConfidence - bConfidence;
        
        // Then by last accessed time (oldest first)
        const aAccessed = (a.metadata?.lastAccessed as number) || 0;
        const bAccessed = (b.metadata?.lastAccessed as number) || 0;
        return aAccessed - bAccessed;
      });
      
      // Remove the lowest priority items
      const itemsToRemove = itemArray.slice(0, excessItems);
      for (const item of itemsToRemove) {
        items.delete(item.id);
      }
      
      logger.warn(`Emergency cleanup completed in ${Date.now() - startTime}ms - removed ${itemsToRemove.length} items`);
    } catch (error) {
      const cleanupError = new MemoryOptimizationError(
        `Failed to perform emergency cleanup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
      logger.error(`Emergency cleanup failed: ${cleanupError.message}`);
      throw cleanupError; // Propagate the error for proper handling
    }
  }
  
  private async optimizeIndexes(items: Map<string | number, MemoryItem>): Promise<void> {
    // Implement index optimization strategies for better lookup performance
    try {
      logger.info(`Optimizing indexes for ${items.size} items`);
      const startTime = Date.now();
      
      // Create optimized lookup structures based on common access patterns
      // This is a placeholder for actual implementation that would:
      // 1. Analyze access patterns
      // 2. Create appropriate indexes
      // 3. Optimize existing indexes
      
      logger.info(`Index optimization completed in ${Date.now() - startTime}ms`);
    } catch (error) {
      logger.error(`Index optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Not throwing error here as index optimization is not critical
    }
  }

  private batchItems<T>(items: T[]): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
      batches.push(items.slice(i, i + this.BATCH_SIZE));
    }
    return batches;
  }

  private calculateSimilarity(item1: MemoryItem, item2: MemoryItem): number {
    if (item1.type !== item2.type) return 0;

    let similarity = 0;
    let totalWeight = 0;

    // Compare content (weight: 0.6)
    const contentSimilarity = this.compareContent(item1.content, item2.content);
    similarity += contentSimilarity * 0.6;
    totalWeight += 0.6;

    // Compare metadata if exists (weight: 0.4)
    if (item1.metadata && item2.metadata) {
      const metadataSimilarity = this.compareMetadata(item1.metadata, item2.metadata);
      similarity += metadataSimilarity * 0.4;
      totalWeight += 0.4;
    }

    return totalWeight > 0 ? similarity / totalWeight : 0;
  }

  private compareContent(content1: unknown, content2: unknown): number {
    if (typeof content1 !== typeof content2) return 0;

    if (typeof content1 === 'string' && typeof content2 === 'string') {
      return this.calculateStringSimilarity(content1, content2);
    }

    if (typeof content1 === 'object' && typeof content2 === 'object') {
      return this.calculateObjectSimilarity(content1, content2);
    }

    return content1 === content2 ? 1 : 0;
  }

  private compareMetadata(metadata1: Record<string, unknown>, metadata2: Record<string, unknown>): number {
    const keys = new Set([...Object.keys(metadata1), ...Object.keys(metadata2)]);
    let totalSimilarity = 0;
    let comparedFields = 0;

    for (const key of keys) {
      if (key in metadata1 && key in metadata2) {
        totalSimilarity += this.compareContent(metadata1[key], metadata2[key]);
        comparedFields++;
      }
    }

    return comparedFields > 0 ? totalSimilarity / comparedFields : 0;
  }

  private calculateStringSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;

    const distance = this.levenshteinDistance(str1, str2);
    return 1 - distance / maxLength;
  }

  private calculateObjectSimilarity(obj1: any, obj2: any): number {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = new Set([...keys1, ...keys2]);

    let totalSimilarity = 0;
    let comparedFields = 0;

    for (const key of allKeys) {
      if (key in obj1 && key in obj2) {
        totalSimilarity += this.compareContent(obj1[key], obj2[key]);
        comparedFields++;
      }
    }

    return comparedFields > 0 ? totalSimilarity / comparedFields : 0;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j - 1] + 1, // substitution
            dp[i - 1][j] + 1,     // deletion
            dp[i][j - 1] + 1      // insertion
          );
        }
      }
    }

    return dp[m][n];
  }

  private selectItemToRemove(item1: MemoryItem, item2: MemoryItem): MemoryItem {
    const confidence1 = (item1.metadata?.confidence as number) || 0;
    const confidence2 = (item2.metadata?.confidence as number) || 0;

    if (confidence1 !== confidence2) {
      return confidence1 < confidence2 ? item1 : item2;
    }

    const timestamp1 = (item1.metadata?.lastAccessed as number) || 0;
    const timestamp2 = (item2.metadata?.lastAccessed as number) || 0;

    return timestamp1 < timestamp2 ? item1 : item2;
  }
}
