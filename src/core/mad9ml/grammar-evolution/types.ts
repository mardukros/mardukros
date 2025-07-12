/**
 * Grammar Evolution Types - Type definitions for MOSES-style grammar evolution
 */

import { Tensor, TensorShape } from '../types.js';
import { AgenticPrimitive, AgenticPrimitiveType } from '../agentic-grammar/types.js';

/**
 * Grammar genome representing evolving grammar structure
 */
export interface GrammarGenome {
  id: string;
  primitives: AgenticPrimitive[];
  structure: {
    nodes: GrammarNode[];
    edges: GrammarEdge[];
    patterns: GrammarPattern[];
  };
  parameters: GrammarParameters;
  fitness: number;
  generation: number;
  lineage: string[];
}

/**
 * Grammar node in the evolved structure
 */
export interface GrammarNode {
  id: string;
  type: AgenticPrimitiveType;
  activation: Tensor;
  complexity: number;
  connections: string[];
}

/**
 * Grammar edge connecting nodes
 */
export interface GrammarEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  type: 'semantic' | 'syntactic' | 'causal' | 'temporal';
}

/**
 * Grammar pattern for recursive structures
 */
export interface GrammarPattern {
  id: string;
  name: string;
  nodes: string[];
  recursionDepth: number;
  applicability: number;
}

/**
 * Parameters controlling grammar behavior
 */
export interface GrammarParameters {
  complexity: Tensor;        // [complexity_weights, depth_limits, branching_factors]
  expressiveness: Tensor;    // [semantic_richness, syntactic_flexibility, compositionality]
  efficiency: Tensor;        // [computation_cost, memory_usage, latency]
  adaptability: Tensor;      // [learning_rates, plasticity, robustness]
}

/**
 * Fitness metrics for grammar evaluation
 */
export interface GrammarFitnessMetrics {
  performance: {
    accuracy: number;          // How well it parses intended constructs
    completeness: number;      // Coverage of target language features
    precision: number;         // Accuracy of semantic interpretation
    efficiency: number;        // Computational efficiency
  };
  complexity: {
    structural: number;        // Complexity of grammar structure
    parametric: number;        // Number of parameters
    computational: number;     // Runtime complexity
  };
  expressiveness: {
    semantic: number;          // Semantic richness
    syntactic: number;         // Syntactic flexibility
    compositional: number;     // Ability to compose patterns
  };
  adaptability: {
    plasticity: number;        // Ability to learn new patterns
    robustness: number;        // Resistance to perturbations
    generalization: number;    // Transfer to new domains
  };
  emergent: {
    novelty: number;           // Novel patterns discovered
    creativity: number;        // Creative combination ability
    insight: number;           // Meta-cognitive insights generated
  };
}

/**
 * Evolution parameters for MOSES algorithm
 */
export interface GrammarEvolutionParams {
  population: {
    size: number;
    eliteRatio: number;
    diversityThreshold: number;
  };
  mutation: {
    structuralRate: number;    // Rate of structural mutations
    parametricRate: number;    // Rate of parameter mutations
    adaptiveScaling: boolean;  // Whether to adapt mutation rates
  };
  crossover: {
    rate: number;
    method: 'uniform' | 'single_point' | 'multi_point' | 'semantic';
  };
  selection: {
    method: 'tournament' | 'roulette' | 'rank' | 'pareto';
    pressure: number;
    paretoFronts: boolean;     // Multi-objective optimization
  };
  termination: {
    maxGenerations: number;
    fitnessThreshold: number;
    stagnationLimit: number;
    timeLimit: number;         // milliseconds
  };
  constraints: {
    maxComplexity: number;
    maxNodes: number;
    maxDepth: number;
    minPerformance: number;
  };
}

/**
 * MOSES configuration
 */
export interface MOSESConfig {
  objective: 'single' | 'multi';
  metaOptimization: boolean;
  transparency: {
    logLevel: 'minimal' | 'normal' | 'verbose' | 'debug';
    trackLineage: boolean;
    saveIntermediates: boolean;
    reportInterval: number;    // generations
  };
  parallelization: {
    enabled: boolean;
    workerCount: number;
    chunkSize: number;
  };
  memoryManagement: {
    archiveSize: number;       // Number of best genomes to keep
    compressionThreshold: number;
    garbageCollectionInterval: number;
  };
}

/**
 * Evolution statistics
 */
export interface EvolutionStats {
  generation: number;
  population: {
    size: number;
    diversity: number;
    averageFitness: number;
    bestFitness: number;
    worstFitness: number;
  };
  convergence: {
    rate: number;
    stagnationCount: number;
    fitnessVariance: number;
  };
  mutation: {
    currentRate: number;
    effectiveRate: number;     // Mutations that improved fitness
    adaptationHistory: number[];
  };
  performance: {
    generationsPerSecond: number;
    evaluationsPerSecond: number;
    memoryUsage: number;
    cpuUsage: number;
  };
  insights: {
    emergedPatterns: string[];
    dominantStrategies: string[];
    unexpectedBehaviors: string[];
  };
}

/**
 * Evolutionary result container
 */
export interface EvolutionaryResult {
  bestGenome: GrammarGenome;
  paretoFront?: GrammarGenome[];
  finalStats: EvolutionStats;
  convergenceHistory: EvolutionStats[];
  insights: {
    summary: string;
    discoveries: string[];
    recommendations: string[];
    futureDirections: string[];
  };
  artifacts: {
    finalPopulation: GrammarGenome[];
    lineageTree: Record<string, string[]>;
    mutationEffectiveness: Record<string, number>;
    fitnessLandscape: number[][];
  };
}

/**
 * Grammar mutation operation
 */
export interface GrammarMutation {
  type: 'structural' | 'parametric' | 'pattern' | 'hybrid';
  operation: string;
  parameters: Record<string, any>;
  probability: number;
  effectiveness: number;
}

/**
 * Grammar crossover operation
 */
export interface GrammarCrossover {
  method: 'semantic' | 'structural' | 'parametric' | 'pattern';
  parentA: string;
  parentB: string;
  offspring: string[];
  novelty: number;
}