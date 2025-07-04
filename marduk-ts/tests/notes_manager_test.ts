import {
  assertEquals,
} from "https://deno.land/std@0.118.0/testing/asserts.ts";
import {
  retrievePreviousNotes,
  saveNotesToSelf,
  reviewCycleResults,
} from "../core/notes_manager.ts";

Deno.test("reviewCycleResults generates notes from task results", () => {
  const taskResults = [
    { status: "error", context: "Process A", topic: "Quantum Dynamics" },
    { status: "success", task: "Task B", unlocked: ["Task C"] },
  ];

  const notes = reviewCycleResults(taskResults);

  assertEquals(notes.length, 2);
  assertEquals(notes[0], "Error in Process A. Consider learning about Quantum Dynamics.");
  assertEquals(notes[1], "Task Task B succeeded, unlocking dependencies: Task C.");
});

Deno.test("retrievePreviousNotes loads notes from file", async () => {
  // Mock the file system for this test
  await Deno.writeTextFile("./logs/notes2self.json", JSON.stringify(["Test Note"], null, 2));
  const notes = await retrievePreviousNotes();

  assertEquals(notes.length, 1);
  assertEquals(notes[0], "Test Note");
});

Deno.test("saveNotesToSelf writes notes to file", async () => {
  const notes = ["New Note 1", "New Note 2"];
  await saveNotesToSelf(notes);

  const savedNotes = await Deno.readTextFile("./logs/notes2self.json");
  assertEquals(JSON.parse(savedNotes), notes);
});
