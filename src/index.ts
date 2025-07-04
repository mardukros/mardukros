import { loadEnv } from './config/env.js';
import { logger } from './core/utils/logger.js';
import { MardukCore } from './core/marduk-core.js';
import { MemorySystemFactory } from './core/memory/memory-factory.js';
import { AiCoordinator } from './core/ai/ai-coordinator.js';
import { healthMonitor } from './core/monitoring/health-monitor.js';
import { metricsCollector } from './core/monitoring/metrics-collector.js';

// Import new advanced features
import { 
  memoryOptimizer, 
  reflectionEngine, 
  knowledgeGraph, 
  recursionEngine,
  cognitiveApi
} from './core/autonomy/index.js';
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

// Load environment variables
loadEnv();
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

// Initialize core components
const memoryFactory = MemorySystemFactory.getInstance();
const aiCoordinator = new AiCoordinator();
const mardukCore = new MardukCore();

// Set up error handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

// Export core components
export {
  mardukCore,
  memoryFactory,
  aiCoordinator,
  healthMonitor,
  metricsCollector,
  logger,
  // Export new advanced features
  memoryOptimizer,
  reflectionEngine,
  knowledgeGraph,
  recursionEngine,
  cognitiveApi
};

// Export type definitions
export * from './core/types/index.js';
export * from './core/memory/types/index.js';
export * from './core/ai/types/index.js';
export * from './core/monitoring/types.js';
export * from './core/autonomy/index.js';