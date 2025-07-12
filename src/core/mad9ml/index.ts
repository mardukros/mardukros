/**
 * Mad9ml Index - Main exports for the ggml-based cognitive encoding system
 */

// Core system
export { Mad9mlSystem } from './mad9ml-core.js';

// Types
export type {
  Tensor,
  TensorShape,
  TensorData,
  CognitiveNode,
  CognitiveEdge,
  CognitiveHypergraph,
  MemoryTensor,
  TaskTensor,
  PersonaTensor,
  MetaCognitiveTensor,
  CognitiveState,
  EvolutionParams,
  AttentionParams,
  Mad9mlConfig
} from './types.js';

// Tensor operations
export {
  makeTensor,
  randomTensor,
  zeroTensor,
  onesTensor,
  addTensors,
  multiplyTensors,
  scaleTensor,
  matmul,
  softmax,
  relu,
  tanh,
  reshape,
  norm,
  normalize,
  cosineSimilarity,
  cloneTensor
} from './tensor/operations.js';

// Hypergraph
export { CognitiveHypergraphImpl } from './hypergraph/cognitive-hypergraph.js';

// Persona evolution
export { PersonaEvolution } from './persona/evolution.js';

// Attention allocation
export { ECANAttentionAllocator } from './attention/ecan-allocator.js';

// Meta-cognitive engine
export { MetaCognitiveEngine } from './meta-cognitive/reflection-engine.js';
export type { ReflectionResult, SelfModification } from './meta-cognitive/reflection-engine.js';

// Agentic Grammar System
export { 
  DistributedAgenticGrammarSystem, 
  createDefaultAgenticGrammarConfig,
  AgenticGrammarExtractor,
  CognitiveKernelRegistry,
  DistributedOrchestrationMesh
} from './agentic-grammar/index.js';
export type {
  AgenticPrimitiveType,
  AgenticPrimitive,
  GrammarToken,
  GgmlKernel,
  KernelPort,
  KernelRegistryEntry,
  TensorMessage,
  KernelCluster,
  DistributedAttentionState,
  AgenticGrammarConfig
} from './agentic-grammar/index.js';

/**
 * Creates a default Mad9ml configuration
 */
export function createDefaultConfig() {
  return {
    tensorPrecision: 'f32',
    memoryCapacity: 1000,
    evolutionParams: {
      mutationRate: 0.05,
      driftFactor: 0.01,
      fitnessThreshold: 0.7,
      adaptationSpeed: 0.1,
      constraints: {
        minValue: -2.0,
        maxValue: 2.0,
        preserveCore: true
      }
    },
    attentionParams: {
      totalResources: 100.0,
      decayRate: 0.05,
      spreadingFactor: 0.8,
      thresholds: {
        activation: 0.1,
        selection: 0.3,
        forgetting: 0.05
      }
    },
    enableMetaCognition: true,
    debugMode: false
  };
}

/**
 * Creates and initializes a Mad9ml system with default configuration
 */
export async function createMad9mlSystem(config?: Partial<any>) {
  const fullConfig = { ...createDefaultConfig(), ...config };
  const system = new Mad9mlSystem(fullConfig);
  await system.initialize();
  return system;
}

// Export hypergraph grammar engine components
export { 
  HypergraphGrammarEngine,
  createDefaultHypergraphGrammarConfig,
  type HypergraphPattern,
  type PatternTransformation,
  type PatternMatchResult,
  type AnalysisMetrics
} from './hypergraph-grammar-engine';

export { runHypergraphGrammarDemo } from './hypergraph-grammar-demo';