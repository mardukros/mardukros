import { logger } from '../../utils/logger.js';
import { CodePattern } from '../analysis/types.js';
import { OptimizationResult } from '../optimization/types.js';

export interface AutonomyStats {
  patterns: {
    total: number;
    byType: Record<CodePattern['type'], number>;
    averageImpact: number;
  };
  optimizations: {
    total: number;
    successful: number;
    failed: number;
    averageImprovements: {
      performance: number;
      memory: number;
      complexity: number;
    };
  };
  lastRun: string;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
}

export class AutonomyMonitor {
  private stats: AutonomyStats = this.getInitialStats();

  updatePatternStats(patterns: CodePattern[]): void {
    const byType = patterns.reduce((acc, pattern) => {
      acc[pattern.type] = (acc[pattern.type] || 0) + 1;
      return acc;
    }, {} as Record<CodePattern['type'], number>);

    const averageImpact = patterns.reduce((sum, p) => sum + p.impact, 0) / patterns.length;

    this.stats.patterns = {
      total: patterns.length,
      byType,
      averageImpact
    };

    this.checkHealth();
    logger.info('Updated pattern stats', { patterns: this.stats.patterns });
  }

  updateOptimizationStats(optimizations: OptimizationResult[]): void {
    const successful = optimizations.filter(opt => opt.success);
    const improvements = successful.reduce((acc, opt) => {
      if (opt.metrics) {
        acc.performance += opt.metrics.performance;
        acc.memory += opt.metrics.memory;
        acc.complexity += opt.metrics.complexity;
      }
      return acc;
    }, { performance: 0, memory: 0, complexity: 0 });

    const count = successful.length;
    this.stats.optimizations = {
      total: optimizations.length,
      successful: count,
      failed: optimizations.length - count,
      averageImprovements: {
        performance: count ? improvements.performance / count : 0,
        memory: count ? improvements.memory / count : 0,
        complexity: count ? improvements.complexity / count : 0
      }
    };
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    this.stats.lastRun = new Date().toISOString();
    this.checkHealth();
    logger.info('Updated optimization stats', { optimizations: this.stats.optimizations });
  }

  private checkHealth(): void {
    const prevStatus = this.stats.healthStatus;
    
    // Check optimization success rate
    const successRate = this.stats.optimizations.successful / 
      (this.stats.optimizations.total || 1);

    // Check pattern impact
    const highImpactPatterns = this.stats.patterns.averageImpact > 0.7;

    if (successRate > 0.8 && highImpactPatterns) {
      this.stats.healthStatus = 'healthy';
    } else if (successRate < 0.5 || this.stats.patterns.averageImpact < 0.4) {
      this.stats.healthStatus = 'unhealthy';
    } else {
      this.stats.healthStatus = 'degraded';
    }

    if (prevStatus !== this.stats.healthStatus) {
      logger.info('Autonomy health status changed', {
        from: prevStatus,
        to: this.stats.healthStatus
      });
    }
  }

  getStats(): AutonomyStats {
    return { ...this.stats };
  }

  private getInitialStats(): AutonomyStats {
    return {
      patterns: {
        total: 0,
        byType: {
          performance: 0,
          memory: 0,
          pattern: 0,
          optimization: 0,
          complexity: 0,
          redundancy: 0,
          inefficiency: 0,
          type_issue: 0,
          architectural: 0
        },
        averageImpact: 0
      },
      optimizations: {
        total: 0,
        successful: 0,
        failed: 0,
        averageImprovements: {
          performance: 0,
          memory: 0,
          complexity: 0
        }
      },
      lastRun: new Date().toISOString(),
      healthStatus: 'healthy'
    };
  }
}