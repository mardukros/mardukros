// Define types for insights and tasks
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

export type Condition = {
  type: "deferred";
  prerequisite: string;
};

export type TaskMessage = {
  type: "task";
  query: string;
  task_id: number;
  target?: string;
  priority?: number;
  condition?: Condition;
  status?: "pending" | "completed" | "deferred";
};