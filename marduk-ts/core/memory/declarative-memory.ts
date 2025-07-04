import { BaseMemory } from './base-memory.js';
import { TaskMessage } from '../types/messages.js';

export class DeclarativeMemory extends BaseMemory {
  private facts: Map<string, string> = new Map();

  constructor() {
    super('declarative_memory');
    this.initializeFacts();
  }

  private initializeFacts(): void {
    this.facts.set('chaos_theory', 'Chaos theory studies the behavior of dynamical systems that are highly sensitive to initial conditions.');
    this.facts.set('dynamic_systems', 'Dynamic systems are mathematical models that describe the behavior of complex systems over time.');
  }

  protected handleMessage(message: TaskMessage): void {
    if (message.type === 'task' && message.query.includes('fact')) {
      const facts = this.queryFacts(message.query);
      this.sendResponse(message.task_id, facts);
    }
  }

  private queryFacts(query: string): string[] {
    const results: string[] = [];
    this.facts.forEach((fact, key) => {
      if (fact.toLowerCase().includes(query.toLowerCase()) || 
          key.toLowerCase().includes(query.toLowerCase())) {
        results.push(fact);
      }
    });
    return results;
  }
}