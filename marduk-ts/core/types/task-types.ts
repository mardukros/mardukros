// Task-related type definitions
export type TaskStatus = 'pending' | 'completed' | 'deferred' | 'failed';
export type TaskPriority = 0 | 1 | 2 | 3 | 4 | 5;

export interface TaskCondition {
  type: 'deferred';
  prerequisite: string;
}

export interface TaskConfig {
  priority?: TaskPriority;
  target?: string;
  condition?: TaskCondition;
  status?: TaskStatus;
}

export interface Task {
  id: number;
  query: string;
  config: TaskConfig;
}