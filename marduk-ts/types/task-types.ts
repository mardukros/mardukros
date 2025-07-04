// Core task types that are used across the system
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

export interface TaskMessage {
  type: "task";
  query: string;
  task_id: number;
  target?: string;
  priority?: number;
  condition?: TaskCondition;
  status?: TaskStatus;
}

export interface TaskResult {
  status: string;
  query: string;
  context?: string;
}

export type InsightType = "error" | "success" | "reflection";

export interface Insight {
  type: InsightType;
  errorCode?: string;
  context?: string;
  requiresResearch?: boolean;
  field?: string;
  topic?: string;
  task?: string;
  unlockedPaths?: string[];
  content?: string;
}