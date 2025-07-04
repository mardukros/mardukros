import { MemoryConfig } from './types/base-types.js';

export const memoryConfigs: Record<string, MemoryConfig> = {
  declarative: {
    capacity: 10000,
    persistence: true,
    indexing: ['type', 'tags', 'content']
  },
  episodic: {
    capacity: 5000,
    persistence: true,
    indexing: ['type', 'timestamp', 'tags']
  },
  procedural: {
    capacity: 5000,
    persistence: true,
    indexing: ['type', 'category', 'tags']
  },
  semantic: {
    capacity: 20000,
    persistence: true,
    indexing: ['type', 'category', 'relationships']
  }
};

export const memoryPaths = {
  dataDir: './data/memory',
  snapshotsDir: './data/memory/snapshots',
  logsDir: './data/memory/logs'
};

export const memorySettings = {
  cleanupThreshold: 0.9, // Cleanup when 90% full
  cleanupAmount: 0.1, // Remove 10% of items
  indexingBatchSize: 1000,
  maxQueryResults: 100,
  persistenceInterval: 5 * 60 * 1000 // 5 minutes
};