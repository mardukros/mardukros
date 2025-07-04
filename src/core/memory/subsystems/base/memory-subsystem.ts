import { MemoryQuery, MemoryOperationResult, MemorySubsystemConfig } from '../../types/memory-types.js';
import { BaseMemoryItem } from '../../types/memory-items.js';
import { logger } from '../../../utils/logger.js';
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

export abstract class BaseMemorySubsystem {
  protected id: string;
  protected config: MemorySubsystemConfig;
  protected initialized: boolean = false;

  constructor(id: string, config: Partial<MemorySubsystemConfig>) {
    this.id = id;
    this.config = {
      id,
      type: 'semantic',
      capacity: 10000,
      persistence: false,
      indexing: [],
      ...config
    } as MemorySubsystemConfig;

    this.initialize();
  }

  protected async initialize(): Promise<void> {
    try {
      // Initialization logic
      this.initialized = true;
      logger.info(`Initialized memory subsystem: ${this.id}`);
    } catch (error) {
      logger.error(`Failed to initialize memory subsystem: ${this.id}`, error as Error);
    }
  }

  abstract store(item: BaseMemoryItem): Promise<MemoryOperationResult>;
  abstract query(query: MemoryQuery): Promise<MemoryOperationResult>;

  /**
   * Get name of memory subsystem
   */
  getName(): string {
    return this.config.id; //Using config.id as a stand-in for name since it's not present in the original.
  }

  /**
   * Get count of items in memory - This is a placeholder and needs implementation based on the specific memory subsystem.
   */
  async getCount(): Promise<number> {
    return 0; // Placeholder -  Requires implementation specific to the memory subsystem.
  }


  protected abstract handleMessage(message: any): Promise<void>;
  protected abstract matchesQuery(item: BaseMemoryItem, query: MemoryQuery): boolean;
}