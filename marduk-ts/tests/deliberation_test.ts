import {
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import { deliberate } from "../core/deliberation.ts";

Deno.test("deliberate generates tasks from insights and notes", () => {
  const previousNotes = ["Review Process A for missed errors", "Reflect on Task B's success"];
  const tasks = deliberate(previousNotes);

  assertEquals(tasks.length, 4);
  assertEquals(tasks[0].query, "Investigate error E123 related to Process A");
  assertEquals(tasks[1].query, "Study Physics with focus on Quantum Dynamics");
  assertEquals(tasks[2].query, "Complete Task C as follow-up to Task B");
  assertEquals(tasks[3].query, "Complete Task D as follow-up to Task B");
});
