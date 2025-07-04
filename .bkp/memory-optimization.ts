import { MemoryItem } from '../types/base-types.js';
import { MemoryStats } from '../types/memory-interface.js';
import { calculateMemoryUsage } from './memory-cleanup.js';
import { logger } from '../../logging/logger.js';
import { createHash } from 'crypto';

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

/**
 * MemoryOptimizer class responsible for optimizing memory items through compression,
 * deduplication, and indexing. Enhanced for large datasets and resilience.
 */
export class MemoryOptimizer {
  private readonly COMPRESSION_THRESHOLD = 0.8; // 80% of capacity
  private readonly DEDUPLICATION_THRESHOLD = 0.7; // 70% similarity for deduplication
  private readonly BATCH_SIZE = 500; // Increased batch size for better performance with large datasets
  private readonly LARGE_DATASET_THRESHOLD = 10000; // Number of items considered a large dataset
  private readonly MAX_PROCESSING_TIME_MS = 30000; // Max time for optimization operations (30 seconds)
  private readonly MIN_STRING_LENGTH_FOR_ADVANCED_COMPRESSION = 1000; // Minimum length for advanced compression
  private readonly MAX_KEYWORD_LENGTH = 15; // Max length of indexed keywords
  private readonly MAX_ATTEMPTS = 3; // Maximum retry attempts for operations
  
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
  logger.info(`Compressed ${items.size} memory items in batches of ${this.BATCH_SIZE}`);
}

/**
 * Enhanced string compression with multiple strategies based on string characteristics
 * @param str String to compress
 * @returns Compressed string
 */
private async compressString(str: string): Promise<string> {
  // Skip compression for very short strings
  if (str.length < 50) {
    return str.replace(/\s+/g, ' ').trim();
  }
  
  try {
    // For larger strings, use more advanced compression techniques
    if (str.length > 1000) {
      // For very large strings, consider content-aware techniques
      return this.advancedStringCompression(str);
    } else {
      // For medium strings, use simpler techniques
      // First, normalize whitespace
      let compressed = str.replace(/\s+/g, ' ').trim();
      
      // Then apply run-length encoding for repetitive patterns
      compressed = this.applyRunLengthEncoding(compressed);
      
      // Remove redundant phrases if they exist
      compressed = this.removeRedundantPhrases(compressed);
      
      return compressed;
    }
  } catch (error) {
    // In case of error, fall back to basic compression
    logger.warn(`Advanced string compression failed, falling back to basic: ${error instanceof Error ? error.message : 'unknown error'}`);
    return str.replace(/\s+/g, ' ').trim();
  }
}

/**
 * Enhanced object compression with redundancy detection and shared reference tracking
 * @param obj Object to compress
 * @returns Compressed object
 */
private async compressObject(obj: any): Promise<any> {
  // Skip null and undefined
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  // For arrays, process elements
  if (Array.isArray(obj)) {
    const result = [];
    // Detect and handle repeated values in arrays
    const valueMap = new Map();
    
    for (let i = 0; i < obj.length; i++) {
      const value = obj[i];
      // Skip null/undefined array elements
      if (value === null || value === undefined) {
        result.push(value);
        continue;
      }
      
      // For objects and strings, check if we've seen a similar one
      if (typeof value === 'object' || (typeof value === 'string' && value.length > 100)) {
        const fingerprint = this.getValueFingerprint(value);
        if (valueMap.has(fingerprint)) {
          // We've seen a similar value, reference the first occurrence
          const existingIndex = valueMap.get(fingerprint);
          // If highly similar (>90%), reuse the compressed version
          if (typeof value === 'object' && typeof obj[existingIndex] === 'object') {
            const similarity = this.calculateObjectSimilarity(value, obj[existingIndex]);
            if (similarity > 0.9) {
              result.push(result[existingIndex]);
              continue;
            }
          } else if (typeof value === 'string' && typeof obj[existingIndex] === 'string') {
            const similarity = this.calculateStringSimilarity(value, obj[existingIndex]);
            if (similarity > 0.9) {
              result.push(result[existingIndex]);
              continue;
            }
          }
        }
        // Store the index of this value for future reference
        valueMap.set(fingerprint, i);
      }
      
      // Process based on type
      if (typeof value === 'string') {
        result.push(await this.compressString(value));
      } else if (typeof value === 'object') {
        result.push(await this.compressObject(value));
      } else {
        result.push(value);
      }
    }
    return result;
  }
  
  // For objects, process properties
  const compressed: any = {};
  // Map to track already seen values to detect shared references
  const seenValues = new Map();
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip null/undefined values
    if (value === null || value === undefined) continue;
    
    // Process based on type
    if (typeof value === 'string') {
      compressed[key] = await this.compressString(value);
    } else if (typeof value === 'object') {
      // Check if we've seen a highly similar object to avoid redundant storage
      const fingerprint = this.getValueFingerprint(value);
      if (seenValues.has(fingerprint)) {
        const similarValue = seenValues.get(fingerprint);
        // If objects are highly similar (>90%), reuse the compressed version
        if (this.calculateObjectSimilarity(value, similarValue.original) > 0.9) {
          compressed[key] = similarValue.compressed;
          continue;
        }
      }
      
      const compressedValue = await this.compressObject(value);
      compressed[key] = compressedValue;
      // Store for reference
      seenValues.set(fingerprint, { original: value, compressed: compressedValue });
    } else {
      compressed[key] = value;
    }
  }
  
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
 * Optimize memory indexes for better lookup performance
 * Creates specialized indexes based on item types and access patterns
 * @param items Map of memory items
 */
