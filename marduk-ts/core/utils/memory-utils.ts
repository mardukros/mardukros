import { MemoryState } from '../types/memory-types.js';

export function checkPrerequisite(prerequisite: string, memoryState: MemoryState): boolean {
  return memoryState.completedTopics.includes(prerequisite);
}

export function updateMemoryState(memoryState: MemoryState, newTopic: string): MemoryState {
  return {
    ...memoryState,
    completedTopics: [...memoryState.completedTopics, newTopic]
  };
}