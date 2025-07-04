import {
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { Insight } from "../types/task_types.ts";
import { _generateGoals } from "../core/learning_scheduler.ts";

Deno.test("generateGoals creates tasks for errors and successes", () => {
  const insights: Insight[] = [
    {
      type: "error",
      errorCode: "E123",
      context: "Process A",
      requiresResearch: true,
      field: "Physics",
      topic: "Quantum Dynamics",
    },
    {
      type: "success",
      task: "Task B",
      unlockedPaths: ["Task C", "Task D"],
    },
  ];

  const tasks = _generateGoals(insights);

  assertEquals(tasks.length, 4);
  assertEquals(tasks[0].query, "Investigate error E123 related to Process A");
  assertEquals(tasks[1].query, "Study Physics with focus on Quantum Dynamics");
  assertEquals(tasks[2].query, "Complete Task C as follow-up to Task B");
  assertEquals(tasks[3].query, "Complete Task D as follow-up to Task B");
});
