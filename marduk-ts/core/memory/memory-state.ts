import { MemoryState } from '../types/memory-types.js';

export class MemoryStateManager {
  private state: MemoryState = {
    completedTopics: []
  };

  addCompletedTopic(topic: string): void {
    if (!this.state.completedTopics.includes(topic)) {
      this.state.completedTopics.push(topic);
    }
  }

  hasCompletedTopic(topic: string): boolean {
    return this.state.completedTopics.includes(topic);
  }

  getState(): MemoryState {
    return { ...this.state };
  }

  loadState(state: MemoryState): void {
    this.state = { ...state };
  }
}