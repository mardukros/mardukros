import { MemoryItem } from '../types/base-types.js';
import { calculateMemoryUsage } from './memory-cleanup.js';
import { memorySettings } from '../config.js';

export interface MemoryStats {
  itemCount: number;
  memoryUsage: number;
  indexSize: number;
  lastCleanup: Date | null;
  lastPersistence: Date | null;
  healthStatus: 'healthy' | 'warning' | 'critical';
}

export class MemoryMonitor {
  private lastCleanup: Date | null = null;
  private lastPersistence: Date | null = null;
  private stats: Map<string, MemoryStats> = new Map();

  constructor(private subsystems: Record<string, { items: Map<string | number, MemoryItem> }>) {}

  getStats(subsystemName: string): MemoryStats | null {
    return this.stats.get(subsystemName) || null;
  }

  getAllStats(): Record<string, MemoryStats> {
    return Object.fromEntries(this.stats.entries());
  }

  updateStats(): void {
    Object.entries(this.subsystems).forEach(([name, subsystem]) => {
      const itemCount = subsystem.items.size;
      const memoryUsage = calculateMemoryUsage(subsystem.items);
      const indexSize = this.calculateIndexSize(subsystem);

      const stats: MemoryStats = {
        itemCount,
        memoryUsage,
        indexSize,
        lastCleanup: this.lastCleanup,
        lastPersistence: this.lastPersistence,
        healthStatus: this.calculateHealthStatus(itemCount, memoryUsage)
      };

      this.stats.set(name, stats);
    });
  }

  private calculateIndexSize(subsystem: { items: Map<string | number, MemoryItem> }): number {
    // Estimate index size based on item count and average key size
    const avgKeySize = 32; // bytes
    return subsystem.items.size * avgKeySize;
  }

  private calculateHealthStatus(
    itemCount: number, 
    memoryUsage: number
  ): 'healthy' | 'warning' | 'critical' {
    const memoryThreshold = memorySettings.cleanupThreshold;
    const criticalThreshold = 0.95;

    if (memoryUsage > criticalThreshold) {
      return 'critical';
    }
    if (memoryUsage > memoryThreshold) {
      return 'warning';
    }
    return 'healthy';
  }

  notifyCleanup(): void {
    this.lastCleanup = new Date();
  }

  notifyPersistence(): void {
    this.lastPersistence = new Date();
  }

  generateReport(): string {
    let report = '=== Memory System Health Report ===\n\n';
    
    this.stats.forEach((stats, subsystem) => {
      report += `${subsystem} Memory:\n`;
      report += `  Status: ${stats.healthStatus}\n`;
      report += `  Items: ${stats.itemCount}\n`;
      report += `  Memory Usage: ${(stats.memoryUsage / 1024 / 1024).toFixed(2)} MB\n`;
      report += `  Index Size: ${(stats.indexSize / 1024).toFixed(2)} KB\n`;
      if (stats.lastCleanup) {
        report += `  Last Cleanup: ${stats.lastCleanup.toISOString()}\n`;
      }
      if (stats.lastPersistence) {
        report += `  Last Persistence: ${stats.lastPersistence.toISOString()}\n`;
      }
      report += '\n';
    });

    return report;
  }
}