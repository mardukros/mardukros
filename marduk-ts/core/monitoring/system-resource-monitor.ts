/**
 * System resource monitoring utility for task management
 * Provides information about system load and resource availability
 */

import { logger } from '../utils/logger.js';

/**
 * Resource category configuration
 */
interface ResourceCategory {
  currentLoad: number;       // Current load factor (0-1)
  maxCapacity: number;       // Maximum capacity in arbitrary units
  currentUsage: number;      // Current usage in arbitrary units
  reservedCapacity: number;  // Capacity reserved for critical tasks
}

/**
 * System Resource Monitor
 * Tracks system load and resource availability for intelligent task scheduling
 */
export class SystemResourceMonitor {
  private systemLoad: number = 0;
  private updateInterval: number;
  private lastUpdateTime: number = 0;
  private resourceCategories: Map<string, ResourceCategory> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  
  /**
   * Creates a new SystemResourceMonitor
   * @param updateIntervalMs How often to automatically update load metrics (in ms)
   */
  constructor(updateIntervalMs: number = 30000) {
    this.updateInterval = updateIntervalMs;
    
    // Initialize default resource categories
    this.resourceCategories.set('cpu', {
      currentLoad: 0.1,
      maxCapacity: 100,
      currentUsage: 10,
      reservedCapacity: 20
    });
    
    this.resourceCategories.set('memory', {
      currentLoad: 0.2,
      maxCapacity: 100,
      currentUsage: 20,
      reservedCapacity: 15
    });
    
    this.resourceCategories.set('network', {
      currentLoad: 0.05,
      maxCapacity: 100,
      currentUsage: 5,
      reservedCapacity: 10
    });
    
    this.resourceCategories.set('io', {
      currentLoad: 0.1,
      maxCapacity: 100,
      currentUsage: 10,
      reservedCapacity: 5
    });
    
    this.resourceCategories.set('ai', {
      currentLoad: 0.3,
      maxCapacity: 100,
      currentUsage: 30,
      reservedCapacity: 25
    });
    
    // Start periodic updates
    this.startMonitoring();
  }
  
