import { CodePattern } from '../analysis/pattern-analyzer.js';

export interface OptimizationResult {
  pattern: CodePattern;
  changes: string[];
  success: boolean;
  metrics?: {
    performance: number;
    memory: number;
    complexity: number;
  };
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