import winston from 'winston';
import { env } from '../../config/env.js';
import { hostname } from 'os';
import path from 'path';
import fs from 'fs';
const { combine, timestamp, printf, colorize, errors, json, label, metadata } = winston.format;
// Custom formatter with better handling of objects, errors, and circular references
const customFormat = printf(({ level, message, timestamp, context, requestId, subsystem, ...metadata }) => {
    // Format the basic log message with timestamp and level
    let msg = `${timestamp} [${level}]`;
    // Add context information if available
    if (context)
        msg += ` [${context}]`;
    if (subsystem)
        msg += ` [${subsystem}]`;
    if (requestId)
        msg += ` [req:${requestId}]`;
    // Add the main message
    msg += `: ${message}`;
    // Handle metadata with special attention to Error objects and circular references
    if (Object.keys(metadata).length > 0) {
        try {
            // Check if metadata contains an error
            if (metadata.error) {
                if (metadata.error instanceof Error) {
                    // Format the error nicely
                    metadata.error = {
                        name: metadata.error.name,
                        message: metadata.error.message,
                        stack: metadata.error.stack
                    };
                }
            }
            // Stringify the metadata with handling for circular references
            const sanitizedMetadata = JSON.stringify(metadata, (key, value) => {
                // Handle circular references and function values
                if (typeof value === 'function')
                    return '[Function]';
                if (typeof value === 'object' && value !== null) {
                    if (seenObjects.has(value))
                        return '[Circular]';
                    seenObjects.add(value);
                }
                return value;
            }, 2);
            // Clear the Set for the next use
            seenObjects.clear();
            msg += `\n${sanitizedMetadata}`;
        }
        catch (err) {
            msg += `\n[Error serializing metadata: ${err.message}]`;
        }
    }
    return msg;
});
// Set to track objects for circular reference detection
const seenObjects = new Set();
/**
 * Enhanced Logger with structured logging, context tracking,
 * aggregated error handling, and performance monitoring
 */
