import { BaseMemorySubsystem } from '../base/memory-subsystem.js';
import { TaskMessage } from '../../types/messages.js';
import { MemoryItem, MemoryQuery } from '../types/memory-types.js';

interface DeclarativeMemoryItem extends MemoryItem {
  type: 'fact' | 'concept' | 'rule';
  content: string;
  metadata: {
    tags: string[];
    confidence: number;
    lastAccessed: number;
    source?: string;
  };
}

export class DeclarativeMemory extends BaseMemorySubsystem {
  constructor() {
    super('declarative_memory', {
      capacity: 10000,
      persistence: true,
      indexing: ['type', 'tags']
    });
    this.initializeMemory();
  }

  private async initializeMemory(): Promise<void> {
    await this.store({
      id: 'fact:chaos-theory',
      type: 'fact',
      content: 'Chaos theory studies the behavior of dynamical systems that are highly sensitive to initial conditions.',
      metadata: {
        tags: ['chaos-theory', 'mathematics', 'systems'],
        confidence: 0.95,
        lastAccessed: Date.now(),
        source: 'academic-research'
      }
    } as DeclarativeMemoryItem);

    await this.store({
      id: 'fact:dynamic-systems',
      type: 'fact',
      content: 'Dynamic systems are mathematical models that describe the behavior of complex systems over time.',
      metadata: {
        tags: ['dynamic-systems', 'mathematics', 'modeling'],
        confidence: 0.9,
        lastAccessed: Date.now(),
        source: 'academic-research'
      }
    } as DeclarativeMemoryItem);
  }

  protected async handleMessage(message: TaskMessage): Promise<void> {
    if (message.type === 'task' && message.query.includes('fact')) {
      const query: MemoryQuery = {
        type: 'fact',
        term: message.query,
        filters: { confidence: { min: 0.8 } }
      };

      const response = await this.query(query);
      this.sendResponse(message.task_id, response.items.map(item => item.content));
    }
  }

  protected matchesQuery(item: MemoryItem, query: MemoryQuery): boolean {
    const memoryItem = item as DeclarativeMemoryItem;
    const searchTerm = query.term.toLowerCase();
    
    // Check content match
    if (memoryItem.content.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Check tags match
    if (memoryItem.metadata.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm))) {
      return true;
    }

    return false;
  }
}