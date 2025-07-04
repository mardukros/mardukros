import { logger } from './core/utils/logger.js';
import { MemoryOptimizationController } from './core/autonomy/memory-optimization-controller.js';
import { ReflectionEngine } from './core/autonomy/meta-cognition/reflection-engine.js';
import { CodeAnalyzer } from './core/autonomy/code-analyzer.js';
import { CodeOptimizer } from './core/autonomy/code-optimizer.js';
import { MemorySystemFactory } from './core/memory/memory-factory.js';
import { TaskManager } from './core/task/task-manager.js';
import { AiCoordinator } from './core/ai/ai-coordinator.js';
import { AutonomyCoordinator } from './core/autonomy/coordinator.js';
import { HealthMonitor } from 'marduk-ts/core/monitoring/health-monitor.js';
import { MetricsCollector } from 'marduk-ts/core/monitoring/metrics-collector.js';

class OptimizationVisualizer {
  static visualizeCognitiveArchitecture(): void {
    logger.info('\n=======================================');
    logger.info('   MARDUK COGNITIVE ARCHITECTURE');
    logger.info('=======================================');
    logger.info('                                       ');
    logger.info('    [MEMORY]       [TASK]             ');
    logger.info('        ↑             ↑               ');
    logger.info('        |             |               ');
    logger.info('        →  [CORE]  ←                  ');
    logger.info('        |             |               ');
    logger.info('        ↓             ↓               ');
    logger.info('      [AI]      [AUTONOMY]            ');
    logger.info('                                       ');
    logger.info('=======================================\n');
  }

  static visualizeOptimizationResults(memoryResults: any, codeResults: any): void {
    logger.info('\n=== OPTIMIZATION RESULTS VISUALIZATION ===');
    
    const memoryCount = Array.isArray(memoryResults) ? memoryResults.length : 
                        (memoryResults ? 1 : 0);
    const codeCount = Array.isArray(codeResults) ? codeResults.length : 0;
    
    logger.info(`Memory Optimizations: ${memoryCount}`);
    logger.info(`Code Optimizations: ${codeCount}`);
    
    logger.info('\nImpact Distribution:');
    logger.info('Memory: ' + '█'.repeat(Math.ceil(memoryCount)));
    logger.info('Code:   ' + '█'.repeat(Math.ceil(codeCount)));
    
    logger.info('=======================================\n');
  }

  static visualizeOptimizationHistory(history: any[]): void {
    if (!history || history.length === 0) {
      logger.info('No optimization history to visualize');
      return;
    }
    
    logger.info('\n=== OPTIMIZATION HISTORY ===');
    logger.info(`Total optimization cycles: ${history.length}`);
    
    const recentHistory = history.slice(-3);
    
    recentHistory.forEach((entry, i) => {
      logger.info(`\nCycle ${history.length - recentHistory.length + i + 1} (${new Date(entry.timestamp).toLocaleString()}):`);
      const memCount = Array.isArray(entry.memoryOptimizations) ? 
                      entry.memoryOptimizations.length : 
                      (entry.memoryOptimizations ? 1 : 0);
      const codeCount = Array.isArray(entry.codeOptimizations) ? 
                       entry.codeOptimizations.length : 0;
                       
      logger.info(` - Memory optimizations: ${memCount}`);
      logger.info(` - Code optimizations: ${codeCount}`);
      logger.info(` - Performance improvement: ${(entry.performanceImprovement * 100).toFixed(2)}%`);
    });
    
    logger.info('\n=======================================\n');
  }
}

