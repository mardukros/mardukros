/**
 * Enhanced Logger with structured logging, context tracking,
 * aggregated error handling, and performance monitoring
 */
export declare class Logger {
    private static instance;
    private logger;
    private currentContext;
    private logQueue;
    private flushInterval;
    private hostInfo;
    /**
     * Constructor initializes the logger with multiple transports and
     * configures the log directory structure
     */
    private constructor();
    /**
     * Ensure log directories exist
     */
    private ensureLogDirectories;
    /**
     * Flush queued logs to file
     */
    private flushLogQueue;
    /**
     * Singleton accessor for the logger
     */
    static getInstance(): Logger;
    /**
     * Set the current context for structured logging
     * @param contextName Context name (e.g., subsystem, component, request ID)
     * @returns The logger instance for chaining
     */
    setContext(contextName: string): Logger;
    /**
     * Create a child logger with a specific context
     * @param context Context name for the child logger
     * @returns A new logger instance with the specified context
     */
    child(context: string): Logger;
    /**
     * Log an informational message
     * @param message The message to log
     * @param metadata Additional contextual data
     */
    info(message: string, metadata?: object): void;
    /**
     * Log a warning message
     * @param message The message to log
     * @param metadata Additional contextual data
     */
    warn(message: string, metadata?: object): void;
    /**
     * Log an error message with enhanced error handling
     * @param message The message to log
     * @param error Optional Error object
     * @param metadata Additional contextual data
     */
    error(message: string, error?: Error, metadata?: object): void;
    /**
     * Log a debug message
     * @param message The message to log
     * @param metadata Additional contextual data
     */
    debug(message: string, metadata?: object): void;
    /**
     * Log a trace message (lowest level, high verbosity)
     * @param message The message to log
     * @param metadata Additional contextual data
     */
    trace(message: string, metadata?: object): void;
    /**
     * General purpose logging function
     * @param level Log level
     * @param message Message to log
     * @param metadata Additional contextual data
     */
    private log;
    /**
     * Manually rotate log files
     * @returns Promise that resolves when rotation is complete
     */
    rotateLog(): Promise<void>;
    /**
     * Log detailed system performance data
     * @param performanceData Performance metrics to log
     */
    logSystemPerformance(performanceData: object): Promise<void>;
    /**
     * Log comprehensive error details with automatic aggregation
     * @param errorDetails Detailed error information
     */
    logErrorDetails(errorDetails: object): Promise<void>;
    /**
     * Capture and process error details for monitoring
     * @param message Error message
     * @param error The error object
     * @param metadata Additional context
     */
    private captureErrorDetails;
    /**
     * Get a summary of log activity
     * @returns Log statistics
     */
    getLogStats(): object;
}
export declare const logger: Logger;
//# sourceMappingURL=logger.d.ts.map