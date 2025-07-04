
import { TaskMessage } from './types/task-types.js';

/**
 * Execute a batch of prioritized tasks
 */
export function executeTasks(tasks: TaskMessage[], memoryState: any): void {
  console.log(`Executing ${tasks.length} tasks`);
  
  for (const task of tasks) {
    console.log(`Executing task: ${task.query} (target: ${task.target})`);
    
    // Simulate task execution
    task.status = Math.random() > 0.2 ? 'completed' : 'failed';
    
    // If task completed successfully, we might add a completed topic
    if (task.status === 'completed' && task.query.includes('research')) {
      const topic = task.query.split(' ').pop() || '';
      memoryState.completedTopics.push(`research-completed:${topic}`);
      console.log(`Added completed topic: research-completed:${topic}`);
    }
    
    console.log(`Task ${task.task_id} ${task.status}`);
  }
}
