
/**
 * Monitors memory usage and patterns
 */
export class MemoryMonitor {
  constructor() {
    this.usageStats = {
      reads: 0,
      writes: 0,
      deletes: 0,
      queries: 0,
      itemsCreated: 0,
      itemsAccessed: 0,
      itemsModified: 0,
      itemsDeleted: 0,
      totalItems: 0,
      averageQueryTime: 0,
      totalQueryTime: 0,
      totalQueries: 0
    };
    
    this.accessPatterns = {};
    this.moduleUsage = {};
  }
  
  /**
   * Tracks a read operation
   */
  trackRead(itemId, module) {
    this.usageStats.reads++;
    this.usageStats.itemsAccessed++;
    
    this._trackModuleUsage(module, 'read');
    this._trackAccessPattern(itemId, 'read');
  }
  
  /**
   * Tracks a write operation
   */
  trackWrite(itemId, module, isNew = false) {
    this.usageStats.writes++;
    
    if (isNew) {
      this.usageStats.itemsCreated++;
      this.usageStats.totalItems++;
    } else {
      this.usageStats.itemsModified++;
    }
    
    this._trackModuleUsage(module, 'write');
    this._trackAccessPattern(itemId, 'write');
  }
  
  /**
   * Tracks a delete operation
   */
  trackDelete(itemId, module) {
    this.usageStats.deletes++;
    this.usageStats.itemsDeleted++;
    this.usageStats.totalItems--;
    
    this._trackModuleUsage(module, 'delete');
    this._trackAccessPattern(itemId, 'delete');
  }
  
  /**
   * Tracks a query operation
   */
  trackQuery(queryParams, resultCount, queryTime, module) {
    this.usageStats.queries++;
    this.usageStats.totalQueryTime += queryTime;
    this.usageStats.totalQueries++;
    this.usageStats.averageQueryTime = this.usageStats.totalQueryTime / this.usageStats.totalQueries;
    
    this._trackModuleUsage(module, 'query');
    
    // Track query patterns (simplified)
    const queryKey = JSON.stringify(queryParams || {});
    if (!this.accessPatterns[queryKey]) {
      this.accessPatterns[queryKey] = {
        count: 0,
        averageResults: 0,
        totalResults: 0,
        averageTime: 0,
        totalTime: 0
      };
    }
    
    const pattern = this.accessPatterns[queryKey];
    pattern.count++;
    pattern.totalResults += resultCount;
    pattern.averageResults = pattern.totalResults / pattern.count;
    pattern.totalTime += queryTime;
    pattern.averageTime = pattern.totalTime / pattern.count;
  }
  
  /**
   * Gets usage statistics
   */
  getUsageStats() {
    return { ...this.usageStats };
  }
  
  /**
   * Gets access patterns
   */
  getAccessPatterns() {
    return { ...this.accessPatterns };
  }
  
  /**
   * Gets module usage
   */
  getModuleUsage() {
    return { ...this.moduleUsage };
  }
  
  /**
   * Tracks module usage
   */
  _trackModuleUsage(module, operation) {
    if (!module) return;
    
    if (!this.moduleUsage[module]) {
      this.moduleUsage[module] = {
        reads: 0,
        writes: 0,
        deletes: 0,
        queries: 0
      };
    }
    
    this.moduleUsage[module][operation]++;
  }
  
  /**
   * Tracks access patterns
   */
  _trackAccessPattern(itemId, operation) {
    if (!itemId) return;
    
    if (!this.accessPatterns[itemId]) {
      this.accessPatterns[itemId] = {
        reads: 0,
        writes: 0,
        deletes: 0,
        lastAccessed: Date.now()
      };
    }
    
    this.accessPatterns[itemId][operation]++;
    this.accessPatterns[itemId].lastAccessed = Date.now();
  }
}
