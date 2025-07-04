
import { TaskManager } from './core/task/task-manager.js';
import { DeferredTaskHandler } from './core/task/deferred-task-handler.js';
import { retrievePreviousNotes, saveNotesToSelf } from './core/notes_manager.js';
import { deliberate } from './core/deliberation.js';
import { executeTasks } from './core/task_execution.js';

// Import and create a merged type that satisfies both interfaces
import { TaskMessage as CoreTaskMessage, TaskResult } from './core/types/task-types.js';

// Create a compatible interface that merges both TaskMessage types
interface TaskMessage extends Omit<CoreTaskMessage, 'type'> {
  // Make type field required and match the expected string type
  type: string;
  // Additional fields needed for compatibility
  condition?: {
    type: string;
    prerequisite: string;
  };
  status?: string;
  result?: any;
  target?: string;
}

// Initialize managers
const taskManager = new TaskManager();
const deferredTaskHandler = new DeferredTaskHandler();

// Simulate a full cycle
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
async function runCycle() {
  console.log("=== Start of Cycle ===");

  // Step 1: Retrieve insights from previous cycle
  const previousNotes = await retrievePreviousNotes();
  console.log("Previous Notes:", previousNotes);

  // Step 2: Deliberate and generate tasks
  const newTasks = deliberate(previousNotes);
  newTasks.forEach((task: TaskMessage) => {
    if (task.condition) {
      deferredTaskHandler.addDeferredTask(task);
    } else {
      taskManager.addTask(task);
    }
  });

  // Step 3: Simulate memory state and activate deferred tasks
  const memoryState = { completedTopics: ["research-completed:Quantum Dynamics"] };
  const activatedTasks = deferredTaskHandler.activateTasks(memoryState);
  activatedTasks.forEach((task: TaskMessage) => taskManager.addTask(task));

  // Step 4: Prioritize tasks
  const prioritizedTasks = taskManager.prioritizeTasks();
  console.log("Prioritized Tasks:", prioritizedTasks);

  // Step 5: Execute tasks
  // Using type assertion to handle the TaskMessage type difference
  executeTasks(prioritizedTasks as any, memoryState);

  // Step 6: Review results and save notes for the next cycle
  // Using type assertion to fix compatibility issues
  const taskResults: TaskResult[] = prioritizedTasks.map((task) => ({
    task_id: task.task_id,
    status: task.status || "completed",
    data: task.result,
    context: task.target
  })) as TaskResult[];

  const notes = taskResults.map((result: TaskResult) => 
    `Task: ${result.task_id} - Status: ${result.status}`
  );
  await saveNotesToSelf(notes);

  console.log("=== End of Cycle ===");
}

// Run the full cycle simulation
await runCycle();
