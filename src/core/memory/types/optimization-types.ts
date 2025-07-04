/**
 * Types for memory optimization subsystem
 */

/**
 * Memory optimization metrics
 */
export interface OptimizationMetrics {
  timeStarted: number;
  timeCompleted?: number;
  memoryBeforeBytes?: number;
  memoryAfterBytes?: number;
  itemsBeforeCount?: number;
  itemsAfterCount?: number;
  redundancyBefore?: number;
  redundancyAfter?: number;
  fragmentation?: number;
  compressionRatio?: number;
  queryPerformanceImprovement?: number;
}

/**
 * Memory optimization result
 */
export interface OptimizationResult {
  ruleId: string;
  success: boolean;
  changes: {
    itemsModified: number;
    itemsRemoved: number;
    itemsCreated: number;
    subsystemsAffected: string[];
  };
  metrics: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  timestamp: string;
}

/**
 * Memory optimization strategy
 */
export interface OptimizationStrategy {
  id: string;
  name: string;
  description: string;
  targeting: {
    subsystems: string[];
    memoryTypes: string[];
    minimumItemCount?: number;
    minimumRedundancy?: number;
    minimumFragmentation?: number;
  };
  parameters: Record<string, any>;
  priority: number;
  cooldownPeriod: number; // in milliseconds
}

/**
 * Memory optimization pattern
 */
export interface OptimizationPattern {
  id: string;
  name: string;
  description: string;
  detectionQuery: Record<string, any>;
  remediationStrategy: string;
  confidence: number;
  detectedItems?: number;
  impact?: 'high' | 'medium' | 'low';
}

/**
 * Memory optimization status
 */
export enum OptimizationStatus {
  IDLE = 'idle',
  ANALYZING = 'analyzing',
  OPTIMIZING = 'optimizing',
  VALIDATING = 'validating',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Optimization session for tracking a full optimization cycle
 */
export interface OptimizationSession {
  id: string;
  startTime: number;
  endTime?: number;
  status: OptimizationStatus;
  patternsDetected: OptimizationPattern[];
  strategiesApplied: string[];
  metrics: OptimizationMetrics;
  results: OptimizationResult[];
  errors?: string[];
}


/**
 * Defines types for memory optimization operations
 */

/**
 * Statistics from a memory optimization operation
 */
export interface OptimizationStats {
  initialCount: number;
  finalCount: number;
  initialSize: number;
  finalSize: number;
  dedupedCount: number;
  compressedCount: number;
  prunedCount: number;
  consolidatedCount: number;
  duration: number;
  timestamp: string;
}

/**
 * System statistics used for optimization analysis
 */
export interface SystemStats {
  memory: {
    totalItems: number;
    averageItemSize: number;
    subsystems: Record<string, {
      count: number;
      accessFrequency: number;
      avgAccessTime: number;
      avgConfidence: number;
      avgRelevance: number;
      redundancy: number;
      fragmentation: number;
    }>;
  };
  patterns: {
    accessPatterns: Record<string, {
      frequency: number;
      recentQueries: string[];
    }>;
    temporalClusters: any[];
    semanticClusters: any[];
    conceptClusters: any[];
    frequentlyAccessed: any[];
    rarelyAccessed: any[];
  };
}

/**
 * Interface for optimization rule
 */
export interface OptimizationRule {
  id: string;
  name: string;
  description: string;
  triggerCondition: (stats: SystemStats) => boolean;
  action: (stats: SystemStats) => Promise<OptimizationResult>;
  priority: number;
  lastTriggered: number;
  cooldownPeriod: number; // milliseconds
}