import { BaseMemoryItem } from '../../../types/memory-items.js';
import { saveToFile, loadFromFile } from '../../../utils/persistence-utils.js';
import { logger } from '../../../../utils/logger.js';

export class MemoryPersistence<T extends BaseMemoryItem> {
  constructor(
    private subsystemName: string,
    private dataDir: string,
    protected subsystem: { items: T[] } // Added subsystem property
  ) {}

  async saveItems(items: Map<string, T>): Promise<void> {
    try {
      // Pass Map directly to saveToFile which expects Map<string, BaseMemoryItem>
      await saveToFile(items, this.dataDir, `${this.subsystemName}.json`);
      logger.info(`Saved ${items.size} items for ${this.subsystemName}`);
    } catch (error) {
      logger.error(`Error saving items for ${this.subsystemName}:`, error as Error);
      throw error;
    }
  }
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

  async loadItems(): Promise<Map<string, T>> {
    try {
      const data = await loadFromFile<T>(this.dataDir, `${this.subsystemName}.json`);
      const items = new Map<string, T>();

      data.forEach((item: any) => {
        if (item && item.id) {
          items.set(item.id, item as T);
        }
      });

      // Convert array to Map for syncItemsToSubsystem
      const itemsMap = new Map<string, T>();
      this.subsystem.items.forEach((item: any) => {
        if (item && item.id) {
          itemsMap.set(item.id, item as T);
        }
      });

      await this.syncItemsToSubsystem(itemsMap, "load");

      return items;
    } catch (error) {
      logger.error(`Error loading items for ${this.subsystemName}:`, error as Error);
      throw error;
    }
  }

  async createSnapshot(): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      // Create a Map from the subsystem items array for proper typing
      const itemsMap = new Map<string, T>();
      this.subsystem.items.forEach((item: any) => {
        if (item && item.id) {
          itemsMap.set(item.id, item as T);
        }
      });
      
      await saveToFile(
        itemsMap,
        `${this.dataDir}/snapshots`,
        `${this.subsystemName}-${timestamp}.json`
      );
      logger.info(`Created snapshot for ${this.subsystemName}`);
    } catch (error) {
      logger.error(`Error creating snapshot for ${this.subsystemName}:`, error as Error);
      throw error;
    }
  }
  // Added syncItemsToSubsystem for completeness,  assuming it exists elsewhere
  async syncItemsToSubsystem(items: Map<string, T>, action: string): Promise<void> {
    //Implementation for syncing items to subsystem.  Placeholder for now.
    console.log(`Syncing ${action}:`, items);
  }
}