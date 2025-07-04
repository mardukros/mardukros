
/**
 * Basic memory query type
 */
export interface MemoryQuery {
  id?: string;
  type?: string;
  tags?: string[];
  content?: string | Record<string, any>;
  confidence?: number;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * Memory response format
 */
export interface MemoryResponse<T = any> {
  items: T[];
  total: number;
  page?: number;
  totalPages?: number;
  query?: MemoryQuery;
}

/**
 * Base memory item interface
 */
export interface MemoryItem {
  id: string;
  type: string;
  content: string | Record<string, any>;
  metadata?: Record<string, any>;
  timestamp?: string;
  tags?: string[];
  confidence?: number;
  relationships?: string[];
}
