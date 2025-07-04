import { BaseMemoryItem } from "../../types/memory-items.js";
import { saveToFile, loadFromFile } from "../../utils/persistence-utils.js";
import { logger } from "../../../utils/logger.js";

export class MemoryPersistence<T extends BaseMemoryItem> {
  private items: Map<string, T> = new Map();

  constructor(
    private subsystemName: string,
    private dataDir: string,
  ) {}

  async saveItems(items: Map<string, T>): Promise<void> {
    try {
      await saveToFile(items, this.dataDir, `${this.subsystemName}.json`);
      logger.info(`Saved ${items.size} items for ${this.subsystemName}`);
    } catch (error) {
      logger.error(
        `Error saving items for ${this.subsystemName}:`,
        error as Error,
      );
      throw error;
    }
  }

  async loadItems(): Promise<Map<string, T>> {
    try {
      const items = await loadFromFile<T>(
        this.dataDir,
        `${this.subsystemName}.json`,
      );
      logger.info(`Loaded ${items.size} items for ${this.subsystemName}`);
      return items;
    } catch (error) {
      logger.error(
        `Error loading items for ${this.subsystemName}:`,
        error as Error,
      );
      throw error;
    }
  }

  async createSnapshot(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      await saveToFile(
        this.items,
        `${this.dataDir}/snapshots`,
        `${this.subsystemName}-${timestamp}.json`,
      );
      logger.info(`Created snapshot for ${this.subsystemName}`);
    } catch (error) {
      logger.error(
        `Error creating snapshot for ${this.subsystemName}:`,
        error as Error,
      );
      throw error;
    }
  }
}
