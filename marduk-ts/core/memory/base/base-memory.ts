import { WebSocket } from 'ws';
import { TaskMessage } from '../../types/messages.js';
import { 
  MemoryItem, 
  MemoryQuery, 
  MemoryResponse, 
  MemoryConfig,
  MemorySubsystem 
} from '../types/base-types.js';
import { MemoryIndex } from '../utils/memory-indexing.js';
import { MemoryPersistence } from '../utils/memory-persistence.js';
import { MemoryValidator } from '../utils/memory-validation.js';
import { cleanupMemory } from '../utils/memory-cleanup.js';

export abstract class BaseMemorySubsystem implements MemorySubsystem {
  protected items: Map<string | number, MemoryItem> = new Map();
  protected index: MemoryIndex;
  protected persistence: MemoryPersistence;
  protected validator: MemoryValidator;
  protected config: Required<MemoryConfig>;
  protected ws: WebSocket;
  protected subsystemName: string;

  constructor(subsystemName: string, config: MemoryConfig = {}) {
    this.subsystemName = subsystemName;
    this.config = {
      capacity: config.capacity || 1000,
      persistence: config.persistence || false,
      indexing: config.indexing || []
    };

    this.index = new MemoryIndex();
    this.persistence = new MemoryPersistence(subsystemName);
    this.validator = new MemoryValidator();

    this.config.indexing.forEach(field => this.index.addIndex(field));

    this.ws = new WebSocket('ws://localhost:8080');
    this.setupWebSocket();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.config.persistence) {
      this.items = await this.persistence.loadItems();
      this.items.forEach(item => this.index.indexItem(item));
    }
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

  async query(query: MemoryQuery): Promise<MemoryResponse> {
    const validation = this.validator.validateQuery(query);
    if (!validation.valid) {
      throw new Error(`Invalid query: ${validation.errors.join(', ')}`);
    }

    const items = this.index.findItems(query, this.items)
      .filter(item => this.matchesQuery(item, query));
    
    return {
      items,
      metadata: { 
        total: items.length,
        timestamp: new Date().toISOString()
      }
    };
  }

  async store(item: MemoryItem): Promise<void> {
    const validation = this.validator.validateItem(item);
    if (!validation.valid) {
      throw new Error(`Invalid item: ${validation.errors.join(', ')}`);
    }

    if (this.items.size >= this.config.capacity) {
      await cleanupMemory(this.items, this.config.capacity);
    }

    this.items.set(item.id, item);
    this.index.indexItem(item);

    if (this.config.persistence) {
      await this.persistence.saveItems(this.items);
    }
  }

  async update(id: string | number, updates: Partial<MemoryItem>): Promise<void> {
    const item = this.items.get(id);
    if (item) {
      const updatedItem = { ...item, ...updates };
      const validation = this.validator.validateItem(updatedItem);
      if (!validation.valid) {
        throw new Error(`Invalid update: ${validation.errors.join(', ')}`);
      }

      this.items.set(id, updatedItem);
      this.index.indexItem(updatedItem);

      if (this.config.persistence) {
        await this.persistence.saveItems(this.items);
      }
    }
  }

  async delete(id: string | number): Promise<void> {
    this.items.delete(id);
    if (this.config.persistence) {
      await this.persistence.saveItems(this.items);
    }
  }

  protected abstract matchesQuery(item: MemoryItem, query: MemoryQuery): boolean;

  async createSnapshot(): Promise<void> {
    if (this.config.persistence) {
      await this.persistence.saveSnapshot();
    }
  }

  async restoreSnapshot(timestamp: string): Promise<boolean> {
    if (!this.config.persistence) return false;

    const snapshot = await this.persistence.loadSnapshot(timestamp);
    if (snapshot) {
      this.items = snapshot;
      this.items.forEach(item => this.index.indexItem(item));
      return true;
    }
    return false;
  }
}