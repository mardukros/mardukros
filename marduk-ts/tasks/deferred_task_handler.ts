import { TaskMessage, Condition } from "../types/task_types.ts";

export class DeferredTaskHandler {
  private deferredTasks: TaskMessage[] = [];

  addDeferredTask(task: TaskMessage): void {
    this.deferredTasks.push(task);
    console.log(`Deferred task added: ${task.query}`);
  }

  activateTasks(memoryState: { completedTopics: string[] }): TaskMessage[] {
    const activatedTasks: TaskMessage[] = [];
    this.deferredTasks = this.deferredTasks.filter((task) => {
      if (task.condition && this.checkCondition(task.condition, memoryState)) {
        console.log(`Activating deferred task: ${task.query}`);
        activatedTasks.push(task);
        return false; // Remove from deferred list
      }
      return true; // Keep in deferred list
    });
    return activatedTasks;
  }

  private checkCondition(condition: Condition, memoryState: { completedTopics: string[] }): boolean {
    if (condition.type === "deferred") {
      return memoryState.completedTopics.includes(condition.prerequisite);
    }
    return true;
  }
}
