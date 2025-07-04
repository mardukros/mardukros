import { Task, TaskStatus } from '../types/task-types.js';
import { EventBus } from './event-bus.js';

export class TaskService {
  private tasks: Map<number, Task> = new Map();
  private nextTaskId = 1;

  constructor(private eventBus: EventBus) {}

  createTask(query: string, config = {}): Task {
    const task: Task = {
      id: this.nextTaskId++,
      query,
      config: {
        priority: 0,
        status: 'pending',
        ...config
      }
    };
    this.tasks.set(task.id, task);
    return task;
  }

  updateTaskStatus(taskId: number, status: TaskStatus): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.config.status = status;
      this.eventBus.publish({
        type: status === 'completed' ? 'task_completed' : 'task_failed',
        timestamp: new Date().toISOString(),
        data: { taskId }
      });
    }
  }

  getTaskById(taskId: number): Task | undefined {
    return this.tasks.get(taskId);
  }

  getPendingTasks(): Task[] {
    return Array.from(this.tasks.values())
      .filter(task => task.config.status === 'pending')
      .sort((a, b) => (a.config.priority || 0) - (b.config.priority || 0));
  }
}