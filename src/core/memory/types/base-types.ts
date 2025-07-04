/**
 * Base types for memory subsystem
 */

export interface MemoryQuery {
  id?: string;
  type?: string;
  tags?: string[];
  content?: any;
  contentMatch?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minConfidence?: number;
  filters?: {
    searchTerm?: string;
    [key: string]: any;
  };
}

export interface MemoryResponse<T = any> {
  items: T[];
  total: number;
  itemCount: number; // Added itemCount field
  executionTime?: number;
  stats?: {
    itemsSearched: number;
    itemsMatched: number;
    matchScores?: Record<string, number>;
  };
}

import { MemorySubsystem } from './memory-interface.js';

export interface MemoryItem {
  id: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  data: any;
  metadata: {
    [key: string]: any;
  };
}