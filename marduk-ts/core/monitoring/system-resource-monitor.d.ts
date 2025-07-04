/**
 * System resource monitoring utility for task management
 * Provides information about system load and resource availability
 */
/**
 * System Resource Monitor
 * Tracks system load and resource availability for intelligent task scheduling
 */
export declare class SystemResourceMonitor {
    private systemLoad;
    private updateInterval;
    private lastUpdateTime;
    private resourceCategories;
    private intervalId;
    /**
     * Creates a new SystemResourceMonitor
     * @param updateIntervalMs How often to automatically update load metrics (in ms)
     */
    constructor(updateIntervalMs?: number);
    /**
     * Start automatic resource monitoring
     */
    startMonitoring(): void;
    /**
     * Stop automatic resource monitoring
     */
    stopMonitoring(): void;
    /**
     * Get current overall system load (0-1)
     */
    getSystemLoad(): number;
    /**
     * Get resource availability for a specific category (0-1)
     * @param category Resource category (cpu, memory, network, io, ai)
     */
    getResourceAvailability(category: string): number;
    /**
     * Reserve resources for a task execution
     * @param category Resource category
     * @param amount Amount to reserve (in category units)
     * @returns Whether reservation was successful
     */
    reserveResources(category: string, amount: number): boolean;
    /**
     * Release previously reserved resources
     * @param category Resource category
     * @param amount Amount to release
     */
    releaseResources(category: string, amount: number): void;
    /**
     * Manually set the load for a specific resource category
     * @param category Resource category
     * @param load Load factor (0-1)
     */
    setResourceLoad(category: string, load: number): void;
    /**
     * Update resource metrics from the system
     * In a real implementation, this would query actual system metrics
     */
    private updateResourceMetrics;
    /**
     * Simulate a metrics update with some randomness
     */
    private simulateMetricsUpdate;
    /**
     * Update the overall system load based on resource categories
     */
    private updateSystemLoad;
    /**
     * Get a snapshot of current resource utilization
     */
    getResourceSnapshot(): Record<string, any>;
}
//# sourceMappingURL=system-resource-monitor.d.ts.map