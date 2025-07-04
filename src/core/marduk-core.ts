
import { logger } from './utils/logger.js';

export class MardukCore {
  private static instance: MardukCore;
  private initialized = false;

  constructor() {
    if (MardukCore.instance) {
      return MardukCore.instance;
    }
    MardukCore.instance = this;
  }

  public async initialize(): Promise<void> {
    try {
      if (this.initialized) {
        logger.warn('MardukCore already initialized');
        return;
      }
      
      logger.info('Initializing MardukCore');
      // Initialize core systems here

      this.initialized = true;
      logger.info('MardukCore initialized successfully');
    } catch (error) {
      logger.error('Error initializing MardukCore', error as Error);
      throw error;
    }
  }

  public isInitialized(): boolean {
    return this.initialized;
  }
}
