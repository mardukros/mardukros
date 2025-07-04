
import { logger } from '../../utils/logger.js';
import { OptimizationResult } from '../types/optimization-types.js';

/**
 * Optimization Visualizer
 * 
 * Provides visualization utilities for memory optimization processes,
 * allowing for deeper meta-cognitive insights into optimization patterns.
 */
export class OptimizationVisualizer {
  /**
   * Generates a text-based visualization of optimization history
   */
  static visualizeOptimizationHistory(history: OptimizationResult[]): void {
    if (history.length === 0) {
      logger.info('No optimization history to visualize');
      return;
    }
    
    logger.info('=== OPTIMIZATION HISTORY VISUALIZATION ===');
    logger.info(`Total optimizations: ${history.length}`);
    
    // Group by rule ID
    const ruleGroups = new Map<string, OptimizationResult[]>();
    
    history.forEach(item => {
      if (!ruleGroups.has(item.ruleId)) {
        ruleGroups.set(item.ruleId, []);
      }
      ruleGroups.get(item.ruleId)!.push(item);
    });
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
    
    // Display summary by rule
    logger.info('\nOptimizations by rule:');
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
    
    for (const [ruleId, items] of ruleGroups.entries()) {
      const successCount = items.filter(i => i.success).length;
      const totalItems = items.length;
      const successRate = (successCount / totalItems * 100).toFixed(1);
      
      // Calculate total changes
      const totalChanges = items.reduce((acc, item) => {
        acc.itemsModified += item.changes.itemsModified || 0;
        acc.itemsRemoved += item.changes.itemsRemoved || 0;
        acc.itemsCreated += item.changes.itemsCreated || 0;
        return acc;
      }, { itemsModified: 0, itemsRemoved: 0, itemsCreated: 0 });
      
      logger.info(`Rule: ${ruleId}`);
      logger.info(`  Success rate: ${successRate}% (${successCount}/${totalItems})`);
      logger.info(`  Items modified: ${totalChanges.itemsModified}`);
      logger.info(`  Items removed: ${totalChanges.itemsRemoved}`);
      logger.info(`  Items created: ${totalChanges.itemsCreated}`);
      logger.info('');
    }
    
    // Timeline visualization
    logger.info('\nOptimization Timeline:');
    
    const timelineBars = this.generateTimelineBars(history);
    timelineBars.forEach(bar => logger.info(bar));
    
    logger.info('\n=== END VISUALIZATION ===');
  }
  
  /**
   * Generate ASCII timeline bars
   */
  private static generateTimelineBars(history: OptimizationResult[]): string[] {
    // Sort by timestamp
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Find date range
    const startDate = new Date(sortedHistory[0].timestamp);
    const endDate = new Date(sortedHistory[sortedHistory.length - 1].timestamp);
    const totalTimeMs = endDate.getTime() - startDate.getTime();
    
    // Generate bars
    const bars: string[] = [];
    const width = 50; // Width of visualization
    
    sortedHistory.forEach(item => {
      const itemDate = new Date(item.timestamp);
      const position = Math.floor(
        ((itemDate.getTime() - startDate.getTime()) / totalTimeMs) * width
      );
      
      const bar = '|' + ' '.repeat(position) + '*' + ' '.repeat(width - position - 1) + '| ' +
        itemDate.toISOString().substr(0, 16).replace('T', ' ') + ' - ' + item.ruleId;
      
      bars.push(bar);
    });
    
    return bars;
  }
  
  /**
   * Visualizes memory optimization metrics
   */
  static visualizeOptimizationMetrics(metrics: Record<string, any>): void {
    logger.info('=== MEMORY OPTIMIZATION METRICS ===');
    
    // Format and display metrics
    for (const [key, value] of Object.entries(metrics)) {
      if (typeof value === 'number') {
        // Format percentages
        const formattedValue = key.includes('rate') || key.includes('improvement') || key.includes('reduction')
          ? `${(value * 100).toFixed(2)}%`
          : value.toString();
          
        logger.info(`${key}: ${formattedValue}`);
      } else if (typeof value === 'object') {
        logger.info(`${key}:`);
        
        for (const [subKey, subValue] of Object.entries(value)) {
          const indent = '  ';
          const formattedSubValue = typeof subValue === 'number' && 
            (subKey.includes('rate') || subKey.includes('improvement') || subKey.includes('reduction'))
            ? `${(subValue * 100).toFixed(2)}%`
            : subValue;
            
          logger.info(`${indent}${subKey}: ${formattedSubValue}`);
        }
      }
    }
    
    logger.info('=== END METRICS ===');
  }
  
  /**
   * Creates an ASCII art visualization of cognitive architecture
   */
  static visualizeCognitiveArchitecture(): void {
    logger.info(`
    ╔════════════════════════════ MARDUK COGNITIVE ARCHITECTURE ═══════════════════════════╗
    ║                                                                                       ║
    ║      ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ║
    ║      │   Memory    │────→│    Task     │────→│     AI      │────→│  Autonomy   │     ║
    ║      │   System    │←────│   System    │←────│   System    │←────│   System    │     ║
    ║      └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     ║
    ║             ↑                   ↑                   ↑                   ↑             ║
    ║             ╰───────────────────┼───────────────────┼───────────────────╯             ║
    ║                                 │                   │                                 ║
    ║                         ┌───────┴───────┐   ┌───────┴───────┐                         ║
    ║                         │  Meta-Memory  │←→│ Self-Optimizer │                         ║
    ║                         └───────────────┘   └───────────────┘                         ║
    ║                                                                                       ║
    ╚═══════════════════════════════════════════════════════════════════════════════════════╝
    `);
  }
}
