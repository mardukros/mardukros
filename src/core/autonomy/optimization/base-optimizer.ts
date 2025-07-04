import { CodePattern } from '../analysis/types.js';
import { OptimizationResult } from './types.js';
import { logger } from "../../utils/logger.js";

export abstract class BaseOptimizer {
  /**
   * Optimize a single pattern
   * @deprecated Use optimize(pattern[]) instead
   */
  async optimize(pattern: CodePattern): Promise<string[]> {
    const result = await this.optimizePatterns([pattern]);
    return result[0]?.changes || [];
  }
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

  /**
   * Optimize multiple patterns
   */
  abstract optimizePatterns(patterns: CodePattern[]): Promise<OptimizationResult[]>;

  /**
   * Measure the impact of an optimization
   */
  abstract measureImpact(): Promise<OptimizationResult['metrics']>;

  async applyOptimization(
    pattern: CodePattern,
  ): Promise<OptimizationResult | null> {
    try {
      const results = await this.optimizePatterns([pattern]);
      const result = results[0];

      if (!result || result.changes.length === 0) {
        return null;
      }

      const metrics = await this.measureImpact();

      logger.info(`Applied optimization for ${pattern.type}`, {
        location: pattern.location,
        changes: result.changes.length,
        metrics,
      });

      return {
        pattern,
        changes: result.changes,
        success: true,
        metrics,
      };
    } catch (error) {
      logger.error(`Error optimizing ${pattern.type}:`, error as Error);
      return null;
    }
  }
}