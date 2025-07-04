
import { logger } from '../../utils/logger.js';

/**
 * Result type from optimization operations
 */
interface OptimizationResult {
  ruleId: string;
  success: boolean;
  changes: {
    itemsModified: number;
    itemsRemoved: number;
    itemsCreated: number;
    subsystemsAffected: string[];
  };
  metrics: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  timestamp: string;
}

/**
 * Visualization utilities for optimization operations
 */
export class OptimizationVisualizer {
  /**
   * Visualizes optimization results in the console
   */
  static visualizeOptimizationResults(memoryOptimizations: OptimizationResult[], codeOptimizations: any[] = []): void {
    logger.info('╔════════════════════════════════════════════════════════════════════╗');
    logger.info('║                     OPTIMIZATION VISUALIZATION                     ║');
    logger.info('╠════════════════════════════════════════════════════════════════════╣');
    
    // Visualize memory optimizations
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
    if (memoryOptimizations.length > 0) {
      logger.info('║ Memory Optimization Results:                                        ║');
      
      // Group by rule ID
      const ruleGroups = new Map<string, OptimizationResult[]>();
      
      for (const item of memoryOptimizations) {
        if (!ruleGroups.has(item.ruleId)) {
          ruleGroups.set(item.ruleId, []);
        }
        ruleGroups.get(item.ruleId)!.push(item);
      }
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
      
      // Show stats for each rule type
      for (const [ruleId, items] of ruleGroups.entries()) {
        const successCount = items.filter(i => i.success).length;
        logger.info(`║ • ${ruleId}: ${successCount}/${items.length} successful              ║`);
        
        // Summarize changes
        const changes = items.reduce((acc, item) => {
          acc.itemsModified += item.changes.itemsModified || 0;
          acc.itemsRemoved += item.changes.itemsRemoved || 0;
          acc.itemsCreated += item.changes.itemsCreated || 0;
          return acc;
        }, { itemsModified: 0, itemsRemoved: 0, itemsCreated: 0 });
        
        logger.info(`║   - Modified: ${changes.itemsModified}, Removed: ${changes.itemsRemoved}, Created: ${changes.itemsCreated}    ║`);
      }
    }
    
    // Visualize code optimizations
    if (codeOptimizations.length > 0) {
      logger.info('║ Code Optimization Results:                                          ║');
      
      // Group by type
      const typeGroups = new Map<string, any[]>();
      
      for (const opt of codeOptimizations) {
        const type = opt.type || 'general';
        if (!typeGroups.has(type)) {
          typeGroups.set(type, []);
        }
        typeGroups.get(type)!.push(opt);
      }
      
      // Show stats for each type
      for (const [type, opts] of typeGroups.entries()) {
        logger.info(`║ • ${type}: ${opts.length} optimizations                             ║`);
      }
    }
    
    logger.info('╚════════════════════════════════════════════════════════════════════╝');
  }
  
  /**
   * Visualizes optimization history over time
   */
  static visualizeOptimizationHistory(history: OptimizationResult[]): void {
    if (history.length === 0) {
      logger.info('No optimization history to visualize');
      return;
    }
    
    logger.info('╔════════════════════════════════════════════════════════════════════╗');
    logger.info('║                     OPTIMIZATION HISTORY                           ║');
    logger.info('╠════════════════════════════════════════════════════════════════════╣');
    
    // Sort by timestamp
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Create a timeline visualization
    const lastItems = sortedHistory.slice(-10); // Show last 10 items
    
    for (const item of lastItems) {
      const itemDate = new Date(item.timestamp);
      logger.info(`║ ${
        itemDate.toISOString().substring(0, 16).replace('T', ' ') + ' - ' + item.ruleId
      } ║`);
      
      if (item.success) {
        const subsystems = item.changes.subsystemsAffected.join(', ');
        logger.info(`║   Result: ✓ | Affected: ${subsystems}${' '.repeat(Math.max(0, 37 - subsystems.length))}║`);
      } else {
        logger.info(`║   Result: ✗ | No changes made${' '.repeat(26)}║`);
      }
    }
    
    logger.info('╚════════════════════════════════════════════════════════════════════╝');
  }
  
  /**
   * Visualizes the cognitive architecture diagram
   */
  static visualizeCognitiveArchitecture(): void {
    logger.info('╔════════════════════════════════════════════════════════════════════╗');
    logger.info('║                   MARDUK COGNITIVE ARCHITECTURE                    ║');
    logger.info('╠════════════════════════════════════════════════════════════════════╣');
    logger.info('║                        ┌───────────────┐                           ║');
    logger.info('║                        │  Memory System │                           ║');
    logger.info('║                    ┌───┴───────────────┴───┐                       ║');
    logger.info('║  ┌───────────────┐ │    ┌───────────────┐  │ ┌───────────────┐    ║');
    logger.info('║  │   AI System   │◄┼────┤  Task System   │◄─┼─┤   Autonomy    │    ║');
    logger.info('║  └───────┬───────┘ │    └───────────────┘  │ └───────────────┘    ║');
    logger.info('║          │         └───────────┬───────────┘         ▲            ║');
    logger.info('║          │                     │                     │            ║');
    logger.info('║          └─────────────────────┼─────────────────────┘            ║');
    logger.info('║                                │                                  ║');
    logger.info('║                     ┌──────────▼─────────┐                        ║');
    logger.info('║                     │  Cognitive API     │                        ║');
    logger.info('║                     └────────────────────┘                        ║');
    logger.info('╚════════════════════════════════════════════════════════════════════╝');
  }
}
