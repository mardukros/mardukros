/**
 * Multi-Kernel Synergy Tests Export Module
 * 
 * Provides access to all synergy testing components including frameworks,
 * workflows, visualizations, and test runners.
 */

export { SynergyTestFramework } from './synergy-test-framework.js';
export { 
  ComplexReasoningWorkflow, 
  AdaptiveLearningWorkflow, 
  AttentionMemoryFusionWorkflow, 
  ErrorRecoveryWorkflow,
  CognitiveWorkflow 
} from './cognitive-workflows.js';
export { 
  ScenarioVisualizer, 
  CoverageReporter, 
  VisualizationData, 
  CoverageReport 
} from './visualization-reporter.js';
export { 
  SynergyTestRunner, 
  TestRunConfiguration, 
  TestRunResult 
} from './synergy-test-runner.js';

// Re-export main test file for Jest
export * from './multi-kernel-workflows.test.js';