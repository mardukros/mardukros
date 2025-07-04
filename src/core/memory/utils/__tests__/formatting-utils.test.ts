import { 
  formatEpisodicEvent, 
  formatRelationship, 
  formatWorkflow 
} from '../formatting-utils.js';
import { 
  EpisodicItem, 
  SemanticItem, 
  ProceduralItem 
} from '../../types/memory-items.js';

describe('Formatting Utilities', () => {
  describe('formatEpisodicEvent', () => {
    it('should format basic event', () => {
      const event: EpisodicItem = {
        id: '1',
        type: 'event',
        content: {
          description: 'Test event',
          timestamp: '2024-01-01T12:00:00Z'
        },
        metadata: {
          importance: 0.5,
          lastAccessed: Date.now(),
          tags: []
        }
      };
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

      const formatted = formatEpisodicEvent(event);
      expect(formatted).toContain('Test event');
      expect(formatted).toContain('2024-01-01T12:00:00Z');
    });

    it('should include context when available', () => {
      const event: EpisodicItem = {
        id: '1',
        type: 'event',
        content: {
          description: 'Test event',
          timestamp: '2024-01-01T12:00:00Z',
          context: 'Test Context'
        },
        metadata: {
          importance: 0.5,
          lastAccessed: Date.now(),
          tags: []
        }
      };

      const formatted = formatEpisodicEvent(event);
      expect(formatted).toContain('(Context: Test Context)');
    });
  });

  describe('formatRelationship', () => {
    it('should format relationships', () => {
      const item: SemanticItem = {
        id: '1',
        type: 'concept',
        content: {
          name: 'Concept A',
          relationships: [{
            type: 'relates_to',
            target: 'Concept B',
            strength: 0.8
          }]
        },
        metadata: {
          confidence: 0.9,
          lastAccessed: Date.now(),
          tags: [],
          category: []
        }
      };

      const formatted = formatRelationship(item);
      expect(formatted[0]).toContain('Concept A relates_to Concept B');
      expect(formatted[0]).toContain('strength: 0.8');
    });
  });

  describe('formatWorkflow', () => {
    it('should format workflow with all details', () => {
      const workflow: ProceduralItem = {
        id: '1',
        type: 'workflow',
        content: {
          title: 'Test Workflow',
          steps: ['Step 1', 'Step 2'],
          prerequisites: ['Prereq 1'],
          estimatedDuration: 60
        },
        metadata: {
          successRate: 0.75,
          lastAccessed: Date.now(),
          tags: [],
          category: [],
          complexity: 3
        }
      };

      const formatted = formatWorkflow(workflow);
      expect(formatted).toContain('Test Workflow');
      expect(formatted).toContain('Duration: 60 minutes');
      expect(formatted).toContain('Complexity: 3/5');
      expect(formatted).toContain('Success Rate: 75%');
      expect(formatted).toContain('Prerequisites: Prereq 1');
      expect(formatted).toContain('1. Step 1');
      expect(formatted).toContain('2. Step 2');
    });
  });
});