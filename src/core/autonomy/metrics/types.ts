import { OptimizationResult, RewriteResult } from '../optimization/types.js';

export interface MetricsCalculator {
  calculateMetrics(optimizations: OptimizationResult[]): RewriteResult['metrics'];
}

export interface MetricsConfig {
  performanceWeight: number;
  memoryWeight: number;
  complexityWeight: number;
}