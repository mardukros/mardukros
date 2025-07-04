import { TaskMessage } from '../../types/task-types.js';

export class TaskValidator {
  validateTask(task: TaskMessage): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!task.type || task.type !== 'task') {
      errors.push('Invalid task type');
    }

    if (!task.query || typeof task.query !== 'string') {
      errors.push('Invalid query');
    }

    if (typeof task.task_id !== 'number') {
      errors.push('Invalid task ID');
    }

    if (task.condition && task.condition.type !== 'deferred') {
      errors.push('Invalid condition type');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}