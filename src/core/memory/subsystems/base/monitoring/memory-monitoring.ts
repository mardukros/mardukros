import { BaseMemoryItem } from '../../../types/memory-items.js';
import { MemoryStats } from '../../../types/memory-interface.js';
import { MemoryMonitor } from '../../../utils/memory-monitor.js';
import { logger } from '../../../../utils/logger.js';
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

export class MemoryMonitoring<T extends BaseMemoryItem> {
  private monitor: MemoryMonitor;
  private lastCheck: number = 0;
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(private subsystemName: string) {
    this.monitor = new MemoryMonitor();
  }

  async checkHealth(items: Map<string, T>): Promise<MemoryStats> {
    const now = Date.now();
    if (now - this.lastCheck < this.CHECK_INTERVAL) {
      return this.monitor.getStats();
    }

    try {
      this.monitor.updateStats();
      const stats = this.monitor.getStats();
      
      if (stats.healthStatus !== 'healthy') {
        logger.warn(`Unhealthy memory state in ${this.subsystemName}`, { stats });
      }

      this.lastCheck = now;
      return stats;
    } catch (error) {
      logger.error(`Error checking memory health for ${this.subsystemName}:`, error as Error);
      throw error;
    }
  }

  getStats(): MemoryStats {
    return this.monitor.getStats();
  }
}