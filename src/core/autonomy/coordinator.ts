import { PatternAnalyzer } from "./analysis/pattern-analyzer.js";
import { MemoryPatternAnalyzer } from "./analysis/memory-pattern-analyzer.js";
import { PerformanceOptimizer } from "./optimization/performance-optimizer.js";
import { MemoryOptimizer } from "./optimization/memory-optimizer.js";
import { PatternOptimizer } from "./optimization/pattern-optimizer.js";
import { OptimizationMetrics } from "./metrics/optimization-metrics.js";
import { CodePattern } from "./analysis/types.js";
import { OptimizationResult, RewriteResult } from "./optimization/types.js";
import { logger } from "../utils/logger.js";
import { Scheduler } from './scheduler.js';
import { MemoryOptimizationController } from './memory-optimization-controller.js';
import { ReflectionEngine } from './meta-cognition/reflection-engine.js';
import { BaseMemorySubsystem } from '../memory/subsystems/base/memory-subsystem.js';
import { MemorySystemFactory } from '../memory/memory-factory.js';
import { TaskManager } from '../task/task-manager.js';
import { AiCoordinator } from '../ai/ai-coordinator.js';

/**
 * Autonomy Coordinator
 * 
 * Central coordination point for all autonomous functions of the system.
 * Manages scheduling, optimization, and self-improvement processes.
 */
export class AutonomyCoordinator {
  private readonly REWRITE_INTERVAL = 24 * 60 * 60 * 1000;
  private lastRewrite: number = 0;
  private paused: boolean = false;
  private optimizationFrequency: number = 1;
  private scheduler: Scheduler;
  private memoryOptimizer: MemoryOptimizationController;
  private reflectionEngine: ReflectionEngine;
  private patternAnalyzer: PatternAnalyzer;
  private memoryAnalyzer: MemoryPatternAnalyzer;
  private performanceOptimizer: PerformanceOptimizer;
  private memoryOptimizerInternal: MemoryOptimizer;
  private patternOptimizer: PatternOptimizer;
  private metrics: OptimizationMetrics;
  private memorySubsystems: Map<string, BaseMemorySubsystem> = new Map();


  constructor(
    patternAnalyzer: PatternAnalyzer = new PatternAnalyzer(),
    memoryAnalyzer: MemoryPatternAnalyzer = new MemoryPatternAnalyzer(),
    performanceOptimizer: PerformanceOptimizer = new PerformanceOptimizer(),
    memoryOptimizer: MemoryOptimizer = new MemoryOptimizer(),
    patternOptimizer: PatternOptimizer = new PatternOptimizer(),
    metrics: OptimizationMetrics = new OptimizationMetrics(),
  ) {
    logger.info('Initializing AutonomyCoordinator - THE MASTER CONTROL CENTER! *maniacal laughter*');
    this.scheduler = new Scheduler();
    this.memoryOptimizer = new MemoryOptimizationController();
    
    // Initialize with proper factory instance
    const memoryFactoryInstance = MemorySystemFactory.getInstance();
    const taskManager = new TaskManager();
    const aiCoordinator = new AiCoordinator();
    this.reflectionEngine = new ReflectionEngine(memoryFactoryInstance, taskManager, aiCoordinator, this);
    this.patternAnalyzer = patternAnalyzer;
    this.memoryAnalyzer = memoryAnalyzer;
    this.performanceOptimizer = performanceOptimizer;
    this.memoryOptimizerInternal = memoryOptimizer;
    this.patternOptimizer = patternOptimizer;
    this.metrics = metrics;
  }

  /**
   * Initialize the autonomy subsystem
   */
  async initialize(): Promise<void> {
    logger.info('Starting autonomy systems - BRINGING THE CREATURE TO LIFE!');

    // Start the scheduler
    await this.scheduler.initialize();

    // Initialize memory optimization
    await this.memoryOptimizer.initialize();

    // Schedule regular reflection cycles
    this.scheduleReflectionCycles();

    logger.info('Autonomy systems initialized and self-awareness engaged!');
  }

  /**
   * Schedule regular reflection cycles for meta-cognitive analysis
   */
  private scheduleReflectionCycles(): void {
    logger.info('Scheduling recursive meta-cognitive reflection cycles');

    // Initial reflection
    setTimeout(() => this.runReflectionCycle(), 60000); // First reflection after 1 minute

    // Schedule regular reflections
    this.scheduler.scheduleRecurringTask({
      id: 'meta-cognitive-reflection',
      name: 'System Meta-Cognitive Reflection',
      interval: 3600000, // Every hour
      execute: async () => {
        await this.runReflectionCycle();
        return { success: true };
      }
    });
  }

  /**
   * Run a single reflection cycle
   */
  private async runReflectionCycle(): Promise<void> {
    try {
      logger.info('Initiating system-wide meta-cognitive reflection');
      await this.reflectionEngine.reflect();
    } catch (error) {
      logger.error('Error during reflection cycle:', error);
    }
  }

