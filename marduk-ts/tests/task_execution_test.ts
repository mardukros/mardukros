import {
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { executeTasks } from "../core/task_execution.ts";
import { TaskMessage } from "../types/task_types.ts";

Deno.test("executeTasks defers tasks with unmet conditions", () => {
  const taskQueue: TaskMessage[] = [
    {
      type: "task",
      query: "Learn Quantum Physics",
      task_id: 1,
      condition: { type: "deferred", prerequisite: "research-completed:Quantum Dynamics" },
    },
    {
      type: "task",
      query: "Execute Process A",
      task_id: 2,
    },
  ];

  const memoryState = { completedTopics: [] };
  executeTasks(taskQueue, memoryState);

  assertEquals(taskQueue[0].condition?.type, "deferred");
  assertEquals(taskQueue[1].query, "Execute Process A");
});
