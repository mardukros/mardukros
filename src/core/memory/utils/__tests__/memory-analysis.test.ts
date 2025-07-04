import { MemoryAnalyzer } from '../memory-analysis.js';
import { BaseMemoryItem } from '../../types/memory-items.js';

describe('Memory Analyzer', () => {
  const analyzer = new MemoryAnalyzer();
  const now = Date.now();

  const createTestItems = (count: number): Map<string, BaseMemoryItem> => {
    const items = new Map<string, BaseMemoryItem>();
    
    for (let i = 0; i < count; i++) {
      items.set(`item${i}`, {
        id: `item${i}`,
        type: i % 2 === 0 ? 'typeA' : 'typeB',
        content: `Test content ${i}`,
        metadata: {
          lastAccessed: now - (i * 3600000), // Each item 1 hour older
          tags: [
            `tag${i % 3}`,
            `category${i % 2}`,
            i % 4 === 0 ? 'common' : `unique${i}`
          ]
        }
      });
    }
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    return items;
  };
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

  describe('analyzeMemory', () => {
    it('should generate complete analysis', async () => {
      const items = createTestItems(10);
      const analysis = await analyzer.analyzeMemory(items);

      expect(analysis.patterns).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.performance).toBeDefined();
    });

    it('should identify access patterns', async () => {
      const items = createTestItems(24);
      const analysis = await analyzer.analyzeMemory(items);

      expect(analysis.patterns.accessFrequency.last_hour).toBeDefined();
      expect(analysis.patterns.accessFrequency.last_day).toBeDefined();
    });

    it('should find type correlations', async () => {
      const items = createTestItems(10);
      const analysis = await analyzer.analyzeMemory(items);

      expect(analysis.patterns.typeCorrelations.typeA).toBeDefined();
      expect(analysis.patterns.typeCorrelations.typeB).toBeDefined();
    });

    it('should identify tag clusters', async () => {
      const items = createTestItems(20);
      const analysis = await analyzer.analyzeMemory(items);

      expect(analysis.patterns.tagClusters.length).toBeGreaterThan(0);
      analysis.patterns.tagClusters.forEach(cluster => {
        expect(cluster.length).toBeGreaterThan(1);
      });
    });
  });

  describe('performance metrics', () => {
    it('should measure query latency', async () => {
      const items = createTestItems(100);
      const analysis = await analyzer.analyzeMemory(items);

      expect(analysis.performance.queryLatency).toBeGreaterThan(0);
    });

    it('should calculate index efficiency', async () => {
      const items = createTestItems(50);
      const analysis = await analyzer.analyzeMemory(items);

      expect(analysis.performance.indexEfficiency).toBeGreaterThan(0);
      expect(analysis.performance.indexEfficiency).toBeLessThanOrEqual(1);
    });
  });

  describe('recommendations', () => {
    it('should generate recommendations based on patterns', async () => {
      const items = createTestItems(100);
      const analysis = await analyzer.analyzeMemory(items);

      expect(analysis.recommendations.length).toBeGreaterThan(0);
      analysis.recommendations.forEach(recommendation => {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
      });
    });
  });
});