import { logger } from '../utils/logger.js';
import { SystemResourceMonitor } from '../monitoring/system-resource-monitor.js';
export class TaskManager {
    taskQueue = [];
    resourceMonitor;
    defaultPriorityFactors = {
        baseFactor: 1.0,
        agingFactor: 0.1,
        dependencyFactor: 1.0,
        urgencyFactor: 1.5,
        userFactor: 2.0,
        resourceFactor: 0.8,
        decayRate: 0.05,
        contextBoost: 0.3,
        failurePenalty: 0.2,
        stalledBoost: 0.4
    };
    // Define default category rules
    categoryRules = new Map([
        ['default', { name: 'default', baseMultiplier: 1.0 }],
        ['io', {
                name: 'io',
                baseMultiplier: 0.9,
                systemLoadImpact: 0.3,
                allowParallel: true,
                maxParallelTasks: 3,
                customFactors: { resourceFactor: 1.2 }
            }],
        ['cpu', {
                name: 'cpu',
                baseMultiplier: 1.2,
                systemLoadImpact: 0.8,
                allowParallel: false,
                isPreemptive: false,
                customFactors: { resourceFactor: 1.5, userFactor: 2.5 }
            }],
        ['memory', {
                name: 'memory',
                baseMultiplier: 1.1,
                systemLoadImpact: 0.7,
                batchSize: 5,
                allowParallel: true,
                maxParallelTasks: 2,
                customFactors: { resourceFactor: 1.4 }
            }],
        ['ai', {
                name: 'ai',
                baseMultiplier: 1.5,
                systemLoadImpact: 0.9,
                allowParallel: false,
                isPreemptive: true,
                customFactors: { userFactor: 3.0, urgencyFactor: 2.0 }
            }],
        ['system', {
                name: 'system',
                baseMultiplier: 2.0,
                minPriority: 8.0,
                systemLoadImpact: 0.5,
                isPreemptive: true,
                customFactors: { baseFactor: 1.5, userFactor: 2.5 }
            }],
        ['user', {
                name: 'user',
                baseMultiplier: 1.8,
                systemLoadImpact: 0.4,
                customFactors: { userFactor: 3.5 }
            }],
        ['background', {
                name: 'background',
                baseMultiplier: 0.5,
                maxPriority: 6.0,
                systemLoadImpact: 1.0,
                isPreemptive: false,
                customFactors: { userFactor: 1.0, decayRate: 0.02 }
            }]
    ]);
    priorityFactors;
    stalledTaskThreshold = 5 * 60 * 1000; // 5 minutes
    lastPriorityUpdate = Date.now();
    taskHistory = new Map();
    taskRelationships = new Map();
    taskCategories = new Map();
    constructor(options) {
        // Initialize priority factors with defaults and any overrides
        this.priorityFactors = {
            baseFactor: options?.priorityFactors?.baseFactor ?? 1.0,
            agingFactor: options?.priorityFactors?.agingFactor ?? 0.1,
            dependencyFactor: options?.priorityFactors?.dependencyFactor ?? 1.0,
            urgencyFactor: options?.priorityFactors?.urgencyFactor ?? 1.5,
            userFactor: options?.priorityFactors?.userFactor ?? 2.0,
            resourceFactor: options?.priorityFactors?.resourceFactor ?? 0.8,
            decayRate: options?.priorityFactors?.decayRate ?? 0.05,
            contextBoost: options?.priorityFactors?.contextBoost ?? 0.3,
            failurePenalty: options?.priorityFactors?.failurePenalty ?? 0.2,
            stalledBoost: options?.priorityFactors?.stalledBoost ?? 0.4
        };
        this.stalledTaskThreshold = options?.stalledTaskThreshold ?? this.stalledTaskThreshold;
        this.resourceMonitor = options?.resourceMonitor ?? new SystemResourceMonitor();
        // Set up periodic priority updates
        setInterval(() => this.updateAllPriorities(), 60 * 1000); // Update every minute
    }
    /**
     * Compute a weighted priority score for a task using multiple factors and category rules
     * @param task The task to compute priority for
     * @param includeContext Whether to include context-specific factors (for scheduled recalculation)
     * @returns Priority score
     */
    computePriority(task, includeContext = false) {
        // Base priority calculation
        const now = Date.now();
        const age = now - (task.createdAt || now);
        const hasFailures = task.retryCount && task.retryCount > 0;
        const isStalled = task.lastExecutionAttempt && (now - task.lastExecutionAttempt > this.stalledTaskThreshold);
        const hasContext = task.hasRelevantContext || false;
        // Get category-specific rules and factors
        const category = task.category || 'default';
        const categoryRule = this.categoryRules.get(category) || this.categoryRules.get('default');
        // Apply category-specific factors (merge with base factors)
        const factors = { ...this.priorityFactors };
        if (categoryRule.customFactors) {
            Object.assign(factors, categoryRule.customFactors);
        }
        // System load impact (higher load = lower priority for resource-intensive tasks)
        const systemLoad = this.resourceMonitor?.getSystemLoad() || 0.5; // Default to mid-load if monitor not available
        const resourceIntensity = task.resourceCost || 0.5; // Default to medium cost
        const categoryLoadImpact = categoryRule.systemLoadImpact !== undefined ? categoryRule.systemLoadImpact : 0.5;
        const resourceLoadFactor = 1 - (systemLoad * resourceIntensity * categoryLoadImpact * factors.resourceFactor);
        // Parse and apply user-defined priority
        let userPriority = task.priority || 1;
        // Check for user-defined priority expressions (e.g. "HIGH+2" or "LOW-1")
        if (typeof task.userPriorityExpression === 'string') {
            const priorityExp = task.userPriorityExpression.trim().toUpperCase();
            // Handle symbolic priority expressions
            if (priorityExp.match(/^(CRITICAL|HIGH|MEDIUM|LOW|LOWEST)(\+|-)(\d+)$/)) {
                const [_, level, op, valueStr] = priorityExp.match(/^(CRITICAL|HIGH|MEDIUM|LOW|LOWEST)(\+|-)(\d+)$/);
                const baseValue = {
                    'CRITICAL': 10,
                    'HIGH': 8,
                    'MEDIUM': 5,
                    'LOW': 3,
                    'LOWEST': 1
                }[level] || 5;
                const modifier = parseInt(valueStr);
                userPriority = op === '+' ? baseValue + modifier : baseValue - modifier;
            }
            // Handle direct priority expressions (e.g. "HIGH")
            else if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST'].includes(priorityExp)) {
                userPriority = {
                    'CRITICAL': 10,
                    'HIGH': 8,
                    'MEDIUM': 5,
                    'LOW': 3,
                    'LOWEST': 1
                }[priorityExp] || 5;
            }
            // Ensure priority is within valid range
            userPriority = Math.max(0, Math.min(10, userPriority));
            // Store the parsed numeric priority
            task.priority = userPriority;
        }
        // Core priority components
        const userPriorityComponent = (userPriority * factors.userFactor);
        const ageComponent = Math.min(1, age / (24 * 60 * 60 * 1000)) * factors.agingFactor; // Cap at 1 day
        const urgencyComponent = ((task.urgency || 0) * factors.urgencyFactor * resourceLoadFactor);
        const baseComponent = factors.baseFactor;
        // Additional factors
        const inheritedComponent = task.inheritedPriorityBoost || 0;
        const stalledComponent = isStalled ? factors.stalledBoost : 0;
        const contextComponent = hasContext && includeContext ? factors.contextBoost : 0;
        const failureComponent = hasFailures ? -(task.retryCount || 0) * factors.failurePenalty : 0;
        const criticalComponent = task.isSystemCritical ? 2.0 : 0;
        // Weighted sum of all components
        let priority = (baseComponent +
            userPriorityComponent +
            ageComponent +
            urgencyComponent +
            inheritedComponent +
            stalledComponent +
            contextComponent +
            failureComponent +
            criticalComponent);
        // Apply category base multiplier
        priority *= categoryRule.baseMultiplier;
        // Apply category min/max constraints if defined
        if (categoryRule.minPriority !== undefined) {
            priority = Math.max(categoryRule.minPriority, priority);
        }
        if (categoryRule.maxPriority !== undefined) {
            priority = Math.min(categoryRule.maxPriority, priority);
        }
        // Clamp to valid range
        priority = Math.max(0, Math.min(10, priority));
        // Log details if flagged for detailed logging
        if (task.logPriority) {
            logger.debug(`Priority calculation for task ${task.task_id}:`, {
                taskId: task.task_id,
                categoryName: category,
                priority,
                components: {
                    base: baseComponent,
                    user: userPriorityComponent,
                    age: ageComponent,
                    urgency: urgencyComponent,
                    inherited: inheritedComponent,
                    stalled: stalledComponent,
                    context: contextComponent,
                    failure: failureComponent,
                    critical: criticalComponent,
                    categoryMultiplier: categoryRule.baseMultiplier
                }
            });
        }
        return priority;
    }
    /**
     * Add a new task to the queue
     * @param task The task to add
     * @returns The task ID
     */
    addTask(task) {
        // Ensure timestamp present
        if (!task.createdAt) {
            task.createdAt = Date.now();
        }
        // Set status timestamp
        task.statusUpdatedAt = Date.now();
        // Ensure task has a status
        if (!task.status) {
            task.status = 'pending';
        }
        // Initial priority calculation
        task.priority = this.computePriority(task);
        // Track task in the appropriate category
        if (task.category) {
            if (!this.taskCategories.has(task.category)) {
                this.taskCategories.set(task.category, new Set());
            }
            this.taskCategories.get(task.category)?.add(task.task_id);
        }
        // Set up dependency tracking
        if (task.dependencies && task.dependencies.length > 0) {
            // For each dependency, add this task as a dependent
            task.dependencies.forEach(depId => {
                if (!this.taskRelationships.has(depId)) {
                    this.taskRelationships.set(depId, new Set());
                }
                this.taskRelationships.get(depId)?.add(task.task_id);
            });
        }
        // Add task to queue
        this.taskQueue.push(task);
        logger.info(`Task added: ${task.query}`, { taskId: task.task_id });
        // Return the task ID for reference
        return task.task_id;
    }
    /**
     * Prioritize all tasks in the queue
     * @param options Optional configuration for prioritization
     * @returns Sorted task list by priority
     */
    prioritizeTasks(options) {
        // Default options
        const applyAging = options?.applyAging !== false;
        const applyInheritance = options?.applyInheritance !== false;
        const applyDecay = options?.applyDecay ?? false;
        const includeContext = options?.includeContext ?? true;
        // Apply priority inheritance if requested
        if (applyInheritance) {
            this.applyPriorityInheritance();
        }
        // Apply age-based priority adjustment if requested
        if (applyAging) {
            this.applyAgingBoost();
        }
        // Apply decay to older tasks if requested
        if (applyDecay) {
            this.applyPriorityDecay();
        }
        // Update all priorities based on current system state
        this.updateAllPriorities(includeContext);
        // Sort tasks by priority and return
        return [...this.taskQueue].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    }
    getTasks() {
        return [...this.taskQueue];
    }
    clearCompletedTasks() {
        this.taskQueue = this.taskQueue.filter(task => task.status !== 'completed');
        logger.info('Cleared completed tasks');
    }
    /**
     * Update priorities for all tasks
     * @param includeContext Whether to include context-specific factors
     */
    updateAllPriorities(includeContext = true) {
        this.taskQueue.forEach(task => {
            task.priority = this.computePriority(task, includeContext);
        });
        this.lastPriorityUpdate = Date.now();
    }
    /**
     * Apply age-based priority boost to tasks
     */
    applyAgingBoost() {
        const now = Date.now();
        this.taskQueue.forEach(task => {
            if (task.status === 'pending' && task.createdAt) {
                const ageMinutes = (now - task.createdAt) / 60000;
                // Boost long-waiting tasks
                if (ageMinutes > 30) { // Over 30 minutes old
                    const boost = Math.min(3, ageMinutes / 20); // Max boost of 3 for very old tasks
                    task.priority = (task.priority ?? 0) + boost;
                }
            }
        });
    }
    categorizeTasks() {
        const categories = {};
        this.taskQueue.forEach(task => {
            const category = task.category || 'default';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(task);
        });
        return categories;
    }
    /**
     * Apply priority inheritance based on task dependencies
     * Uses a more sophisticated algorithm to propagate priority through the dependency graph
     */
    applyPriorityInheritance() {
        // Reset inherited boosts
        this.taskQueue.forEach(task => {
            task.inheritedPriorityBoost = 0;
        });
        // Build a map for quick task lookup
        const taskMap = new Map();
        this.taskQueue.forEach(task => taskMap.set(task.task_id, task));
        // Calculate dependents for inheritance tracking (if not already set)
        this.taskQueue.forEach(task => {
            if (!task.dependents) {
                task.dependents = [];
            }
        });
        // Process each dependency relationship
        this.taskQueue.forEach(task => {
            if (task.dependencies && task.dependencies.length > 0) {
                // Get the maximum priority from dependencies
                let maxDependencyPriority = 0;
                let criticalDependency = false;
                task.dependencies.forEach(depId => {
                    const depTask = taskMap.get(depId);
                    if (depTask) {
                        // If dependency is system critical, inherit that property
                        if (depTask.isSystemCritical) {
                            criticalDependency = true;
                        }
                        // Find the highest priority among dependencies
                        maxDependencyPriority = Math.max(maxDependencyPriority, depTask.priority ?? 0);
                    }
                });
                // Apply inheritance with scaled factor
                if (maxDependencyPriority > (task.priority ?? 0)) {
                    // Calculate boost (80% of the difference)
                    const boost = (maxDependencyPriority - (task.priority ?? 0)) *
                        this.priorityFactors.dependencyFactor;
                    // Store as inherited boost for transparency
                    task.inheritedPriorityBoost = boost;
                    // Apply to actual priority
                    task.priority = (task.priority ?? 0) + boost;
                }
                // Inherit system critical flag if needed
                if (criticalDependency) {
                    task.isSystemCritical = true;
                }
            }
        });
        // Second pass for transitive dependencies
        this.taskQueue.forEach(task => {
            if (task.dependents && task.dependents.length > 0) {
                task.dependents.forEach(depId => {
                    const depTask = taskMap.get(depId);
                    if (depTask && (task.priority ?? 0) > (depTask.priority ?? 0)) {
                        const boost = ((task.priority ?? 0) - (depTask.priority ?? 0)) * 0.6; // 60% transitive inheritance
                        depTask.inheritedPriorityBoost = (depTask.inheritedPriorityBoost ?? 0) + boost;
                        depTask.priority = (depTask.priority ?? 0) + boost;
                    }
                });
            }
        });
    }
    /**
     * Apply priority decay to tasks that haven't been executed
     * Prevents old, uncompleted tasks from dominating the queue forever
     */
    applyPriorityDecay() {
        const now = Date.now();
        this.taskQueue.forEach(task => {
            if (task.priority && task.priority > 0) {
                // Skip system critical tasks
                if (task.isSystemCritical)
                    return;
                // Apply decay for tasks that have been in the queue too long
                if (task.createdAt && ((now - task.createdAt) > 24 * 60 * 60 * 1000)) { // Older than 24 hours
                    const ageInDays = (now - task.createdAt) / (24 * 60 * 60 * 1000);
                    const decayFactor = Math.min(0.9, this.priorityFactors.decayRate * ageInDays);
                    // Calculate decay amount
                    const decayAmount = task.priority * decayFactor;
                    // Apply decay with floor
                    task.priority = Math.max(1, task.priority - decayAmount);
                    // Log significant decay
                    if (decayAmount > 1) {
                        logger.debug(`Applied decay to task ${task.task_id}: -${decayAmount.toFixed(2)} points (age=${ageInDays.toFixed(1)} days)`);
                    }
                }
            }
        });
    }
    /**
     * Return the highest priority task without removing it.
     */
    /**
     * Return the highest priority task without removing it
     * @param categoryFilter Optional category to filter tasks by
     * @param options Optional configuration for task selection
     * @returns The highest priority task that matches criteria
     */
    getNextTask(categoryFilter, options) {
        // Default options
        const excludeIds = options?.excludeIds || [];
        const resourceThreshold = options?.resourceThreshold ?? 0.3;
        const priorityThreshold = options?.priorityThreshold ?? 0;
        const includeDeferred = options?.includeDeferred ?? false;
        // Get fresh prioritized list
        const sorted = this.prioritizeTasks();
        // Filter based on criteria
        for (const task of sorted) {
            // Skip excluded tasks
            if (excludeIds.includes(task.task_id))
                continue;
            // Filter by category if specified
            if (categoryFilter && task.category !== categoryFilter)
                continue;
            // Skip deferred tasks unless explicitly included
            if (!includeDeferred && task.status === 'deferred')
                continue;
            // Skip low priority tasks
            if ((task.priority ?? 0) < priorityThreshold)
                continue;
            // Skip tasks with insufficient resources
            if (task.category &&
                this.resourceMonitor.getResourceAvailability(task.category) < resourceThreshold) {
                continue;
            }
            // Task passes all filters
            return task;
        }
        return undefined;
    }
    /**
     * Get a batch of tasks for execution
     * @param count Maximum number of tasks to return
     * @param options Optional filters and configuration
     * @returns Array of tasks ready for execution
     */
    getTaskBatch(count, options) {
        const result = [];
        const excludeIds = [...(options?.excludeIds || [])];
        const categories = options?.categories;
        const minPriority = options?.minPriority ?? 0;
        const includeDeferred = options?.includeDeferred ?? false;
        // Get prioritized list
        const sorted = this.prioritizeTasks();
        // Filter and select tasks
        for (const task of sorted) {
            // Skip if we've reached the limit
            if (result.length >= count)
                break;
            // Skip excluded tasks
            if (excludeIds.includes(task.task_id))
                continue;
            // Filter by categories if specified
            if (categories && categories.length > 0 &&
                task.category && !categories.includes(task.category)) {
                continue;
            }
            // Skip deferred tasks unless explicitly included
            if (!includeDeferred && task.status === 'deferred')
                continue;
            // Skip low priority tasks
            if ((task.priority ?? 0) < minPriority)
                continue;
            // Add task to result and exclude it from future consideration
            result.push(task);
            excludeIds.push(task.task_id);
        }
        return result;
    }
    /**
     * Update task status and related metadata
     * @param taskId ID of the task to update
     * @param status New status for the task
     * @param options Additional options for the update
     * @returns Whether the update was successful
     */
    updateTaskStatus(taskId, status, options) {
        const task = this.taskQueue.find(t => t.task_id === taskId);
        if (!task)
            return false;
        const oldStatus = task.status;
        task.status = status;
        task.statusUpdatedAt = Date.now();
        if (options?.statusReason) {
            task.statusReason = options.statusReason;
        }
        if (options?.resetRetries) {
            task.retryCount = 0;
        }
        // If task is completed, notify dependents
        if (status === 'completed' && oldStatus !== 'completed') {
            this.notifyTaskCompletion(taskId);
        }
        // Update task history
        if (status === 'failed') {
            const historyRecord = this.taskHistory.get(taskId) || { attempts: 0, lastFailure: null };
            historyRecord.attempts = (historyRecord.attempts || 0) + 1;
            historyRecord.lastFailure = Date.now();
            this.taskHistory.set(taskId, historyRecord);
        }
        logger.info(`Task ${taskId} status updated: ${oldStatus || 'new'} -> ${status}`);
        return true;
    }
    /**
     * Notify dependent tasks about a completed task
     * @param taskId ID of the completed task
     */
    notifyTaskCompletion(taskId) {
        // Find tasks that depend on this task
        const dependents = this.taskRelationships.get(taskId);
        if (!dependents)
            return;
        for (const depId of dependents) {
            const task = this.taskQueue.find(t => t.task_id === depId);
            if (task) {
                // Check if this was the last blocking dependency
                if (task.dependencies) {
                    const stillPending = task.dependencies.some(id => {
                        const depTask = this.taskQueue.find(t => t.task_id === id);
                        return depTask && depTask.status !== 'completed';
                    });
                    if (!stillPending && task.status === 'deferred') {
                        // All dependencies completed, update status
                        this.updateTaskStatus(task.task_id, 'pending', {
                            statusReason: 'Dependencies satisfied'
                        });
                        logger.info(`Task ${task.task_id} unblocked - all dependencies completed`);
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=task-manager.js.map