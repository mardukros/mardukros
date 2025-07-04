import { CodePattern } from '../analysis/types.js';

export interface OptimizationResult {
  pattern: CodePattern;
  changes: string[];
  success: boolean;
  metrics?: OptimizationMetrics;
}

export interface OptimizationMetrics {
  performance: number;
  memory: number;
  complexity: number;
}

export interface RewriteResult {
  patterns: CodePattern[];
  optimizations: OptimizationResult[];
  metrics: {
    performanceImprovement: number;
    memoryOptimization: number;
    complexityReduction: number;
  };
}