import { Insight, TaskMessage } from "../types/task-types.js";
import { _generateGoals } from "./learning_scheduler.js";

export function deliberate(previousNotes: string[]): TaskMessage[] {
  const insights = gatherMemoryInsights(previousNotes);
  const newGoals = _generateGoals(insights);

  console.log("Generated Goals:", newGoals);
  return newGoals;
}

function gatherMemoryInsights(notes: string[]): Insight[] {
  const baseInsights: Insight[] = [
    {
      type: "error",
      errorCode: "E123",
      context: "Process A",
      requiresResearch: true,
      field: "Physics",
      topic: "Quantum Dynamics"
    },
    {
      type: "success",
      task: "Task B",
      unlockedPaths: ["Task C", "Task D"]
    }
  ];

  const noteInsights: Insight[] = notes.map(note => ({
    type: "reflection" as const,
    content: note
  }));

  return [...baseInsights, ...noteInsights];
}