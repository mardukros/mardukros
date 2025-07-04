export interface TaskConfig {
    priority?: number;
    target?: string;
    condition?: TaskCondition;
    status?: TaskStatus;
}
export interface TaskCondition {
    type: 'deferred';
    prerequisite: string;
}
/**
 * Advanced condition expression for complex task execution logic
 */
export interface TaskConditionExpression {
    /**
     * Logical operator to combine conditions
     */
    operator: 'and' | 'or' | 'not' | 'threshold';
    /**
     * Child conditions (for 'and', 'or', and 'threshold' operators)
     */
    conditions?: (TaskCondition | TaskConditionExpression)[];
    /**
     * Single condition to negate (for 'not' operator)
     */
    condition?: TaskCondition | TaskConditionExpression;
    /**
     * Optional threshold for dynamic condition evaluation (for 'threshold' operator)
     * Specifies how many of the conditions must be true for the expression to evaluate to true.
     * If not specified, defaults to majority (ceil(conditions.length / 2)).
     */
    threshold?: number;
}
export type TaskStatus = 'pending' | 'completed' | 'deferred' | 'failed';
export type TaskPriority = 0 | 1 | 2 | 3 | 4 | 5;
export interface Task {
    id: number;
    query: string;
    config: TaskConfig;
}
export interface TaskMessage {
    type: "task";
    query: string;
    task_id: number;
    target?: string;
    priority?: number;
    /**
     * Priority specified directly by the user. 0 (lowest) – 100 (highest).
     * Takes precedence over calculated urgency.
     */
    userPriority?: number;
    /**
     * System-estimated urgency of the task. 0 (non-urgent) – 100 (critical).
     */
    urgency?: number;
    /**
     * How available are the required resources (0 – 1). 1 means fully available.
     */
    resourceAvailability?: number;
    /**
     * Current overall system load factor (0 – 1). 1 means fully loaded.
     */
    systemLoad?: number;
    /**
     * Optional logical category for grouping tasks (e.g. "io", "cpu", "ai").
     */
    category?: string;
    /**
     * IDs of tasks that must complete before this task should run.
     */
    dependencies?: number[];
    /**
     * Timestamp (ms) when the task was created. Used for age-based weighting/decay.
     */
    createdAt?: number;
    /**
     * Estimated resource cost (arbitrary units); higher cost may lower priority under load.
     */
    resourceCost?: number;
    /**
     * Number of retry attempts made for this task.
     */
    retryCount?: number;
    /**
     * Timestamp (ms) when the task status was last updated.
     */
    statusUpdatedAt?: number;
    /**
     * Whether this task has relevant context data available.
     */
    hasRelevantContext?: boolean;
    /**
     * Priority boost inherited from dependent tasks.
     */
    inheritedPriorityBoost?: number;
    /**
     * Whether to log detailed priority calculation information.
     */
    logPriority?: boolean;
    /**
     * Last execution timestamp, used for stalled task detection.
     */
    lastExecutionAttempt?: number;
    /**
     * IDs of tasks that this task influences (reverse of dependencies).
     */
    dependents?: number[];
    /**
     * Task condition to evaluate before execution.
     */
    condition?: TaskCondition;
    /**
     * Current status of the task.
     */
    status?: TaskStatus;
    /**
     * Reason for the current task status, especially for deferred/failed.
     */
    statusReason?: string;
    /**
     * Maximum allowed retries for this task (default: 3).
     */
    maxRetries?: number;
    /**
     * Timeout for task execution in milliseconds (default: 30000 - 30 seconds).
     * Task will be marked as failed if execution exceeds this time.
     */
    executionTimeout?: number;
    /**
     * Complex condition expressions for advanced task execution control.
     */
    conditionExpression?: TaskConditionExpression;
    /**
     * Whether task is a critical system task that gets priority boosts.
     */
    isSystemCritical?: boolean;
    /**
     * User-defined priority expression (e.g., "HIGH", "MEDIUM", "LOW+2").
     * Will be parsed into a numeric priority.
     */
    userPriorityExpression?: string;
}
export interface TaskResult {
    status: string;
    query: string;
    context?: string;
}
//# sourceMappingURL=task-types.d.ts.map