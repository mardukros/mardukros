
import { TaskMessage } from '../types/task-types.js';
import { logger } from '../utils/logger.js';

/**
 * Interface defining the memory state used to evaluate conditions
 */
export interface MemoryState {
  completedTopics: string[];
  [key: string]: any;
}

/**
 * Manages conditional tasks that are waiting for specific conditions to be met
 */
export class DeferredTaskHandler {
  private deferredTasks: TaskMessage[] = [];
  private static instance: DeferredTaskHandler;

  constructor() {
    logger.info('DeferredTaskHandler initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DeferredTaskHandler {
    if (!DeferredTaskHandler.instance) {
      DeferredTaskHandler.instance = new DeferredTaskHandler();
    }
    return DeferredTaskHandler.instance;
  }

  /**
   * Add a task to be executed when its condition is met
   */
  addDeferredTask(task: TaskMessage): void {
    if (!task.condition) {
      logger.warn('Task added to deferred handler but has no condition');
    }
    
    this.deferredTasks.push(task);
    logger.info(`Deferred task added: ${task.query}`, { 
      taskId: task.task_id, 
      condition: task.condition 
    });
  }

  /**
   * Check if any deferred tasks can be activated based on the current memory state
   */
  activateTasks(memoryState: MemoryState): TaskMessage[] {
    const activatedTasks: TaskMessage[] = [];
    const remainingTasks: TaskMessage[] = [];

    for (const task of this.deferredTasks) {
      if (this.canActivateTask(task, memoryState)) {
        task.status = 'activated';
        activatedTasks.push(task);
        logger.info(`Task activated: ${task.query}`, { taskId: task.task_id });
      } else {
        remainingTasks.push(task);
      }
    }

    // Update our list to only contain tasks that weren't activated
    this.deferredTasks = remainingTasks;
    
    if (activatedTasks.length > 0) {
      logger.info(`Activated ${activatedTasks.length} deferred tasks`);
    }
    
    return activatedTasks;
  }

  /**
   * Get all currently deferred tasks
   */
  getDeferredTasks(): TaskMessage[] {
    return [...this.deferredTasks];
  }

  /**
   * Check if a task can be activated given the current memory state
   */
  private canActivateTask(task: TaskMessage, memoryState: MemoryState): boolean {
    // If there's no condition, it can be activated
    if (!task.condition) return true;
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
    
    // Only handle deferred conditions for now
    if (task.condition.type !== 'deferred') return false;
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
    
    // Check if the prerequisite is in the list of completed topics
    return memoryState.completedTopics.includes(task.condition.prerequisite);
  }
}
