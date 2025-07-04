/**
 * Agentic Grammar Types - Type definitions for distributed cognitive grammar processing
 * 
 * Defines the core types for extracting and processing agentic primitives from code
 * and mapping them to GGML tensor representations.
 */

import { Tensor, TensorShape } from '../types.js';

/**
 * Agentic primitive types that can be extracted from code
 */
export type AgenticPrimitiveType = 
  | 'action'           // Function calls, method invocations
  | 'percept'          // Data input, sensor readings  
  | 'memory'           // Data storage, state management
  | 'decision'         // Conditional logic, branching
  | 'planning'         // Loop structures, sequences
  | 'communication'    // Message passing, events
  | 'adaptation'       // Learning, parameter updates
  | 'attention'        // Focus allocation, prioritization
  | 'goal'             // Objective functions, targets
  | 'constraint';      // Limitations, boundaries

/**
 * Agentic primitive extracted from code
 */
export interface AgenticPrimitive {
  id: string;
  type: AgenticPrimitiveType;
  name: string;
  sourceLocation: {
    filePath: string;
    startLine: number;
    endLine: number;
    startColumn: number;
    endColumn: number;
  };
  parameters: {
    name: string;
    type: string;
    defaultValue?: any;
  }[];
  semanticComplexity: number;
  functionalDepth: number;
  dependencies: string[];
  metadata: Record<string, any>;
}

/**
 * Grammar token representing a semantic unit
 */
export interface GrammarToken {
  id: string;
  type: 'symbolic' | 'subsymbolic';
  content: string | number[];
  semanticWeight: number;
  syntacticRole: string;
  tensorMapping?: {
    shape: TensorShape;
    encoding: 'dense' | 'sparse' | 'factorized';
  };
}

/**
 * GGML kernel representing a distributed cognitive function
 */
export interface GgmlKernel {
  id: string;
  name: string;
  agenticFunction: AgenticPrimitive;
  tensorShape: TensorShape;
  primeFactorization: number[];
  grammarTokens: GrammarToken[];
  kernelCode: string;
  inputPorts: KernelPort[];
  outputPorts: KernelPort[];
  metadata: {
    complexity: number;
    resourceCost: number;
    activationLevel: number;
    usageFrequency: number;
    lastUsed: number;
  };
}

/**
 * Input/output port for kernel communication
 */
export interface KernelPort {
  id: string;
  name: string;
  type: 'input' | 'output';
  tensorShape: TensorShape;
  dataType: 'f32' | 'f16' | 'i32';
  semanticTag: string;
}

/**
 * Kernel registry entry
 */
export interface KernelRegistryEntry {
  kernel: GgmlKernel;
  registrationTime: number;
  category: string;
  tags: string[];
  version: string;
  dependencies: string[];
  performance: {
    averageExecutionTime: number;
    memoryUsage: number;
    errorRate: number;
  };
}

/**
 * Distributed tensor message for kernel communication
 */
export interface TensorMessage {
  id: string;
  sourceKernelId: string;
  targetKernelId: string;
  sourcePort: string;
  targetPort: string;
  tensor: Tensor;
  routingInfo: {
    priority: number;
    ttl: number;
    path: string[];
  };
  timestamp: number;
}

/**
 * Cognitive kernel cluster for distributed processing
 */
export interface KernelCluster {
  id: string;
  name: string;
  kernels: string[];
  coordinator: string;
  loadBalancer: {
    strategy: 'round-robin' | 'least-loaded' | 'complexity-based';
    currentLoad: number;
    maxCapacity: number;
  };
  resilience: {
    replicationFactor: number;
    failoverStrategy: 'hot-standby' | 'cold-standby' | 'restart';
    healthChecks: boolean;
  };
}

/**
 * Attention allocation for distributed kernels
 */
export interface DistributedAttentionState {
  totalResources: number;
  allocatedResources: number;
  kernelAllocations: Map<string, number>;
  priorityQueue: {
    kernelId: string;
    priority: number;
    resourceDemand: number;
  }[];
  decayRate: number;
  adaptationRate: number;
}

/**
 * Configuration for agentic grammar processing
 */
export interface AgenticGrammarConfig {
  extraction: {
    sourceDirectories: string[];
    fileExtensions: string[];
    excludePatterns: string[];
    maxFileSize: number;
  };
  tensorization: {
    defaultPrecision: 'f32' | 'f16' | 'i32';
    maxTensorDimensions: number;
    sparsityThreshold: number;
    compressionEnabled: boolean;
  };
  distribution: {
    maxKernelsPerCluster: number;
    replicationFactor: number;
    loadBalancingStrategy: 'round-robin' | 'least-loaded' | 'complexity-based';
    messagingProtocol: 'tcp' | 'udp' | 'websocket';
  };
  primeFactorization: {
    maxFactors: number;
    preferredBases: number[];
    factorizationStrategy: 'greedy' | 'optimal' | 'heuristic';
  };
}