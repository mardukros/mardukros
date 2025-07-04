import { TaskMessage, TaskConditionExpression, TaskCondition } from "./task/types/task-types.js";
import { logger } from "./logging/logger.js";
import { SystemResourceMonitor } from "./monitoring/system-resource-monitor.js";

/**
 * Complex task execution system with advanced dependency management, resource awareness, and condition evaluation
 * @param taskQueue Tasks to execute
 * @param memoryState System memory state for condition evaluation
 * @param resourceMonitor Optional resource monitor (will create one if not provided)
 * @param options Additional execution options
 * @returns Statistics about task execution
 */
export function executeTasks(
  taskQueue: TaskMessage[], 
  memoryState: { completedTopics: string[] },
  resourceMonitor?: SystemResourceMonitor,
  options: {
    debugMode?: boolean,
    failFast?: boolean,
    maxConcurrent?: number,
    timeoutMs?: number
  } = {}
): {
  executed: number,
  deferred: number,
  failed: number,
  completed: number,
  errors: Error[]
} {
  // Initialize statistics
  const stats = {
    executed: 0,
    deferred: 0,
    failed: 0,
    completed: 0,
    errors: [] as Error[]
  };
  
  // Extract options with defaults
  const {
    debugMode = false,
    failFast = false,
    maxConcurrent = 0, // 0 means no limit
    timeoutMs = 30000 // Default timeout 30 seconds
  } = options;
  
  // Default retry settings
  const maxRetries = 3;
  const processedTaskIds = new Set<number>();
  
  // Initialize resource monitor if not provided
  const resources = resourceMonitor || new SystemResourceMonitor();
  
  // Track task resource reservations for cleanup
  const resourceReservations: Map<number, {category: string, amount: number}[]> = new Map();

  // Process tasks in order of priority
  const sortedTasks = [...taskQueue].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  
  for (const task of sortedTasks) {
    // Skip already processed tasks
    if (processedTaskIds.has(task.task_id)) continue;
    processedTaskIds.add(task.task_id);
    
    // Skip non-pending tasks (already completed or failed)
    if (task.status !== 'pending' && task.status !== 'deferred') continue;
    
    // Update status timestamp for tracking
    task.statusUpdatedAt = Date.now();
    task.lastExecutionAttempt = Date.now();
    
    // Check if max retries exceeded
    if ((task.retryCount ?? 0) >= (task.maxRetries ?? maxRetries)) {
      logger.warn(`Task exceeded maximum retry attempts (${task.maxRetries ?? maxRetries}): ${task.query}`, { taskId: task.task_id });
      task.status = 'failed';
      task.statusReason = 'Maximum retry attempts exceeded';
      stats.failed++;
      continue;
    }
    
    // Check if task is blocked by dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      const uncompletedDeps = task.dependencies.filter(depId => {
        const depTask = taskQueue.find(t => t.task_id === depId);
        return depTask && depTask.status !== 'completed';
      });
      
      if (uncompletedDeps.length > 0) {
        const depList = uncompletedDeps.join(', ');
        logger.info(`Task deferred due to uncompleted dependencies: ${task.query}`, { 
          taskId: task.task_id,
          dependencies: depList
        });
        task.status = 'deferred';
        task.statusReason = `Waiting for dependencies: ${depList}`;
        stats.deferred++;
        continue;
      }
    }
    
    // Check for complex condition expression first with detailed evaluation
    if (task.conditionExpression) {
      try {
        const conditionContext = { 
          taskId: task.task_id, 
          debug: debugMode 
        };
        
        const conditionSatisfied = evaluateConditionExpression(
          task.conditionExpression, 
          memoryState,
          conditionContext
        );
        
        if (!conditionSatisfied) {
          logger.info(`Task deferred due to unmet complex condition: ${task.query}`, { 
            taskId: task.task_id,
            conditionType: task.conditionExpression.operator
          });
          task.status = 'deferred';
          task.statusReason = `Complex condition (${task.conditionExpression.operator}) not satisfied`;
          stats.deferred++;
          continue;
        }
      } catch (error) {
        // Handle condition evaluation errors - use simple string format instead of object with taskId
        logger.error(
          `Error evaluating complex condition for task ${task.task_id}: ${task.query}. ` +
          `Error: ${error.message}`
        );
        
        // Create a properly formatted error without custom properties
        const conditionError = new Error(`Condition evaluation error: ${error.message}`);
        stats.errors.push(conditionError);
        
        if (failFast) {
          throw conditionError; // Stop execution if failFast is enabled
        }
        
        // Otherwise mark as deferred and continue
        task.status = 'deferred';
        task.statusReason = `Condition evaluation error: ${error.message}`;
        stats.deferred++;
        continue;
      }
    }
    
    // Check simple condition (if any)
    if (task.condition && !checkCondition(task.condition, memoryState)) {
      logger.info(`Task deferred due to unmet condition: ${task.query}`, { taskId: task.task_id });
      task.status = 'deferred';
      task.statusReason = `Prerequisite '${task.condition.prerequisite}' not completed`;
      stats.deferred++;
      continue;
    }

    // Resource availability check
    let insufficientResources = false;
    const taskResourceReservations: {category: string, amount: number}[] = [];
    
    if (task.category) {
      const availability = resources.getResourceAvailability(task.category);
      const requiredAmount = task.resourceCost ?? 10; // Default resource cost if not specified
      
      if (availability < 0.3) { // 30% minimum availability
        logger.info(`Task deferred due to low ${task.category} resource availability: ${task.query}`, { 
          taskId: task.task_id, 
          resourceAvailability: availability,
          resourceCategory: task.category
        });
        task.status = 'deferred';
        task.statusReason = `Insufficient ${task.category} resources (${Math.round(availability * 100)}% available)`;
        stats.deferred++;
        insufficientResources = true;
      } else {
        // Try to reserve the required resources
        const reservationSuccessful = resources.reserveResources(task.category, requiredAmount);
        if (!reservationSuccessful) {
          logger.info(`Task deferred due to failed resource reservation: ${task.query}`, { 
            taskId: task.task_id, 
            resourceCategory: task.category,
            requestedAmount: requiredAmount
          });
          task.status = 'deferred';
          task.statusReason = `Could not reserve ${requiredAmount} units of ${task.category} resources`;
          stats.deferred++;
          insufficientResources = true;
        } else {
          // Track successful reservation for later release
          taskResourceReservations.push({
            category: task.category,
            amount: requiredAmount
          });
        }
      }
    }
    
    // Skip to next task if resources were insufficient
    if (insufficientResources) {
      continue;
    }
    
    // Check system load for high-cost tasks
    const systemLoad = resources.getSystemLoad();
    if (systemLoad > 0.8 && (task.resourceCost ?? 0) > 50 && !task.isSystemCritical) {
      logger.info(`Task deferred due to high system load: ${task.query}`, { 
        taskId: task.task_id, 
        systemLoad,
        resourceCost: task.resourceCost
      });
      task.status = 'deferred';
      task.statusReason = 'System under heavy load, deferring non-critical high-cost task';
      stats.deferred++;
      
      // Release any resources we reserved
      taskResourceReservations.forEach(res => {
        resources.releaseResources(res.category, res.amount);
      });
      
      continue;
    }
    
    // Store resource reservations for cleanup after task execution
    if (taskResourceReservations.length > 0) {
      resourceReservations.set(task.task_id, taskResourceReservations);
    }

    // Track retry attempts and mark task as executing
    const retryCount = task.retryCount ?? 0;
    const effectiveMaxRetries = task.maxRetries ?? maxRetries;
    
    task.status = 'pending';
    logger.info(`Executing task (attempt ${retryCount + 1}/${effectiveMaxRetries + 1}): ${task.query}`, { taskId: task.task_id });
    stats.executed++;

    try {
      // Add timeout for task execution
      const taskTimeout = task.executionTimeout || timeoutMs;
      let timedOut = false;
      let timeoutId: NodeJS.Timeout | null = null;
      
      // Create a promise that will resolve or reject based on task execution
      const executeWithTimeout = new Promise<void>((resolve, reject) => {
        // Set timeout if specified
        if (taskTimeout > 0) {
          timeoutId = setTimeout(() => {
            timedOut = true;
            reject(new Error(`Task execution timed out after ${taskTimeout}ms`));
          }, taskTimeout);
        }
        
        try {
          // Actual task execution would happen here
          // This is a simplified placeholder - real implementation would invoke the task handler
          logger.info(`Executing task: ${task.query}`, { 
            taskId: task.task_id,
            timeout: taskTimeout,
            debug: debugMode
          });
          
          // For debug mode, provide additional execution details
          if (debugMode) {
            logger.debug(`Task execution details for task ${task.task_id}:`, {
              category: task.category,
              priority: task.priority,
              hasDependencies: task.dependencies && task.dependencies.length > 0,
              hasConditions: !!task.conditionExpression || !!task.condition,
              retryCount: task.retryCount || 0,
              maxRetries: task.maxRetries || maxRetries
            });
          }
          
          // Simulate successful execution
          resolve();
        } catch (execError) {
          // Clear timeout if there was an error
          if (timeoutId) clearTimeout(timeoutId);
          reject(execError);
        }
      });
      
      // Execute the task with timeout
      await executeWithTimeout;
      
      // Clear timeout if it exists
      if (timeoutId) clearTimeout(timeoutId);
      
      // Record successful execution
      task.status = 'completed';
      task.statusReason = 'Task completed successfully';
      task.statusUpdatedAt = Date.now();
      stats.executed++;
      stats.completed++;
      
    } catch (error: any) {
      // Record error for statistics
      stats.errors.push(error);
      
      // Handle task execution failure
      // Log the error with task details in the message
      const errorLogMessage = 
        `Error executing task ${task.task_id} (attempt ${retryCount + 1}/${effectiveMaxRetries + 1}): ${task.query}. ` +
        `Error: ${error.message}`;
      
      logger.error(errorLogMessage);
      
      // Check if we should retry
      if (retryCount < effectiveMaxRetries) {
        task.retryCount = retryCount + 1;
        task.status = 'pending';
        task.statusReason = `Execution failed: ${error.message}. Scheduled for retry.`;
        
        logger.info(`Task scheduled for retry (${task.retryCount}/${effectiveMaxRetries}): ${task.query}`, { 
          taskId: task.task_id.toString() // Convert to string to avoid lint errors
        });
      } else {
        // Max retries exceeded
        task.status = 'failed';
        task.statusReason = `Failed after ${effectiveMaxRetries + 1} attempts: ${error.message}`;
        
        // Log the final failure
        const failureMessage = 
          `Task ${task.task_id} failed after ${effectiveMaxRetries + 1} attempts: ${task.query}. ` +
          `Error: ${error.message}`;
        
        logger.error(failureMessage);
        stats.failed++;
        
        // If failFast is enabled and this is not a timeout error, throw the error to stop execution
        if (failFast && !error.message.includes('timed out')) {
          throw new Error(`Task execution failed with error: ${error.message}`);
        }
      }
    } finally {
      // Release any resources that were reserved for this task
      const reservations = resourceReservations.get(task.task_id);
      if (reservations) {
        reservations.forEach(res => {
          resources.releaseResources(res.category, res.amount);
        });
        resourceReservations.delete(task.task_id);
      }
    }
  }
  
  // Return execution statistics
  return stats;
}

