```typescript
import { CodeOptimizer } from '../code-optimizer.js';
import { CodePattern } from '../code-analyzer.js';

describe('CodeOptimizer', () => {
  let optimizer: CodeOptimizer;

  beforeEach(() => {
    optimizer = new CodeOptimizer();
  });

  const mockPatterns: CodePattern[] = [
    {
      type: 'performance',
      location: 'memory/query-execution',
      description: 'High memory query latency',
      impact: 0.9,
      suggestion: 'Implement caching'
    },
    {
      type: 'memory',
      location: 'core/resources',
      description: 'High memory usage',
      impact: 0.8,
      suggestion: 'Implement pooling'
    }
  ];

  describe('optimizeSystem', () => {
    it('should apply optimizations to high-impact patterns', async () => {
      const results = await optimizer.optimizeSystem(mockPatterns);

      expect(results.length).toBe(2);
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.changes.length).toBeGreaterThan(0);
      });
    });

    it('should include performance metrics for successful optimizations', async () => {
      const results = await optimizer.optimizeSystem(mockPatterns);

      results.forEach(result => {
        expect(result.metrics).toBeDefined();
        expect(result.metrics?.performance).toBeGreaterThan(0);
        expect(result.metrics?.memory).toBeGreaterThan(0);
        expect(result.metrics?.complexity).toBeGreaterThan(0);
      });
    });

    it('should handle different optimization types', async () => {
      const results = await optimizer.optimizeSystem(mockPatterns);
      const optimizationTypes = new Set(results.map(r => r.pattern.type));

      expect(optimizationTypes.size).toBeGreaterThan(1);
    });
  });
});
```