import { OptimizationResult } from "../optimization/types.js";
import { RewriteResult } from "../optimization/types.js";

export class OptimizationMetrics {
  calculateMetrics(
    optimizations: OptimizationResult[],
  ): RewriteResult["metrics"] {
    const successfulOpts = optimizations.filter(
      (opt) => opt.success && opt.metrics,
    );

    if (successfulOpts.length === 0) {
      return {
        performanceImprovement: 0,
        memoryOptimization: 0,
        complexityReduction: 0,
      };
    }

    return {
      performanceImprovement: this.calculateAverageMetric(
        successfulOpts,
        "performance",
      ),
      memoryOptimization: this.calculateAverageMetric(successfulOpts, "memory"),
      complexityReduction:
        1 - this.calculateAverageMetric(successfulOpts, "complexity"),
    };
  }

  private calculateAverageMetric(
    optimizations: OptimizationResult[],
    metric: string,
  ): number {
    const values = optimizations
      .map((opt) => opt.metrics?.[metric as keyof typeof opt.metrics])
      .filter(
        (val): val is number => val !== undefined && typeof val === "number",
      );
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
}
