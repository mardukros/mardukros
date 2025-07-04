import { TaskMessage, TaskStatus } from './types/task-types.js';
import { SystemResourceMonitor } from '../monitoring/system-resource-monitor.js';
/**
 * Priority factors that affect task priority calculation
 */
interface TaskPriorityFactors {
    baseFactor: number;
    agingFactor: number;
    dependencyFactor: number;
    urgencyFactor: number;
    userFactor: number;
    resourceFactor: number;
    decayRate: number;
    contextBoost: number;
    failurePenalty: number;
    stalledBoost: number;
}
export declare class TaskManager {
    private taskQueue;
    private resourceMonitor;
    private defaultPriorityFactors;
    private categoryRules;
    private priorityFactors;
    private stalledTaskThreshold;
    private lastPriorityUpdate;
    private taskHistory;
    private taskRelationships;
    private taskCategories;
    constructor(options?: {
        priorityFactors?: Partial<TaskPriorityFactors>;
        stalledTaskThreshold?: number;
        resourceMonitor?: SystemResourceMonitor;
    });
    /**
     * Compute a weighted priority score for a task using multiple factors and category rules
     * @param task The task to compute priority for
     * @param includeContext Whether to include context-specific factors (for scheduled recalculation)
     * @returns Priority score
     */
    computePriority(task: TaskMessage, includeContext?: boolean): number;
    /**
     * Add a new task to the queue
     * @param task The task to add
     * @returns The task ID
     */
    addTask(task: TaskMessage): number;
    /**
     * Prioritize all tasks in the queue
     * @param options Optional configuration for prioritization
     * @returns Sorted task list by priority
     */
    prioritizeTasks(options?: {
        applyAging?: boolean;
        applyInheritance?: boolean;
        applyDecay?: boolean;
        includeContext?: boolean;
    }): TaskMessage[];
    getTasks(): TaskMessage[];
    clearCompletedTasks(): void;
    /**
     * Update priorities for all tasks
     * @param includeContext Whether to include context-specific factors
     */
    updateAllPriorities(includeContext?: boolean): void;
    /**
     * Apply age-based priority boost to tasks
     */
    applyAgingBoost(): void;
    categorizeTasks(): Record<string, TaskMessage[]>;
    /**
     * Apply priority inheritance based on task dependencies
     * Uses a more sophisticated algorithm to propagate priority through the dependency graph
     */
    applyPriorityInheritance(): void;
    /**
     * Apply priority decay to tasks that haven't been executed
     * Prevents old, uncompleted tasks from dominating the queue forever
     */
    applyPriorityDecay(): void;
    /**
     * Return the highest priority task without removing it.
     */
    /**
     * Return the highest priority task without removing it
     * @param categoryFilter Optional category to filter tasks by
     * @param options Optional configuration for task selection
     * @returns The highest priority task that matches criteria
     */
    getNextTask(categoryFilter?: string, options?: {
        excludeIds?: number[];
        resourceThreshold?: number;
        priorityThreshold?: number;
        includeDeferred?: boolean;
    }): TaskMessage | undefined;
    /**
     * Get a batch of tasks for execution
     * @param count Maximum number of tasks to return
     * @param options Optional filters and configuration
     * @returns Array of tasks ready for execution
     */
    getTaskBatch(count: number, options?: {
        categories?: string[];
        excludeIds?: number[];
        minPriority?: number;
        includeDeferred?: boolean;
    }): TaskMessage[];
    /**
     * Update task status and related metadata
     * @param taskId ID of the task to update
     * @param status New status for the task
     * @param options Additional options for the update
     * @returns Whether the update was successful
     */
    updateTaskStatus(taskId: number, status: TaskStatus, options?: {
        statusReason?: string;
        resetRetries?: boolean;
    }): boolean;
    /**
     * Notify dependent tasks about a completed task
     * @param taskId ID of the completed task
     */
    private notifyTaskCompletion;
}
export {};
//# sourceMappingURL=task-manager.d.ts.map