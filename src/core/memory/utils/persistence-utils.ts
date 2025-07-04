import { promises as fs } from 'fs';
import { join } from 'path';
import { BaseMemoryItem } from '../types/memory-items.js';
import { logger } from '../../utils/logger.js';

export async function saveToFile<T extends BaseMemoryItem>(
  items: Map<string, T>,
  directory: string,
  filename: string
): Promise<void> {
  try {
    await fs.mkdir(directory, { recursive: true });
    const filePath = join(directory, filename);
    const data = Array.from(items.entries());
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    logger.info(`Saved ${items.size} items to ${filePath}`);
  } catch (error) {
    logger.error('Error saving to file:', error as Error);
    throw error;
  }
}

export async function loadFromFile<T extends BaseMemoryItem>(
  directory: string,
  filename: string
): Promise<Map<string, T>> {
  try {
    const filePath = join(directory, filename);
    const data = await fs.readFile(filePath, 'utf8');
    const items = new Map<string, T>(JSON.parse(data));
    
    logger.info(`Loaded ${items.size} items from ${filePath}`);
    return items;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      logger.info(`No existing file found at ${filename}, starting fresh`);
      return new Map<string, T>();
    }
    logger.error('Error loading from file:', error as Error);
    throw error;
  }
}