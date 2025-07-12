/**
 * Grammar Evolution Module - MOSES-style evolutionary pipelines for grammar modules
 * 
 * Implements meta-optimizing evolutionary algorithms specifically for agentic grammar
 * evolution, providing fitness metrics, mutation strategies, and transparency.
 */

export { GrammarEvolutionEngine } from './evolution-engine.js';
export { GrammarFitnessEvaluator } from './fitness-evaluator.js';
export { MOSESPipeline } from './moses-pipeline.js';
export { EvolutionaryResultsReporter } from './results-reporter.js';

export type {
  GrammarFitnessMetrics,
  GrammarEvolutionParams,
  GrammarGenome,
  EvolutionStats,
  MOSESConfig,
  EvolutionaryResult
} from './types.js';