// Memory types for the Marduk cognitive architecture
import { BaseMemoryItem } from './memory-items.js';

export interface MemoryQuery {
  type?: string;
  filter?: Record<string, any>;
  searchTerm?: string;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  term?: string; // For backward compatibility
}

export interface MemoryItem extends BaseMemoryItem {
  // Base interface for memory items, detailed in memory-items.ts
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface MemoryStats {
  totalItems: number;
  byType: Record<string, number>;
  lastOptimized?: Date;
  compressionRatio?: number;
}

export interface MemoryOperationResult {
  success: boolean;
  message?: string;
  itemId?: string;
  items?: MemoryItem[];
}

export interface MemoryOptimizationResult {
  success: boolean;
  itemsOptimized: number;
  spaceReclaimed?: number;
  duration: number;
  details?: string;
}

export type MemorySubsystemType = 'semantic' | 'episodic' | 'procedural' | 'declarative';

export interface MemorySubsystemConfig {
  id: string;
  type: MemorySubsystemType;
  capacity: number;
  persistence: boolean;
  indexing: string[];
  optimizationFrequency?: number;
}

export interface MemoryIndexConfig {
  field: string;
  unique?: boolean;
  multiValue?: boolean;
}

export interface MemoryResponse<T> {
  items: T[];
  count: number;
  query: {
    type: string;
    filters?: Record<string, any>;
  };
}