import { logger } from '../../utils/logger.js';
import { SystemOrchestrator } from './system-orchestrator.js';
import { VisualizationEngine } from './visualization-engine.js';
import { CognitiveCapabilities } from './types.js';
import { MemorySystemFactory } from '../../memory/memory-factory.js';
import { TaskManager } from '../../task/task-manager.js';
import { AiCoordinator } from '../../ai/ai-coordinator.js';
import { AutonomyCoordinator } from '../coordinator.js';

/**
 * Reflection Engine - The core meta-cognitive component that orchestrates
 * self-analysis and improvement of the cognitive architecture.
 * 
 * This engine integrates:
 * 1. System state collection and analysis
 * 2. Visualization of cognitive processes
 * 3. Self-improvement orchestration
 * 4. Meta-level learning about system patterns
 */
export class ReflectionEngine {
  private memoryFactory: MemorySystemFactory;
  private taskManager: TaskManager;
  private aiCoordinator: AiCoordinator;
  private autonomyCoordinator: AutonomyCoordinator;
  private orchestrator: SystemOrchestrator;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(
    memoryFactory: MemorySystemFactory,
    taskManager: TaskManager,
    aiCoordinator: AiCoordinator,
    autonomyCoordinator: AutonomyCoordinator
  ) {
    this.memoryFactory = memoryFactory;
    this.taskManager = taskManager;
    this.aiCoordinator = aiCoordinator;
    this.autonomyCoordinator = autonomyCoordinator;

    // Initialize the system orchestrator
    this.orchestrator = new SystemOrchestrator(
      memoryFactory,
      taskManager,
      aiCoordinator,
      autonomyCoordinator
    );

    logger.info('⚡ REFLECTION ENGINE INITIALIZED! ⚡ Meta-cognitive capabilities ready!');
  }

  /**
   * Start the meta-cognitive engine and all its components
   */
  public start(): void {
    // Start state visualization
    this.startVisualizationHeartbeat();

    // Start the improvement orchestrator
    this.orchestrator.startRecursiveCycle();

    // Visualize neural pathways
    VisualizationEngine.visualizeNeuralPathways();

    logger.info('⚡ META-COGNITIVE REFLECTION ENGINE ACTIVATED! ⚡ System can now analyze and improve itself!');
  }

  /**
   * Stop the meta-cognitive engine
   */
  public stop(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    this.orchestrator.stopRecursiveCycle();
    logger.info('Meta-cognitive reflection engine deactivated');
  }

  /**
   * Start a visualization heartbeat that shows the system state periodically
   */
  private startVisualizationHeartbeat(): void {
    // Initial visualization
    this.visualizeSystemState();

    // Schedule periodic visualization
    this.heartbeatInterval = setInterval(() => {
      this.visualizeSystemState();
    }, 300000); // Every 5 minutes
  }

  /**
   * Collect system state information and visualize it
   */
  private async visualizeSystemState(): Promise<void> {
    try {
      const capabilities = await this.collectSystemCapabilities();
      VisualizationEngine.visualizeSystemState(capabilities);
    } catch (error) {
      logger.error('Error visualizing system state', { error });
    }
  }

  /**
   * Collect current capabilities and state from all subsystems
   */
  private async collectSystemCapabilities(): Promise<CognitiveCapabilities> {
    // Collect memory system capabilities
    const memoryStats = await this.memoryFactory.getSubsystemStats();
    const memoryCapabilities = {
      itemCounts: {
        declarative: memoryStats.declarative?.itemCount || 0,
        episodic: memoryStats.episodic?.itemCount || 0,
        procedural: memoryStats.procedural?.itemCount || 0,
        semantic: memoryStats.semantic?.itemCount || 0,
        total: memoryStats.totalItems || 0
      },
      accessEfficiency: memoryStats.accessEfficiency || 0.95,
      remainingCapacity: memoryStats.remainingCapacity || 'Unknown'
    };
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    // Collect task system capabilities
    const taskMetrics = this.taskManager.getPerformanceMetrics ? 
                        this.taskManager.getPerformanceMetrics() : 
                        { scheduledCount: 0, averageExecutionTime: 0, tasksPerMinute: 0 };

    const taskCapabilities = {
      scheduledTasks: taskMetrics.scheduledCount || 0,
      averageExecutionTime: taskMetrics.averageExecutionTime || 0,
      throughput: taskMetrics.tasksPerMinute || 0
    };

    // Collect AI system capabilities
    const aiMetrics = this.aiCoordinator.getUsageMetrics();
    const aiCapabilities = {
      availableModels: aiMetrics.availableModels || ['gpt-4', 'claude-2'],
      tokenUsage: aiMetrics.totalTokensUsed || 0,
      averageResponseTime: aiMetrics.averageResponseTime || 0
    };

    // Collect autonomy system capabilities
    const autonomyHealth = this.autonomyCoordinator.getSystemHealth ? 
                          this.autonomyCoordinator.getSystemHealth() : 
                          {
                            selfImprovementActive: true,
                            improvementsCount: 0,
                            lastImprovementTimestamp: ''
                          };

    const autonomyCapabilities = {
      selfImprovementActive: autonomyHealth.selfImprovementActive || true,
      improvementsImplemented: autonomyHealth.improvementsCount || 0,
      lastImprovement: autonomyHealth.lastImprovementTimestamp || ''
    };

    return {
      memory: memoryCapabilities,
      task: taskCapabilities,
      ai: aiCapabilities,
      autonomy: autonomyCapabilities
    };
  }

