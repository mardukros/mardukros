import { MemoryState } from '../types/memory-types.js';
import { EventBus } from './event-bus.js';

export class MemoryService {
  private state: MemoryState = {
    completedTopics: []
  };

  constructor(private eventBus: EventBus) {}

  addCompletedTopic(topic: string): void {
    if (!this.state.completedTopics.includes(topic)) {
      this.state.completedTopics.push(topic);
      this.eventBus.publish({
        type: 'memory_updated',
        timestamp: new Date().toISOString(),
        data: { topic, status: 'completed' }
      });
    }
  }

  hasCompletedTopic(topic: string): boolean {
    return this.state.completedTopics.includes(topic);
  }

  getState(): MemoryState {
    return { ...this.state };
  }
}