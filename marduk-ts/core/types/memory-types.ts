export interface MemoryState {
  completedTopics: string[];
}

export interface MemoryUpdate {
  topic: string;
  status: 'completed' | 'failed';
  timestamp: string;
}