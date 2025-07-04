import { BaseMemorySubsystem } from '../base/memory-subsystem.js';
import { TaskMessage } from '../../types/messages.js';
import { MemoryItem, MemoryQuery } from '../types/memory-types.js';

interface SemanticMemoryItem extends MemoryItem {
  type: 'concept' | 'relationship' | 'category';
  content: {
    name: string;
    description?: string;
    relationships: {
      type: string;
      target: string;
      strength: number;
      bidirectional?: boolean;
    }[];
    properties?: Record<string, unknown>;
  };
  metadata: {
    confidence: number;
    lastAccessed: number;
    category: string[];
    source?: string;
  };
}

export class SemanticMemory extends BaseMemorySubsystem {
  constructor() {
    super('semantic_memory', {
      capacity: 20000,
      persistence: true,
      indexing: ['type', 'category', 'relationships']
    });
    this.initializeMemory();
  }

  private async initializeMemory(): Promise<void> {
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
          },
          {
            type: 'uses',
            target: 'Nonlinear Equations',
            strength: 0.8
          }
        ],
        properties: {
          complexity: 'high',
          applicationDomain: ['mathematics', 'physics', 'complex systems']
        }
      },
      metadata: {
        confidence: 0.95,
        lastAccessed: Date.now(),
        category: ['mathematics', 'theory', 'systems'],
        source: 'academic-research'
      }
    } as SemanticMemoryItem);

    await this.store({
      id: 'concept:dynamic-systems',
      type: 'concept',
      content: {
        name: 'Dynamic Systems',
        description: 'Mathematical models describing behavior of complex systems over time',
        relationships: [
          {
            type: 'uses',
            target: 'Differential Equations',
            strength: 0.9
          },
          {
            type: 'is_studied_by',
            target: 'Chaos Theory',
            strength: 0.9,
            bidirectional: true
          }
        ]
      },
      metadata: {
        confidence: 0.9,
        lastAccessed: Date.now(),
        category: ['mathematics', 'systems', 'modeling'],
        source: 'academic-research'
      }
    } as SemanticMemoryItem);
  }

  protected async handleMessage(message: TaskMessage): Promise<void> {
    if (message.type === 'task') {
      if (message.query.includes('relationship')) {
        const relationships = await this.findRelationships(message.query);
        this.sendResponse(message.task_id, relationships);
      } else if (message.query.includes('concept')) {
        const concepts = await this.findConcepts(message.query);
        this.sendResponse(message.task_id, concepts);
      }
    }
  }

  protected matchesQuery(item: MemoryItem, query: MemoryQuery): boolean {
    const memoryItem = item as SemanticMemoryItem;
    const searchTerm = query.term.toLowerCase();

    // Check name and description match
    if (memoryItem.content.name.toLowerCase().includes(searchTerm) ||
        memoryItem.content.description?.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Check relationships match
    if (memoryItem.content.relationships.some(rel => 
      rel.target.toLowerCase().includes(searchTerm) ||
      rel.type.toLowerCase().includes(searchTerm))) {
      return true;
    }

    // Check category match
    if (memoryItem.metadata.category.some(cat => 
      cat.toLowerCase().includes(searchTerm))) {
      return true;
    }

    return false;
  }

  private async findRelationships(query: string): Promise<string[]> {
    const searchQuery: MemoryQuery = {
      type: 'concept',
      term: query,
      filters: { confidence: { min: 0.7 } }
    };

    const response = await this.query(searchQuery);
    const items = response.items as SemanticMemoryItem[];
    
    return items.flatMap(item => 
      item.content.relationships.map(rel => 
        `${item.content.name} ${rel.type} ${rel.target} (strength: ${rel.strength})`
      )
    );
  }

  private async findConcepts(query: string): Promise<string[]> {
    const searchQuery: MemoryQuery = {
      type: 'concept',
      term: query
    };

    const response = await this.query(searchQuery);
    const items = response.items as SemanticMemoryItem[];

    return items.map(item => {
      let result = `${item.content.name}`;
      if (item.content.description) {
        result += `\n  Description: ${item.content.description}`;
      }
      if (item.content.relationships.length > 0) {
        result += '\n  Relationships:';
        item.content.relationships.forEach(rel => {
          result += `\n    - ${rel.type} ${rel.target} (${rel.strength})`;
        });
      }
      return result;
    });
  }

  // Additional methods for semantic memory specific functionality
  async addConcept(name: string, description: string, category: string[]): Promise<void> {
    const concept: SemanticMemoryItem = {
      id: `concept:${name.toLowerCase().replace(/\s+/g, '-')}`,
      type: 'concept',
      content: {
        name,
        description,
        relationships: []
      },
      metadata: {
        confidence: 0.7, // Initial confidence
        lastAccessed: Date.now(),
        category
      }
    };
    await this.store(concept);
  }

  async addRelationship(
    sourceConcept: string, 
    targetConcept: string, 
    relationType: string, 
    strength: number
  ): Promise<void> {
    const source = Array.from(this.items.values())
      .find(item => (item as SemanticMemoryItem).content.name === sourceConcept) as SemanticMemoryItem;

    if (source) {
      source.content.relationships.push({
        type: relationType,
        target: targetConcept,
        strength
      });
      await this.update(source.id, source);
    }
  }
}