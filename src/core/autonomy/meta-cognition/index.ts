import { ReflectionEngine } from './reflection-engine.js';
import { logger } from '../../utils/logger.js';
import { MemorySystemFactory } from '../../memory/memory-factory.js';
import { TaskManager } from '../../task/task-manager.js';
import { AiCoordinator } from '../../ai/ai-coordinator.js';
import { AutonomyCoordinator } from '../coordinator.js';

export { ReflectionEngine };

// Factory method to create a properly initialized reflection engine
export function createReflectionEngine() {
  // Create mock instances of required dependencies
  const memoryFactory = MemorySystemFactory.getInstance();
  const taskManager = new TaskManager();
  const aiCoordinator = new AiCoordinator();

  // Create a minimal mock for AutonomyCoordinator if needed
  const autonomyCoordinator = {
    getSystemHealth: () => ({
      selfImprovementActive: true,
      improvementsCount: 17,
      lastImprovementTimestamp: new Date().toISOString()
    })
  } as unknown as AutonomyCoordinator;
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

  return new ReflectionEngine(memoryFactory, taskManager, aiCoordinator, autonomyCoordinator);
}
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

// Allow direct execution for testing
const isMainModule = import.meta.url.endsWith(process.argv[1].replace('file://', ''));
if (isMainModule) {
  logger.info('Running ReflectionEngine directly for testing');

  const reflectionEngine = createReflectionEngine();
  reflectionEngine.reflect()
    .then(() => {
      logger.info('Reflection cycle completed successfully');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Error during reflection cycle:', error);
      process.exit(1);
    });
}

export * from './system-orchestrator.js';
export * from './visualization-engine.js';
export * from './types.js';

import { SystemOrchestrator } from './system-orchestrator.js';
import { VisualizationEngine } from './visualization-engine.js';


export { 
  SystemOrchestrator,
  VisualizationEngine
};