import { WebSocket } from 'ws';
import { TaskMessage } from '../../types/messages.js';
import { 
  MemoryItem, 
  MemoryQuery, 
  MemoryResponse, 
  MemoryConfig,
  MemorySubsystem 
} from '../types/memory-types.js';

export abstract class BaseMemorySubsystem implements MemorySubsystem {
  protected items: Map<string | number, MemoryItem> = new Map();
  protected config: MemoryConfig;
  protected ws: WebSocket;
  protected subsystemName: string;

  constructor(subsystemName: string, config: MemoryConfig = {}) {
    this.subsystemName = subsystemName;
    this.config = {
      capacity: 1000,
      persistence: false,
      indexing: [],
      ...config
    };
    this.ws = new WebSocket('ws://localhost:8080');
    this.setupWebSocket();
  }

  protected setupWebSocket(): void {
    this.ws.on('open', () => {
      console.log(`${this.subsystemName} connected to WebSocket server`);
      this.register();
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as TaskMessage;
        this.handleMessage(message);
      } catch (error) {
        console.error(`Error processing message in ${this.subsystemName}:`, error);
      }
    });
  }

  protected register(): void {
    this.ws.send(JSON.stringify({ 
      type: "register", 
      subsystem: this.subsystemName 
    }));
  }

  protected abstract handleMessage(message: TaskMessage): void;

  protected sendResponse(taskId: number, result: unknown): void {
    const response = {
      type: "response",
      subsystem: this.subsystemName,
      task_id: taskId,
      result
    };
    this.ws.send(JSON.stringify(response));
  }

  // MemorySubsystem interface implementation
  async query(query: MemoryQuery): Promise<MemoryResponse> {
    const items = Array.from(this.items.values())
      .filter(item => this.matchesQuery(item, query));
    
    return {
      items,
      metadata: { total: items.length }
    };
  }

  async store(item: MemoryItem): Promise<void> {
    if (this.items.size >= (this.config.capacity || 1000)) {
      await this.cleanup();
    }
    this.items.set(item.id, item);
  }

  async update(id: string | number, updates: Partial<MemoryItem>): Promise<void> {
    const item = this.items.get(id);
    if (item) {
      this.items.set(id, { ...item, ...updates });
    }
  }

  async delete(id: string | number): Promise<void> {
    this.items.delete(id);
  }

  protected abstract matchesQuery(item: MemoryItem, query: MemoryQuery): boolean;

  protected async cleanup(): Promise<void> {
    // Implement cleanup strategy (e.g., LRU, priority-based)
    const itemsArray = Array.from(this.items.entries());
    itemsArray.sort((a, b) => {
      const aAccessed = (a[1].metadata?.lastAccessed as number) || 0;
      const bAccessed = (b[1].metadata?.lastAccessed as number) || 0;
      return aAccessed - bAccessed;
    });

    // Remove oldest 10% of items
    const removeCount = Math.floor(this.items.size * 0.1);
    itemsArray.slice(0, removeCount).forEach(([id]) => this.items.delete(id));
  }
}