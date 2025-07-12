/**
 * AtomSpace Adapter for Kernel State
 * 
 * Maps Marduk kernel states (CognitiveNode, CognitiveEdge, Tensors) to OpenCog 
 * AtomSpace format, enabling seamless integration with PLN reasoning.
 */

import { CognitiveNode, CognitiveEdge, CognitiveHypergraph, CognitiveState, Tensor } from '../mad9ml/types.js';
import { AttentionValue } from '../attention/ecan-attention-kernel.js';

/**
 * OpenCog Atom types mapping to cognitive elements
 */
export type AtomType = 
  | 'ConceptNode' 
  | 'PredicateNode' 
  | 'NumberNode'
  | 'InheritanceLink'
  | 'SimilarityLink' 
  | 'EvaluationLink'
  | 'ImplicationLink'
  | 'AndLink'
  | 'OrLink'
  | 'NotLink'
  | 'ListLink'
  | 'ExecutionLink';

/**
 * Truth Value for probabilistic reasoning
 */
export interface TruthValue {
  /** Strength/probability [0,1] */
  strength: number;
  /** Confidence in the strength [0,1] */
  confidence: number;
  /** Count of evidence supporting this truth value */
  count?: number;
}

/**
 * Attention Value for ECAN integration
 */
export interface AtomAttentionValue {
  /** Short-term importance */
  sti: number;
  /** Long-term importance */
  lti: number;
  /** Very long-term importance */
  vlti: number;
}

/**
 * OpenCog Atom representation
 */
export interface Atom {
  /** Unique identifier */
  id: string;
  /** OpenCog atom type */
  type: AtomType;
  /** Atom name/label */
  name: string;
  /** Truth value for probabilistic reasoning */
  truthValue: TruthValue;
  /** Attention value for ECAN */
  attentionValue: AtomAttentionValue;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** Source kernel information */
  source: {
    kernelId: string;
    nodeId?: string;
    edgeId?: string;
    tensorComponent?: string;
  };
}

/**
 * OpenCog Link representation (connects atoms)
 */
export interface Link extends Atom {
  /** Outgoing atoms this link connects */
  outgoing: string[]; // atom IDs
  /** Incoming atoms that connect to this link */
  incoming?: string[]; // atom IDs
}

/**
 * AtomSpace container for atoms and links
 */
export interface AtomSpace {
  /** All atoms indexed by ID */
  atoms: Map<string, Atom>;
  /** All links indexed by ID */
  links: Map<string, Link>;
  /** Type index for efficient queries */
  typeIndex: Map<AtomType, Set<string>>;
  /** Name index for lookup by name */
  nameIndex: Map<string, Set<string>>;
  /** Attention index for ECAN queries */
  attentionIndex: Map<string, number>; // atom_id -> total_attention
}

/**
 * Conversion statistics and metadata
 */
export interface ConversionResult {
  /** Number of nodes converted */
  nodesConverted: number;
  /** Number of edges converted */
  edgesConverted: number;
  /** Number of atoms created */
  atomsCreated: number;
  /** Number of links created */
  linksCreated: number;
  /** Conversion duration in milliseconds */
  duration: number;
  /** Any errors encountered */
  errors: string[];
  /** Warnings during conversion */
  warnings: string[];
}

/**
 * AtomSpace Adapter for converting kernel state to OpenCog format
 */
export class AtomSpaceAdapter {
  private atomSpace: AtomSpace;
  private idCounter: number = 0;

  constructor() {
    this.atomSpace = {
      atoms: new Map(),
      links: new Map(),
      typeIndex: new Map(),
      nameIndex: new Map(),
      attentionIndex: new Map()
    };
  }