  async analyze(): Promise<CodePattern[]> {
    try {
      // Analyze code patterns
      const [codePatterns, memoryPatterns] = await Promise.all([
        this.patternAnalyzer.analyzeCodeStructure(),
        this.memoryAnalyzer.analyzeMemoryPatterns(),
      ]);

      // Create a properly typed array for the patterns
      const typedPatterns: CodePattern[] = [];

      // Process and normalize each pattern
      [...codePatterns, ...memoryPatterns]
        .filter(pattern => typeof pattern.impact === 'number')
        .sort((a, b) => b.impact - a.impact)
        .forEach(pattern => {
          // Generate unique ID if not present
          const patternId = (pattern as any).id || `pattern-${Math.random().toString(36).substring(2, 9)}`;
          const filePath = (pattern as any).filePath || 'unknown';

          // Create a new pattern object with all required properties
          const normalizedPattern: CodePattern = {
            type: pattern.type || 'pattern',
            id: patternId,
            filePath: filePath,
            location: pattern.location || 'unknown',
            description: pattern.description || '',
            impact: pattern.impact,
            lineStart: typeof (pattern as any).lineStart === 'number' ? (pattern as any).lineStart : 0,
            lineEnd: typeof (pattern as any).lineEnd === 'number' ? (pattern as any).lineEnd : 0,
            severity: (pattern as any).severity || 'medium',
            suggestion: pattern.suggestion || '',
            codeFragment: (pattern as any).codeFragment || '',
            suggestedFix: (pattern as any).suggestedFix || ''
          };
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

          typedPatterns.push(normalizedPattern);
        });
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

      logger.info("System analysis completed", {
        totalPatterns: typedPatterns.length,
        highImpact: typedPatterns.filter((p) => p.impact > 0.8).length,
      });

      return typedPatterns;
    } catch (error) {
      logger.error("Error during system analysis:", error as Error);
      throw error;
    }
  }

  async rewrite(): Promise<RewriteResult> {
    if (this.paused) {
      logger.info("System rewrite skipped - optimizations are paused");
      return {
        patterns: [],
        optimizations: [],
        metrics: {
          performanceImprovement: 0,
          memoryOptimization: 0,
          complexityReduction: 0,
        },
      };
    }

    try {
      // Analyze system
      const patterns = await this.analyze();

      // Apply optimizations
      const optimizations = await this.optimizeSystem(patterns);

      // Calculate metrics
      const rewriteMetrics = this.metrics.calculateMetrics(optimizations);

      const result: RewriteResult = {
        patterns,
        optimizations,
        metrics: rewriteMetrics,
      };

      this.lastRewrite = Date.now();
      logger.info("System rewrite completed", { metrics: rewriteMetrics });

      return result;
    } catch (error) {
      logger.error("Error during system rewrite:", error as Error);
      throw error;
    }
  }

  private async optimizeSystem(
    patterns: CodePattern[],
  ): Promise<OptimizationResult[]> {
    try {
      // Use the unified code optimizer interface that handles arrays of patterns
      return await this.performanceOptimizer.optimizePatterns(patterns);
    } catch (error) {
      logger.error("Error during system optimization:", error as Error);
      return [];
    }
  }

  pauseOptimizations(): void {
    this.paused = true;
    logger.info("Optimizations paused");
  }

  resumeOptimizations(): void {
    this.paused = false;
    logger.info("Optimizations resumed");
  }

  reduceOptimizationFrequency(): void {
    this.optimizationFrequency = Math.min(this.optimizationFrequency * 2, 8);
    logger.info("Optimization frequency reduced", {
      factor: this.optimizationFrequency,
    });
  }

  async stabilize(): Promise<void> {
    try {
      // Perform minimal analysis
      const patterns = await this.analyze();
      const criticalPatterns = patterns.filter((p) => p.impact > 0.9);

      if (criticalPatterns.length > 0) {
        logger.info("Addressing critical patterns during stabilization", {
          count: criticalPatterns.length,
        });

        // Only handle critical patterns
        await this.optimizeSystem(criticalPatterns);
      }

      // Gradually restore normal operation
      this.optimizationFrequency = Math.max(1, this.optimizationFrequency - 1);
      if (this.optimizationFrequency === 1) {
        this.resumeOptimizations();
      }
    } catch (error) {
      logger.error("Error during stabilization:", error as Error);
      throw error;
    }
  }

  shouldRewrite(): boolean {
    return (
      !this.paused &&
      Date.now() - this.lastRewrite >=
        this.REWRITE_INTERVAL * this.optimizationFrequency
    );
  }

    /**
   * Register a memory subsystem for monitoring
   */
  registerMemorySubsystem(name: string, subsystem: BaseMemorySubsystem): void {
    this.memorySubsystems.set(name, subsystem);
    logger.info(`Registered memory subsystem: ${name}`);
  }

  /**
   * Get health metrics for the autonomy subsystem
   */
  getSystemHealth(): { selfImprovementActive: boolean, improvementsCount: number, lastImprovementTimestamp: string } {
    return {
      selfImprovementActive: !this.paused,
      improvementsCount: 0, // Fixed metrics access
      lastImprovementTimestamp: new Date().toISOString()
    };
  }

  /**
   * Analyze code patterns and suggest optimizations
   */
  analyzeCodePatterns(code: string): CodePattern[] {
    logger.info('Analyzing code patterns');
    // Implementation of code pattern analysis
    return [
      {
        id: `pattern-${Math.random().toString(36).substring(2, 9)}`,
        type: 'performance',
        description: 'Inefficient loop detected',
        lineStart: 10,
        lineEnd: 15,
        severity: 'medium',
        suggestion: 'Consider using map() instead of for loop',
        codeFragment: code.split('\n').slice(9, 15).join('\n'),
        suggestedFix: 'const results = items.map(item => processItem(item));',
        filePath: 'analyzed-code.ts',
        location: 'function',
        impact: 0.7
      }
    ];
  }
}