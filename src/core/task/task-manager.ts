import { logger } from '../utils/logger.js';

/**
 * Manages task execution, prioritization, and scheduling
 */
// Define TaskMessage interface locally to avoid conflicts
interface TaskMessage {
  task_id: string;
  query: string;
  priority?: number;
  type?: string;
  status?: string;
  target?: string;
  data?: any;
  result?: any;
}

export class TaskManager {
  private tasks: Map<string, TaskMessage> = new Map();
  private priorityQueue: string[] = [];
  private executedTasksCount: number = 0;
  private totalExecutionTime: number = 0;
  private lastExecutionTimestamp: number = 0;

  constructor() {
    logger.info('Task Manager initialized');
  }

  /**
   * Add a new task to the manager
   */
  addTask(task: TaskMessage): { success: boolean, taskId: string } {
    if (!task.task_id) {
      task.task_id = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    logger.info(`Adding task: ${task.task_id} - ${task.query}`);
    this.tasks.set(task.task_id, task);
    this.priorityQueue.push(task.task_id);

    return {
      success: true,
      taskId: task.task_id
    };
  }
  
  /**
   * Create a task with the given parameters
   */
  createTask(query: string, options: any = {}): TaskMessage {
    const taskId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const task: TaskMessage = {
      task_id: taskId,
      query,
      priority: options.priority || 3,
      type: options.type || 'standard',
      status: 'pending',
      target: options.target || 'general',
      data: options.data || {}
    };
    
    return task;
  }
  
  /**
   * Get performance metrics for the task system
   */
  getPerformanceMetrics(): { scheduledCount: number, averageExecutionTime: number, tasksPerMinute: number } {
    const now = Date.now();
    const timeWindow = 60000; // 1 minute in ms
    const timeSinceLastExecution = now - this.lastExecutionTimestamp;
    
    // Calculate tasks per minute based on recent execution
    const tasksPerMinute = this.lastExecutionTimestamp === 0 ? 0 :
                           Math.min(60, Math.round((this.executedTasksCount / timeSinceLastExecution) * timeWindow));
    
    return {
      scheduledCount: this.tasks.size,
      averageExecutionTime: this.executedTasksCount === 0 ? 0 : Math.round(this.totalExecutionTime / this.executedTasksCount),
      tasksPerMinute
    };
  }

  /**
   * Get a task by ID
   */
  getTask(taskId: string): TaskMessage | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks
   */
  getAllTasks(): TaskMessage[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Prioritize tasks based on importance, dependencies, and timing
   */
  prioritizeTasks(): TaskMessage[] {
    logger.info('Prioritizing tasks');

    const prioritized = this.priorityQueue
      .map(id => this.tasks.get(id))
      .filter(task => task !== undefined) as TaskMessage[];

    // Sort by priority if available
    return prioritized.sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      return priorityB - priorityA;
    });
  }

  /**
   * Remove a task from the manager
   */
  removeTask(taskId: string): boolean {
    logger.info(`Removing task: ${taskId}`);

    const removed = this.tasks.delete(taskId);
    this.priorityQueue = this.priorityQueue.filter(id => id !== taskId);

    return removed;
  }

  /**
   * Update task status
   */
  updateTaskStatus(taskId: string, status: string, result?: any): boolean {
    const task = this.tasks.get(taskId);

    if (!task) {
      logger.warn(`Cannot update status for non-existent task: ${taskId}`);
      return false;
    }

    logger.info(`Updating task ${taskId} status to: ${status}`);
    task.status = status;

    if (result) {
      task.result = result;
    }

    return true;
  }
}