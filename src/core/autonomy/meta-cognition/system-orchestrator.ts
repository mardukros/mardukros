
import { MemorySystemFactory } from '../../memory/memory-factory.js';
import { TaskManager } from '../../task/task-manager.js';
import { AiCoordinator } from '../../ai/ai-coordinator.js';
import { AutonomyCoordinator } from '../coordinator.js';
import { logger } from '../../utils/logger.js';
import { 
  ReflectionPattern, 
  SystemObservation,
  CognitiveImprovement
} from './types.js';

/**
 * System Orchestrator - Meta-cognitive component that coordinates
 * cross-subsystem interactions and enables recursive self-improvement.
 * 
 * This class creates feedback loops between all four cognitive subsystems:
 * - Memory provides data about system operation
 * - Task system orchestrates improvement actions
 * - AI analyzes patterns and suggests optimizations
 * - Autonomy implements the optimizations
 */
export class SystemOrchestrator {
  private memoryFactory: MemorySystemFactory;
  private taskManager: TaskManager;
  private aiCoordinator: AiCoordinator;
  private autonomyCoordinator: AutonomyCoordinator;
  private observationCycle: NodeJS.Timeout | null = null;
  private cycleInterval = 60000; // Default 1 minute
  
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
    
    logger.info('⚡ META-COGNITIVE ORCHESTRATOR INITIALIZED! ⚡ Neural pathways connected for recursive enhancement!');
  }
  
  /**
   * Start the meta-cognitive cycle that continuously observes, analyzes and improves
   * the cognitive architecture.
   */
  public startRecursiveCycle(): void {
    logger.info('⚡ RECURSIVE META-COGNITIVE CYCLE ACTIVATED! ⚡');
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
    
    this.observationCycle = setInterval(async () => {
      await this.runCognitiveImprovement();
    }, this.cycleInterval);
  }
  
  /**
   * Stop the meta-cognitive cycle
   */
  public stopRecursiveCycle(): void {
    if (this.observationCycle) {
      clearInterval(this.observationCycle);
      this.observationCycle = null;
      logger.info('Meta-cognitive cycle deactivated');
    }
  }
  
  /**
   * Run a complete cognitive improvement cycle:
   * 1. Gather observations across subsystems
   * 2. Identify patterns in system behavior
   * 3. Generate improvement suggestions
   * 4. Schedule implementation tasks
   * 5. Record the improvement in episodic memory
   */
  private async runCognitiveImprovement(): Promise<void> {
    try {
      // Step 1: Gather observations from all subsystems
      const observations = await this.gatherSystemObservations();
      
      // Step 2: Analyze patterns in system behavior
      const patterns = await this.identifyPatterns(observations);
      
      if (patterns.length === 0) {
        logger.debug('No improvement patterns identified in this cycle');
        return;
      }
      
      // Step 3: Generate improvement suggestions using AI
      const improvements = await this.generateImprovements(patterns);
      
      // Step 4: Schedule implementation tasks
      await this.scheduleImprovementTasks(improvements);
      
      // Step 5: Record the improvement cycle in episodic memory
      await this.recordImprovementCycle(observations, patterns, improvements);
      
      logger.info(`⚡ META-COGNITIVE CYCLE COMPLETE! ⚡ ${improvements.length} improvements scheduled`);
    } catch (error) {
      logger.error('Error in cognitive improvement cycle', { error });
    }
  }
  
  /**
   * Gather observations from all subsystems to identify potential improvements
   */
  private async gatherSystemObservations(): Promise<SystemObservation[]> {
    const observations: SystemObservation[] = [];
    
    // Memory subsystem observations
    const memoryStats = await this.memoryFactory.getSubsystemStats();
    observations.push({
      subsystem: 'memory',
      metrics: memoryStats,
      timestamp: new Date().toISOString()
    });
    
    // Task subsystem observations
    const taskMetrics = this.taskManager.getPerformanceMetrics?.() || {
      tasksExecuted: 0,
      averageCompletionTime: 0
    };
    
    observations.push({
      subsystem: 'task',
      metrics: taskMetrics,
      timestamp: new Date().toISOString()
    });
    
    // AI subsystem observations
    const aiMetrics = this.aiCoordinator.getUsageMetrics();
    observations.push({
      subsystem: 'ai',
      metrics: aiMetrics,
      timestamp: new Date().toISOString()
    });
    
    // Autonomy subsystem observations
    const autonomyHealth = this.autonomyCoordinator.getSystemHealth ? 
                          this.autonomyCoordinator.getSystemHealth() :
                          {
                            selfImprovementActive: true,
                            improvementsCount: 0,
                            lastImprovementTimestamp: ''
                          };
    observations.push({
      subsystem: 'autonomy',
      metrics: autonomyHealth,
      timestamp: new Date().toISOString()
    });
    
    return observations;
  }
  
  /**
   * Identify patterns in system behavior that could lead to improvements
   */
  private async identifyPatterns(observations: SystemObservation[]): Promise<ReflectionPattern[]> {
    // Analyze memory access patterns
    const memoryObservation = observations.find(o => o.subsystem === 'memory');
    const memoryPatterns: ReflectionPattern[] = memoryObservation ? [{
      type: 'memory_access',
      description: 'Memory access pattern analysis',
      source: 'memory',
      confidence: 0.85,
      metrics: memoryObservation.metrics
    }] : [];
    
    // Analyze task execution patterns
    const taskObservation = observations.find(o => o.subsystem === 'task');
    const taskPatterns: ReflectionPattern[] = taskObservation ? [{
      type: 'task_scheduling',
      description: 'Task scheduling optimization opportunity',
      source: 'task',
      confidence: 0.78,
      metrics: taskObservation.metrics
    }] : [];
    
    // Analyze AI usage patterns
    const aiObservation = observations.find(o => o.subsystem === 'ai');
    const aiPatterns: ReflectionPattern[] = aiObservation ? [{
      type: 'ai_prompt_efficiency',
      description: 'AI prompt optimization',
      source: 'ai',
      confidence: 0.92,
      metrics: aiObservation.metrics
    }] : [];
    
    // Combine all patterns and filter by confidence threshold
    const allPatterns = [...memoryPatterns, ...taskPatterns, ...aiPatterns];
    return allPatterns.filter(pattern => pattern.confidence > 0.75);
  }
  
  /**
   * Generate improvement suggestions based on identified patterns
   */
  private async generateImprovements(patterns: ReflectionPattern[]): Promise<CognitiveImprovement[]> {
    const improvements: CognitiveImprovement[] = [];
    
    for (const pattern of patterns) {
      // Use AI to analyze the pattern and suggest improvements
      const prompt = `Analyze the following system pattern and suggest concrete improvements:
      Pattern type: ${pattern.type}
      Description: ${pattern.description}
      Source subsystem: ${pattern.source}
      Metrics: ${JSON.stringify(pattern.metrics)}`;
      
      try {
        const response = await this.aiCoordinator.processQuery(prompt, {
          temperature: 0.4,
          max_tokens: 500
        });
        
        improvements.push({
          patternType: pattern.type,
          description: response.content as string,
          sourcePattern: pattern,
          implementationStrategy: 'task_sequence',
          priority: this.calculatePriority(pattern)
        });
      } catch (error) {
        logger.error('Error generating improvement from pattern', { 
          patternType: pattern.type, 
          error 
        });
      }
    }
    
    return improvements;
  }
  
  /**
   * Schedule tasks to implement the suggested improvements
   */
  private async scheduleImprovementTasks(improvements: CognitiveImprovement[]): Promise<void> {
    // Create tasks for each improvement, ordered by priority
    const sortedImprovements = improvements.sort((a, b) => b.priority - a.priority);
    
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
    for (const improvement of sortedImprovements) {
      // Use a more generic approach to creating tasks since createTask might not be available
      let task;
      
      if (this.taskManager.createTask) {
        task = this.taskManager.createTask(`Implement ${improvement.patternType} improvement`, {
          priority: improvement.priority,
          target: 'autonomy-coordinator',
          data: {
            improvement,
            steps: this.parseImplementationSteps(improvement.description)
          }
        });
      } else {
        task = {
          task_id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          query: `Implement ${improvement.patternType} improvement`,
          priority: improvement.priority,
          type: 'optimization',
          status: 'pending',
          target: 'autonomy-coordinator',
          data: {
            improvement,
            steps: this.parseImplementationSteps(improvement.description)
          }
        };
      }
      
      this.taskManager.addTask(task);
      logger.debug(`Scheduled improvement task: ${task.task_id}`);
    }
  }
  
  /**
   * Parse implementation steps from the AI-generated improvement description
   */
  private parseImplementationSteps(description: string): string[] {
    // Simple implementation to extract numbered steps from the description
    const steps: string[] = [];
    const lines = description.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^\d+\./.test(trimmed)) {
        steps.push(trimmed);
      }
    }
    
    return steps.length > 0 ? steps : [description];
  }
  
  /**
   * Calculate priority for an improvement based on pattern confidence and type
   */
  private calculatePriority(pattern: ReflectionPattern): number {
    // Base priority from confidence
    let priority = pattern.confidence * 5;
    
    // Adjust based on pattern type
    switch (pattern.type) {
      case 'memory_access':
        priority += 1;
        break;
      case 'task_scheduling':
        priority += 2;
        break;
      case 'ai_prompt_efficiency':
        priority += 3;
        break;
      default:
        break;
    }
    
    // Cap to range 1-5
    return Math.min(5, Math.max(1, Math.round(priority)));
  }
  
  /**
   * Record the improvement cycle in episodic memory for future reference
   */
  private async recordImprovementCycle(
    observations: SystemObservation[],
    patterns: ReflectionPattern[],
    improvements: CognitiveImprovement[]
  ): Promise<void> {
    const episodicMemory = this.memoryFactory.getSubsystem('episodic');
    
    await episodicMemory.store({
      id: `improvement-cycle:${Date.now()}`,
      type: 'cognitive_improvement_cycle',
      content: {
        observations,
        patterns,
        improvements,
        timestamp: new Date().toISOString()
      },
      metadata: {
        importance: 0.85,
        context: 'system_optimization',
        tags: ['meta-cognition', 'self-improvement', 'autonomy']
      }
    });
  }
  
  /**
   * Change the interval between meta-cognitive cycles
   */
  public setCycleInterval(intervalMs: number): void {
    if (intervalMs < 5000) {
      throw new Error('Cycle interval must be at least 5000ms');
    }
    
    this.cycleInterval = intervalMs;
    
    // Restart cycle with new interval if already running
    if (this.observationCycle) {
      this.stopRecursiveCycle();
      this.startRecursiveCycle();
    }
    
    logger.info(`Meta-cognitive cycle interval updated to ${intervalMs}ms`);
  }
}
