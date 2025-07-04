import { TaskMessage } from "../types/task_types.ts";

export class TaskManager {
  private taskQueue: TaskMessage[] = [];

  addTask(task: TaskMessage): void {
    this.taskQueue.push(task);
    console.log(`Task added: ${task.query}`);
  }

  prioritizeTasks(): TaskMessage[] {
    return this.taskQueue.sort((a, b) => (a.priority || 0) - (b.priority || 0));
  }

  getTasks(): TaskMessage[] {
    return [...this.taskQueue];
  }

  clearCompletedTasks(): void {
    this.taskQueue = this.taskQueue.filter((task) => task.status !== "completed");
    console.log("Cleared completed tasks.");
  }
}
