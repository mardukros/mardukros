import { BaseMemoryItem } from '../types/memory-items.js';
import { logger } from '../../utils/logger.js';

export interface MemoryUsageStats {
  totalItems: number;
  totalSize: number;
  averageItemSize: number;
  typeDistribution: Record<string, number>;
  tagDistribution: Record<string, number>;
  accessPatterns: {
    lastHour: number;
    lastDay: number;
    lastWeek: number;
  };
}

export class MemoryStatsCollector {
  private lastCollection: number = 0;
  private readonly COLLECTION_INTERVAL = 5 * 60 * 1000; // 5 minutes

  collectStats<T extends BaseMemoryItem>(items: Map<string, T>): MemoryUsageStats {
    const now = Date.now();
    const itemArray = Array.from(items.values());
    
    const typeDistribution: Record<string, number> = {};
    const tagDistribution: Record<string, number> = {};
    let totalSize = 0;

    const accessCounts = {
      lastHour: 0,
      lastDay: 0,
      lastWeek: 0
    };
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    const hourAgo = now - 3600000;
    const dayAgo = now - 86400000;
    const weekAgo = now - 604800000;
// Consider extracting this duplicated code into a shared function

    itemArray.forEach(item => {
      // Calculate size
      totalSize += JSON.stringify(item).length;
// Consider extracting this duplicated code into a shared function

      // Count types
      typeDistribution[item.type] = (typeDistribution[item.type] || 0) + 1;
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

      // Count tags
      item.metadata.tags.forEach(tag => {
        tagDistribution[tag] = (tagDistribution[tag] || 0) + 1;
      });

      // Track access patterns
      const lastAccessed = item.metadata.lastAccessed;
      if (lastAccessed > hourAgo) accessCounts.lastHour++;
      if (lastAccessed > dayAgo) accessCounts.lastDay++;
      if (lastAccessed > weekAgo) accessCounts.lastWeek++;
    });

    const stats: MemoryUsageStats = {
      totalItems: items.size,
      totalSize,
      averageItemSize: totalSize / items.size,
      typeDistribution,
      tagDistribution,
      accessPatterns: accessCounts
    };

    this.logWarnings(stats);
    this.lastCollection = now;

    return stats;
  }

  private logWarnings(stats: MemoryUsageStats): void {
    // Warn about large memory usage
    if (stats.totalSize > 100 * 1024 * 1024) { // 100MB
      logger.warn('High memory usage detected', {
        totalSize: stats.totalSize,
        totalItems: stats.totalItems
      });
    }

    // Warn about low access patterns
    if (stats.accessPatterns.lastDay < stats.totalItems * 0.1) {
      logger.warn('Low memory utilization detected', {
        accessedLastDay: stats.accessPatterns.lastDay,
        totalItems: stats.totalItems
      });
    }
  }
}