  /**
   * Start automatic resource monitoring
   */
  public startMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.updateResourceMetrics();
    this.intervalId = setInterval(() => this.updateResourceMetrics(), this.updateInterval);
    logger.info(`System resource monitoring started with ${this.updateInterval}ms interval`);
  }
  
  /**
   * Stop automatic resource monitoring
   */
  public stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('System resource monitoring stopped');
    }
  }
  
  /**
   * Get current overall system load (0-1)
   */
  public getSystemLoad(): number {
    // Ensure metrics are not too stale
    const now = Date.now();
    if (now - this.lastUpdateTime > this.updateInterval * 2) {
      this.updateResourceMetrics();
    }
    return this.systemLoad;
  }
  
  /**
   * Get resource availability for a specific category (0-1)
   * @param category Resource category (cpu, memory, network, io, ai)
   */
  public getResourceAvailability(category: string): number {
    const resourceInfo = this.resourceCategories.get(category);
    if (!resourceInfo) {
      // Unknown category, assume moderate availability
      return 0.7;
    }
    
    const availableCapacity = resourceInfo.maxCapacity - resourceInfo.currentUsage;
    const availabilityRatio = availableCapacity / 
                             (resourceInfo.maxCapacity - resourceInfo.reservedCapacity);
    
    // Return value between 0-1, where 0 means no availability and 1 means fully available
    return Math.max(0, Math.min(1, availabilityRatio));
  }
  
  /**
   * Reserve resources for a task execution
   * @param category Resource category
   * @param amount Amount to reserve (in category units)
   * @returns Whether reservation was successful
   */
  public reserveResources(category: string, amount: number): boolean {
    const resourceInfo = this.resourceCategories.get(category);
    if (!resourceInfo) {
      return false;
    }
    
    // Check if enough capacity is available
    const availableCapacity = resourceInfo.maxCapacity - resourceInfo.currentUsage;
    if (availableCapacity < amount) {
      return false;
    }
    
    // Reserve the resources
    resourceInfo.currentUsage += amount;
    resourceInfo.currentLoad = resourceInfo.currentUsage / resourceInfo.maxCapacity;
    this.updateSystemLoad();
    
    return true;
  }
  
  /**
   * Release previously reserved resources
   * @param category Resource category
   * @param amount Amount to release
   */
  public releaseResources(category: string, amount: number): void {
    const resourceInfo = this.resourceCategories.get(category);
    if (!resourceInfo) {
      return;
    }
    
    // Release resources and ensure we don't go below zero
    resourceInfo.currentUsage = Math.max(0, resourceInfo.currentUsage - amount);
    resourceInfo.currentLoad = resourceInfo.currentUsage / resourceInfo.maxCapacity;
    this.updateSystemLoad();
  }
  
  /**
   * Manually set the load for a specific resource category
   * @param category Resource category
   * @param load Load factor (0-1)
   */
  public setResourceLoad(category: string, load: number): void {
    const resourceInfo = this.resourceCategories.get(category);
    if (!resourceInfo) {
      // Create category if it doesn't exist
      this.resourceCategories.set(category, {
        currentLoad: load,
        maxCapacity: 100,
        currentUsage: load * 100,
        reservedCapacity: 10
      });
    } else {
      resourceInfo.currentLoad = load;
      resourceInfo.currentUsage = load * resourceInfo.maxCapacity;
    }
    
    this.updateSystemLoad();
  }
  
  /**
   * Update resource metrics from the system
   * In a real implementation, this would query actual system metrics
   */
  private updateResourceMetrics(): void {
    // In a real implementation, we would get actual system metrics here
    // For now, we'll use simulated metrics with some randomness
    
    this.simulateMetricsUpdate();
    this.updateSystemLoad();
    
    this.lastUpdateTime = Date.now();
  }
  
  /**
   * Simulate a metrics update with some randomness
   */
  private simulateMetricsUpdate(): void {
    // Simulate varying load for each category
    for (const [category, info] of this.resourceCategories.entries()) {
      // Random variation between -10% and +10%
      const variation = (Math.random() * 0.2) - 0.1;
      
      // Ensure load stays within bounds
      const newLoad = Math.max(0.05, Math.min(0.95, info.currentLoad + variation));
      info.currentLoad = newLoad;
      info.currentUsage = newLoad * info.maxCapacity;
      
      logger.debug(`Resource update for ${category}: load=${newLoad.toFixed(2)}, usage=${info.currentUsage.toFixed(1)}/${info.maxCapacity}`);
    }
  }
  
  /**
   * Update the overall system load based on resource categories
   */
  private updateSystemLoad(): void {
    // Calculate overall system load as weighted average of all categories
    const weights: Record<string, number> = {
      'cpu': 0.3,
      'memory': 0.25,
      'network': 0.15,
      'io': 0.15,
      'ai': 0.15
    };
    
    let totalLoad = 0;
    let totalWeight = 0;
    
    for (const [category, info] of this.resourceCategories.entries()) {
      const weight = weights[category] || 0.1;
      totalLoad += info.currentLoad * weight;
      totalWeight += weight;
    }
    
    this.systemLoad = totalWeight > 0 ? totalLoad / totalWeight : 0.5;
  }
  
  /**
   * Get a snapshot of current resource utilization
   */
  public getResourceSnapshot(): Record<string, any> {
    const snapshot: Record<string, any> = {
      systemLoad: this.systemLoad,
      lastUpdateTime: this.lastUpdateTime,
      resources: {}
    };
    
    for (const [category, info] of this.resourceCategories.entries()) {
      snapshot.resources[category] = {
        load: info.currentLoad,
        usage: info.currentUsage,
        capacity: info.maxCapacity,
        reserved: info.reservedCapacity,
        availability: this.getResourceAvailability(category)
      };
    }
    
    return snapshot;
  }
}
