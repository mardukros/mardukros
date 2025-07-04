import { BaseMemory } from './base-memory.js';
import { TaskMessage } from '../types/messages.js';

interface SemanticLink {
  concept1: string;
  concept2: string;
  relation: string;
  strength: number;
  context?: string;
}

export class SemanticMemory extends BaseMemory {
  private semanticNetwork: SemanticLink[] = [];

  constructor() {
    super('semantic_memory');
    this.initializeNetwork();
  }

  private initializeNetwork(): void {
    this.addLink({
      concept1: "Chaos Theory",
      concept2: "Dynamic Systems",
      relation: "is foundational for",
      strength: 0.9,
      context: "mathematical modeling"
    });

    this.addLink({
      concept1: "Dynamic Systems",
      concept2: "Nonlinear Equations",
      relation: "uses",
      strength: 0.8,
      context: "mathematical analysis"
    });

    this.addLink({
      concept1: "Bug Resolution",
      concept2: "System Analysis",
      relation: "requires",
      strength: 0.7,
      context: "software maintenance"
    });
  }

  private addLink(link: SemanticLink): void {
    this.semanticNetwork.push(link);
  }

  protected handleMessage(message: TaskMessage): void {
    if (message.type === 'task') {
      if (message.query.includes('relationship')) {
        const relationships = this.findRelationships(message.query);
        this.sendResponse(message.task_id, relationships);
      } else if (message.query.includes('concepts')) {
        const concepts = this.findRelatedConcepts(message.query);
        this.sendResponse(message.task_id, concepts);
      }
    }
  }

  private findRelationships(query: string): string[] {
    const searchTerm = query.toLowerCase();
    return this.semanticNetwork
      .filter(link => 
        link.concept1.toLowerCase().includes(searchTerm) ||
        link.concept2.toLowerCase().includes(searchTerm)
      )
      .map(link => this.formatLink(link));
  }

  private findRelatedConcepts(concept: string): string[] {
    const searchTerm = concept.toLowerCase();
    const relatedLinks = this.semanticNetwork
      .filter(link => 
        link.concept1.toLowerCase().includes(searchTerm) ||
        link.concept2.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => b.strength - a.strength);

    return relatedLinks.map(link => {
      const mainConcept = link.concept1.toLowerCase().includes(searchTerm) 
        ? link.concept1 
        : link.concept2;
      const relatedConcept = link.concept1.toLowerCase().includes(searchTerm)
        ? link.concept2
        : link.concept1;
      
      return `${mainConcept} ${link.relation} ${relatedConcept} (strength: ${link.strength})`;
    });
  }

  private formatLink(link: SemanticLink): string {
    let formatted = `${link.concept1} ${link.relation} ${link.concept2}`;
    if (link.context) {
      formatted += ` [${link.context}]`;
    }
    return formatted;
  }
}