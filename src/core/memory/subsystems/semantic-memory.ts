// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

import { BaseMemorySubsystem } from './base/memory-subsystem.js';
import { MemoryQuery, MemoryOperationResult } from '../types/memory-types.js';
import { ConceptMemoryItem } from '../types/memory-items.js';
import { logger } from '../../utils/logger.js';

interface SemanticMemoryItem extends Omit<ConceptMemoryItem, 'type'> {
  type: 'concept' | 'relationship' | 'category';
}

export class SemanticMemory extends BaseMemorySubsystem {
  private items: Map<string, SemanticMemoryItem>;

  constructor() {
    super('semantic_memory', {
      capacity: 20000,
      persistence: true,
      indexing: ['type', 'category', 'relationships']
    });
    this.items = new Map();
    this.initializeMemory();
  }

  private async initializeMemory(): Promise<void> {
    try {
      await this.store({
        id: 'concept:chaos-theory',
        type: 'concept',
        content: {
          name: 'Chaos Theory',
          description: 'A branch of mathematics focused on dynamic systems highly sensitive to initial conditions',
          relationships: [
            {
              type: 'is_foundation_for',
              target: 'Dynamic Systems',
              strength: 0.9,
              bidirectional: true
            }
          ]
        },
        metadata: {
          lastAccessed: Date.now(),
          tags: ['mathematics', 'theory', 'systems'],
          confidence: 0.95,
          category: ['mathematics', 'theory', 'systems']
        }
      } as SemanticMemoryItem);
    } catch (error) {
      logger.error('Error initializing semantic memory', error as Error);
    }
  }

  protected async handleMessage(message: any): Promise<void> {
    try {
      if (message.type === 'task' && message.query?.includes('relationship')) {
        const query: MemoryQuery = {
          type: 'concept',
          searchTerm: message.query,
          filter: { 'metadata.confidence': { min: 0.7 } }
        };
        const response = await this.query(query);
        if (response.success && response.items) {
          // Send response using message bus or callback
          logger.info(`Found ${response.items.length} matching items`);
        }
      }
    } catch (error) {
      logger.error('Error handling message in semantic memory', error as Error);
    }
  }

  protected matchesQuery(item: SemanticMemoryItem, query: MemoryQuery): boolean {
    const searchTerm = query.searchTerm || query.term || '';
    
    if (!searchTerm) return true;
    
    const termLower = searchTerm.toLowerCase();
    
    return item.content.name.toLowerCase().includes(termLower) ||
           item.content.description?.toLowerCase().includes(termLower) ||
           (item.metadata.category && 
            Array.isArray(item.metadata.category) && 
            item.metadata.category.some((cat: string) => cat.toLowerCase().includes(termLower)));
  }

  async store(item: SemanticMemoryItem): Promise<MemoryOperationResult> {
    try {
      this.items.set(item.id, item);
      return { success: true, itemId: item.id };
    } catch (error) {
      logger.error('Error storing item in semantic memory', error as Error);
      return { success: false, message: `Failed to store item: ${(error as Error).message}` };
    }
  }

  async query(query: MemoryQuery): Promise<MemoryOperationResult> {
    try {
      const matchingItems = Array.from(this.items.values())
        .filter(item => this.matchesQuery(item, query))
        .slice(0, query.limit || 50);
      
      return { 
        success: true, 
        items: matchingItems,
        message: `Found ${matchingItems.length} matching items`
      };
    } catch (error) {
      logger.error('Error querying semantic memory', error as Error);
      return { success: false, message: `Query failed: ${(error as Error).message}` };
    }
  }

  private formatRelationships(items: SemanticMemoryItem[]): string[] {
    return items.flatMap(item => 
      item.content.relationships?.map(rel => 
        `${item.content.name} ${rel.type} ${rel.target} (strength: ${rel.strength})`
      ) || []
    );
  }
}
