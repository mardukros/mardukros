// Task related type definitions

export interface TaskMessage {
  type: string;
  query: string;
  task_id: string;
  target?: string;
  priority?: number;
  status?: string;
  result?: any;
  condition?: {
    type: string;
    prerequisite: string;
  };
}

export interface TaskResult {
  task_id: string;
  status: string;
  data?: any;
  error?: string;
  context?: string;
  topic?: string;
  task?: string;
  unlocked?: string[];
}

export interface Insight {
  type: string;
  errorCode?: string;
  context?: string;
  field?: string;
  topic?: string;
  requiresResearch?: boolean;
  task?: string;
  unlockedPaths?: string[];
}