export class Logger {
    static instance;
    logger;
    currentContext = 'default';
    logQueue = [];
    flushInterval = null;
    hostInfo;
    /**
     * Constructor initializes the logger with multiple transports and
     * configures the log directory structure
     */
    constructor() {
        // Capture host information for all logs
        this.hostInfo = {
            hostname: hostname(),
            pid: process.pid,
            startTime: Date.now()
        };
        // Ensure log directories exist
        this.ensureLogDirectories();
        // Configure the main logger
        this.logger = winston.createLogger({
            level: env.logging.level || 'info',
            defaultMeta: {
                host: this.hostInfo.hostname,
                pid: this.hostInfo.pid
            },
            format: combine(timestamp(), errors({ stack: true }), customFormat),
            transports: [
                // Main log file with rotation
                new winston.transports.File({
                    filename: env.logging.file || 'logs/app.log',
                    maxsize: env.logging.maxSize || 5242880, // 5MB
                    maxFiles: env.logging.maxFiles || 10,
                    tailable: true
                }),
                // Separate error log file
                new winston.transports.File({
                    filename: env.logging.errorFile || 'logs/error.log',
                    level: 'error',
                    maxsize: env.logging.maxSize || 5242880,
                    maxFiles: env.logging.maxFiles || 10,
                    tailable: true
                }),
                // JSON structured logs for machine processing
                new winston.transports.File({
                    filename: env.logging.structuredFile || 'logs/structured.json',
                    format: combine(timestamp(), json()),
                    maxsize: env.logging.maxSize || 5242880,
                    maxFiles: env.logging.maxFiles || 5
                }),
                // Console output for development
                new winston.transports.Console({
                    format: combine(colorize(), customFormat)
                })
            ]
        });
        // Set up log queue flush interval (useful for batched writes)
        this.flushInterval = setInterval(() => this.flushLogQueue(), 5000); // Flush every 5 seconds
        // Handle process termination to flush remaining logs
        process.on('beforeExit', () => {
            this.flushLogQueue();
            if (this.flushInterval) {
                clearInterval(this.flushInterval);
                this.flushInterval = null;
            }
        });
        // Log startup information
        this.info('Logger initialized', {
            level: env.logging.level || 'info',
            environment: env.environment || 'development',
            logFiles: {
                main: env.logging.file || 'logs/app.log',
                error: env.logging.errorFile || 'logs/error.log',
                structured: env.logging.structuredFile || 'logs/structured.json'
            }
        });
    }
    /**
     * Ensure log directories exist
     */
    ensureLogDirectories() {
        const logDir = path.dirname(env.logging.file || 'logs/app.log');
        const errorLogDir = path.dirname(env.logging.errorFile || 'logs/error.log');
        const structuredLogDir = path.dirname(env.logging.structuredFile || 'logs/structured.json');
        // Create directories if they don't exist
        [logDir, errorLogDir, structuredLogDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }
    /**
     * Flush queued logs to file
     */
    flushLogQueue() {
        if (this.logQueue.length === 0)
            return;
        // Process all queued logs
        while (this.logQueue.length > 0) {
            const { level, message, metadata } = this.logQueue.shift();
            this.logger.log(level, message, metadata);
        }
    }
    /**
     * Singleton accessor for the logger
     */
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    /**
     * Set the current context for structured logging
     * @param contextName Context name (e.g., subsystem, component, request ID)
     * @returns The logger instance for chaining
     */
    setContext(contextName) {
        this.currentContext = contextName;
        return this;
    }
    /**
     * Create a child logger with a specific context
     * @param context Context name for the child logger
     * @returns A new logger instance with the specified context
     */
    child(context) {
        const childLogger = Logger.getInstance();
        childLogger.setContext(context);
        return childLogger;
    }
    /**
     * Log an informational message
     * @param message The message to log
     * @param metadata Additional contextual data
     */
    info(message, metadata = {}) {
        this.log('info', message, metadata);
    }
    /**
     * Log a warning message
     * @param message The message to log
     * @param metadata Additional contextual data
     */
    warn(message, metadata = {}) {
        this.log('warn', message, metadata);
    }
    /**
     * Log an error message with enhanced error handling
     * @param message The message to log
     * @param error Optional Error object
     * @param metadata Additional contextual data
     */
    error(message, error, metadata = {}) {
        const errorMetadata = error ? {
            ...metadata,
            error: error // The formatter will handle Error objects appropriately
        } : metadata;
        this.log('error', message, errorMetadata);
        // Additional error handling - could send to monitoring service, etc.
        this.captureErrorDetails(message, error, metadata);
    }
    /**
     * Log a debug message
     * @param message The message to log
     * @param metadata Additional contextual data
     */
    debug(message, metadata = {}) {
        this.log('debug', message, metadata);
    }
    /**
     * Log a trace message (lowest level, high verbosity)
     * @param message The message to log
     * @param metadata Additional contextual data
     */
    trace(message, metadata = {}) {
        this.log('silly', message, metadata);
    }
    /**
     * General purpose logging function
     * @param level Log level
     * @param message Message to log
     * @param metadata Additional contextual data
     */
    log(level, message, metadata = {}) {
        const enhancedMetadata = {
            ...metadata,
            context: this.currentContext,
            timestamp: new Date().toISOString(),
            // Add additional context that might be useful
            memory: process.memoryUsage().heapUsed,
            uptime: process.uptime()
        };
        // If batching is enabled (for high volume logs), queue the log
        if (env.logging.batchLogs && level !== 'error') {
            this.logQueue.push({ level, message, metadata: enhancedMetadata });
            // Immediately flush if queue exceeds threshold
            if (this.logQueue.length >= (env.logging.batchThreshold || 100)) {
                this.flushLogQueue();
            }
        }
        else {
            // Otherwise log immediately
            this.logger.log(level, message, enhancedMetadata);
        }
    }
    /**
     * Manually rotate log files
     * @returns Promise that resolves when rotation is complete
     */
    async rotateLog() {
        this.info('Log rotation initiated');
        // Ensure any pending logs are written
        this.flushLogQueue();
        try {
            // Create backup of current log files
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupDir = path.join(path.dirname(env.logging.file || 'logs/app.log'), 'archived');
            // Create backup directory if it doesn't exist
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            // Backup main log
            const mainLogPath = env.logging.file || 'logs/app.log';
            if (fs.existsSync(mainLogPath)) {
                const backupFile = path.join(backupDir, `app-${timestamp}.log`);
                fs.copyFileSync(mainLogPath, backupFile);
                fs.truncateSync(mainLogPath, 0);
            }
            // Backup error log
            const errorLogPath = env.logging.errorFile || 'logs/error.log';
            if (fs.existsSync(errorLogPath)) {
                const backupFile = path.join(backupDir, `error-${timestamp}.log`);
                fs.copyFileSync(errorLogPath, backupFile);
                fs.truncateSync(errorLogPath, 0);
            }
            // Backup structured log
            const structuredLogPath = env.logging.structuredFile || 'logs/structured.json';
            if (fs.existsSync(structuredLogPath)) {
                const backupFile = path.join(backupDir, `structured-${timestamp}.json`);
                fs.copyFileSync(structuredLogPath, backupFile);
                fs.truncateSync(structuredLogPath, 0);
            }
            this.info('Log rotation completed successfully', {
                backupTimestamp: timestamp,
                backupDirectory: backupDir
            });
        }
        catch (error) {
            this.error('Log rotation failed', error);
            throw error;
        }
    }
    /**
     * Log detailed system performance data
     * @param performanceData Performance metrics to log
     */
    async logSystemPerformance(performanceData) {
        // Create a specialized performance log entry
        const enhancedData = {
            ...performanceData,
            timestamp: new Date().toISOString(),
            processInfo: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                pid: process.pid,
                hostname: this.hostInfo.hostname
            }
        };
        // Log to specific performance file if configured
        if (env.logging.performanceFile) {
            try {
                const perfDir = path.dirname(env.logging.performanceFile);
                if (!fs.existsSync(perfDir)) {
                    fs.mkdirSync(perfDir, { recursive: true });
                }
                // Append to performance log file
                fs.appendFileSync(env.logging.performanceFile, JSON.stringify(enhancedData) + '\n');
            }
            catch (error) {
                this.error('Failed to write performance data to file', error);
            }
        }
        // Also log through standard logger
        this.info('System performance data', enhancedData);
    }
    /**
     * Log comprehensive error details with automatic aggregation
     * @param errorDetails Detailed error information
     */
    async logErrorDetails(errorDetails) {
        this.error('Detailed error information', undefined, errorDetails);
    }
    /**
     * Capture and process error details for monitoring
     * @param message Error message
     * @param error The error object
     * @param metadata Additional context
     */
    captureErrorDetails(message, error, metadata = {}) {
        try {
            // Create error report
            const errorReport = {
                message,
                error: error ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    code: error.code
                } : undefined,
                context: this.currentContext,
                metadata,
                timestamp: new Date().toISOString(),
                process: {
                    pid: process.pid,
                    uptime: process.uptime(),
                    memory: process.memoryUsage()
                },
                host: this.hostInfo.hostname
            };
            // Write to dedicated error log file if configured
            if (env.logging.errorReportDir) {
                try {
                    const errorDir = env.logging.errorReportDir;
                    if (!fs.existsSync(errorDir)) {
                        fs.mkdirSync(errorDir, { recursive: true });
                    }
                    // Create unique error ID
                    const errorId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                    const errorFile = path.join(errorDir, `error-${errorId}.json`);
                    // Write detailed error report
                    fs.writeFileSync(errorFile, JSON.stringify(errorReport, null, 2));
                }
                catch (writeError) {
                    // Just log to console if we can't write to file
                    console.error('Failed to write error report:', writeError);
                }
            }
            // Here you could also send to external error monitoring service
            // if integrated with a system like Sentry, New Relic, etc.
        }
        catch (metaError) {
            // Last resort console log if everything else fails
            console.error('Failed to process error:', metaError);
        }
    }
    /**
     * Get a summary of log activity
     * @returns Log statistics
     */
    getLogStats() {
        return {
            uptime: process.uptime(),
            processStartTime: new Date(this.hostInfo.startTime).toISOString(),
            hostname: this.hostInfo.hostname,
            pid: this.hostInfo.pid,
            memoryUsage: process.memoryUsage(),
            queuedLogs: this.logQueue.length
        };
    }
}
export const logger = Logger.getInstance();
//# sourceMappingURL=logger.js.map