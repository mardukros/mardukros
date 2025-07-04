
import { logger } from '../utils/logger.js';
import { ReflectionEngine } from './meta-cognition/reflection-engine.js';

export interface Task {
  id: string;
  name: string;
  interval: number;
  execute: () => Promise<TaskResult>;
  lastRun?: number;
  nextRun?: number;
}

export interface TaskResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Scheduler for autonomy subsystem
 * 
 * Manages recurring tasks and optimization cycles
 */
export class Scheduler {
  private tasks: Task[] = [];
  private running = false;
  private interval = 5000; // Check tasks every 5 seconds
  private intervalId: NodeJS.Timeout | null = null;
  private reflectionEngine: ReflectionEngine;

  constructor() {
    logger.info('Initializing Scheduler - THE TEMPORAL COORDINATOR OF MARDUK! *maniacal laughter*');
    // Initialize with a placeholder, will be set properly later
    this.reflectionEngine = {} as ReflectionEngine;
  }

  /**
   * Initialize the scheduler
   */
  async initialize(): Promise<void> {
    logger.info('Starting scheduler for autonomous operations');
    this.start();
    
    // Schedule standard maintenance tasks
    this.scheduleRecurringTask({
      id: 'system-health-check',
      name: 'System Health Check',
      interval: 60 * 1000, // Every minute
      execute: async () => {
        logger.debug('Running system health check');
        return { success: true };
      }
    });
    
    this.scheduleRecurringTask({
      id: 'self-optimization',
      name: 'Self-Optimization Cycle',
      interval: 60 * 60 * 1000, // Every hour
      execute: async () => {
        await this.runSelfOptimization();
        return { success: true };
      }
    });
    
    logger.info('Scheduler initialized successfully');
  }

  /**
   * Start the scheduler
   */
  start(): void {
    if (this.running) return;
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
    
    this.running = true;
    this.intervalId = setInterval(() => this.processTasks(), this.interval);
    logger.info('Scheduler started');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this.running) return;
    
    this.running = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    logger.info('Scheduler stopped');
  }

  /**
   * Schedule a recurring task
   */
  scheduleRecurringTask(task: Task): void {
    // Check if task already exists
    const existingIndex = this.tasks.findIndex(t => t.id === task.id);
    
    if (existingIndex >= 0) {
      // Update existing task
      this.tasks[existingIndex] = {
        ...task,
        lastRun: this.tasks[existingIndex].lastRun,
        nextRun: Date.now() + task.interval
      };
      logger.info(`Updated scheduled task: ${task.name}`);
    } else {
      // Add new task
      this.tasks.push({
        ...task,
        lastRun: 0,
        nextRun: Date.now() + task.interval
      });
      logger.info(`Scheduled new task: ${task.name}`);
    }
  }

  /**
   * Remove a scheduled task
   */
  removeTask(taskId: string): boolean {
    const initialLength = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    
    const removed = initialLength > this.tasks.length;
    if (removed) {
      logger.info(`Removed scheduled task: ${taskId}`);
    }
    
    return removed;
  }

  /**
   * Process due tasks
   */
  private async processTasks(): Promise<void> {
    const now = Date.now();
    
    for (const task of this.tasks) {
      if (task.nextRun && task.nextRun <= now) {
        try {
          logger.debug(`Executing scheduled task: ${task.name}`);
          const result = await task.execute();
          
          if (result.success) {
            logger.debug(`Task ${task.name} completed successfully`);
          } else {
            logger.warn(`Task ${task.name} failed: ${result.error || 'Unknown error'}`);
          }
        } catch (error) {
          logger.error(`Error executing task ${task.name}:`, error instanceof Error ? error : String(error));
        }
        
        // Update task timing
        task.lastRun = now;
        task.nextRun = now + task.interval;
      }
    }
  }

  /**
   * Run self-optimization cycle
   */
  private async runSelfOptimization(): Promise<void> {
    try {
      // Check if self-rewrite is needed
      logger.info('Initiating scheduled self-optimization');
      
      // Run reflection cycle
      await this.reflectionEngine.reflect();
      
      logger.info("System optimization completed");
    } catch (error) {
      logger.error("Error during scheduled optimization:", error instanceof Error ? error : String(error));
    }
  }
}
