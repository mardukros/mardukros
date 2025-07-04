/**
 * Agentic Grammar Module - Exports for distributed GGML tensor network
 */

// Core system
export { DistributedAgenticGrammarSystem, createDefaultAgenticGrammarConfig } from './distributed-system.js';

// Grammar extraction
export { AgenticGrammarExtractor } from './extractor.js';

// Kernel management
export { CognitiveKernelRegistry } from './kernel-registry.js';

// Distributed orchestration
export { DistributedOrchestrationMesh } from './orchestration-mesh.js';

// Types
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
} from './types.js';