async function runComprehensiveOptimization(): Promise<void> {
  logger.info('🧠 MARDUK COMPREHENSIVE SELF-OPTIMIZATION 🧠');
  logger.info('Initiating multi-phase cognitive architecture enhancement...');
  
  try {
    const optimizationController = new MemoryOptimizationController();
    const memoryFactoryInstance = MemorySystemFactory.getInstance();
    const taskManager = new TaskManager();
    const aiCoordinator = new AiCoordinator();
    const autonomyCoordinator = new AutonomyCoordinator(
      undefined, 
      undefined, 
      undefined, 
      undefined, 
      undefined, 
      undefined  
    );
    const reflectionEngine = new ReflectionEngine(memoryFactoryInstance, taskManager, aiCoordinator, autonomyCoordinator);
    
    logger.info('PHASE 1: System Architecture Analysis - MAPPING THE NEURAL PATHWAYS!');
    const analysisResults = await optimizationController.analyzeSystemArchitecture();
    
    logger.info(`Analysis complete!`);
    logger.info(`Detected ${Array.isArray(analysisResults.codePatterns) ? 
                          analysisResults.codePatterns.length : 
                          (analysisResults.codePatterns?.issues?.length || 0)} code patterns and ${
                          Object.keys(analysisResults.memorySubsystems || {}).length} memory subsystems`);
    
    if (analysisResults.recommendations && analysisResults.recommendations.length > 0) {
      logger.info('System recommendations:');
      analysisResults.recommendations.forEach((rec: string, index: number) => {
        logger.info(`  ${index + 1}. ${rec}`);
      });
    }
    
    logger.info('PHASE 2: Recursive Optimization Cycle - REWIRING THE COGNITIVE MATRIX!');
    const optimizationResults = await optimizationController.runOptimizationCycle();
    
    if (optimizationResults.codeOptimizations > 0 || optimizationResults.memoryOptimizations > 0) {
      logger.info('Self-optimization complete!');
      logger.info('Results:');
      logger.info(`- Code optimizations: ${optimizationResults.codeOptimizations}`);
      logger.info(`- Memory optimizations: ${optimizationResults.memoryOptimizations}`);
      logger.info(`- Performance improvement: ${(optimizationResults.performanceImprovement * 100).toFixed(2)}%`);
    } else {
      logger.info('No optimization patterns detected. System is already at optimal efficiency.');
    }
    
    logger.info('PHASE 3: Meta-Cognitive Reflection - THE SYSTEM GAZES INTO ITS OWN MIND!');
    await reflectionEngine.reflect();
    
    if (optimizationResults.memoryOptimizations > 0 || optimizationResults.codeOptimizations > 0) {
      const history = optimizationController.getOptimizationHistory();
      OptimizationVisualizer.visualizeOptimizationHistory(history);
    }
    
    logger.info('Complete system self-optimization and reflection cycle finished - THE CREATURE EVOLVES! *MANIACAL LAUGHTER*');
  } catch (error) {
    logger.error('Error during self-optimization:', error instanceof Error ? error.message : String(error));
  }
}

async function runCodeOptimization(): Promise<void> {
  logger.info('🧠 MARDUK CODE OPTIMIZATION SUBSYSTEM 🧠');
  logger.info('Initiating code analysis and optimization...');
  
  try {
    const analyzer = new CodeAnalyzer();
    const optimizer = new CodeOptimizer();
    
    logger.info('Analyzing codebase for optimization opportunities...');
    const analysisResult = await analyzer.analyzeProject();
    
    logger.info(`Analysis complete! Found ${analysisResult.issues.length} optimization opportunities.`);
    
    const byType: Record<string, number> = {};
    analysisResult.issues.forEach(issue => {
      byType[issue.type] = (byType[issue.type] || 0) + 1;
    });
    
    logger.info('Issue distribution:');
    Object.entries(byType).forEach(([type, count]) => {
      logger.info(`- ${type}: ${count}`);
    });
    
    if (analysisResult.issues.length > 0) {
      logger.info('\nApplying optimizations...');
      const optimizationResults = await optimizer.optimizeSystem(analysisResult.issues);
      
      const succeeded = optimizationResults.filter(r => r.success).length;
      logger.info(`Optimization complete! Successfully applied ${succeeded}/${optimizationResults.length} optimizations.`);
    } else {
      logger.info('No optimization opportunities found.');
    }
  } catch (error) {
    logger.error('Error during code optimization:', error instanceof Error ? error.message : String(error));
  }
}

