import { CodePattern } from '../analysis/types.js';
import { OptimizationResult } from '../optimization/types.js';
import { logger } from '../../utils/logger.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class OptimizationValidator {
  validatePattern(pattern: CodePattern): ValidationResult {
    const errors: string[] = [];

    if (!pattern.type) {
      errors.push('Pattern must have a type');
    }

    if (!pattern.location) {
      errors.push('Pattern must have a location');
    }

    if (typeof pattern.impact !== 'number' || pattern.impact < 0 || pattern.impact > 1) {
      errors.push('Pattern impact must be a number between 0 and 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateOptimization(result: OptimizationResult): ValidationResult {
    const errors: string[] = [];

    if (!result.pattern) {
      errors.push('Optimization must have a pattern');
    }

    if (!Array.isArray(result.changes)) {
      errors.push('Changes must be an array');
    }

    if (result.metrics) {
      if (typeof result.metrics.performance !== 'number' ||
          typeof result.metrics.memory !== 'number' ||
          typeof result.metrics.complexity !== 'number') {
        errors.push('Metrics must contain valid numbers');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateOptimizationBatch(results: OptimizationResult[]): ValidationResult {
    const errors: string[] = [];
    
    results.forEach((result, index) => {
      const validation = this.validateOptimization(result);
      if (!validation.valid) {
        errors.push(`Optimization ${index}: ${validation.errors.join(', ')}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}