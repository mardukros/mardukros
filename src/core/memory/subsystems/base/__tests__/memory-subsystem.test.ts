import { BaseMemorySubsystem, MemoryConfig } from '../memory-subsystem.js';
import { BaseMemoryItem } from '../../../types/memory-items.js';

interface TestItem extends BaseMemoryItem {
  content: string;
}

class TestMemorySubsystem extends BaseMemorySubsystem<TestItem> {
  constructor(config: MemoryConfig) {
    super('test_memory', config);
  }
}

describe('BaseMemorySubsystem', () => {
  let subsystem: TestMemorySubsystem;
  const config: MemoryConfig = {
    capacity: 100,
    persistence: false,
    dataDir: './test-data'
  };

  beforeEach(() => {
    subsystem = new TestMemorySubsystem(config);
  });

  describe('Basic Operations', () => {
    it('should store and retrieve items', async () => {
      const item: TestItem = {
        id: 'test1',
        type: 'test',
        content: 'Test content',
        metadata: {
          lastAccessed: Date.now(),
          tags: ['test']
        }
      };

      await subsystem.store(item);
      const result = await subsystem.query({ type: 'test', term: 'Test' });
      
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('test1');
    });

    it('should update items', async () => {
      const item: TestItem = {
        id: 'test1',
        type: 'test',
        content: 'Original content',
        metadata: {
          lastAccessed: Date.now(),
          tags: ['test']
        }
      };

      await subsystem.store(item);
      await subsystem.update('test1', { content: 'Updated content' });
      
      const result = await subsystem.query({ type: 'test', term: 'Updated' });
      expect(result.items[0].content).toBe('Updated content');
    });

    it('should delete items', async () => {
      const item: TestItem = {
        id: 'test1',
        type: 'test',
        content: 'Test content',
        metadata: {
          lastAccessed: Date.now(),
          tags: ['test']
        }
      };
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

      await subsystem.store(item);
      await subsystem.delete('test1');
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
      
      const result = await subsystem.query({ type: 'test', term: 'Test' });
      expect(result.items).toHaveLength(0);
    });
  });

  describe('Health Monitoring', () => {
    it('should provide health stats', async () => {
      const stats = subsystem.getStats();
      expect(stats.healthStatus).toBe('healthy');
    });
  });

  describe('Optimization', () => {
    it('should optimize when needed', async () => {
      // Add many items to trigger optimization
      const items = Array.from({ length: 90 }, (_, i) => ({
        id: `test${i}`,
        type: 'test',
        content: `Test content ${i}`,
        metadata: {
          lastAccessed: Date.now(),
          tags: ['test']
        }
      }));

      for (const item of items) {
        await subsystem.store(item);
      }

      await subsystem.optimize();
      const stats = subsystem.getStats();
      expect(stats.healthStatus).toBe('healthy');
    });
  });
});
import { SemanticMemory } from '../../semantic-memory.js';
import { MemoryQuery } from '../../../types/memory-types.js';
import { ConceptMemoryItem } from '../../../types/memory-items.js';

describe('SemanticMemory', () => {
  let semanticMemory: SemanticMemory;

  beforeEach(() => {
    semanticMemory = new SemanticMemory();
  });

  test('should initialize with seed concepts', async () => {
    const query: MemoryQuery = {
      type: 'concept',
      searchTerm: 'Chaos'
    };
    
    const result = await semanticMemory.query(query);
    
    expect(result.success).toBe(true);
    expect(result.items?.length).toBeGreaterThan(0);
    if (result.items && result.items.length > 0) {
      const item = result.items[0] as ConceptMemoryItem;
      expect(item.content.name).toContain('Chaos');
    }
  });

  test('should store and retrieve a new concept', async () => {
    const newConcept = {
      id: 'concept:recursion',
      type: 'concept',
      content: {
        name: 'Recursion',
        description: 'A method where the solution depends on solutions to smaller instances of the same problem',
        relationships: [
          {
            type: 'related_to',
            target: 'Algorithms',
            strength: 0.85,
            bidirectional: true
          }
        ]
      },
      metadata: {
        lastAccessed: Date.now(),
        tags: ['computer science', 'algorithms', 'programming'],
        confidence: 0.95,
        category: ['computer science', 'algorithms']
      }
    } as ConceptMemoryItem;
    
    const storeResult = await semanticMemory.store(newConcept);
    expect(storeResult.success).toBe(true);
    
    const query: MemoryQuery = {
      searchTerm: 'Recursion'
    };
    
    const queryResult = await semanticMemory.query(query);
    expect(queryResult.success).toBe(true);
    expect(queryResult.items?.length).toBeGreaterThan(0);
    
    if (queryResult.items && queryResult.items.length > 0) {
      const item = queryResult.items[0] as ConceptMemoryItem;
      expect(item.content.name).toBe('Recursion');
      expect(item.content.relationships?.length).toBe(1);
    }
  });
});
