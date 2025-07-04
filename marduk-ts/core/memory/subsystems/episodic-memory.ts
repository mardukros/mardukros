import { BaseMemorySubsystem } from '../base/memory-subsystem.js';
import { TaskMessage } from '../../types/messages.js';
import { MemoryItem, MemoryQuery } from '../types/memory-types.js';

interface EpisodicMemoryItem extends MemoryItem {
  type: 'event' | 'experience' | 'observation';
  content: {
    description: string;
    timestamp: string;
    context?: string;
    actors?: string[];
    location?: string;
  };
  metadata: {
    importance: number;
    lastAccessed: number;
    tags: string[];
    emotionalValence?: number; // -1 to 1 scale
  };
}

export class EpisodicMemory extends BaseMemorySubsystem {
  constructor() {
    super('episodic_memory', {
      capacity: 5000,
      persistence: true,
      indexing: ['type', 'timestamp', 'tags']
    });
    this.initializeMemory();
  }

  private async initializeMemory(): Promise<void> {
    await this.store({
      id: 'event:experiment-a-completion',
      type: 'event',
      content: {
        description: "Experiment A completed successfully",
        timestamp: "2024-12-10T12:00:00Z",
        context: "Research Phase 1",
        actors: ["Research Team A"],
        location: "Lab 1"
      },
      metadata: {
        importance: 0.8,
        lastAccessed: Date.now(),
        tags: ['experiment', 'success', 'research'],
        emotionalValence: 0.7
      }
    } as EpisodicMemoryItem);

    await this.store({
      id: 'event:bug-identification',
      type: 'event',
      content: {
        description: "Bug identified in Chaos Module",
        timestamp: "2024-12-11T09:30:00Z",
        context: "System Maintenance",
        actors: ["QA Team", "Development Team"],
        location: "Development Environment"
      },
      metadata: {
        importance: 0.9,
        lastAccessed: Date.now(),
        tags: ['bug', 'chaos-module', 'maintenance'],
        emotionalValence: -0.3
      }
    } as EpisodicMemoryItem);
  }

  protected async handleMessage(message: TaskMessage): Promise<void> {
    if (message.type === 'task') {
      if (message.query.includes('event')) {
        const query: MemoryQuery = {
          type: 'event',
          term: message.query,
          filters: { importance: { min: 0.7 } }
        };
        const response = await this.query(query);
        this.sendResponse(message.task_id, this.formatEvents(response.items as EpisodicMemoryItem[]));
      } else if (message.query.includes('experience')) {
        const query: MemoryQuery = {
          type: 'experience',
          term: message.query
        };
        const response = await this.query(query);
        this.sendResponse(message.task_id, this.formatEvents(response.items as EpisodicMemoryItem[]));
      }
    }
  }

  protected matchesQuery(item: MemoryItem, query: MemoryQuery): boolean {
    const memoryItem = item as EpisodicMemoryItem;
    const searchTerm = query.term.toLowerCase();
    
    // Check description match
    if (memoryItem.content.description.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Check context match
    if (memoryItem.content.context?.toLowerCase().includes(searchTerm)) {
      return true;
    }

    // Check actors match
    if (memoryItem.content.actors?.some(actor => 
      actor.toLowerCase().includes(searchTerm))) {
      return true;
    }

    // Check tags match
    if (memoryItem.metadata.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm))) {
      return true;
    }

    return false;
  }

  private formatEvents(events: EpisodicMemoryItem[]): string[] {
    return events.map(event => {
      let formatted = `[${event.content.timestamp}] ${event.content.description}`;
      if (event.content.context) {
        formatted += ` (Context: ${event.content.context})`;
      }
      if (event.metadata.importance > 0.8) {
        formatted += ' [High Importance]';
      }
      return formatted;
    });
  }

  // Additional methods for episodic memory specific functionality
  async addEvent(description: string, context?: string): Promise<void> {
    const event: EpisodicMemoryItem = {
      id: `event:${Date.now()}`,
      type: 'event',
      content: {
        description,
        timestamp: new Date().toISOString(),
        context
      },
      metadata: {
        importance: 0.5, // Default importance
        lastAccessed: Date.now(),
        tags: this.extractTags(description)
      }
    };
    await this.store(event);
  }

  private extractTags(text: string): string[] {
    // Simple tag extraction based on common keywords
    const keywords = ['experiment', 'bug', 'success', 'failure', 'research', 'maintenance'];
    return keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase()));
  }
}