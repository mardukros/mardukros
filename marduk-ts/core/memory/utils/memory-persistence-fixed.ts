import { MemoryItem } from '../types/base-types.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { logger } from '../../logging/logger.js';
import { promises as fs } from 'fs';
import { createHash } from 'crypto';

/**
 * Error class for memory persistence issues
 */
export class MemoryPersistenceError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'MemoryPersistenceError';
  }
}

/**
 * Error class for data integrity issues
 */
export class DataIntegrityError extends MemoryPersistenceError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'DataIntegrityError';
  }
}

/**
 * Class responsible for memory persistence operations
 * Provides functionality for saving and loading memory items with
 * data integrity checks, backups, and snapshot capabilities
 */
export class MemoryPersistence {
  private storageDir: string;
  private backupDir: string;
  private maxRetries: number = 3;
  private retryDelayMs: number = 500;
  private integrityCheckEnabled: boolean = true;
  private backupEnabled: boolean = true;
  private maxBatchSize: number = 2000;

  /**
   * Constructor for MemoryPersistence with configuration options
   * @param subsystemName Name of the subsystem for memory segregation
   * @param options Configuration options for memory persistence
   */
  constructor(subsystemName: string, options: {
    baseDir?: string;
    enableIntegrityCheck?: boolean;
    enableBackup?: boolean;
    maxRetries?: number;
    retryDelayMs?: number;
    maxBatchSize?: number;
  } = {}) {
    const baseDir = options.baseDir || 'data';
    this.storageDir = join(baseDir, 'memory', subsystemName);
    this.backupDir = join(baseDir, 'memory', '_backups', subsystemName);
    
    // Configure options with defaults
    if (options.enableIntegrityCheck !== undefined) this.integrityCheckEnabled = options.enableIntegrityCheck;
    if (options.enableBackup !== undefined) this.backupEnabled = options.enableBackup;
    if (options.maxRetries !== undefined) this.maxRetries = options.maxRetries;
    if (options.retryDelayMs !== undefined) this.retryDelayMs = options.retryDelayMs;
    if (options.maxBatchSize !== undefined) this.maxBatchSize = options.maxBatchSize;
    
    // Initialize directories
    this.ensureStorageDirectory();
  }

