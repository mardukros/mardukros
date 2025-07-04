/**
 * mad9ml Types - Core type definitions for ggml-based cognitive encoding
 * 
 * Defines tensor shapes, hypergraph structures, and cognitive primitives
 * for encoding the Marduk persona and its evolution.
 */

export type TensorShape = number[];
export type TensorData = Float32Array | number[];

/**
 * Core tensor interface for ggml-style operations
 */
export interface Tensor {
  readonly shape: TensorShape;
  readonly data: TensorData;
  readonly type: 'f32' | 'f16' | 'i32';
  readonly size: number;
}

/**
 * Hypergraph node representing cognitive elements
 */
export interface CognitiveNode {
  id: string;
  type: 'concept' | 'memory' | 'pattern' | 'goal' | 'action' | 'context';
  state: Tensor;
  metadata: Record<string, any>;
}

/**
 * Hypergraph edge representing relationships between cognitive elements
 */
export interface CognitiveEdge {
  id: string;
  type: 'semantic' | 'temporal' | 'causal' | 'hierarchical' | 'associative' | 'meta';
  source: string;
  target: string;
  weight: number;
  properties: Record<string, any>;
}

/**
 * Hypergraph structure for cognitive relationships
 */
export interface CognitiveHypergraph {
  nodes: Map<string, CognitiveNode>;
  edges: Map<string, CognitiveEdge>;
  clusters: Map<string, string[]>; // cluster_id -> node_ids
}

/**
 * Memory tensor encoding different types of cognitive memory
 */
export interface MemoryTensor {
  episodic: Tensor;    // [episodes, context, salience]
  semantic: Tensor;    // [concepts, features, confidence]
  procedural: Tensor;  // [skills, steps, mastery]
  working: Tensor;     // [active_items, attention, decay]
}

/**
 * Task allocation and attention distribution
 */
export interface TaskTensor {
  active: Tensor;      // [active_tasks, dependencies, priority]
  queue: Tensor;       // [queued_tasks, urgency, resources]
  attention: Tensor;   // [focus_weights, allocation, dynamics]
}

/**
 * Persona encoding with evolutionary parameters
 */
export interface PersonaTensor {
  traits: Tensor;           // [personality_traits, strengths, preferences]
  parameters: Tensor;       // [cognitive_params, adaptation_rates, thresholds]
  mutationCoeffs: Tensor;   // [mutation_rates, drift_factors, constraints]
}

/**
 * Meta-cognitive state for self-reflection and adaptation
 */
export interface MetaCognitiveTensor {
  selfEval: Tensor;     // [performance_metrics, satisfaction, goals_met]
  adjustment: Tensor;   // [parameter_deltas, strategy_changes, adaptations]
  history: Tensor;      // [past_states, evolution_trace, learned_patterns]
}

/**
 * Complete cognitive state encoding
 */
export interface CognitiveState {
  memory: MemoryTensor;
  task: TaskTensor;
  persona: PersonaTensor;
  metaCognitive: MetaCognitiveTensor;
  hypergraph: CognitiveHypergraph;
  timestamp: number;
}

/**
 * Evolutionary mutation parameters for persona drift
 */
export interface EvolutionParams {
  mutationRate: number;
  driftFactor: number;
  fitnessThreshold: number;
  adaptationSpeed: number;
  constraints: {
    minValue: number;
    maxValue: number;
    preserveCore: boolean;
  };
}

/**
 * ECAN-style attention allocation parameters
 */
export interface AttentionParams {
  totalResources: number;
  decayRate: number;
  spreadingFactor: number;
  thresholds: {
    activation: number;
    selection: number;
    forgetting: number;
  };
}

/**
 * Configuration for mad9ml cognitive system
 */
export interface Mad9mlConfig {
  tensorPrecision: 'f32' | 'f16';
  memoryCapacity: number;
  evolutionParams: EvolutionParams;
  attentionParams: AttentionParams;
  enableMetaCognition: boolean;
  debugMode: boolean;
}