  /**
   * Allow manual triggering of a cognitive improvement cycle
   */
  public async runManualImprovementCycle(): Promise<void> {
    logger.info('⚡ MANUAL META-COGNITIVE CYCLE TRIGGERED! ⚡');
    return this.orchestrator['runCognitiveImprovement']();
  }

  /**
   * Change the orchestrator's cycle interval
   */
  public setCycleInterval(intervalMs: number): void {
    this.orchestrator.setCycleInterval(intervalMs);
    logger.info(`Meta-cognitive cycle interval updated to ${intervalMs}ms`);
  }

  /**
   * For backwards compatibility - support the reflect method
   */
  public async reflect(): Promise<void> {
    return this.runManualImprovementCycle();
  }
}

// Demo mode to run the reflection engine in isolation for testing
const isMainModule = import.meta.url.endsWith(process.argv[1].replace('file://', ''));
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
if (isMainModule) {
  logger.info('⚡ RUNNING REFLECTION ENGINE IN DEMONSTRATION MODE! ⚡');

  // Create mock subsystems
  const mockFactory = {
    getSubsystemStats: async (): Promise<{
      declarative?: { itemCount: number };
      episodic?: { itemCount: number };
      procedural?: { itemCount: number };
      semantic?: { itemCount: number };
      totalItems?: number;
      accessEfficiency?: number;
      remainingCapacity?: string;
    }> => ({
      declarative: { itemCount: 156 },
      episodic: { itemCount: 87 },
      procedural: { itemCount: 22 },
      semantic: { itemCount: 213 },
      totalItems: 478,
      accessEfficiency: 0.92,
      remainingCapacity: '86%'
    }),
    getSubsystem: (): { store: () => Promise<unknown>; query: () => Promise<unknown[]> } => ({
      store: async () => ({}),
      query: async () => ([])
    })
  } as unknown as MemorySystemFactory;

  const mockTaskManager = {
    getPerformanceMetrics: (): {
      scheduledCount: number;
      averageExecutionTime: number;
      tasksPerMinute: number;
    } => ({
      scheduledCount: 12,
      averageExecutionTime: 45,
      tasksPerMinute: 8
    }),
    createTask: (): { id: string } => ({ id: 'task-123' }),
    addTask: (): void => { /* Mock implementation */ }
  } as unknown as TaskManager;

  const mockAI = {
    getUsageMetrics: (): {
      availableModels: string[];
      totalTokensUsed: number;
      averageResponseTime: number;
    } => ({
      availableModels: ['gpt-4', 'claude-2'],
      totalTokensUsed: 23842,
      averageResponseTime: 420
    }),
    processQuery: async (): Promise<{ content: string }> => ({ content: 'Mock AI response with improvement suggestions' })
  } as unknown as AiCoordinator;

  const mockAutonomy = {
    getSystemHealth: (): {
      selfImprovementActive: boolean;
      improvementsCount: number;
      lastImprovementTimestamp: string;
    } => ({
      selfImprovementActive: true,
      improvementsCount: 17,
      lastImprovementTimestamp: new Date().toISOString()
    })
  } as unknown as AutonomyCoordinator;

  // Create and start the engine
  const engine = new ReflectionEngine(
    mockFactory,
    mockTaskManager,
    mockAI,
    mockAutonomy
  );

  engine.start();

  // Run a manual cycle after a delay
  setTimeout(() => {
    engine.runManualImprovementCycle().catch(console.error);
  }, 2000);
}