/**
 * Check if a task's dependencies are completed.
 * @param task The task to check.
 * @param taskQueue The full queue to look up dependency tasks.
 * @returns True if all dependencies are completed or if there are no dependencies.
 */
function checkDependencies(task: TaskMessage, taskQueue: TaskMessage[]): boolean {
  if (!task.dependencies || task.dependencies.length === 0) {
    return true;
  }
  
  return task.dependencies.every(depId => {
    const depTask = taskQueue.find(t => t.task_id === depId);
    return depTask && depTask.status === 'completed';
  });
}

/**
 * Evaluate a complex condition expression with advanced logical operations
 * @param expression The condition expression to evaluate
 * @param memoryState Memory state for condition evaluation
 * @param context Additional context for detailed logging
 * @returns Whether the condition is satisfied
 */
function evaluateConditionExpression(
  expression: TaskConditionExpression, 
  memoryState: { completedTopics: string[] },
  context: { taskId?: number, debug?: boolean } = {}
): boolean {
  try {
    // For debugging purposes
    const isDebug = context.debug === true;
    const taskInfo = context.taskId ? `[Task ${context.taskId}] ` : '';
    let result = false;
    
    switch (expression.operator) {
      case 'and':
        if (!expression.conditions || expression.conditions.length === 0) {
          result = true; // Empty AND is true
          if (isDebug) logger.debug(`${taskInfo}Empty AND condition evaluated to true`);
          return result;
        }
        
        // Track individual condition results for debugging
        const andResults: boolean[] = [];
        
        result = expression.conditions.every(condition => {
          let conditionResult: boolean;
          
          if ('type' in condition) { // It's a simple condition
            conditionResult = checkCondition(condition, memoryState);
            if (isDebug) {
              logger.debug(`${taskInfo}AND condition '${condition.prerequisite}' evaluated to ${conditionResult}`);
            }
          } else { // It's a nested expression
            conditionResult = evaluateConditionExpression(condition, memoryState, context);
            if (isDebug) {
              logger.debug(`${taskInfo}AND nested expression (${condition.operator}) evaluated to ${conditionResult}`);
            }
          }
          
          andResults.push(conditionResult);
          return conditionResult;
        });
        
        if (isDebug) {
          logger.debug(`${taskInfo}AND expression with ${expression.conditions.length} conditions evaluated to ${result}`, {
            results: andResults,
            taskId: context.taskId
          });
        }
        return result;
        
      case 'or':
        if (!expression.conditions || expression.conditions.length === 0) {
          result = false; // Empty OR is false
          if (isDebug) logger.debug(`${taskInfo}Empty OR condition evaluated to false`);
          return result;
        }
        
        // Track individual condition results for debugging
        const orResults: boolean[] = [];
        
        result = expression.conditions.some(condition => {
          let conditionResult: boolean;
          
          if ('type' in condition) { // It's a simple condition
            conditionResult = checkCondition(condition, memoryState);
            if (isDebug) {
              logger.debug(`${taskInfo}OR condition '${condition.prerequisite}' evaluated to ${conditionResult}`);
            }
          } else { // It's a nested expression
            conditionResult = evaluateConditionExpression(condition, memoryState, context);
            if (isDebug) {
              logger.debug(`${taskInfo}OR nested expression (${condition.operator}) evaluated to ${conditionResult}`);
            }
          }
          
          orResults.push(conditionResult);
          return conditionResult;
        });
        
        if (isDebug) {
          logger.debug(`${taskInfo}OR expression with ${expression.conditions.length} conditions evaluated to ${result}`, {
            results: orResults,
            taskId: context.taskId
          });
        }
        return result;
        
      case 'not':
        if (!expression.condition) {
          result = true; // Empty NOT is true (no condition to negate)
          if (isDebug) logger.debug(`${taskInfo}Empty NOT condition evaluated to true (no condition)`);
          return result;
        }
        
        let notResult: boolean;
        if ('type' in expression.condition) { // It's a simple condition
          notResult = checkCondition(expression.condition, memoryState);
          result = !notResult;
          
          if (isDebug) {
            logger.debug(
              `${taskInfo}NOT condition '${expression.condition.prerequisite}' evaluated to ${result} ` +
              `(condition was ${notResult})`
            );
          }
        } else { // It's a nested expression
          notResult = evaluateConditionExpression(expression.condition, memoryState, context);
          result = !notResult;
          
          if (isDebug) {
            logger.debug(
              `${taskInfo}NOT nested expression (${expression.condition.operator}) evaluated to ${result} ` +
              `(nested expression was ${notResult})`
            );
          }
        }
        
        return result;
        
      case 'threshold':
        // Optional threshold operator: require X out of Y conditions to be true
        if (!expression.conditions || expression.conditions.length === 0) {
          result = false;
          if (isDebug) logger.debug(`${taskInfo}Empty THRESHOLD condition evaluated to false`);
          return result;
        }
        
        // Default to majority (half or more) if threshold not specified
        const threshold = expression.threshold || Math.ceil(expression.conditions.length / 2);
        let trueCount = 0;
        const thresholdResults: boolean[] = [];
        
        // Count true conditions
        expression.conditions.forEach(condition => {
          let conditionResult: boolean;
          
          if ('type' in condition) { // It's a simple condition
            conditionResult = checkCondition(condition, memoryState);
            if (isDebug) {
              logger.debug(`${taskInfo}THRESHOLD condition evaluated to ${conditionResult}`);
            }
          } else { // It's a nested expression
            conditionResult = evaluateConditionExpression(condition, memoryState, context);
            if (isDebug) {
              logger.debug(`${taskInfo}THRESHOLD nested expression evaluated to ${conditionResult}`);
            }
          }
          
          if (conditionResult) trueCount++;
          thresholdResults.push(conditionResult);
        });
        
        result = trueCount >= threshold;
        
        if (isDebug) {
          logger.debug(
            `${taskInfo}THRESHOLD expression (${trueCount}/${expression.conditions.length}, ` +
            `threshold=${threshold}) evaluated to ${result}`,
            { results: thresholdResults, taskId: context.taskId }
          );
        }
        return result;
        
      default:
        logger.warn(`${taskInfo}Unknown condition operator: ${(expression as any).operator}`);
        return false;
    }
  } catch (error) {
    logger.error(
      `Error evaluating condition expression (operator: ${expression.operator}): ${error.message}`,
      { taskId: context.taskId, errorStack: error.stack }
    );
    return false; // Fail safely on errors
  }
}
}

/**
 * Check if a condition is satisfied based on memory state
 * @param condition The condition to check
 * @param memoryState Memory state to use for condition evaluation
 * @returns Whether the condition is satisfied
 */
function checkCondition(condition: TaskCondition, memoryState: { completedTopics: string[] }): boolean {
  if (condition.type === "deferred") {
    return memoryState.completedTopics.includes(condition.prerequisite);
  }
  return true;
}
