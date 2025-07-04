import { TaskMessage, TaskCondition } from '../../types/task-types.js';
import { MemoryState } from '../types/memory-types.js';

export class DeferredTaskHandler {
  private deferredTasks: TaskMessage[] = [];

  addDeferredTask(task: TaskMessage): void {
    this.deferredTasks.push(task);
    console.log(`Deferred task added: ${task.query}`);
  }

  activateTasks(memoryState: MemoryState): TaskMessage[] {
    const activatedTasks: TaskMessage[] = [];
    const remainingTasks: TaskMessage[] = [];

    for (const task of this.deferredTasks) {
      if (this.canActivateTask(task, memoryState)) {
        activatedTasks.push(task);
      } else {
        remainingTasks.push(task);
      }
    }

    this.deferredTasks = remainingTasks;
    return activatedTasks;
  }

  private canActivateTask(task: TaskMessage, memoryState: MemoryState): boolean {
    if (!task.condition) return true;
    if (task.condition.type !== 'deferred') return true;
    return memoryState.completedTopics.includes(task.condition.prerequisite);
  }
}