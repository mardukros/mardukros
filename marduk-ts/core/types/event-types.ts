export interface SystemEvent {
  type: 'task_completed' | 'task_failed' | 'memory_updated';
  timestamp: string;
  data: unknown;
}

export interface TaskEvent extends SystemEvent {
  type: 'task_completed' | 'task_failed';
  data: {
    taskId: number;
    result?: unknown;
    error?: string;
  };
}

export interface MemoryEvent extends SystemEvent {
  type: 'memory_updated';
  data: {
    topic: string;
    status: 'completed' | 'failed';
  };
}