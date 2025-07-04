import { MemoryItem } from './base-types.js';

export interface DeclarativeMemoryItem extends MemoryItem {
  type: 'fact' | 'concept' | 'rule';
  content: string;
  metadata: {
    tags: string[];
    confidence: number;
    lastAccessed: number;
    source?: string;
  };
}

export interface EpisodicMemoryItem extends MemoryItem {
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
    emotionalValence?: number;
  };
}

export interface SemanticMemoryItem extends MemoryItem {
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

export interface ProceduralMemoryItem extends MemoryItem {
  type: 'workflow' | 'procedure' | 'task';
  content: {
    title: string;
    steps: string[];
    tags?: string[];
    prerequisites?: string[];
    estimatedDuration?: number;
  };
  metadata: {
    successRate?: number;
    lastAccessed: number;
    category: string[];
    complexity: number;
  };
}