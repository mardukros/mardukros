import { WebSocket } from 'ws';
import { TaskMessage } from '../types/messages.js';
import { TaskValidator } from './task-validator.js';
import { formatTaskLog } from '../utils/task-utils.js';
import { CognitiveWebSocket } from '../../../src/types/websocket-types';

export class TaskScheduler {
  private currentTaskIndex: number = 0;
  private validator: TaskValidator;

  constructor(
    private ws: WebSocket | CognitiveWebSocket,
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
        console.log(`Scheduled: ${formatTaskLog(task)}`);
      } else {
        console.error(`Invalid task skipped: ${validation.errors.join(', ')}`);
        this.currentTaskIndex++;
        this.scheduleNextTask();
      }
    } else {
      console.log("All tasks have been scheduled and completed.");
    }
  }

  addTask(task: TaskMessage): void {
    const validation = this.validator.validateTask(task);
    if (validation.valid) {
      this.tasks.push(task);
      console.log(`Added: ${formatTaskLog(task)}`);
    } else {
      console.error(`Failed to add invalid task: ${validation.errors.join(', ')}`);
    }
  }

  getTasks(): TaskMessage[] {
    return [...this.tasks];
  }
}