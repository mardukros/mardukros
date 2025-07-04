import { EventEmitter } from 'events';
import { logger } from '../logging/logger.js';
import { MemorySystemFactory } from '../memory/memory-factory.js';
import { AiCoordinator } from '../ai/ai-coordinator.js';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { TaskManager } from '../task/task-manager.js';
import { performance } from 'perf_hooks';
export class HealthMonitor extends EventEmitter {
    static instance;
    memoryFactory;
    aiCoordinator;
    taskManager;
    lastCheck = null;
    checkInterval = null;
    alertInterval = null;
    performanceMetricsInterval = null;
    // Configurable check intervals
    healthCheckIntervalMs = 60000; // 1 minute
    alertCheckIntervalMs = 30000; // 30 seconds
    metricsIntervalMs = 5000; // 5 seconds
    // Response time tracking
    responseTimes = {
        ai: [],
        memory: [],
        api: {
            all: [],
            byEndpoint: {},
        },
    };
    // Alert history and cooldown tracking
    alerts = [];
    lastAlertTime = {};
    alertConfig = {
        enabled: true,
        thresholds: {
            cpu: 90, // 90% CPU usage
            memory: 85, // 85% memory usage
            disk: 90, // 90% disk usage
            responseTime: 2000 // 2 seconds
        },
        cooldown: 300000 // 5 minutes between similar alerts
    };
    // Health check result caching
    componentHealthCache = {};
    // Component failure tracking
    consecutiveFailures = {};
    constructor() {
        super();
        this.memoryFactory = MemorySystemFactory.getInstance();
        this.aiCoordinator = new AiCoordinator();
        // Try to initialize task manager if available
        try {
            this.taskManager = TaskManager.getInstance();
        }
        catch (error) {
            logger.warn('TaskManager not available for health monitoring', { error: error instanceof Error ? error.message : String(error) });
        }
        // Set up application version
        try {
            const packageJsonPath = path.resolve(process.cwd(), 'package.json');
            this.appVersion = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')).version || 'unknown';
        }
        catch (error) {
            logger.warn('Could not determine application version', { error: error instanceof Error ? error.message : String(error) });
            this.appVersion = 'unknown';
        }
        // Initialize metrics collection and automated health checks
        this.startAutomatedMonitoring();
    }
    // Application version tracking
    appVersion = 'unknown';
    static getInstance() {
        if (!HealthMonitor.instance) {
            HealthMonitor.instance = new HealthMonitor();
        }
        return HealthMonitor.instance;
    }
    /**
     * Starts automated health monitoring, alerts, and metrics collection
     */
    startAutomatedMonitoring() {
        // Start periodic health checks
        this.checkInterval = setInterval(() => {
            this.monitorSubsystemHealth().catch(error => {
                logger.error('Error in automated health check', error);
            });
        }, this.healthCheckIntervalMs);
        // Start alert checking
        this.alertInterval = setInterval(() => {
            this.checkForAlerts().catch(error => {
                logger.error('Error in alert check', error);
            });
        }, this.alertCheckIntervalMs);
        // Start detailed performance metrics collection
        this.performanceMetricsInterval = setInterval(() => {
            this.collectPerformanceMetrics().catch(error => {
                logger.error('Error collecting performance metrics', error);
            });
        }, this.metricsIntervalMs);
        logger.info('Automated health monitoring started', {
            healthCheckInterval: `${this.healthCheckIntervalMs}ms`,
            alertInterval: `${this.alertCheckIntervalMs}ms`,
            metricsInterval: `${this.metricsIntervalMs}ms`
        });
    }
    /**
     * Stops all automated monitoring intervals
     */
    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
        if (this.alertInterval) {
            clearInterval(this.alertInterval);
            this.alertInterval = null;
        }
        if (this.performanceMetricsInterval) {
            clearInterval(this.performanceMetricsInterval);
            this.performanceMetricsInterval = null;
        }
        logger.info('Automated health monitoring stopped');
    }
    /**
     * Measures the time taken for a function to execute and records it for a specific component
     * @param component The component being measured (ai, memory, api)
     * @param endpoint Optional endpoint name for API calls
     * @param fn The function to time
     * @returns The result of the function
     */
    async measureResponseTime(component, endpoint, fn) {
        const startTime = performance.now();
        try {
            const result = await fn();
            const duration = performance.now() - startTime;
            // Record the response time
            if (component === 'ai') {
                this.responseTimes.ai.push(duration);
                // Keep only the last 1000 measurements
                if (this.responseTimes.ai.length > 1000) {
                    this.responseTimes.ai.shift();
                }
            }
            else if (component === 'memory') {
                this.responseTimes.memory.push(duration);
                if (this.responseTimes.memory.length > 1000) {
                    this.responseTimes.memory.shift();
                }
            }
            else if (component === 'api') {
                this.responseTimes.api.all.push(duration);
                if (this.responseTimes.api.all.length > 1000) {
                    this.responseTimes.api.all.shift();
                }
                // Also record by endpoint if provided
                if (endpoint) {
                    if (!this.responseTimes.api.byEndpoint[endpoint]) {
                        this.responseTimes.api.byEndpoint[endpoint] = [];
                    }
                    this.responseTimes.api.byEndpoint[endpoint].push(duration);
                    if (this.responseTimes.api.byEndpoint[endpoint].length > 100) {
                        this.responseTimes.api.byEndpoint[endpoint].shift();
                    }
                }
            }
            // Check for slow responses and create alerts if needed
            if (duration > this.alertConfig.thresholds.responseTime) {
                this.createAlert({
                    severity: 'warning',
                    component,
                    message: `Slow ${component} response${endpoint ? ` for ${endpoint}` : ''}: ${duration.toFixed(2)}ms`,
                    details: { duration, endpoint }
                });
            }
            return result;
        }
        catch (error) {
            const duration = performance.now() - startTime;
            logger.error(`Error in ${component} operation`, error, {
                component,
                endpoint,
                duration
            });
            throw error;
        }
    }
    /**
     * Collects real-time system resource utilization metrics
     */
    async collectResourceMetrics() {
        // Get CPU information
        const cpus = os.cpus();
        const loadAvg = os.loadavg();
        // Get memory information
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        // Get disk information (approximation - would need a better library for accurate readings)
        let diskTotal = 0;
        let diskFree = 0;
        let diskUsed = 0;
        let diskUsagePercent = 0;
        try {
            // Use fs.statfs for disk info if available, otherwise use mock data
            // This is a simplified approach - in production would use a proper disk space library
            const rootPath = os.platform() === 'win32' ? 'C:\\' : '/';
            const stats = fs.statfsSync(rootPath);
            diskTotal = stats.blocks * stats.bsize;
            diskFree = stats.bfree * stats.bsize;
            diskUsed = diskTotal - diskFree;
            diskUsagePercent = (diskUsed / diskTotal) * 100;
        }
        catch (error) {
            logger.warn('Could not collect disk metrics', { error: error instanceof Error ? error.message : String(error) });
            // Mock data if we can't get real disk stats
            diskTotal = 1000000000000; // 1 TB
            diskFree = 500000000000; // 500 GB
            diskUsed = diskTotal - diskFree;
            diskUsagePercent = 50;
        }
        // Get process metrics
        const processUptime = process.uptime();
        const processMemoryUsage = process.memoryUsage();
        const processCpuUsage = process.cpuUsage();
        // Calculate CPU usage
        let cpuUsage = 0;
        try {
            // This is an approximation - real CPU usage monitoring would require more complex logic
            // Ideally we'd track usage over time
            const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
            const totalTick = cpus.reduce((acc, cpu) => acc + Object.values(cpu.times).reduce((sum, time) => sum + time, 0), 0);
            cpuUsage = 100 - ((totalIdle / totalTick) * 100);
        }
        catch (error) {
            logger.warn('Error calculating CPU usage', { error: error instanceof Error ? error.message : String(error) });
            // Fallback to load average as an approximation
            cpuUsage = (loadAvg[0] / cpus.length) * 100;
        }
        return {
            cpu: {
                usage: cpuUsage,
                loadAverage: loadAvg,
            },
            memory: {
                total: totalMem,
                free: freeMem,
                used: usedMem,
                usagePercent: (usedMem / totalMem) * 100,
            },
            disk: {
                total: diskTotal,
                free: diskFree,
                used: diskUsed,
                usagePercent: diskUsagePercent,
            },
            process: {
                uptime: processUptime,
                memory: processMemoryUsage,
                cpuUsage: processCpuUsage,
            },
        };
    }
    /**
     * Collects and records detailed performance metrics
     */
    async collectPerformanceMetrics() {
        try {
            const resources = await this.collectResourceMetrics();
            // Log detailed metrics at appropriate intervals to avoid flooding logs
            logger.debug('Performance metrics collected', { resources });
            // Check for resource utilization thresholds
            await this.checkResourceThresholds(resources);
            // Emit event for subscribers
            this.emit('performanceMetrics', resources);
        }
        catch (error) {
            logger.error('Failed to collect performance metrics', error);
        }
    }
    /**
     * Checks if resource utilization exceeds thresholds and creates alerts
     */
    async checkResourceThresholds(resources) {
        // Check CPU threshold
        if (resources.cpu.usage > this.alertConfig.thresholds.cpu) {
            this.createAlert({
                severity: 'warning',
                component: 'system',
                message: `High CPU usage: ${resources.cpu.usage.toFixed(1)}%`,
                details: { cpuUsage: resources.cpu.usage, loadAverage: resources.cpu.loadAverage }
            });
        }
        // Check memory threshold
        if (resources.memory.usagePercent > this.alertConfig.thresholds.memory) {
            this.createAlert({
                severity: 'warning',
                component: 'system',
                message: `High memory usage: ${resources.memory.usagePercent.toFixed(1)}%`,
                details: { memoryUsed: resources.memory.used, memoryTotal: resources.memory.total }
            });
        }
        // Check disk threshold
        if (resources.disk.usagePercent > this.alertConfig.thresholds.disk) {
            this.createAlert({
                severity: 'warning',
                component: 'system',
                message: `High disk usage: ${resources.disk.usagePercent.toFixed(1)}%`,
                details: { diskUsed: resources.disk.used, diskTotal: resources.disk.total }
            });
        }
    }
    /**
     * Creates a new alert and adds it to the alert history, with cooldown logic
     */
    createAlert(options) {
        if (!this.alertConfig.enabled) {
            return;
        }
        const now = Date.now();
        const alertKey = `${options.component}-${options.severity}-${options.message}`;
        // Check cooldown for similar alerts
        if (this.lastAlertTime[alertKey] &&
            (now - this.lastAlertTime[alertKey]) < this.alertConfig.cooldown) {
            logger.debug('Alert suppressed due to cooldown', {
                alertKey,
                timeSinceLastAlert: now - this.lastAlertTime[alertKey],
                cooldownPeriod: this.alertConfig.cooldown
            });
            return;
        }
        // Create new alert
        const alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            severity: options.severity,
            message: options.message,
            component: options.component,
            timestamp: new Date().toISOString(),
            details: options.details,
            acknowledged: false
        };
        // Add to alerts list (limited to last 100 alerts)
        this.alerts.push(alert);
        if (this.alerts.length > 100) {
            this.alerts.shift();
        }
        // Update cooldown timestamp
        this.lastAlertTime[alertKey] = now;
        // Log the alert
        if (alert.severity === 'critical' || alert.severity === 'error') {
            logger.error(`ALERT: ${alert.message}`, undefined, {
                alertId: alert.id,
                component: alert.component,
                details: alert.details
            });
        }
        else if (alert.severity === 'warning') {
            logger.warn(`ALERT: ${alert.message}`, {
                alertId: alert.id,
                component: alert.component,
                details: alert.details
            });
        }
        else {
            logger.info(`ALERT: ${alert.message}`, {
                alertId: alert.id,
                component: alert.component,
                details: alert.details
            });
        }
        // Emit alert event
        this.emit('alert', alert);
    }
    /**
     * Acknowledges an alert by ID
     */
    acknowledgeAlert(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (alert) {
            alert.acknowledged = true;
            logger.info(`Alert acknowledged: ${alert.message}`, { alertId });
            return true;
        }
        return false;
    }
    /**
     * Gets all current alerts, optionally filtered by acknowledgement status
     */
    getAlerts(options) {
        if (options?.acknowledged !== undefined) {
            return this.alerts.filter(alert => alert.acknowledged === options.acknowledged);
        }
        return [...this.alerts];
    }
    /**
     * Checks for system-level alerts based on current health status
     */
    async checkForAlerts() {
        try {
            // Get current system health
            const health = await this.checkHealth();
            // Check for overall system health alerts
            if (health.status === 'unhealthy') {
                this.createAlert({
                    severity: 'error',
                    component: 'system',
                    message: 'System is unhealthy',
                    details: { components: Object.entries(health.components)
                            .filter(([, comp]) => comp.status === 'unhealthy')
                            .map(([name]) => name) }
                });
            }
            else if (health.status === 'degraded') {
                this.createAlert({
                    severity: 'warning',
                    component: 'system',
                    message: 'System performance is degraded',
                    details: { components: Object.entries(health.components)
                            .filter(([, comp]) => comp.status !== 'healthy')
                            .map(([name, comp]) => ({ name, status: comp.status })) }
                });
            }
            // Check tasks in queue if task manager is available
            if (this.taskManager) {
                const queueStats = await this.taskManager.getQueueStats();
                if (queueStats.stalled > 5) {
                    this.createAlert({
                        severity: 'warning',
                        component: 'tasks',
                        message: `${queueStats.stalled} stalled tasks detected`,
                        details: { queueStats }
                    });
                }
                if (queueStats.failed > 10) {
                    this.createAlert({
                        severity: 'error',
                        component: 'tasks',
                        message: `High number of failed tasks: ${queueStats.failed}`,
                        details: { queueStats }
                    });
                }
            }
        }
        catch (error) {
            logger.error('Error checking for alerts', error);
        }
    }
    /**
     * Performs a comprehensive health check of all system components
     * @returns The complete system health status
     */
    async checkHealth() {
        try {
            // Track the start time for performance monitoring
            const startTime = performance.now();
            // Run component health checks with timing
            const memoryHealth = await this.timedHealthCheck('memory', () => this.checkMemoryHealth());
            const aiHealth = await this.timedHealthCheck('ai', () => this.checkAiHealth());
            const taskHealth = this.taskManager ?
                await this.timedHealthCheck('tasks', () => this.checkTaskHealth()) :
                this.createDefaultComponentHealth('tasks', 'degraded', 'Task manager not available');
            // Collect system resource metrics
            const resources = await this.collectResourceMetrics();
            // Calculate response time metrics from collected data
            const responseTimes = this.calculateResponseTimeMetrics();
            // Determine overall system status from components
            const status = this.determineOverallStatus({
                memory: memoryHealth,
                ai: aiHealth,
                tasks: taskHealth
            });
            // Create complete system health report
            const health = {
                status,
                components: {
                    memory: memoryHealth,
                    ai: aiHealth,
                    tasks: taskHealth
                },
                resources,
                responseTimes,
                alerts: this.getAlerts({ acknowledged: false }).slice(0, 10), // Include most recent unacknowledged alerts
                timestamp: new Date().toISOString(),
                version: this.appVersion
            };
            // Cache the health check result
            this.lastCheck = health;
            // Calculate and log the total check duration
            const checkDuration = performance.now() - startTime;
            logger.debug('Health check completed', {
                status: health.status,
                checkDuration: `${checkDuration.toFixed(2)}ms`,
                componentCount: Object.keys(health.components).length
            });
            // Emit event for subscribers
            this.emit('healthCheck', health);
            return health;
        }
        catch (error) {
            logger.error('Health check failed', error);
            // Create a fallback health report in case of error
            const fallbackHealth = {
                status: 'unhealthy',
                components: {
                    system: {
                        status: 'unhealthy',
                        details: {
                            error: error instanceof Error ? error.message : 'Unknown error',
                            stack: error instanceof Error ? error.stack : undefined
                        },
                        lastCheck: new Date().toISOString(),
                        consecutiveFailures: 1
                    }
                },
                resources: await this.collectResourceMetrics().catch(() => ({
                    cpu: { usage: 0, loadAverage: [0, 0, 0] },
                    memory: { total: 0, free: 0, used: 0, usagePercent: 0 },
                    disk: { total: 0, free: 0, used: 0, usagePercent: 0 },
                    process: { uptime: 0, memory: process.memoryUsage(), cpuUsage: process.cpuUsage() }
                })),
                responseTimes: this.calculateResponseTimeMetrics(),
                alerts: [{
                        id: `error-${Date.now()}`,
                        severity: 'error',
                        message: 'Health check system failure',
                        component: 'monitoring',
                        timestamp: new Date().toISOString(),
                        details: { error: error instanceof Error ? error.message : String(error) }
                    }],
                timestamp: new Date().toISOString(),
                version: this.appVersion
            };
            this.lastCheck = fallbackHealth;
            this.emit('healthCheckError', { error, health: fallbackHealth });
            throw error;
        }
    }
    /**
     * Helper method to time component health checks and track metrics
     */
    async timedHealthCheck(component, checkFn) {
        const startTime = performance.now();
        try {
            const result = await checkFn();
            const duration = performance.now() - startTime;
            // Add duration to the component health result
            result.checkDuration = duration;
            // Reset consecutive failures on success
            this.consecutiveFailures[component] = 0;
            return result;
        }
        catch (error) {
            const duration = performance.now() - startTime;
            // Increment consecutive failures
            this.consecutiveFailures[component] = (this.consecutiveFailures[component] || 0) + 1;
            // Log detailed error
            logger.error(`Health check failed for ${component}`, error, {
                component,
                duration: `${duration.toFixed(2)}ms`,
                consecutiveFailures: this.consecutiveFailures[component]
            });
            // Create error health result
            return this.createDefaultComponentHealth(component, 'unhealthy', `Health check failed: ${error instanceof Error ? error.message : String(error)}`, { error: error instanceof Error ? error.message : String(error) }, this.consecutiveFailures[component]);
        }
    }
    /**
     * Creates a default component health object for cases when a check isn't available
     */
    createDefaultComponentHealth(component, status = 'degraded', message = 'Component check not implemented', additionalDetails = {}, consecutiveFailures = 0) {
        return {
            status,
            details: {
                message,
                ...additionalDetails
            },
            metrics: {
                errorRate: status === 'unhealthy' ? 100 : status === 'degraded' ? 50 : 0
            },
            lastCheck: new Date().toISOString(),
            consecutiveFailures
        };
    }
    /**
     * Checks memory subsystem health by querying the memory monitor
     */
    async checkMemoryHealth() {
        return await this.measureResponseTime('memory', null, async () => {
            const monitor = this.memoryFactory.getMonitor();
            monitor.updateStats();
            const stats = monitor.getAllStats();
            const unhealthySubsystems = Object.entries(stats)
                .filter(([, stat]) => stat.healthStatus !== 'healthy');
            // Calculate error rate as percentage of unhealthy subsystems
            const errorRate = unhealthySubsystems.length > 0 ?
                (unhealthySubsystems.length / Object.keys(stats).length) * 100 : 0;
            // Get memory usage statistics if available
            const memoryUsage = stats.usage?.current || {};
            const saturation = memoryUsage.percentUsed ||
                (memoryUsage.total && memoryUsage.used ? (memoryUsage.used / memoryUsage.total) * 100 : undefined);
            return {
                status: unhealthySubsystems.length === 0 ? 'healthy' :
                    unhealthySubsystems.length < Object.keys(stats).length ? 'degraded' : 'unhealthy',
                details: {
                    subsystems: stats,
                    unhealthyCount: unhealthySubsystems.length,
                    errorDetails: unhealthySubsystems.map(([name, stat]) => ({
                        name,
                        status: stat.healthStatus,
                        reason: stat.healthReason || 'Unknown issue'
                    }))
                },
                metrics: {
                    errorRate,
                    saturation
                },
                lastCheck: new Date().toISOString()
            };
        });
    }
    /**
     * Checks AI subsystem health by sending a test query
     */
    async checkAiHealth() {
        return await this.measureResponseTime('ai', null, async () => {
            try {
                const startTime = performance.now();
                const testResponse = await this.aiCoordinator.processQuery('Test health check', { maxTokens: 5 });
                const responseTime = performance.now() - startTime;
                return {
                    status: 'healthy',
                    details: {
                        model: testResponse.model,
                        provider: testResponse.provider || 'unknown',
                        tokensUsed: testResponse.usage?.totalTokens || 0,
                        completionId: testResponse.id || 'unknown'
                    },
                    metrics: {
                        responseTime,
                        throughput: 1000 / responseTime // Requests per second calculation
                    },
                    lastCheck: new Date().toISOString()
                };
            }
            catch (error) {
                // Increment failure count for alerting purposes
                this.consecutiveFailures['ai'] = (this.consecutiveFailures['ai'] || 0) + 1;
                // Create alert for AI failures
                if (this.consecutiveFailures['ai'] >= 3) {
                    this.createAlert({
                        severity: 'error',
                        component: 'ai',
                        message: `AI system unavailable (${this.consecutiveFailures['ai']} consecutive failures)`,
                        details: { error: error instanceof Error ? error.message : String(error) }
                    });
                }
                return {
                    status: 'unhealthy',
                    details: {
                        error: error instanceof Error ? error.message : 'Unknown error',
                        stack: error instanceof Error ? error.stack : undefined,
                        consecutiveFailures: this.consecutiveFailures['ai']
                    },
                    metrics: {
                        errorRate: 100
                    },
                    lastCheck: new Date().toISOString(),
                    consecutiveFailures: this.consecutiveFailures['ai']
                };
            }
        });
    }
    /**
     * Checks task management subsystem health
     */
    async checkTaskHealth() {
        if (!this.taskManager) {
            return this.createDefaultComponentHealth('tasks', 'degraded', 'Task manager not available');
        }
        try {
            // Get queue statistics
            const queueStats = await this.taskManager.getQueueStats();
            // Determine status based on failed and stalled tasks
            let status = 'healthy';
            const messages = [];
            if (queueStats.failed > 10) {
                status = 'unhealthy';
                messages.push(`${queueStats.failed} failed tasks`);
            }
            else if (queueStats.failed > 3) {
                status = 'degraded';
                messages.push(`${queueStats.failed} failed tasks`);
            }
            if (queueStats.stalled > 5) {
                status = Math.min(status === 'unhealthy' ? 2 : 1, 1) === 1 ? 'degraded' : 'unhealthy';
                messages.push(`${queueStats.stalled} stalled tasks`);
            }
            // Calculate approximate throughput and error rate
            const throughput = queueStats.completed / Math.max(1, queueStats.completedAge / 1000);
            const errorRate = queueStats.total > 0 ?
                ((queueStats.failed + queueStats.stalled) / queueStats.total) * 100 : 0;
            return {
                status,
                details: {
                    queueStats,
                    issues: messages.length > 0 ? messages : ['No issues'],
                    activeWorkers: queueStats.workers || 0
                },
                metrics: {
                    throughput,
                    errorRate,
                    saturation: queueStats.waiting > 0 ?
                        (queueStats.waiting / Math.max(1, queueStats.workers || 1)) * 100 : 0
                },
                lastCheck: new Date().toISOString()
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined
                },
                lastCheck: new Date().toISOString()
            };
        }
    }
    /**
     * Determines the overall system health status based on component health
     * @param components All component health objects
     * @returns The overall system health status
     */
    determineOverallStatus(components) {
        const statuses = Object.values(components).map(c => c.status);
        // Count the number of components in each status
        const statusCounts = statuses.reduce((counts, status) => {
            counts[status] = (counts[status] || 0) + 1;
            return counts;
        }, {});
        // If any critical components exist, the system is critical
        if (statusCounts['critical'] > 0) {
            return 'critical';
        }
        // If more than 50% of components are unhealthy, the system is unhealthy
        const unhealthyCount = statusCounts['unhealthy'] || 0;
        const totalCount = Object.values(components).length;
        if (unhealthyCount > 0 && unhealthyCount / totalCount > 0.5) {
            return 'unhealthy';
        }
        // If any unhealthy components exist, the system is at least degraded
        if (unhealthyCount > 0) {
            return 'degraded';
        }
        // If any degraded components exist, the system is degraded
        if (statusCounts['degraded'] > 0) {
            return 'degraded';
        }
        // Otherwise, the system is healthy
        return 'healthy';
    }
    /**
     * Calculates response time metrics for all monitored components
     */
    calculateResponseTimeMetrics() {
        // Calculate AI response time metrics
        const aiTimes = this.responseTimes.ai.slice();
        const aiSorted = aiTimes.sort((a, b) => a - b);
        const aiP95Index = Math.floor(aiSorted.length * 0.95);
        // Calculate Memory response time metrics
        const memoryTimes = this.responseTimes.memory.slice();
        const memorySorted = memoryTimes.sort((a, b) => a - b);
        const memoryP95Index = Math.floor(memorySorted.length * 0.95);
        // Calculate API response time metrics
        const apiTimes = this.responseTimes.api.all.slice();
        const apiSorted = apiTimes.sort((a, b) => a - b);
        const apiP95Index = Math.floor(apiSorted.length * 0.95);
        // Generate endpoint response time metrics
        const endpointMetrics = {};
        Object.entries(this.responseTimes.api.byEndpoint).forEach(([endpoint, times]) => {
            if (times.length > 0) {
                const sum = times.reduce((acc, time) => acc + time, 0);
                endpointMetrics[endpoint] = {
                    average: sum / times.length,
                    count: times.length
                };
            }
        });
        // Helper function to calculate average
        const average = (arr) => {
            if (arr.length === 0)
                return 0;
            return arr.reduce((sum, val) => sum + val, 0) / arr.length;
        };
        return {
            ai: {
                average: average(aiTimes),
                min: aiSorted.length > 0 ? aiSorted[0] : 0,
                max: aiSorted.length > 0 ? aiSorted[aiSorted.length - 1] : 0,
                p95: aiSorted.length > 0 ? aiSorted[Math.min(aiP95Index, aiSorted.length - 1)] : 0,
                requestCount: aiTimes.length
            },
            memory: {
                average: average(memoryTimes),
                min: memorySorted.length > 0 ? memorySorted[0] : 0,
                max: memorySorted.length > 0 ? memorySorted[memorySorted.length - 1] : 0,
                p95: memorySorted.length > 0 ? memorySorted[Math.min(memoryP95Index, memorySorted.length - 1)] : 0,
                requestCount: memoryTimes.length
            },
            api: {
                average: average(apiTimes),
                min: apiSorted.length > 0 ? apiSorted[0] : 0,
                max: apiSorted.length > 0 ? apiSorted[apiSorted.length - 1] : 0,
                p95: apiSorted.length > 0 ? apiSorted[Math.min(apiP95Index, apiSorted.length - 1)] : 0,
                requestCount: apiTimes.length,
                endpoints: endpointMetrics
            }
        };
    }
    /**
     * Returns the most recent health check result
     */
    getLastCheck() {
        return this.lastCheck;
    }
    /**
     * Gets summary health status without running a new check
     */
    getHealthSummary() {
        if (!this.lastCheck) {
            return {
                status: 'degraded',
                lastCheck: new Date().toISOString(),
                components: {}
            };
        }
        const componentStatuses = {};
        for (const [name, component] of Object.entries(this.lastCheck.components)) {
            componentStatuses[name] = component.status;
        }
        return {
            status: this.lastCheck.status,
            lastCheck: this.lastCheck.timestamp,
            components: componentStatuses
        };
    }
    /**
     * Monitors subsystem health and logs the results
     */
    async monitorSubsystemHealth() {
        try {
            const health = await this.checkHealth();
            // Log at appropriate level based on status
            if (health.status === 'unhealthy' || health.status === 'critical') {
                logger.error('System health check critical issues detected', {
                    status: health.status,
                    unhealthyComponents: Object.entries(health.components)
                        .filter(([, component]) => component.status === 'unhealthy' || component.status === 'critical')
                        .map(([name, component]) => ({ name, status: component.status, details: component.details }))
                });
            }
            else if (health.status === 'degraded') {
                logger.warn('System health check detected degraded performance', {
                    status: health.status,
                    degradedComponents: Object.entries(health.components)
                        .filter(([, component]) => component.status === 'degraded')
                        .map(([name]) => name)
                });
            }
            else {
                logger.info('System health check completed successfully', {
                    status: health.status,
                    componentCount: Object.keys(health.components).length
                });
            }
            // Emit detailed metrics event
            this.emit('healthMetrics', {
                timestamp: health.timestamp,
                status: health.status,
                components: Object.entries(health.components).reduce((acc, [name, component]) => {
                    acc[name] = {
                        status: component.status,
                        metrics: component.metrics
                    };
                    return acc;
                }, {}),
                resources: {
                    cpu: health.resources.cpu.usage,
                    memory: health.resources.memory.usagePercent,
                    disk: health.resources.disk.usagePercent
                }
            });
        }
        catch (error) {
            logger.error('Error during subsystem health monitoring', error, {
                stack: error instanceof Error ? error.stack : undefined
            });
            // Emit error event
            this.emit('healthMonitoringError', { error });
        }
    }
    /**
     * Logs detailed health metrics to the performance log
     */
    async logHealthMetrics() {
        try {
            // Get current health without running a full check if we have recent data
            const health = this.lastCheck && (Date.now() - new Date(this.lastCheck.timestamp).getTime()) < 10000 ?
                this.lastCheck : await this.checkHealth();
            // Format metrics for logging
            const formattedMetrics = {
                timestamp: health.timestamp,
                status: health.status,
                responseTimesMs: {
                    ai: {
                        avg: Math.round(health.responseTimes.ai.average),
                        p95: Math.round(health.responseTimes.ai.p95)
                    },
                    memory: {
                        avg: Math.round(health.responseTimes.memory.average),
                        p95: Math.round(health.responseTimes.memory.p95)
                    },
                    api: {
                        avg: Math.round(health.responseTimes.api.average),
                        p95: Math.round(health.responseTimes.api.p95)
                    }
                },
                resources: {
                    cpu: Math.round(health.resources.cpu.usage),
                    memoryPercent: Math.round(health.resources.memory.usagePercent),
                    diskPercent: Math.round(health.resources.disk.usagePercent)
                }
            };
            // Log the metrics
            logger.info('System health metrics', formattedMetrics);
            // If there are any non-healthy components, log details at higher level
            const unhealthyComponents = Object.entries(health.components)
                .filter(([, component]) => component.status !== 'healthy');
            if (unhealthyComponents.length > 0) {
                logger.warn('Unhealthy components detected', {
                    count: unhealthyComponents.length,
                    components: unhealthyComponents.map(([name, component]) => ({
                        name,
                        status: component.status,
                        consecutiveFailures: component.consecutiveFailures || 0,
                        lastCheck: component.lastCheck
                    }))
                });
            }
        }
        catch (error) {
            logger.error('Error logging health metrics', error, {
                errorMessage: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    }
    /**
     * Resets the health monitoring system, clearing all cached data
     */
    reset() {
        // Clear response time history
        this.responseTimes.ai = [];
        this.responseTimes.memory = [];
        this.responseTimes.api.all = [];
        this.responseTimes.api.byEndpoint = {};
        // Reset alerts and failure tracking
        this.alerts = [];
        this.lastAlertTime = {};
        this.consecutiveFailures = {};
        this.componentHealthCache = {};
        // Clear last health check
        this.lastCheck = null;
        logger.info('Health monitoring system reset');
    }
}
export const healthMonitor = HealthMonitor.getInstance();
//# sourceMappingURL=health-monitor.js.map