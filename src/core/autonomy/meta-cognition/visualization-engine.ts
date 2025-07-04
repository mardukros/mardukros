
import { logger } from '../../utils/logger.js';
import { 
  SystemObservation, 
  ReflectionPattern, 
  CognitiveImprovement,
  CognitiveCapabilities 
} from './types.js';

/**
 * Visualization Engine for Meta-Cognitive processes
 * 
 * Provides visual representations of the system's internal states,
 * improvement patterns, and cognitive flows for both debugging
 * and monitoring purposes.
 */
export class VisualizationEngine {
  /**
   * Visualize the current cognitive architecture state
   */
  public static visualizeSystemState(capabilities: CognitiveCapabilities): void {
    logger.info(`
╔══════════════════════════ MARDUK COGNITIVE ARCHITECTURE ═══════════════════════════╗
║                                                                                     ║
║  ┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐         ║
║  │   MEMORY SYSTEM   │     │    TASK SYSTEM    │     │     AI SYSTEM     │         ║
║  ├───────────────────┤     ├───────────────────┤     ├───────────────────┤         ║
║  │ Items: ${this.padRight(String(capabilities.memory.itemCounts.total || 0), 9)}│     │ Scheduled: ${this.padRight(String(capabilities.task.scheduledTasks), 5)}│     │ Models: ${this.padRight(String(capabilities.ai.availableModels.length), 9)}│         ║
║  │ Efficiency: ${this.formatPercent(capabilities.memory.accessEfficiency)}│     │ Throughput: ${this.padRight(String(capabilities.task.throughput), 5)}│     │ Tokens: ${this.padRight(String(capabilities.ai.tokenUsage), 9)}│         ║
║  │ Capacity: ${this.padRight(capabilities.memory.remainingCapacity, 9)}│     │ Avg Time: ${this.padRight(String(capabilities.task.averageExecutionTime), 5)}ms│     │ Avg Time: ${this.padRight(String(capabilities.ai.averageResponseTime), 7)}ms│         ║
║  └─────────┬─────────┘     └─────────┬─────────┘     └─────────┬─────────┘         ║
║            │                         │                         │                   ║
║            └─────────────────────────┼─────────────────────────┘                   ║
║                                      │                                             ║
║                        ┌─────────────▼─────────────┐                               ║
║                        │     AUTONOMY SYSTEM      │                               ║
║                        ├───────────────────────────┤                               ║
║                        │ Self-Improvement: ${capabilities.autonomy.selfImprovementActive ? 'ACTIVE ' : 'INACTIVE'}│                               ║
║                        │ Improvements: ${this.padRight(String(capabilities.autonomy.improvementsImplemented), 8)}│                               ║
║                        │ Last Update: ${this.formatTimestamp(capabilities.autonomy.lastImprovement)}│                               ║
║                        └───────────────────────────┘                               ║
╚═════════════════════════════════════════════════════════════════════════════════════╝
`);
  }

  /**
   * Visualize a meta-cognitive improvement cycle with its patterns and improvements
   */
  public static visualizeImprovementCycle(
    observations: SystemObservation[],
    patterns: ReflectionPattern[],
    improvements: CognitiveImprovement[]
  ): void {
    // Header for the visualization
    logger.info(`
╔═══════════════════════ META-COGNITIVE IMPROVEMENT CYCLE ═══════════════════════╗
║                                                                                 ║
║  OBSERVATIONS (${observations.length})                PATTERNS (${patterns.length})                IMPROVEMENTS (${improvements.length})  ║`);
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    // Create rows for each subsystem
    const subsystems = ['memory', 'task', 'ai', 'autonomy'];
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
    
    for (const subsystem of subsystems) {
      const subsystemObservations = observations.filter(o => o.subsystem === subsystem).length;
      const subsystemPatterns = patterns.filter(p => p.source === subsystem).length;
      const subsystemImprovements = improvements.filter(i => i.sourcePattern.source === subsystem).length;
      
      logger.info(`║  ${this.padRight(subsystem.toUpperCase(), 10)}: ${this.padRight(String(subsystemObservations), 6)}        ${this.padRight(subsystem.toUpperCase(), 10)}: ${this.padRight(String(subsystemPatterns), 4)}        ${this.padRight(subsystem.toUpperCase(), 10)}: ${this.padRight(String(subsystemImprovements), 4)}  ║`);
    }
    
    // Improvement details
    if (improvements.length > 0) {
      logger.info(`║                                                                                 ║
║  DETAILED IMPROVEMENTS:                                                        ║`);
      
      for (let i = 0; i < Math.min(3, improvements.length); i++) {
        const improvement = improvements[i];
        logger.info(`║  - ${this.padRight(improvement.patternType, 20)} | Priority: ${improvement.priority} | Source: ${this.padRight(improvement.sourcePattern.source, 10)}  ║`);
      }
      
      if (improvements.length > 3) {
        logger.info(`║  (${improvements.length - 3} more improvements not shown)                                           ║`);
      }
    }
    
    // Footer 
    logger.info(`║                                                                                 ║
╚═════════════════════════════════════════════════════════════════════════════════╝`);
  }
  
  /**
   * Format a percentage value with % sign
   */
  private static formatPercent(value: number): string {
    return this.padRight(`${Math.round(value * 100)}%`, 9);
  }
  
  /**
   * Pad a string to the right to ensure consistent column widths
   */
  private static padRight(str: string, length: number): string {
    return (str + ' '.repeat(length)).slice(0, length);
  }
  
  /**
   * Format a timestamp for display
   */
  private static formatTimestamp(timestamp: string): string {
    if (!timestamp) return this.padRight('Never', 13);
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      // If today, just show time
      if (date.toDateString() === now.toDateString()) {
        return this.padRight(date.toTimeString().slice(0, 8), 13);
      }
      
      // Otherwise show date and time
      return this.padRight(`${date.toISOString().slice(5, 10)} ${date.toTimeString().slice(0, 5)}`, 13);
    } catch (e) {
      return this.padRight('Invalid', 13);
    }
  }
  
  /**
   * Visualize neural pathways between cognitive subsystems
   */
  public static visualizeNeuralPathways(): void {
    logger.info(`
╔═════════════════════════ NEURAL PATHWAY VISUALIZATION ═════════════════════════╗
║                                                                                 ║
║                            ┌───────────────────┐                                ║
║                            │       MEMORY      │                                ║
║                            └─┬─────────────┬───┘                                ║
║                              │             │                                    ║
║                  ┌───────────┘             └───────────┐                        ║
║                  │                                     │                        ║
║          ┌───────▼─────────┐               ┌───────────▼─────┐                  ║
║          │       TASK      │◄──────────────►      AI         │                  ║
║          └───────┬─────────┘               └───────────┬─────┘                  ║
║                  │                                     │                        ║
║                  └───────────┐             ┌───────────┘                        ║
║                              │             │                                    ║
║                            ┌─▼─────────────▼───┐                                ║
║                            │     AUTONOMY      │                                ║
║                            └───────────────────┘                                ║
║                                     │                                           ║
║                                     ▼                                           ║
║                            ┌───────────────────┐                                ║
║                            │  META-COGNITION   │                                ║
║                            └───────────────────┘                                ║
║                                                                                 ║
╚═════════════════════════════════════════════════════════════════════════════════╝
`);
  }
}
