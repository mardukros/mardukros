
import { TaskMessage } from './types/task-types.js';

/**
 * Analyzes previous notes and generates new tasks
 */
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
export function deliberate(previousNotes: string[]): TaskMessage[] {
  const newTasks: TaskMessage[] = [];
  
  // Example deliberation logic
  if (previousNotes.length === 0) {
    // Initial tasks when no previous notes exist
    newTasks.push({
      type: 'task',
      task_id: `task-${Date.now()}-1`,
      query: 'Analyze system architecture for optimization opportunities',
      target: 'semantic_memory',
      priority: 2
    });
    
    newTasks.push({
      type: 'task',
      task_id: `task-${Date.now()}-2`,
      query: 'Review recent errors and identify patterns',
      target: 'episodic_memory',
      priority: 3
    });
  } else {
    // Generate tasks based on previous notes
    for (const note of previousNotes) {
      if (note.includes('error') || note.includes('failed')) {
        newTasks.push({
          type: 'task',
          task_id: `task-${Date.now()}-error`,
          query: `Investigate issue: ${note}`,
          target: 'procedural_memory',
          priority: 3
        });
      }
      
      if (note.includes('completed')) {
        newTasks.push({
          type: 'task',
          task_id: `task-${Date.now()}-follow`,
          query: `Follow up on: ${note}`,
          target: 'declarative_memory',
          priority: 1,
          condition: {
            type: 'deferred',
            prerequisite: 'research-completed:follow-up'
          }
        });
      }
    }
  }
  
  console.log(`Generated ${newTasks.length} tasks from deliberation`);
  return newTasks;
}
