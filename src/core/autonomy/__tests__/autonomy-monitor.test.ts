import { AutonomyMonitor } from '../monitoring/autonomy-monitor.js';
import { CodePattern } from '../analysis/types.js';
import { OptimizationResult } from '../optimization/types.js';

describe('AutonomyMonitor', () => {
  let monitor: AutonomyMonitor;

  beforeEach(() => {
    monitor = new AutonomyMonitor();
  });

  describe('Pattern Statistics', () => {
    it('should track pattern statistics', () => {
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
      const patterns: CodePattern[] = [
        {
          type: 'performance',
          location: 'test',
          description: 'test pattern',
          impact: 0.8
        }
      ];

      monitor.updatePatternStats(patterns);
      const stats = monitor.getStats();

      expect(stats.patterns.total).toBe(1);
      expect(stats.patterns.byType.performance).toBe(1);
      expect(stats.patterns.averageImpact).toBe(0.8);
    });

    it('should calculate pattern type distribution', () => {
      const patterns: CodePattern[] = [
        {
          type: 'performance',
          location: 'test1',
          description: 'test pattern 1',
          impact: 0.8
        },
        {
          type: 'memory',
          location: 'test2',
          description: 'test pattern 2',
          impact: 0.7
        }
      ];

      monitor.updatePatternStats(patterns);
      const stats = monitor.getStats();

      expect(stats.patterns.byType.performance).toBe(1);
      expect(stats.patterns.byType.memory).toBe(1);
    });
  });

  describe('Optimization Statistics', () => {
    it('should track optimization results', () => {
      const optimizations: OptimizationResult[] = [
        {
          pattern: {
            type: 'performance',
            location: 'test',
            description: 'test pattern',
            impact: 0.8
          },
          changes: ['test change'],
          success: true,
          metrics: {
            performance: 0.9,
            memory: 0.8,
            complexity: 0.7
          }
        }
      ];

      monitor.updateOptimizationStats(optimizations);
      const stats = monitor.getStats();

      expect(stats.optimizations.total).toBe(1);
      expect(stats.optimizations.successful).toBe(1);
      expect(stats.optimizations.failed).toBe(0);
    });

    it('should calculate average improvements', () => {
      const optimizations: OptimizationResult[] = [
        {
          pattern: {
            type: 'performance',
            location: 'test1',
            description: 'test pattern 1',
            impact: 0.8
          },
          changes: ['change 1'],
          success: true,
          metrics: {
            performance: 0.9,
            memory: 0.8,
            complexity: 0.7
          }
        },
        {
          pattern: {
            type: 'memory',
            location: 'test2',
            description: 'test pattern 2',
            impact: 0.7
          },
          changes: ['change 2'],
          success: true,
          metrics: {
            performance: 0.7,
            memory: 0.9,
            complexity: 0.8
          }
        }
      ];

      monitor.updateOptimizationStats(optimizations);
      const stats = monitor.getStats();

      expect(stats.optimizations.averageImprovements.performance).toBe(0.8);
      expect(stats.optimizations.averageImprovements.memory).toBe(0.85);
      expect(stats.optimizations.averageImprovements.complexity).toBe(0.75);
    });
  });

  describe('Health Status', () => {
    it('should calculate overall health status', () => {
      const patterns: CodePattern[] = [
        {
          type: 'performance',
          location: 'test',
          description: 'test pattern',
          impact: 0.9
        }
      ];

      const optimizations: OptimizationResult[] = [
        {
          pattern: patterns[0],
          changes: ['test change'],
          success: true,
          metrics: {
            performance: 0.9,
            memory: 0.8,
            complexity: 0.7
          }
        }
      ];

      monitor.updatePatternStats(patterns);
      monitor.updateOptimizationStats(optimizations);

      expect(monitor.getStats().healthStatus).toBe('healthy');
    });

    it('should detect degraded health status', () => {
      const patterns: CodePattern[] = [
        {
          type: 'performance',
          location: 'test',
          description: 'test pattern',
          impact: 0.6
        }
      ];

      const optimizations: OptimizationResult[] = [
        {
          pattern: patterns[0],
          changes: ['test change'],
          success: false,
          metrics: {
            performance: 0.5,
            memory: 0.5,
            complexity: 0.5
          }
        }
      ];

      monitor.updatePatternStats(patterns);
      monitor.updateOptimizationStats(optimizations);

      expect(monitor.getStats().healthStatus).toBe('degraded');
    });
  });
});