  /**
   * Convert a complete cognitive state to AtomSpace
   */
  public convertCognitiveState(state: CognitiveState): ConversionResult {
    const startTime = Date.now();
    const result: ConversionResult = {
      nodesConverted: 0,
      edgesConverted: 0,
      atomsCreated: 0,
      linksCreated: 0,
      duration: 0,
      errors: [],
      warnings: []
    };

    try {
      // Convert hypergraph nodes and edges
      if (state.hypergraph) {
        this.convertHypergraph(state.hypergraph, result);
      }

      // Convert memory tensors
      this.convertMemoryTensors(state.memory, result);

      // Convert task tensors
      this.convertTaskTensors(state.task, result);

      // Convert persona tensors
      this.convertPersonaTensors(state.persona, result);

      // Convert meta-cognitive tensors
      this.convertMetaCognitiveTensors(state.metaCognitive, result);

      result.duration = Date.now() - startTime;
    } catch (error) {
      result.errors.push(`Conversion error: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  /**
   * Convert hypergraph structure to AtomSpace
   */
  private convertHypergraph(hypergraph: CognitiveHypergraph, result: ConversionResult): void {
    // Convert nodes to atoms
    hypergraph.nodes.forEach((node, nodeId) => {
      try {
        const atom = this.convertNodeToAtom(node);
        this.addAtom(atom);
        result.nodesConverted++;
        result.atomsCreated++;
      } catch (error) {
        result.errors.push(`Node conversion error for ${nodeId}: ${error}`);
      }
    });

    // Convert edges to links
    hypergraph.edges.forEach((edge, edgeId) => {
      try {
        const link = this.convertEdgeToLink(edge);
        this.addLink(link);
        result.edgesConverted++;
        result.linksCreated++;
      } catch (error) {
        result.errors.push(`Edge conversion error for ${edgeId}: ${error}`);
      }
    });

    // Convert clusters to hierarchical links
    hypergraph.clusters.forEach((nodeIds, clusterId) => {
      try {
        const clusterLink = this.createClusterLink(clusterId, nodeIds);
        this.addLink(clusterLink);
        result.linksCreated++;
      } catch (error) {
        result.warnings.push(`Cluster conversion warning for ${clusterId}: ${error}`);
      }
    });
  }

  /**
   * Convert CognitiveNode to Atom
   */
  private convertNodeToAtom(node: CognitiveNode): Atom {
    const atomType = this.mapNodeTypeToAtomType(node.type);
    const truthValue = this.extractTruthValue(node);
    const attentionValue = this.extractAttentionValue(node);

    return {
      id: this.generateId(),
      type: atomType,
      name: node.id,
      truthValue,
      attentionValue,
      metadata: {
        ...node.metadata,
        originalType: node.type,
        tensorShape: node.state.shape,
        tensorSize: node.state.size
      },
      source: {
        kernelId: 'hypergraph',
        nodeId: node.id
      }
    };
  }

  /**
   * Convert CognitiveEdge to Link
   */
  private convertEdgeToLink(edge: CognitiveEdge): Link {
    const linkType = this.mapEdgeTypeToLinkType(edge.type);
    const truthValue = this.extractTruthValueFromEdge(edge);
    const attentionValue = this.createAttentionValueFromWeight(edge.weight);

    return {
      id: this.generateId(),
      type: linkType,
      name: `${edge.type}_${edge.source}_${edge.target}`,
      truthValue,
      attentionValue,
      metadata: {
        ...edge.properties,
        originalType: edge.type,
        weight: edge.weight
      },
      source: {
        kernelId: 'hypergraph',
        edgeId: edge.id
      },
      outgoing: [edge.source, edge.target]
    };
  }

  /**
   * Convert memory tensors to concept nodes and relationships
   */
  private convertMemoryTensors(memory: any, result: ConversionResult): void {
    // Convert semantic memory concepts
    if (memory.semantic) {
      this.convertSemanticTensor(memory.semantic, result);
    }

    // Convert episodic memory events
    if (memory.episodic) {
      this.convertEpisodicTensor(memory.episodic, result);
    }

    // Convert procedural memory skills
    if (memory.procedural) {
      this.convertProceduralTensor(memory.procedural, result);
    }

    // Convert working memory items
    if (memory.working) {
      this.convertWorkingTensor(memory.working, result);
    }
  }

  /**
   * Convert semantic tensor to concept nodes and similarity links
   */
  private convertSemanticTensor(tensor: Tensor, result: ConversionResult): void {
    const conceptCount = tensor.shape[0];
    const featureCount = tensor.shape[1];
    const confidenceChannel = tensor.shape[2] > 2 ? 2 : 0;

    for (let i = 0; i < Math.min(conceptCount, 1000); i++) { // Limit to prevent memory issues
      try {
        const concept = this.createConceptFromTensor(tensor, i, featureCount, confidenceChannel);
        this.addAtom(concept);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`Semantic concept ${i} conversion warning: ${error}`);
      }
    }
  }

  /**
   * Convert episodic tensor to event nodes and temporal links
   */
  private convertEpisodicTensor(tensor: Tensor, result: ConversionResult): void {
    const episodeCount = tensor.shape[0];
    const contextDim = tensor.shape[1];
    const salienceChannel = tensor.shape[2] > 2 ? 2 : 0;

    for (let i = 0; i < Math.min(episodeCount, 500); i++) {
      try {
        const episode = this.createEpisodeFromTensor(tensor, i, contextDim, salienceChannel);
        this.addAtom(episode);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`Episode ${i} conversion warning: ${error}`);
      }
    }
  }

  /**
   * Convert procedural tensor to skill nodes and execution links
   */
  private convertProceduralTensor(tensor: Tensor, result: ConversionResult): void {
    const skillCount = tensor.shape[0];
    const stepCount = tensor.shape[1];
    const masteryChannel = tensor.shape[2] > 2 ? 2 : 0;

    for (let i = 0; i < Math.min(skillCount, 300); i++) {
      try {
        const skill = this.createSkillFromTensor(tensor, i, stepCount, masteryChannel);
        this.addAtom(skill);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`Skill ${i} conversion warning: ${error}`);
      }
    }
  }

  /**
   * Convert working memory tensor to temporary concept nodes
   */
  private convertWorkingTensor(tensor: Tensor, result: ConversionResult): void {
    const itemCount = tensor.shape[0];
    const attentionDim = tensor.shape[1];
    const decayChannel = tensor.shape[2] > 2 ? 2 : 0;

    for (let i = 0; i < Math.min(itemCount, 100); i++) {
      try {
        const workingItem = this.createWorkingItemFromTensor(tensor, i, attentionDim, decayChannel);
        this.addAtom(workingItem);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`Working memory item ${i} conversion warning: ${error}`);
      }
    }
  }

  /**
   * Convert task tensors to goal nodes and execution links
   */
  private convertTaskTensors(task: any, result: ConversionResult): void {
    if (task.active) {
      this.convertActiveTaskTensor(task.active, result);
    }
    if (task.queue) {
      this.convertQueuedTaskTensor(task.queue, result);
    }
    if (task.attention) {
      this.convertAttentionTensor(task.attention, result);
    }
  }

  /**
   * Convert active task tensor to execution atoms
   */
  private convertActiveTaskTensor(tensor: Tensor, result: ConversionResult): void {
    const taskCount = tensor.shape[0];
    const dependencyDim = tensor.shape[1];
    const priorityChannel = tensor.shape[2] > 2 ? 2 : 0;

    for (let i = 0; i < Math.min(taskCount, 50); i++) {
      try {
        const task = this.createTaskFromTensor(tensor, i, dependencyDim, priorityChannel, 'active');
        this.addAtom(task);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`Active task ${i} conversion warning: ${error}`);
      }
    }
  }

  /**
   * Convert queued task tensor to planning atoms
   */
  private convertQueuedTaskTensor(tensor: Tensor, result: ConversionResult): void {
    const taskCount = tensor.shape[0];
    const urgencyDim = tensor.shape[1];
    const resourceChannel = tensor.shape[2] > 2 ? 2 : 0;

    for (let i = 0; i < Math.min(taskCount, 100); i++) {
      try {
        const task = this.createTaskFromTensor(tensor, i, urgencyDim, resourceChannel, 'queued');
        this.addAtom(task);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`Queued task ${i} conversion warning: ${error}`);
      }
    }
  }

  /**
   * Convert attention tensor to attention allocation atoms
   */
  private convertAttentionTensor(tensor: Tensor, result: ConversionResult): void {
    const focusCount = tensor.shape[0];
    const allocationDim = tensor.shape[1];
    const dynamicsChannel = tensor.shape[2] > 2 ? 2 : 0;

    for (let i = 0; i < Math.min(focusCount, 20); i++) {
      try {
        const attention = this.createAttentionFromTensor(tensor, i, allocationDim, dynamicsChannel);
        this.addAtom(attention);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`Attention focus ${i} conversion warning: ${error}`);
      }
    }
  }

  /**
   * Convert persona tensors to personality and adaptation atoms
   */
  private convertPersonaTensors(persona: any, result: ConversionResult): void {
    if (persona.traits) {
      this.convertTraitsTensor(persona.traits, result);
    }
    if (persona.parameters) {
      this.convertParametersTensor(persona.parameters, result);
    }
    if (persona.mutationCoeffs) {
      this.convertMutationTensor(persona.mutationCoeffs, result);
    }
  }

  /**
   * Convert meta-cognitive tensors to self-reflection atoms
   */
  private convertMetaCognitiveTensors(metaCognitive: any, result: ConversionResult): void {
    if (metaCognitive.selfEval) {
      this.convertSelfEvalTensor(metaCognitive.selfEval, result);
    }
    if (metaCognitive.adjustment) {
      this.convertAdjustmentTensor(metaCognitive.adjustment, result);
    }
    if (metaCognitive.history) {
      this.convertHistoryTensor(metaCognitive.history, result);
    }
  }

  // Helper methods for tensor-to-atom conversion

  private createConceptFromTensor(tensor: Tensor, index: number, featureCount: number, confidenceChannel: number): Atom {
    const data = tensor.data as Float32Array;
    const baseIdx = index * featureCount * tensor.shape[2];
    
    const confidence = confidenceChannel > 0 ? data[baseIdx + confidenceChannel] : 0.8;
    const strength = data[baseIdx] || 0.5;

    return {
      id: this.generateId(),
      type: 'ConceptNode',
      name: `semantic_concept_${index}`,
      truthValue: { strength, confidence },
      attentionValue: { sti: 0.1, lti: 0.1, vlti: 0.1 },
      metadata: {
        tensorIndex: index,
        featureCount,
        originalData: Array.from(data.slice(baseIdx, baseIdx + featureCount))
      },
      source: {
        kernelId: 'semantic_memory',
        tensorComponent: 'concepts'
      }
    };
  }

  private createEpisodeFromTensor(tensor: Tensor, index: number, contextDim: number, salienceChannel: number): Atom {
    const data = tensor.data as Float32Array;
    const baseIdx = index * contextDim * tensor.shape[2];
    
    const salience = salienceChannel > 0 ? data[baseIdx + salienceChannel] : 0.6;
    const strength = Math.min(1.0, salience);

    return {
      id: this.generateId(),
      type: 'ConceptNode',
      name: `episode_${index}`,
      truthValue: { strength, confidence: 0.7 },
      attentionValue: { sti: salience, lti: 0.1, vlti: 0.05 },
      metadata: {
        tensorIndex: index,
        contextDim,
        salience,
        type: 'episodic_memory'
      },
      source: {
        kernelId: 'episodic_memory',
        tensorComponent: 'episodes'
      }
    };
  }

  private createSkillFromTensor(tensor: Tensor, index: number, stepCount: number, masteryChannel: number): Atom {
    const data = tensor.data as Float32Array;
    const baseIdx = index * stepCount * tensor.shape[2];
    
    const mastery = masteryChannel > 0 ? data[baseIdx + masteryChannel] : 0.5;
    const strength = mastery;

    return {
      id: this.generateId(),
      type: 'ConceptNode',
      name: `skill_${index}`,
      truthValue: { strength, confidence: 0.8 },
      attentionValue: { sti: 0.1, lti: mastery, vlti: mastery * 0.8 },
      metadata: {
        tensorIndex: index,
        stepCount,
        mastery,
        type: 'procedural_skill'
      },
      source: {
        kernelId: 'procedural_memory',
        tensorComponent: 'skills'
      }
    };
  }

  private createWorkingItemFromTensor(tensor: Tensor, index: number, attentionDim: number, decayChannel: number): Atom {
    const data = tensor.data as Float32Array;
    const baseIdx = index * attentionDim * tensor.shape[2];
    
    const decay = decayChannel > 0 ? data[baseIdx + decayChannel] : 0.1;
    const attention = data[baseIdx] || 0.5;

    return {
      id: this.generateId(),
      type: 'ConceptNode',
      name: `working_item_${index}`,
      truthValue: { strength: attention, confidence: 1.0 - decay },
      attentionValue: { sti: attention, lti: 0.05, vlti: 0.01 },
      metadata: {
        tensorIndex: index,
        attention,
        decay,
        type: 'working_memory'
      },
      source: {
        kernelId: 'working_memory',
        tensorComponent: 'active_items'
      }
    };
  }

  private createTaskFromTensor(tensor: Tensor, index: number, dim: number, channel: number, taskType: string): Atom {
    const data = tensor.data as Float32Array;
    const baseIdx = index * dim * tensor.shape[2];
    
    const priority = channel > 0 ? data[baseIdx + channel] : 0.5;
    const strength = priority;

    return {
      id: this.generateId(),
      type: 'ConceptNode',
      name: `task_${taskType}_${index}`,
      truthValue: { strength, confidence: 0.7 },
      attentionValue: { sti: priority, lti: 0.1, vlti: 0.05 },
      metadata: {
        tensorIndex: index,
        priority,
        taskType,
        type: 'task'
      },
      source: {
        kernelId: 'task_manager',
        tensorComponent: taskType
      }
    };
  }

  private createAttentionFromTensor(tensor: Tensor, index: number, allocationDim: number, dynamicsChannel: number): Atom {
    const data = tensor.data as Float32Array;
    const baseIdx = index * allocationDim * tensor.shape[2];
    
    const dynamics = dynamicsChannel > 0 ? data[baseIdx + dynamicsChannel] : 0.5;
    const allocation = data[baseIdx] || 0.5;

    return {
      id: this.generateId(),
      type: 'ConceptNode',
      name: `attention_focus_${index}`,
      truthValue: { strength: allocation, confidence: dynamics },
      attentionValue: { sti: allocation, lti: dynamics, vlti: dynamics * 0.5 },
      metadata: {
        tensorIndex: index,
        allocation,
        dynamics,
        type: 'attention_focus'
      },
      source: {
        kernelId: 'attention_manager',
        tensorComponent: 'focus_weights'
      }
    };
  }

  private convertTraitsTensor(tensor: Tensor, result: ConversionResult): void {
    const traitCount = tensor.shape[0];
    const strengthCount = tensor.shape[1];
    
    for (let i = 0; i < Math.min(traitCount, 50); i++) {
      try {
        const trait = this.createTraitFromTensor(tensor, i, strengthCount);
        this.addAtom(trait);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`Trait ${i} conversion warning: ${error}`);
      }
    }
  }

  private convertParametersTensor(tensor: Tensor, result: ConversionResult): void {
    const paramCount = tensor.shape[0];
    const adaptationDim = tensor.shape[1];
    
    for (let i = 0; i < Math.min(paramCount, 30); i++) {
      try {
        const param = this.createParameterFromTensor(tensor, i, adaptationDim);
        this.addAtom(param);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`Parameter ${i} conversion warning: ${error}`);
      }
    }
  }

  private convertMutationTensor(tensor: Tensor, result: ConversionResult): void {
    const mutationCount = tensor.shape[0];
    const coeffDim = tensor.shape[1];
    
    for (let i = 0; i < Math.min(mutationCount, 20); i++) {
      try {
        const mutation = this.createMutationFromTensor(tensor, i, coeffDim);
        this.addAtom(mutation);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`Mutation ${i} conversion warning: ${error}`);
      }
    }
  }

  private convertSelfEvalTensor(tensor: Tensor, result: ConversionResult): void {
    const metricCount = tensor.shape[0];
    const satisfactionDim = tensor.shape[1];
    
    for (let i = 0; i < Math.min(metricCount, 15); i++) {
      try {
        const eval_ = this.createSelfEvalFromTensor(tensor, i, satisfactionDim);
        this.addAtom(eval_);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`Self-evaluation ${i} conversion warning: ${error}`);
      }
    }
  }

  private convertAdjustmentTensor(tensor: Tensor, result: ConversionResult): void {
    const adjustmentCount = tensor.shape[0];
    const deltaDim = tensor.shape[1];
    
    for (let i = 0; i < Math.min(adjustmentCount, 25); i++) {
      try {
        const adjustment = this.createAdjustmentFromTensor(tensor, i, deltaDim);
        this.addAtom(adjustment);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`Adjustment ${i} conversion warning: ${error}`);
      }
    }
  }

  private convertHistoryTensor(tensor: Tensor, result: ConversionResult): void {
    const historyCount = tensor.shape[0];
    const traceDim = tensor.shape[1];
    
    for (let i = 0; i < Math.min(historyCount, 100); i++) {
      try {
        const history = this.createHistoryFromTensor(tensor, i, traceDim);
        this.addAtom(history);
        result.atomsCreated++;
      } catch (error) {
        result.warnings.push(`History ${i} conversion warning: ${error}`);
      }
    }
  }

  private createTraitFromTensor(tensor: Tensor, index: number, strengthCount: number): Atom {
    const data = tensor.data as Float32Array;
    const baseIdx = index * strengthCount * tensor.shape[2];
    const strength = data[baseIdx] || 0.5;

    return {
      id: this.generateId(),
      type: 'ConceptNode',
      name: `personality_trait_${index}`,
      truthValue: { strength, confidence: 0.8 },
      attentionValue: { sti: 0.1, lti: strength, vlti: strength },
      metadata: { tensorIndex: index, type: 'personality_trait' },
      source: { kernelId: 'persona', tensorComponent: 'traits' }
    };
  }

  private createParameterFromTensor(tensor: Tensor, index: number, adaptationDim: number): Atom {
    const data = tensor.data as Float32Array;
    const baseIdx = index * adaptationDim * tensor.shape[2];
    const adaptation = data[baseIdx] || 0.5;

    return {
      id: this.generateId(),
      type: 'NumberNode',
      name: `cognitive_parameter_${index}`,
      truthValue: { strength: adaptation, confidence: 0.9 },
      attentionValue: { sti: 0.05, lti: adaptation, vlti: adaptation },
      metadata: { tensorIndex: index, adaptation, type: 'cognitive_parameter' },
      source: { kernelId: 'persona', tensorComponent: 'parameters' }
    };
  }

  private createMutationFromTensor(tensor: Tensor, index: number, coeffDim: number): Atom {
    const data = tensor.data as Float32Array;
    const baseIdx = index * coeffDim * tensor.shape[2];
    const coeff = data[baseIdx] || 0.1;

    return {
      id: this.generateId(),
      type: 'NumberNode',
      name: `mutation_coefficient_${index}`,
      truthValue: { strength: coeff, confidence: 0.7 },
      attentionValue: { sti: 0.02, lti: coeff, vlti: coeff },
      metadata: { tensorIndex: index, coefficient: coeff, type: 'mutation_coefficient' },
      source: { kernelId: 'persona', tensorComponent: 'mutation_coeffs' }
    };
  }

  private createSelfEvalFromTensor(tensor: Tensor, index: number, satisfactionDim: number): Atom {
    const data = tensor.data as Float32Array;
    const baseIdx = index * satisfactionDim * tensor.shape[2];
    const satisfaction = data[baseIdx] || 0.5;

    return {
      id: this.generateId(),
      type: 'PredicateNode',
      name: `self_evaluation_${index}`,
      truthValue: { strength: satisfaction, confidence: 0.8 },
      attentionValue: { sti: satisfaction, lti: 0.3, vlti: 0.2 },
      metadata: { tensorIndex: index, satisfaction, type: 'self_evaluation' },
      source: { kernelId: 'meta_cognitive', tensorComponent: 'self_eval' }
    };
  }

  private createAdjustmentFromTensor(tensor: Tensor, index: number, deltaDim: number): Atom {
    const data = tensor.data as Float32Array;
    const baseIdx = index * deltaDim * tensor.shape[2];
    const delta = data[baseIdx] || 0.0;

    return {
      id: this.generateId(),
      type: 'NumberNode',
      name: `adjustment_delta_${index}`,
      truthValue: { strength: Math.abs(delta), confidence: 0.7 },
      attentionValue: { sti: Math.abs(delta), lti: 0.1, vlti: 0.05 },
      metadata: { tensorIndex: index, delta, type: 'adjustment' },
      source: { kernelId: 'meta_cognitive', tensorComponent: 'adjustment' }
    };
  }

  private createHistoryFromTensor(tensor: Tensor, index: number, traceDim: number): Atom {
    const data = tensor.data as Float32Array;
    const baseIdx = index * traceDim * tensor.shape[2];
    const trace = data[baseIdx] || 0.1;

    return {
      id: this.generateId(),
      type: 'ConceptNode',
      name: `history_trace_${index}`,
      truthValue: { strength: trace, confidence: 0.6 },
      attentionValue: { sti: 0.05, lti: trace, vlti: trace },
      metadata: { tensorIndex: index, trace, type: 'history' },
      source: { kernelId: 'meta_cognitive', tensorComponent: 'history' }
    };
  }

  // Utility methods

  private mapNodeTypeToAtomType(nodeType: string): AtomType {
    switch (nodeType) {
      case 'concept': return 'ConceptNode';
      case 'memory': return 'ConceptNode';
      case 'pattern': return 'PredicateNode';
      case 'goal': return 'ConceptNode';
      case 'action': return 'ExecutionLink';
      case 'context': return 'ConceptNode';
      default: return 'ConceptNode';
    }
  }

  private mapEdgeTypeToLinkType(edgeType: string): AtomType {
    switch (edgeType) {
      case 'semantic': return 'SimilarityLink';
      case 'temporal': return 'EvaluationLink';
      case 'causal': return 'ImplicationLink';
      case 'hierarchical': return 'InheritanceLink';
      case 'associative': return 'SimilarityLink';
      case 'meta': return 'EvaluationLink';
      default: return 'SimilarityLink';
    }
  }

  private extractTruthValue(node: CognitiveNode): TruthValue {
    // Extract truth value from metadata or tensor data
    const metadata = node.metadata;
    return {
      strength: metadata.confidence || 0.8,
      confidence: metadata.confidence || 0.8,
      count: metadata.count || 1
    };
  }

  private extractTruthValueFromEdge(edge: CognitiveEdge): TruthValue {
    return {
      strength: edge.weight,
      confidence: edge.properties.confidence || 0.7,
      count: edge.properties.count || 1
    };
  }

  private extractAttentionValue(node: CognitiveNode): AtomAttentionValue {
    const metadata = node.metadata;
    return {
      sti: metadata.sti || 0.1,
      lti: metadata.lti || 0.1,
      vlti: metadata.vlti || 0.1
    };
  }

  private createAttentionValueFromWeight(weight: number): AtomAttentionValue {
    return {
      sti: weight,
      lti: weight * 0.5,
      vlti: weight * 0.3
    };
  }

  private createClusterLink(clusterId: string, nodeIds: string[]): Link {
    return {
      id: this.generateId(),
      type: 'ListLink',
      name: `cluster_${clusterId}`,
      truthValue: { strength: 0.8, confidence: 0.7 },
      attentionValue: { sti: 0.2, lti: 0.3, vlti: 0.2 },
      metadata: { type: 'cluster', nodeCount: nodeIds.length },
      source: { kernelId: 'hypergraph', tensorComponent: 'clusters' },
      outgoing: nodeIds
    };
  }

  private addAtom(atom: Atom): void {
    this.atomSpace.atoms.set(atom.id, atom);
    this.updateIndices(atom);
  }

  private addLink(link: Link): void {
    this.atomSpace.links.set(link.id, link);
    this.updateIndices(link);
  }

  private updateIndices(atom: Atom): void {
    // Update type index
    if (!this.atomSpace.typeIndex.has(atom.type)) {
      this.atomSpace.typeIndex.set(atom.type, new Set());
    }
    this.atomSpace.typeIndex.get(atom.type)!.add(atom.id);

    // Update name index
    if (!this.atomSpace.nameIndex.has(atom.name)) {
      this.atomSpace.nameIndex.set(atom.name, new Set());
    }
    this.atomSpace.nameIndex.get(atom.name)!.add(atom.id);

    // Update attention index
    const totalAttention = atom.attentionValue.sti + atom.attentionValue.lti + atom.attentionValue.vlti;
    this.atomSpace.attentionIndex.set(atom.id, totalAttention);
  }

  private generateId(): string {
    return `atom_${this.idCounter++}_${Date.now()}`;
  }

  /**
   * Get the current AtomSpace
   */
  public getAtomSpace(): AtomSpace {
    return this.atomSpace;
  }

  /**
   * Query atoms by type
   */
  public queryByType(type: AtomType): Atom[] {
    const atomIds = this.atomSpace.typeIndex.get(type) || new Set();
    return Array.from(atomIds).map(id => this.atomSpace.atoms.get(id)!).filter(Boolean);
  }

  /**
   * Query atoms by name
   */
  public queryByName(name: string): Atom[] {
    const atomIds = this.atomSpace.nameIndex.get(name) || new Set();
    return Array.from(atomIds).map(id => this.atomSpace.atoms.get(id)!).filter(Boolean);
  }

  /**
   * Get top attention atoms
   */
  public getTopAttentionAtoms(limit: number = 10): Atom[] {
    const sortedEntries = Array.from(this.atomSpace.attentionIndex.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    return sortedEntries.map(([id]) => this.atomSpace.atoms.get(id)!).filter(Boolean);
  }

  /**
   * Clear the AtomSpace
   */
  public clear(): void {
    this.atomSpace.atoms.clear();
    this.atomSpace.links.clear();
    this.atomSpace.typeIndex.clear();
    this.atomSpace.nameIndex.clear();
    this.atomSpace.attentionIndex.clear();
    this.idCounter = 0;
  }
}