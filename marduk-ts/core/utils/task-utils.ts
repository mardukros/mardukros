import { TaskMessage } from '../../types/task-types';

export function validateTask(task: TaskMessage): boolean {
  return (
    task.type === 'task' &&
    typeof task.query === 'string' &&
    typeof task.task_id === 'number'
  );
}

export function formatTaskLog(task: TaskMessage): string {
  return `[Task ${task.task_id}] ${task.query}${task.target ? ` (Target: ${task.target})` : ''}`;
}

export function sortTasksByPriority(tasks: TaskMessage[]): TaskMessage[] {
  return [...tasks].sort((a, b) => {
    const priorityA = a.priority || 0;
    const priorityB = b.priority || 0;
    return priorityA - priorityB;
  });
}