import { BaseMemoryItem } from './memory-items.js';

/**
 * Memory statistics interface
 */
export interface MemoryStats {
  totalItems: number;
  byType: Record<string, number>;
  lastOptimized?: Date;
  compressionRatio?: number;
  queryLatency?: number;
  indexEfficiency?: number;
  healthStatus?: 'healthy' | 'degraded' | 'critical';
}

/**
 * Memory query options
 */
export interface MemoryQueryOptions {
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Memory subsystem configuration
 */
export interface MemorySubsystemConfig {
  maxItems: number;
  persistenceEnabled: boolean;
  autoOptimize: boolean;
  optimizationInterval: number;
  dataDirectory: string;
  backupDirectory: string;
}

/**
 * Memory operation result
 */
export interface MemoryOperationResult {
  success: boolean;
  message?: string;
  itemId?: string;
}

/**
 * Memory retrieval result
 */
export interface MemoryRetrievalResult<T extends BaseMemoryItem> {
  items: T[];
  totalItems: number;
  queryTime: number;
}

/**
 * Memory validation result
 */
export interface MemoryValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * Hypothetical MemoryItem interface added based on the incomplete change request.
 */
export interface MemoryItem {
  id: string;
  content: string;
  type: string; // Assuming MemoryType is a string for simplicity.  Should be defined elsewhere.
  metadata: any; // Assuming MemoryMetadata is an object. Should be defined elsewhere.
  encoding?: string;
  timestamp: number;
  tags?: string[];
  importance?: number;
}


/**
 * Memory subsystem interface
 */
export interface MemorySubsystem {
  getStats(): Promise<MemoryStats>;
  query(options?: MemoryQueryOptions): Promise<MemoryRetrievalResult<any>>;
  addItem(item: MemoryItem): Promise<MemoryOperationResult>; // Added type to item.
  updateItem(id: string, item: MemoryItem): Promise<MemoryOperationResult>; // Added type to item.
  deleteItem(id: string): Promise<MemoryOperationResult>;
  validate(item: MemoryItem): MemoryValidationResult; // Added type to item.
}