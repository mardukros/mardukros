import { TaskManager } from './task/task-manager';
import { DeferredTaskHandler } from './task/deferred-task-handler';
import { retrievePreviousNotes, saveNotesToSelf } from './notes_manager';
import { deliberate } from './deliberation';
import { executeTasks } from './task_execution';
import { TaskMessage } from '../types/task-types';
import { MemoryState } from './types/memory-types';

// Initialize managers
const taskManager = new TaskManager();
const deferredTaskHandler = new DeferredTaskHandler();

interface TaskResult {
  status: string;
  query: string;
  context?: string;
}

// Simulate a full cycle
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
  const memoryState: MemoryState = { completedTopics: ["research-completed:Quantum Dynamics"] };
  const activatedTasks = deferredTaskHandler.activateTasks(memoryState);
  activatedTasks.forEach((task: TaskMessage) => taskManager.addTask(task));

  // Step 4: Prioritize tasks
  const prioritizedTasks = taskManager.prioritizeTasks();
  console.log("Prioritized Tasks:", prioritizedTasks);

  // Step 5: Execute tasks
  executeTasks(prioritizedTasks, memoryState);

  // Step 6: Review results and save notes for the next cycle
  const taskResults: TaskResult[] = prioritizedTasks.map((task: TaskMessage) => ({
    status: task.status || "completed",
    query: task.query,
    context: task.target,
  }));

  const notes = taskResults.map((result: TaskResult) => 
    `Task: ${result.query} - Status: ${result.status}`
  );
  await saveNotesToSelf(notes);

  console.log("=== End of Cycle ===");
}

// Run the full cycle simulation
await runCycle();