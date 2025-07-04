import { readFileSync, writeFileSync } from 'fs';

export async function retrievePreviousNotes(): Promise<string[]> {
  try {
    const notes = readFileSync("./logs/notes2self.json", 'utf8');
    return JSON.parse(notes);
  } catch {
    console.log("No previous notes found. Starting fresh.");
    return [];
  }
}

export async function saveNotesToSelf(notes: string[]): Promise<void> {
  writeFileSync("./logs/notes2self.json", JSON.stringify(notes, null, 2));
  console.log("Notes saved for the next cycle.");
}

export function reviewCycleResults(taskResults: Array<{ status: string; [key: string]: unknown }>): string[] {
  const notes: string[] = [];

  taskResults.forEach((result) => {
    if (result.status === "error") {
      notes.push(`Error in ${result.context}. Consider learning about ${result.topic}.`);
    }
    if (result.status === "success") {
      notes.push(`Task ${result.task} succeeded, unlocking dependencies: ${result.unlocked}.`);
    }
  });

  return notes;
}

export async function endCycle(taskResults: Array<{ status: string; [key: string]: unknown }>): Promise<void> {
  const notes = reviewCycleResults(taskResults);
  await saveNotesToSelf(notes);
}