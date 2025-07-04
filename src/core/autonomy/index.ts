
// Export base components from analysis, optimization, and metrics
export * from './analysis/pattern-analyzer.js';
export * from './analysis/memory-pattern-analyzer.js';
export * from './optimization/performance-optimizer.js';
export * from './optimization/memory-optimizer.js';
export * from './optimization/pattern-optimizer.js';
export * from './optimization/optimization-result.js';
export * from './metrics/optimization-metrics.js';
export * from './coordinator.js';

// Import core components
import { AdaptiveMemoryOptimizer } from '../memory/optimization/adaptive-memory-optimizer.js';
import { ReflectionEngine } from './meta-cognition/reflection-engine.js';
import { KnowledgeGraphGenerator } from '../memory/visualization/knowledge-graph.js';
import { TemporalRecursionEngine } from '../task/temporal-recursion-engine.js';
import { CognitiveApi } from '../interfaces/cognitive-api.js';
import { CodeAnalyzer } from './code-analyzer.js';
import { CodeOptimizer } from './code-optimizer.js';
import { SelfRewriter } from './self-rewriter.js';
import { MemoryOptimizationController } from './memory-optimization-controller.js';

// Export component types without duplication
export {
  AdaptiveMemoryOptimizer,
  ReflectionEngine,
  KnowledgeGraphGenerator,
  TemporalRecursionEngine,
  CognitiveApi,
  CodeAnalyzer,
  CodeOptimizer,
  SelfRewriter,
  MemoryOptimizationController
};
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

// Create and export singleton instances
export const memoryOptimizer = new AdaptiveMemoryOptimizer();
import { createReflectionEngine } from './meta-cognition/index.js';
// Consider extracting this duplicated code into a shared function

export const reflectionEngine = createReflectionEngine();
export const knowledgeGraph = new KnowledgeGraphGenerator();
export const recursionEngine = new TemporalRecursionEngine();
export const cognitiveApi = new CognitiveApi();