  /**
   * Ensures storage directories exist
   */
  private ensureStorageDirectory(): void {
    try {
      // Create main storage directory
      if (!existsSync(this.storageDir)) {
        mkdirSync(this.storageDir, { recursive: true });
        logger.info(`Created storage directory: ${this.storageDir}`);
      }
      
      // Create backup directory if enabled
      if (this.backupEnabled && !existsSync(this.backupDir)) {
        mkdirSync(this.backupDir, { recursive: true });
        logger.info(`Created backup directory: ${this.backupDir}`);
      }
      
      // Create snapshots directory
      const snapshotDir = join(this.storageDir, 'snapshots');
      if (!existsSync(snapshotDir)) {
        mkdirSync(snapshotDir, { recursive: true });
        logger.info(`Created snapshot directory: ${snapshotDir}`);
      }
    } catch (error) {
      const message = `Failed to create storage directories: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(message);
      throw new MemoryPersistenceError(message, error instanceof Error ? error : undefined);
    }
  }
  
  /**
   * Calculate checksum for data to verify integrity
   * @param data The data to calculate checksum for
   * @returns SHA-256 checksum of the data
   */
  private calculateChecksum(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }
  
  /**
   * Creates a backup of a file before modifying it
   * @param filePath Path to the file to backup
   */
  private async createBackup(filePath: string): Promise<void> {
    if (!this.backupEnabled) return;
    
    try {
      if (await this.fileExists(filePath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `${filePath.split('/').pop()}.${timestamp}.bak`;
        const backupPath = join(this.backupDir, backupFileName);
        
        // Ensure backup directory exists
        await fs.mkdir(dirname(backupPath), { recursive: true });
        
        // Copy file to backup location
        await fs.copyFile(filePath, backupPath);
        logger.debug(`Created backup: ${backupPath}`);
      }
    } catch (error) {
      // Log but don't throw - backups are helpful but not critical
      logger.warn(`Failed to create backup for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Sleep for a specified duration
   * @param ms Milliseconds to sleep
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Check if a file exists
   * @param filePath Path to file
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Retry a function with exponential backoff
   * @param operation Function to retry
   * @param retries Maximum number of retries
   * @param delayMs Base delay in milliseconds
   * @returns Result of the operation
   */
  private async retry<T>(
    operation: () => Promise<T>, 
    retries: number = this.maxRetries, 
    delayMs: number = this.retryDelayMs
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < retries) {
          const delay = delayMs * Math.pow(2, attempt); // Exponential backoff
          logger.warn(`Attempt ${attempt + 1}/${retries + 1} failed, retrying in ${delay}ms: ${lastError.message}`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError || new Error('Operation failed after retries with unknown error');
  }
  
  /**
   * Verify file integrity using checksums stored in companion file
   * @param filePath Path to file to verify
   * @param content Content of the file
   */
  private async verifyFileIntegrity(filePath: string, content: string): Promise<void> {
    const checksumFile = `${filePath}.checksum`;
    
    if (!await this.fileExists(checksumFile)) {
      logger.warn(`No checksum file found for ${filePath}, skipping integrity check`);
      return;
    }
    
    try {
      const storedChecksum = (await fs.readFile(checksumFile, 'utf-8')).trim();
      const calculatedChecksum = this.calculateChecksum(content);
      
      if (storedChecksum !== calculatedChecksum) {
        throw new DataIntegrityError(
          `Data integrity check failed for ${filePath}: checksums do not match`
        );
      }
      
      logger.debug(`Data integrity verified for ${filePath}`);
    } catch (error) {
      if (error instanceof DataIntegrityError) throw error;
      
      throw new DataIntegrityError(
        `Failed to verify data integrity: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Find the latest backup file for a given file
   * @param originalFile Original file path
   * @returns Path to latest backup if exists, null otherwise
   */
  private async findLatestBackup(originalFile: string): Promise<string | null> {
    try {
      const fileName = originalFile.split('/').pop();
      const backupFiles = await fs.readdir(this.backupDir);
      
      // Filter backups for this file and sort by timestamp (newest first)
      const relevantBackups = backupFiles
        .filter(file => file.startsWith(`${fileName}.`))
        .sort((a, b) => b.localeCompare(a)); // Sort descending
      
      if (relevantBackups.length > 0) {
        return join(this.backupDir, relevantBackups[0]);
      }
      
      return null;
    } catch (error) {
      logger.error(`Error finding backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }
  
  /**
   * Restore from a backup file
   * @param backupFile Path to backup file
   * @returns Map of restored memory items
   */
  private async restoreFromBackup(backupFile: string): Promise<Map<string | number, MemoryItem>> {
    try {
      const fileContent = await fs.readFile(backupFile, 'utf-8');
      const items = JSON.parse(fileContent);
      const result = new Map<string | number, MemoryItem>();
      
      if (Array.isArray(items)) {
        for (const item of items) {
          if (this.isValidMemoryItem(item)) {
            result.set(item.id, item);
          }
        }
      }
      
      logger.info(`Restored ${result.size} items from backup ${backupFile}`);
      return result;
    } catch (error) {
      logger.error(`Failed to restore from backup: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return new Map(); // Return empty map if restore fails
    }
  }
  
  /**
   * Validate a memory item
   * @param item Item to validate
   * @returns Whether the item is valid
   */
  private isValidMemoryItem(item: any): item is MemoryItem {
    return (
      item &&
      typeof item === 'object' &&
      (typeof item.id === 'string' || typeof item.id === 'number') &&
      typeof item.type === 'string' &&
      item.content !== undefined
    );
  }
  
  /**
   * Load memory items with enhanced error handling, integrity checks, and retry logic
   * @returns Map of memory items
   */
  async loadItems(): Promise<Map<string | number, MemoryItem>> {
    const itemsFile = join(this.storageDir, 'items.json');
    const result = new Map<string | number, MemoryItem>();

    if (!await this.fileExists(itemsFile)) {
      logger.info(`No memory items file found at ${itemsFile}, returning empty map`);
      return result;
    }

    try {
      // Use retry logic to handle transient file system errors
      return await this.retry(async () => {
        const fileContent = await fs.readFile(itemsFile, 'utf-8');
        
        // Integrity check if enabled
        if (this.integrityCheckEnabled) {
          await this.verifyFileIntegrity(itemsFile, fileContent);
        }
        
        try {
          const items = JSON.parse(fileContent);
          
          // Validate the parsed data
          if (!Array.isArray(items)) {
            throw new DataIntegrityError(`Memory items file does not contain an array of items`);
          }
          
          // Process items with validation
          let loadedCount = 0;
          let skippedCount = 0;
          
          for (const item of items) {
            if (this.isValidMemoryItem(item)) {
              result.set(item.id, item);
              loadedCount++;
            } else {
              logger.warn(`Skipping invalid memory item: ${JSON.stringify(item).substring(0, 100)}...`);
              skippedCount++;
            }
          }
          
          logger.info(`Loaded ${loadedCount} memory items, skipped ${skippedCount} invalid items`);
          return result;
        } catch (error) {
          // Check if there's a backup to restore from
          if (this.backupEnabled) {
            const backupItem = await this.findLatestBackup(itemsFile);
            if (backupItem) {
              logger.warn(`Attempting to restore from backup: ${backupItem}`);
              return await this.restoreFromBackup(backupItem);
            }
          }
          
          throw new DataIntegrityError(
            `Failed to parse memory items: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error instanceof Error ? error : undefined
          );
        }
      });
    } catch (error) {
      logger.error(`Error loading memory items: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Return empty map rather than throwing to allow system to continue operation
      return result;
    }
  }

  /**
   * Save memory items with enhanced error handling, integrity checks, and backups
   * Uses atomic write pattern to prevent data corruption
   * @param items Map of memory items to save
   */
  async saveItems(items: Map<string | number, MemoryItem>): Promise<void> {
    const itemsFile = join(this.storageDir, 'items.json');
    const itemsArray = Array.from(items.values());
    
    // For very large collections, use batched saving
    if (itemsArray.length > this.maxBatchSize) {
      logger.info(`Large memory collection detected (${itemsArray.length} items), using batched saving`);
      return this.saveLargeItemCollection(items);
    }

    try {
      // Create backup of existing file
      await this.createBackup(itemsFile);
      
      // Use a temporary file for atomic write
      const tempFile = `${itemsFile}.tmp`;
      const content = JSON.stringify(itemsArray, null, 2);
      
      // Write to temp file first
      await fs.writeFile(tempFile, content, 'utf-8');
      
      // Calculate and save checksum if integrity check is enabled
      if (this.integrityCheckEnabled) {
        const checksum = this.calculateChecksum(content);
        await fs.writeFile(`${tempFile}.checksum`, checksum, 'utf-8');
      }
      
      // Rename temp file to target file (atomic operation)
      await fs.rename(tempFile, itemsFile);
      
      // Move checksum file if needed
      if (this.integrityCheckEnabled && await this.fileExists(`${tempFile}.checksum`)) {
        await fs.rename(`${tempFile}.checksum`, `${itemsFile}.checksum`);
      }
      
      logger.info(`Successfully saved ${itemsArray.length} memory items to ${itemsFile}`);
    } catch (error) {
      const message = `Error saving memory items: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(message);
      throw new MemoryPersistenceError(message, error instanceof Error ? error : undefined);
    }
  }
  
  /**
   * Save a large collection of items in batches to minimize memory usage
   * @param items Large map of memory items
   */
  private async saveLargeItemCollection(items: Map<string | number, MemoryItem>): Promise<void> {
    const batchDir = join(this.storageDir, 'batches');
    
    try {
      // Ensure batch directory exists
      await fs.mkdir(batchDir, { recursive: true });
      
      // Clear existing batch files
      const existingBatches = await fs.readdir(batchDir);
      for (const batch of existingBatches) {
        await fs.unlink(join(batchDir, batch));
      }
      
      // Convert to array for batching
      const itemsArray = Array.from(items.values());
      const totalItems = itemsArray.length;
      const batchSize = this.maxBatchSize;
      const batchCount = Math.ceil(totalItems / batchSize);
      
      logger.info(`Saving ${totalItems} items in ${batchCount} batches of ${batchSize} items each`);
      
      // Save each batch to a separate file
      for (let i = 0; i < batchCount; i++) {
        const start = i * batchSize;
        const end = Math.min(start + batchSize, totalItems);
        const batchItems = itemsArray.slice(start, end);
        const batchFile = join(batchDir, `batch_${i.toString().padStart(5, '0')}.json`);
        
        const content = JSON.stringify(batchItems, null, 2);
        await fs.writeFile(batchFile, content, 'utf-8');
        
        // Save checksum if enabled
        if (this.integrityCheckEnabled) {
          const checksum = this.calculateChecksum(content);
          await fs.writeFile(`${batchFile}.checksum`, checksum, 'utf-8');
        }
        
        logger.debug(`Saved batch ${i+1}/${batchCount} with ${batchItems.length} items`);
      }
      
      // Create an index file to track all batches
      const indexFile = join(batchDir, 'index.json');
      const indexContent = JSON.stringify({
        totalItems,
        batchCount,
        batchSize,
        timestamp: new Date().toISOString(),
        batches: Array.from({length: batchCount}, (_, i) => `batch_${i.toString().padStart(5, '0')}.json`)
      }, null, 2);
      
      await fs.writeFile(indexFile, indexContent, 'utf-8');
      logger.info(`Successfully saved ${totalItems} items in ${batchCount} batches`);
    } catch (error) {
      const message = `Error saving large item collection: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(message);
      throw new MemoryPersistenceError(message, error instanceof Error ? error : undefined);
    }
  }
  
  /**
   * Create a timestamped snapshot of the current memory state
   * Enhanced with integrity checks and proper error handling
   */
  async saveSnapshot(): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotPath = join(this.storageDir, 'snapshots', `snapshot-${timestamp}.json`);

    try {
      // Load current items
      const items = await this.loadItems();
      if (items.size === 0) {
        logger.warn('No memory items to snapshot, skipping');
        return;
      }
      
      // Convert to array for storage
      const itemsArray = Array.from(items.values());
      const content = JSON.stringify(itemsArray, null, 2);
      
      // Ensure snapshots directory exists
      const snapshotsDir = join(this.storageDir, 'snapshots');
      await fs.mkdir(snapshotsDir, { recursive: true });
      
      // Write snapshot file
      await fs.writeFile(snapshotPath, content, 'utf-8');
      
      // Create checksum if integrity checks enabled
      if (this.integrityCheckEnabled) {
        const checksum = this.calculateChecksum(content);
        await fs.writeFile(`${snapshotPath}.checksum`, checksum, 'utf-8');
      }
      
      logger.info(`Created memory snapshot with ${items.size} items at ${snapshotPath}`);
    } catch (error) {
      const message = `Error creating memory snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(message);
      throw new MemoryPersistenceError(message, error instanceof Error ? error : undefined);
    }
  }
  
  /**
   * Load a memory snapshot by timestamp
   * Enhanced with integrity verification and better error handling
   * @param timestamp Timestamp identifier for the snapshot to load
   * @returns Map of memory items or null if snapshot not found/invalid
   */
  async loadSnapshot(timestamp: string): Promise<Map<string | number, MemoryItem> | null> {
    const snapshotPath = join(this.storageDir, 'snapshots', `snapshot-${timestamp}.json`);

    try {
      if (!await this.fileExists(snapshotPath)) {
        logger.warn(`Snapshot not found at ${snapshotPath}`);
        return null;
      }
      
      // Read snapshot file
      const fileContent = await fs.readFile(snapshotPath, 'utf-8');
      
      // Verify integrity if enabled
      if (this.integrityCheckEnabled) {
        try {
          await this.verifyFileIntegrity(snapshotPath, fileContent);
        } catch (integrityError) {
          logger.error(`Integrity check failed for snapshot: ${integrityError instanceof Error ? integrityError.message : 'Unknown error'}`);
          return null;
        }
      }
      
      // Parse snapshot content
      const items = new Map<string | number, MemoryItem>();
      const parsedItems = JSON.parse(fileContent);
      
      if (Array.isArray(parsedItems)) {
        // New format (array of items)
        for (const item of parsedItems) {
          if (this.isValidMemoryItem(item)) {
            items.set(item.id, item);
          }
        }
      } else {
        // Legacy format (object with id keys)
        Object.entries(parsedItems).forEach(([id, item]) => {
          if (this.isValidMemoryItem(item as any)) {
            items.set(id, item as MemoryItem);
          }
        });
      }
      
      logger.info(`Loaded memory snapshot from ${timestamp} with ${items.size} items`);
      return items;
    } catch (error) {
      const message = `Error loading memory snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error(message);
      return null; // Return null instead of throwing to allow graceful fallback
    }
  }
  
  /**
   * Legacy method - redirects to new implementation
   */
  async saveMemoryItems(items: Map<string | number, MemoryItem>, batchSize = 1000): Promise<void> {
    logger.warn('saveMemoryItems is deprecated, use saveItems instead');
    this.maxBatchSize = batchSize; // Use the provided batch size
    return this.saveItems(items);
  }
  
  /**
   * Legacy method - redirects to new implementation
   */
  async loadMemoryItems(): Promise<Map<string | number, MemoryItem>> {
    logger.warn('loadMemoryItems is deprecated, use loadItems instead');
    return this.loadItems();
  }
  
  /**
   * Legacy method - redirects to ensureStorageDirectory
   * @private
   */
  private async ensureStorageDirExists(): Promise<void> {
    logger.warn('ensureStorageDirExists is deprecated, use ensureStorageDirectory instead');
    this.ensureStorageDirectory();
  }
}
