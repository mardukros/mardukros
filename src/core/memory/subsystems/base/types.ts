export interface MemoryConfig {
  capacity: number;
  persistence: boolean;
  dataDir: string;
}

export interface MemoryStats {
  itemCount: number;
  memoryUsage: number;
  indexSize: number;
  lastCleanup: Date | null;
  lastPersistence: Date | null;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}