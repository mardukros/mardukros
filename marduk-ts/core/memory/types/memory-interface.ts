import { MemoryItem, MemoryQuery, MemoryResponse } from './base-types.js';
import { 
  DeclarativeMemoryItem,
  EpisodicMemoryItem,
  ProceduralMemoryItem,
  SemanticMemoryItem 
} from './subsystem-types.js';

export type MemoryItemType = 
  | DeclarativeMemoryItem 
  | EpisodicMemoryItem 
  | ProceduralMemoryItem 
  | SemanticMemoryItem;

export interface MemoryInterface<T extends MemoryItem = MemoryItemType> {
  // Core operations
  query(query: MemoryQuery): Promise<MemoryResponse<T>>;
  store(item: T): Promise<void>;
  update(id: string | number, updates: Partial<T>): Promise<void>;
  delete(id: string | number): Promise<void>;

  // Maintenance operations
  cleanup(): Promise<void>;
  createSnapshot(): Promise<void>;
  restoreSnapshot(timestamp: string): Promise<boolean>;

  // Monitoring
  getStats(): Promise<MemoryStats>;
}

export interface MemoryStats {
  itemCount: number;
  memoryUsage: number;
  indexSize: number;
  lastCleanup: Date | null;
  lastPersistence: Date | null;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

export interface MemoryValidation {
  valid: boolean;
  errors: string[];
}

export interface MemoryOptions {
  capacity?: number;
  persistence?: boolean;
  indexing?: string[];
  cleanupThreshold?: number;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  validator: (value: any) => boolean;
  message: string;
}