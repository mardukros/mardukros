import { WebSocket } from 'ws';
import { TaskMessage } from './types/task-types.js';
import { TaskValidator } from './task-validator.js';
import { logger } from '../utils/logger.js';

export class TaskScheduler {
  private currentTaskIndex = 0;
  private validator: TaskValidator;

  constructor(
    private ws: WebSocket,
    private tasks: TaskMessage[]
  ) {
    this.validator = new TaskValidator();
  }

  scheduleNextTask(): void {
    if (this.currentTaskIndex < this.tasks.length) {
      const task = this.tasks[this.currentTaskIndex];
      const validation = this.validator.validateTask(task);
      
      if (validation.valid) {
        this.ws.send(JSON.stringify(task));
        this.currentTaskIndex++;
        logger.info(`Scheduled task: ${this.formatTaskLog(task)}`);
      } else {
        logger.error(`Invalid task skipped: ${validation.errors.join(', ')}`);
        this.currentTaskIndex++;
        this.scheduleNextTask();
      }
    } else {
      logger.info('All tasks have been scheduled and completed');
    }
  }

  addTask(task: TaskMessage): void {
    const validation = this.validator.validateTask(task);
    if (validation.valid) {
      this.tasks.push(task);
      logger.info(`Added task: ${this.formatTaskLog(task)}`);
    } else {
      logger.error(`Failed to add invalid task: ${validation.errors.join(', ')}`);
    }
  }

  getTasks(): TaskMessage[] {
    return [...this.tasks];
  }

  private formatTaskLog(task: TaskMessage): string {
    return `[Task ${task.task_id}] ${task.query}${task.target ? ` (Target: ${task.target})` : ''}`;
  }
}