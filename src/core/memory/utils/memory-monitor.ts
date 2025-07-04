import { logger } from '../../utils/logger.js';
import { BaseMemoryItem } from '../types/memory-items.js';
import { MemoryStats } from '../types/memory-interface.js';

/**
 * Monitors memory system health and performance
 */
export class MemoryMonitor {
  private stats: MemoryStats = {
    totalItems: 0,
    byType: {},
    lastOptimized: new Date(),
    compressionRatio: 1.0,
    queryLatency: 0,
    indexEfficiency: 1.0,
    healthStatus: 'healthy'
  };

  private lastCheck: number = Date.now();
  private readonly CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
   * Update memory stats based on current items
   */
  updateStats<T extends BaseMemoryItem>(items?: Map<string, T>): void {
    try {
      // Calculate basic stats if items are provided
      if (items) {
        this.stats.totalItems = items.size;

        // Count by type
        const byType: Record<string, number> = {};
        for (const item of items.values()) {
          byType[item.type] = (byType[item.type] || 0) + 1;
        }
        this.stats.byType = byType;
      }

      // Analyze health status based on stats
      this.analyzeHealth();

      this.lastCheck = Date.now();
    } catch (error) {
      logger.error('Error updating memory stats', error as Error);
    }
  }

  /**
   * Analyze memory health
   */
  private analyzeHealth(): void {
    // Determine health status based on metrics
    // This is a simplified implementation
    const { totalItems, queryLatency, indexEfficiency } = this.stats;

    if (queryLatency && queryLatency > 200) {
      this.stats.healthStatus = 'critical';
    } else if (totalItems > 10000 || (indexEfficiency && indexEfficiency < 0.5)) {
      this.stats.healthStatus = 'degraded';
    } else {
      this.stats.healthStatus = 'healthy';
    }
  }

  /**
   * Get current memory stats
   */
  getStats(): MemoryStats {
    return { ...this.stats };
  }

  /**
   * Record query performance
   */
  recordQueryPerformance(queryTimeMs: number): void {
    this.stats.queryLatency = 
      this.stats.queryLatency ? 
      (this.stats.queryLatency * 0.7 + queryTimeMs * 0.3) : // Weighted average
      queryTimeMs;
  }

  /**
   * Record memory optimization
   */
  recordOptimization(beforeSize: number, afterSize: number): void {
    if (beforeSize > 0) {
      this.stats.compressionRatio = beforeSize / afterSize;
      this.stats.lastOptimized = new Date();
    }
  }

  /**
   * Update index efficiency
   */
  updateIndexEfficiency(efficiency: number): void {
    this.stats.indexEfficiency = efficiency;
  }
}