private async optimizeIndexes(items: Map<string | number, MemoryItem>): Promise<void> {
  try {
    logger.info(`Optimizing indexes for ${items.size} items`);
    const startTime = Date.now();
    
    // Skip if there are too few items to benefit from indexing
    if (items.size < 100) {
      logger.info('Skipping index optimization - too few items');
      return;
    }
    
    // Track item categories for specialized indexes
    const categories = new Map<string, MemoryItem[]>();
    const keywordIndex = new Map<string, Set<string | number>>();
    const timeIndex = new Map<string, Map<number, Set<string | number>>>(); // type -> timestamp -> ids
    let indexedItemCount = 0;
    
    // Build indexes based on item properties
    for (const [id, item] of items.entries()) {
      try {
        // Category index
        const category = (item.metadata?.category as string) || 'uncategorized';
        if (!categories.has(category)) {
          categories.set(category, []);
        }
        categories.get(category)!.push(item);
        
        // Keyword index (for string content)
        if (typeof item.content === 'string') {
          // Extract significant words for search
          const keywords = this.extractKeywords(item.content);
          for (const keyword of keywords) {
            if (!keywordIndex.has(keyword)) {
              keywordIndex.set(keyword, new Set());
            }
            keywordIndex.get(keyword)!.add(id);
          }
        }
        
        // Timestamp index for temporal queries
        const timestamp = (item.metadata?.timestamp as number) || 
                         (item.metadata?.lastAccessed as number) || 
                         (item.metadata?.created as number) || 0;
                         
        if (timestamp > 0) {
          // Group by item type and timestamp
          if (!timeIndex.has(item.type)) {
            timeIndex.set(item.type, new Map());
          }
          const typeIndex = timeIndex.get(item.type)!;
          
          // Round timestamp to nearest hour for bucketing
          const timeKey = Math.floor(timestamp / 3600000) * 3600000;
          if (!typeIndex.has(timeKey)) {
            typeIndex.set(timeKey, new Set());
          }
          typeIndex.get(timeKey)!.add(id);
        }
        
        indexedItemCount++;
      } catch (itemError) {
        // Continue with other items even if one fails
        logger.warn(`Failed to index item ${id}: ${itemError instanceof Error ? itemError.message : 'unknown error'}`);
      }
    }
    
    // Store indexes for later use (in a real implementation, you'd persist these)
    (items as any).__indexes = {
      categories,
      keywords: keywordIndex,
      timeIndex,
      lastUpdated: Date.now()
    };
    
    // Analyze and optimize existing indexes
    this.optimizeExistingIndexes(items);
    
    logger.info(`Index optimization completed in ${Date.now() - startTime}ms - indexed ${indexedItemCount}/${items.size} items (${keywordIndex.size} keywords, ${categories.size} categories)`);
  } catch (error) {
    logger.error(`Index optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    // Not throwing error here as index optimization is not critical
  }
}

/**
 * Optimize existing indexes for better performance
 * @param items Map with attached indexes
 */
private optimizeExistingIndexes(items: Map<string | number, MemoryItem>): void {
  // Check if indexes exist
  if (!(items as any).__indexes) {
    return;
  }
  
  try {
    const indexes = (items as any).__indexes;
    
    // Prune keyword index - remove keywords that are too common (appear in >50% of items)
    // as they're not useful for discrimination
    if (indexes.keywords && indexes.keywords instanceof Map) {
      const keywordMap = indexes.keywords as Map<string, Set<string | number>>;
      const keywordsToRemove: string[] = [];
      
      for (const [keyword, itemIds] of keywordMap.entries()) {
        if (itemIds.size > items.size * 0.5) {
          keywordsToRemove.push(keyword);
        }
      }
      
      for (const keyword of keywordsToRemove) {
        keywordMap.delete(keyword);
      }
      
      if (keywordsToRemove.length > 0) {
        logger.debug(`Removed ${keywordsToRemove.length} over-common keywords from index`);
      }
    }
    
    // Update index timestamp
    indexes.lastOptimized = Date.now();
  } catch (error) {
    logger.warn(`Error optimizing existing indexes: ${error instanceof Error ? error.message : 'unknown error'}`);
  }
}

/**
 * Extract meaningful keywords from a string for indexing
 * @param text Text to extract keywords from
 * @returns Array of keywords
 */
private extractKeywords(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Normalize text: lowercase, remove extra whitespace
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  
  // Split into words
  const words = normalized.split(/\W+/).filter(word => {
    // Filter out common stop words and short words
    return word.length >= 3 && 
           word.length <= this.MAX_KEYWORD_LENGTH && 
           !this.isStopWord(word);
  });
  
  // Return unique words
  return Array.from(new Set(words));
}

/**
 * Check if a word is a common stop word
 * @param word Word to check
 * @returns True if it's a stop word
 */
private isStopWord(word: string): boolean {
  const stopWords = new Set([
    'the', 'and', 'but', 'for', 'nor', 'not',
    'with', 'from', 'this', 'that', 'these', 'those',
    'what', 'which', 'who', 'whom', 'whose',
    'when', 'where', 'why', 'how',
    'all', 'any', 'some', 'many', 'few',
    'are', 'was', 'were', 'been', 'being', 
    'have', 'has', 'had', 'does', 'did', 'done',
    'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might',
    'must', 'our', 'your', 'their', 'his', 'her', 'its',
    'there', 'here', 'about', 'above', 'under', 'below'
  ]);
  
  return stopWords.has(word.toLowerCase());
}

/**
 * Detect if a string has repetitive patterns
 * @param str String to analyze 
 * @returns True if repetitive patterns are found
 */
private hasRepetitivePatterns(str: string): boolean {
  // Look for repeated words or phrases
  const repeatedWords = /\b(\w+)\b(?:\s+\w+){0,3}\s+\1\b/i.test(str);
  
  // Look for repeated character sequences
  const repeatedChars = /(\w{3,})\1/i.test(str);
  
  return repeatedWords || repeatedChars;
}

/**
 * Apply run-length encoding to compress repetitive content
 * @param str String to compress
 * @returns Compressed string
 */
private applyRunLengthEncoding(str: string): string {
  // This is a simplified version that focuses on repeated phrases
  // Find repeated phrases (3+ words) and replace them with a shorter form
  let result = str;
  
  // Match phrases that repeat at least once (with 3+ words)
  const phraseRegex = /((?:\b\w+\b[ ,.]?){3,})(?=.*\1)/g;
  const matches = result.match(phraseRegex);
  
  if (matches) {
    // Process unique matches
    const uniqueMatches = Array.from(new Set(matches)).filter(m => m.length > 15);
    
    for (const match of uniqueMatches) {
      const count = (result.match(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      
      // Only compress if there are multiple occurrences and the phrase is substantial
      if (count > 1) {
        // Replace all occurrences after the first with a placeholder
        let replaced = false;
        result = result.replace(new RegExp(match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), (matched) => {
          if (!replaced) {
            replaced = true;
            return matched; // Keep the first occurrence
          }
          return '[...]'; // Replace others with placeholder
        });
      }
    }
  }
  
  return result;
}

/**
 * Remove redundant phrases from text
 * @param str String to optimize
 * @returns Optimized string
 */
private removeRedundantPhrases(str: string): string {
  // List of common redundant phrases and their replacements
  const redundancies = [
    [/\b(repeat|say|state|tell)\s+(again|once more)\b/gi, '$1'],
    [/\b(completely|totally|absolutely|entirely)\s+(eliminate|remove)\b/gi, '$2'],
    [/\blarge\s+in\s+size\b/gi, 'large'],
    [/\bsmall\s+in\s+size\b/gi, 'small'],
    [/\bnew\s+(innovation|invention|creation)\b/gi, '$1'],
    [/\bcollaborate\s+together\b/gi, 'collaborate'],
    [/\bbasic\s+fundamentals\b/gi, 'fundamentals'],
    [/\bfuture\s+plans\b/gi, 'plans'],
    [/\bpast\s+history\b/gi, 'history'],
    [/\bcurrently\s+being\b/gi, 'currently'],
    [/\badvance\s+planning\b/gi, 'planning'],
    [/\bimportant\s+essentials\b/gi, 'essentials'],
    [/\bfinal\s+outcome\b/gi, 'outcome'],
    [/\bunexpected\s+surprise\b/gi, 'surprise'],
    [/\bpersonal\s+opinion\b/gi, 'opinion'],
    [/\bmerge\s+together\b/gi, 'merge'],
    [/\bjoin\s+together\b/gi, 'join'],
    [/\bclose\s+proximity\b/gi, 'proximity']
  ];
  
  let result = str;
  for (const [pattern, replacement] of redundancies) {
    result = result.replace(pattern, replacement as string);
  }
  
  return result;
}

/**
 * Abbreviate common words and phrases in natural language text
 * @param str String to abbreviate
 * @returns Abbreviated string
 */
private abbreviateCommonPhrases(str: string): string {
  // Only apply to longer strings that likely benefit from abbreviation
  if (str.length < 200) {
    return str;
  }
  
  // Common phrases and their abbreviations
  const phrases = [
    [/\bfor example\b/gi, 'e.g.'],
    [/\bthat is\b/gi, 'i.e.'],
    [/\bis equal to\b/gi, '='],
    [/\bis not equal to\b/gi, '≠'],
    [/\bis greater than\b/gi, '>'],
    [/\bis less than\b/gi, '<'],
    [/\bis greater than or equal to\b/gi, '≥'],
    [/\bis less than or equal to\b/gi, '≤'],
    [/\band so on\b/gi, 'etc.'],
    [/\band so forth\b/gi, 'etc.'],
    [/\bapproximately\b/gi, 'approx.'],
    [/\bcontinued\b/gi, 'cont.'],
    [/\bdepartment\b/gi, 'dept.'],
    [/\bgovernment\b/gi, 'govt.'],
    [/\bindependent\b/gi, 'indep.'],
    [/\binternational\b/gi, 'intl.'],
    [/\bmanagement\b/gi, 'mgmt.'],
    [/\bmanufacturing\b/gi, 'mfg.'],
    [/\borganization\b/gi, 'org.'],
    [/\breference\b/gi, 'ref.']
  ];
  
  let result = str;
  for (const [phrase, abbr] of phrases) {
    result = result.replace(phrase, abbr as string);
  }
  
  return result;
}

/**
 * Check if text is natural language vs structured data/code
 * @param text Text to analyze
 * @returns True if likely natural language
 */
private isNaturalLanguageText(text: string): boolean {
  // Skip very short strings
  if (text.length < 100) {
    return true;
  }
  
  // Check if this looks like code/structured data
  const codePatterns = [
    /[{\[\(<>].*[}\]\)]/s, // Matching brackets often indicate code
    /function\s*\(/i, // JavaScript/TypeScript function
    /class\s+\w+/i, // Class definition
    /if\s*\(.*\)\s*[{:]/i, // If statements
    /for\s*\(.*\)\s*[{:]/i, // For loops
    /<\/?\w+.*>/i, // HTML tags
    /\w+\s*:\s*[\w\d"']+/i, // JSON-like key-value pairs
    /\s{2,}\w+/gm // Indentation pattern typical in code
  ];
  
  // If it matches code patterns, it's not natural language
  for (const pattern of codePatterns) {
    if (pattern.test(text)) {
      return false;
    }
  }
  
  // Check for natural language indicators
  const sentences = text.split(/[.!?]+/).length;
  const words = text.split(/\s+/).length;
  
  // Natural text has a reasonable words-per-sentence ratio
  const wordsPerSentence = words / (sentences || 1);
  return wordsPerSentence > 3 && wordsPerSentence < 25;
}

/**
 * Enhanced Levenshtein distance calculation with optimizations for large strings
 * @param str1 First string
 * @param str2 Second string
 * @returns Edit distance between strings
 */
private approximateEditDistance(str1: string, str2: string): number {
  // This is a faster approximation for very large strings
  // It works by sampling substrings and characters
  
  // First, compare lengths
  const lenDiff = Math.abs(str1.length - str2.length);
  let similarity = 1 - (lenDiff / Math.max(str1.length, str2.length));
  
  // Then, compare character frequency distributions
  const freq1 = this.getCharFrequency(str1);
  const freq2 = this.getCharFrequency(str2);
  const freqSimilarity = this.compareFrequencyMaps(freq1, freq2);
  
  // Finally, compare a few random samples from the strings
  const sampleSimilarity = this.compareSampleSubstrings(str1, str2);
  
  // Combine the metrics with appropriate weights
  const combinedSimilarity = similarity * 0.3 + freqSimilarity * 0.4 + sampleSimilarity * 0.3;
  
  // Convert similarity to distance
  return Math.floor((1 - combinedSimilarity) * Math.max(str1.length, str2.length));
}

/**
 * Get character frequency distribution of a string
 * @param str String to analyze
 * @returns Map of character frequencies
 */
private getCharFrequency(str: string): Map<string, number> {
  const result = new Map<string, number>();
  
  for (const char of str) {
    result.set(char, (result.get(char) || 0) + 1);
  }
  
  return result;
}

/**
 * Compare two frequency maps to determine similarity
 * @param map1 First frequency map
 * @param map2 Second frequency map
 * @returns Similarity score (0-1)
 */
private compareFrequencyMaps(map1: Map<string, number>, map2: Map<string, number>): number {
  const allKeys = new Set([...map1.keys(), ...map2.keys()]);
  let totalDiff = 0;
  let totalChars = 0;
  
  for (const key of allKeys) {
    const count1 = map1.get(key) || 0;
    const count2 = map2.get(key) || 0;
    totalDiff += Math.abs(count1 - count2);
    totalChars += Math.max(count1, count2);
  }
  
  return totalChars > 0 ? 1 - (totalDiff / totalChars) : 0;
}

/**
 * Compare sample substrings from two strings for similarity
 * @param str1 First string
 * @param str2 Second string
 * @returns Similarity score (0-1)
 */
private compareSampleSubstrings(str1: string, str2: string): number {
  // Number of samples to take
  const sampleCount = 5;
  let totalSimilarity = 0;
  
  // Sample start positions
  for (let i = 0; i < sampleCount; i++) {
    // Generate sample position - distribute evenly through strings
    const pos1 = Math.floor((str1.length / sampleCount) * i);
    const pos2 = Math.floor((str2.length / sampleCount) * i);
    
    // Sample length - 10% of average string length but max 50 chars
    const sampleLength = Math.min(50, Math.floor((str1.length + str2.length) / 20));
    
    // Extract samples
    const sample1 = str1.substring(pos1, pos1 + sampleLength);
    const sample2 = str2.substring(pos2, pos2 + sampleLength);
    
    // Compare samples with standard Levenshtein (small enough for standard approach)
    const distance = this.levenshteinDistance(sample1, sample2);
    const similarity = 1 - (distance / Math.max(sample1.length, sample2.length));
    
    totalSimilarity += similarity;
  }
  
  return totalSimilarity / sampleCount;
}

/**
 * Get a batch of items for processing
 * @param items Items to batch
 * @returns Array of batches
 */
private batchItems<T>(items: T[]): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
    batches.push(items.slice(i, i + this.BATCH_SIZE));
  }
  return batches;
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
