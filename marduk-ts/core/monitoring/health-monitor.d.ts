import { EventEmitter } from 'events';
/**
 * Possible health status values for system and components
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'critical';
/**
 * Resource utilization metrics for system monitoring
 */
export interface ResourceUtilization {
    cpu: {
        usage: number;
        loadAverage: number[];
    };
    memory: {
        total: number;
        free: number;
        used: number;
        usagePercent: number;
    };
    disk: {
        total: number;
        free: number;
        used: number;
        usagePercent: number;
    };
    network?: {
        bytesReceived: number;
        bytesSent: number;
        connections: number;
    };
    process: {
        uptime: number;
        memory: NodeJS.MemoryUsage;
        cpuUsage: NodeJS.CpuUsage;
    };
}
/**
 * Alert configuration for health monitoring
 */
export interface AlertConfig {
    enabled: boolean;
    thresholds: {
        cpu: number;
        memory: number;
        disk: number;
        responseTime: number;
    };
    cooldown: number;
}
/**
 * Response time metrics for API and subsystem performance monitoring
 */
export interface ResponseTimes {
    ai: {
        average: number;
        min: number;
        max: number;
        p95: number;
        requestCount: number;
    };
    memory: {
        average: number;
        min: number;
        max: number;
        p95: number;
        requestCount: number;
    };
    api: {
        average: number;
        min: number;
        max: number;
        p95: number;
        requestCount: number;
        endpoints: Record<string, {
            average: number;
            count: number;
        }>;
    };
}
/**
 * Overall system health status and detailed component information
 */
export interface SystemHealth {
    status: HealthStatus;
    components: Record<string, ComponentHealth>;
    resources: ResourceUtilization;
    responseTimes: ResponseTimes;
    alerts: Alert[];
    timestamp: string;
    version: string;
}
/**
 * Health information for an individual system component
 */
export interface ComponentHealth {
    status: HealthStatus;
    details: Record<string, unknown>;
    metrics?: {
        responseTime?: number;
        errorRate?: number;
        throughput?: number;
        saturation?: number;
    };
    lastCheck: string;
    checkDuration?: number;
    consecutiveFailures?: number;
}
/**
 * System alert with severity, message, and context
 */
export interface Alert {
    id: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    component: string;
    timestamp: string;
    details?: Record<string, unknown>;
    acknowledged?: boolean;
}
/**
 * Health check result with duration metrics
 */
export interface HealthCheckResult<T> {
    result: T;
    duration: number;
    timestamp: string;
}
export declare class HealthMonitor extends EventEmitter {
    private static instance;
    private memoryFactory;
    private aiCoordinator;
    private taskManager?;
    private lastCheck;
    private checkInterval;
    private alertInterval;
    private performanceMetricsInterval;
    private readonly healthCheckIntervalMs;
    private readonly alertCheckIntervalMs;
    private readonly metricsIntervalMs;
    private responseTimes;
    private alerts;
    private lastAlertTime;
    private alertConfig;
    private componentHealthCache;
    private consecutiveFailures;
    private constructor();
    private appVersion;
    static getInstance(): HealthMonitor;
    /**
     * Starts automated health monitoring, alerts, and metrics collection
     */
    private startAutomatedMonitoring;
    /**
     * Stops all automated monitoring intervals
     */
    stopMonitoring(): void;
    /**
     * Measures the time taken for a function to execute and records it for a specific component
     * @param component The component being measured (ai, memory, api)
     * @param endpoint Optional endpoint name for API calls
     * @param fn The function to time
     * @returns The result of the function
     */
    measureResponseTime<T>(component: 'ai' | 'memory' | 'api', endpoint: string | null, fn: () => Promise<T>): Promise<T>;
    /**
     * Collects real-time system resource utilization metrics
     */
    private collectResourceMetrics;
    /**
     * Collects and records detailed performance metrics
     */
    private collectPerformanceMetrics;
    /**
     * Checks if resource utilization exceeds thresholds and creates alerts
     */
    private checkResourceThresholds;
    /**
     * Creates a new alert and adds it to the alert history, with cooldown logic
     */
    private createAlert;
    /**
     * Acknowledges an alert by ID
     */
    acknowledgeAlert(alertId: string): boolean;
    /**
     * Gets all current alerts, optionally filtered by acknowledgement status
     */
    getAlerts(options?: {
        acknowledged?: boolean;
    }): Alert[];
    /**
     * Checks for system-level alerts based on current health status
     */
    private checkForAlerts;
    /**
     * Performs a comprehensive health check of all system components
     * @returns The complete system health status
     */
    checkHealth(): Promise<SystemHealth>;
    /**
     * Helper method to time component health checks and track metrics
     */
    private timedHealthCheck;
    /**
     * Creates a default component health object for cases when a check isn't available
     */
    private createDefaultComponentHealth;
    /**
     * Checks memory subsystem health by querying the memory monitor
     */
    private checkMemoryHealth;
    /**
     * Checks AI subsystem health by sending a test query
     */
    private checkAiHealth;
    /**
     * Checks task management subsystem health
     */
    private checkTaskHealth;
    /**
     * Determines the overall system health status based on component health
     * @param components All component health objects
     * @returns The overall system health status
     */
    private determineOverallStatus;
    /**
     * Calculates response time metrics for all monitored components
     */
    private calculateResponseTimeMetrics;
    /**
     * Returns the most recent health check result
     */
    getLastCheck(): SystemHealth | null;
    /**
     * Gets summary health status without running a new check
     */
    getHealthSummary(): {
        status: HealthStatus;
        lastCheck: string;
        components: Record<string, HealthStatus>;
    };
    /**
     * Monitors subsystem health and logs the results
     */
    monitorSubsystemHealth(): Promise<void>;
    /**
     * Logs detailed health metrics to the performance log
     */
    logHealthMetrics(): Promise<void>;
    /**
     * Resets the health monitoring system, clearing all cached data
     */
    reset(): void;
}
export declare const healthMonitor: HealthMonitor;
//# sourceMappingURL=health-monitor.d.ts.map