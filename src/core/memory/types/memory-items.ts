// Memory item type definitions for the Marduk cognitive architecture
import { SystemEvent } from '../../types/event-types.js';

export interface BaseMemoryItem {
  id: string;
  type: string;
  content: any;
  metadata: {
    lastAccessed: number;
    tags: string[];
    [key: string]: any;
  };
}

export interface ConceptMemoryItem extends BaseMemoryItem {
  type: 'concept';
  content: {
    name: string;
    description: string;
    relationships?: Array<{
      type: string;
      target: string;
      strength: number;
      bidirectional?: boolean;
    }>;
  };
}

export interface FactMemoryItem extends BaseMemoryItem {
  type: 'fact';
  content: {
    statement: string;
    truth_value: number;
    sources?: string[];
    related_concepts?: string[];
  };
}

export interface ProcedureMemoryItem extends BaseMemoryItem {
  type: 'procedure';
  content: {
    name: string;
    steps: string[];
    prerequisites?: string[];
    estimated_duration?: number;
  };
  metadata: {
    lastAccessed: number;
    tags: string[];
    success_rate?: number;
    complexity?: number;
  };
}

export interface EventMemoryItem extends BaseMemoryItem {
  type: 'event';
  content: {
    title: string;
    description: string;
    timestamp: number;
    actors: string[];
    related_events?: string[];
  };
  metadata: {
    lastAccessed: number;
    tags: string[];
    emotional_valence?: number;
    significance?: number;
  };
}

export interface MemoryAccessRecord {
  item_id: string;
  timestamp: number;
  context?: string;
  query?: string;
}

export interface MemoryUpdateEvent extends SystemEvent {
  type: 'memory_updated';
  data: {
    item_id: string;
    operation: 'create' | 'update' | 'delete';
    memory_type: string;
  };
}