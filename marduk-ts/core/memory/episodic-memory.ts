import { BaseMemory } from './base-memory.js';
import { TaskMessage } from '../types/messages.js';

interface EpisodicEvent {
  id: number;
  event: string;
  timestamp: string;
}

export class EpisodicMemory extends BaseMemory {
  private events: EpisodicEvent[] = [];

  constructor() {
    super('episodic_memory');
    this.initializeEvents();
  }

  private initializeEvents(): void {
    this.events = [
      { id: 1, event: "Experiment A completed successfully", timestamp: "2024-12-10T12:00:00Z" },
      { id: 2, event: "Bug identified in Chaos Module", timestamp: "2024-12-11T09:30:00Z" }
    ];
  }

  protected handleMessage(message: TaskMessage): void {
    if (message.type === 'task' && message.query.includes('event')) {
      const events = this.queryEvents(message.query);
      this.sendResponse(message.task_id, events);
    }
  }

  private queryEvents(query: string): string[] {
    return this.events
      .filter(event => event.event.toLowerCase().includes(query.toLowerCase()))
      .map(event => `${event.timestamp}: ${event.event}`);
  }
}