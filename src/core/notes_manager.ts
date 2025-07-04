
import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger.js';

/**
 * Notes Manager - Handles system's self-reflective notes
 * Stores and retrieves insights from previous cognitive cycles
 * Implements dual-storage strategy with both memory and persistence
 */
export class NotesManager {
  private static instance: NotesManager;
  private memoryNotes: string[] = [];
  private persistencePath: string = './logs/notes2self.json';
  
  private constructor() {
    // Ensure logs directory exists
    try {
      if (!fs.existsSync('./logs')) {
        fs.mkdirSync('./logs', { recursive: true });
      }
    } catch (error) {
      logger.warn('Could not create logs directory for notes persistence', error);
    }
  }

  static getInstance(): NotesManager {
    if (!NotesManager.instance) {
      NotesManager.instance = new NotesManager();
    }
    return NotesManager.instance;
  }

  /**
   * Retrieve notes from previous cycles
   * Attempts file-based retrieval first, falls back to in-memory if file access fails
   */
  async retrievePreviousNotes(): Promise<string[]> {
    try {
      // Try to read from persistent storage first
      if (fs.existsSync(this.persistencePath)) {
        const notes = fs.readFileSync(this.persistencePath, 'utf8');
        const parsedNotes = JSON.parse(notes);
        // Update in-memory cache
        this.memoryNotes = parsedNotes;
        logger.info(`Retrieved ${parsedNotes.length} notes from persistent storage`);
        return parsedNotes;
      }
    } catch (error) {
      logger.warn('Failed to retrieve notes from persistent storage, using in-memory cache', error);
    }
    
    // Return in-memory notes as fallback
    return [...this.memoryNotes];
  }

  /**
   * Save notes for the next cycle
   * Saves to both in-memory and persistent storage for redundancy
   */
  async saveNotesToSelf(newNotes: string[]): Promise<void> {
    // Update in-memory storage
    this.memoryNotes = [...newNotes];
    
    // Try to persist to filesystem
    try {
      fs.writeFileSync(this.persistencePath, JSON.stringify(newNotes, null, 2));
      logger.info(`Saved ${newNotes.length} notes to persistent storage for next cycle`);
    } catch (error) {
      logger.error('Failed to save notes to persistent storage', error);
    }
  }

  /**
   * Review results of task execution and generate self-reflective notes
   */
  reviewCycleResults(taskResults: Array<{ status: string; [key: string]: unknown }>): string[] {
    const notes: string[] = [];

    taskResults.forEach((result) => {
      if (result.status === "error") {
        notes.push(`Error in ${result.context || 'unknown context'}. Consider learning about ${result.topic || 'this area'}.`);
      }
      if (result.status === "success") {
        notes.push(`Task ${result.task || 'unknown task'} succeeded, unlocking dependencies: ${result.unlocked || 'none'}.`);
      }
    });

    return notes;
  }

  /**
   * Process end of cycle, generating and saving notes
   */
  async endCycle(taskResults: Array<{ status: string; [key: string]: unknown }>): Promise<void> {
    const notes = this.reviewCycleResults(taskResults);
    await this.saveNotesToSelf(notes);
  }
}
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

// Export convenience functions that use the singleton
export async function retrievePreviousNotes(): Promise<string[]> {
  return NotesManager.getInstance().retrievePreviousNotes();
}

export async function saveNotesToSelf(newNotes: string[]): Promise<void> {
  return NotesManager.getInstance().saveNotesToSelf(newNotes);
}

export function reviewCycleResults(taskResults: Array<{ status: string; [key: string]: unknown }>): string[] {
  return NotesManager.getInstance().reviewCycleResults(taskResults);
}

export async function endCycle(taskResults: Array<{ status: string; [key: string]: unknown }>): Promise<void> {
  return NotesManager.getInstance().endCycle(taskResults);
}