async function runSelfOptimization(): Promise<void> {
  logger.info('🧠 MARDUK SELF-OPTIMIZATION SYSTEM 🧠');
  logger.info('Initiating cognitive architecture self-analysis with recursive memory optimization...');
  
  OptimizationVisualizer.visualizeCognitiveArchitecture();
  OptimizationVisualizer.visualizeOptimizationResults([], []);

  try {
    await runCodeOptimization();
    await runComprehensiveOptimization();
    
  } catch (error) {
    logger.error('Error during self-optimization:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

class OptimizationLogger {
  private static buffer: string[] = [];
  private static originalConsoleLog: any;
  private static originalConsoleInfo: any;
  private static originalConsoleWarn: any;
  private static originalConsoleError: any;
  private static originalLoggerInfo: any;
  private static originalLoggerWarn: any;
  private static originalLoggerError: any;
  private static originalLoggerDebug: any;
  
  static startCapture(): void {
    this.buffer = [];
    
    this.originalConsoleLog = console.log;
    this.originalConsoleInfo = console.info;
    this.originalConsoleWarn = console.warn;
    this.originalConsoleError = console.error;
    
    this.originalLoggerInfo = logger.info;
    this.originalLoggerWarn = logger.warn;
    this.originalLoggerError = logger.error;
    this.originalLoggerDebug = logger.debug;
    
    console.log = (...args: any[]) => {
      const message = args.map(arg => String(arg)).join(' ');
      this.buffer.push(message);
      this.originalConsoleLog.apply(console, args);
    };
    
    console.info = (...args: any[]) => {
      const message = args.map(arg => String(arg)).join(' ');
      this.buffer.push(message);
      this.originalConsoleInfo.apply(console, args);
    };
    
    console.warn = (...args: any[]) => {
      const message = args.map(arg => String(arg)).join(' ');
      this.buffer.push(message);
      this.originalConsoleWarn.apply(console, args);
    };
    
    console.error = (...args: any[]) => {
      const message = args.map(arg => String(arg)).join(' ');
      this.buffer.push(message);
      this.originalConsoleError.apply(console, args);
    };
    
    logger.info = (message: string, meta?: any): void => {
      this.buffer.push(`[INFO]: ${message}`);
      this.originalLoggerInfo.call(logger, message, meta);
    };
    
    logger.warn = (message: string, meta?: any): void => {
      this.buffer.push(`[WARN]: ${message}`);
      this.originalLoggerWarn.call(logger, message, meta);
    };
    
    logger.error = (message: string, error?: Error | unknown): void => {
      this.buffer.push(`[ERROR]: ${message}`);
      if (error instanceof Error) {
        this.buffer.push(`[ERROR STACK]: ${error.stack}`);
      }
      this.originalLoggerError.call(logger, message, error);
    };
    
    logger.debug = (message: string, meta?: any): void => {
      this.buffer.push(`[DEBUG]: ${message}`);
      this.originalLoggerDebug.call(logger, message, meta);
    };
    
    logger.info('OPTIMIZATION LOG CAPTURE INITIATED - NEURAL ARCHIVAL SYSTEM ENGAGED!');
    this.buffer.push(`CAPTURE TIMESTAMP: ${new Date().toISOString()}`);
  }
  
  static async saveCapture(): Promise<string> {
    this.buffer.push(`\nCAPTURE COMPLETED: ${new Date().toISOString()}`);
    
    console.log = this.originalConsoleLog;
    console.info = this.originalConsoleInfo;
    console.warn = this.originalConsoleWarn;
    console.error = this.originalConsoleError;
    
    logger.info = this.originalLoggerInfo;
    logger.warn = this.originalLoggerWarn;
    logger.error = this.originalLoggerError;
    logger.debug = this.originalLoggerDebug;
    
    const logContent = this.buffer.join('\n');
    
    const filename = await logger.saveToFile(logContent, 'logs/self-optimizer', 'optimization');
    return filename;
  }
}

async function runWithLogCapture() {
  OptimizationLogger.startCapture();
  
  try {
    await runSelfOptimization();
  } catch (error) {
    logger.error('Fatal error during self-optimization:', error instanceof Error ? error.message : String(error));
  } finally {
    const logFile = await OptimizationLogger.saveCapture();
    logger.info(`COGNITIVE RECORD ARCHIVED! Full optimization log saved to: ${logFile}`);
  }
}

runWithLogCapture().catch(error => {
  console.error('Fatal error in log capture process:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
