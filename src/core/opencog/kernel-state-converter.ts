/**
 * Kernel State Converter
 * 
 * Provides bidirectional conversion between Marduk kernel states and OpenCog AtomSpace,
 * enabling seamless integration with PLN reasoning while maintaining state consistency.
 */

import { CognitiveState, CognitiveNode, CognitiveEdge, CognitiveHypergraph, Tensor } from '../mad9ml/types.js';
import { AtomSpaceAdapter, AtomSpace, Atom, Link, ConversionResult } from './atomspace-adapter.js';
import { PLNAdapter, PLNQuery, PLNInferenceResult } from './pln-adapter.js';

/**
 * Bidirectional conversion options
 */
export interface ConversionOptions {
  /** Include tensor data in conversion */
  includeTensorData: boolean;
  /** Maximum tensor size to convert */
  maxTensorSize: number;
  /** Preserve original metadata */
  preserveMetadata: boolean;
  /** Enable consistency checking */
  enableConsistencyCheck: boolean;
  /** Attention threshold for filtering */
  attentionThreshold: number;
  /** Confidence threshold for back-conversion */
  confidenceThreshold: number;
}

/**
 * Consistency check result
 */
export interface ConsistencyResult {
  /** Overall consistency score [0,1] */
  score: number;
  /** Detailed consistency issues */
  issues: string[];
  /** Recommendations for fixing issues */
  recommendations: string[];
  /** Number of atoms checked */
  atomsChecked: number;
  /** Number of inconsistencies found */
  inconsistenciesFound: number;
  /** Consistency check duration */
  duration: number;
}

/**
 * State synchronization result
 */
export interface SyncResult {
  /** Number of atoms synchronized */
  atomsSynced: number;
  /** Number of new atoms created */
  atomsCreated: number;
  /** Number of atoms updated */
  atomsUpdated: number;
  /** Number of atoms removed */
  atomsRemoved: number;
  /** Synchronization success */
  success: boolean;
  /** Error messages */
  errors: string[];
  /** Sync duration */
  duration: number;
}

/**
 * Bidirectional conversion state
 */
export interface ConversionState {
  /** Original kernel state */
  kernelState: CognitiveState;
  /** Converted AtomSpace */
  atomSpace: AtomSpace;
  /** Conversion metadata */
  conversionMetadata: {
    conversionTime: number;
    kernelToAtomMapping: Map<string, string>; // kernel_id -> atom_id
    atomToKernelMapping: Map<string, string>; // atom_id -> kernel_id
    tensorMappings: Map<string, { atomIds: string[], tensorInfo: any }>;
  };
  /** Last sync timestamp */
  lastSync: number;
  /** Conversion options used */
  options: ConversionOptions;
}

/**
 * Kernel State Converter for bidirectional AtomSpace integration
 */
export class KernelStateConverter {
  private atomSpaceAdapter: AtomSpaceAdapter;
  private plnAdapter: PLNAdapter;
  private conversionStates: Map<string, ConversionState> = new Map();
  private defaultOptions: ConversionOptions;

  constructor(options?: Partial<ConversionOptions>) {
    this.atomSpaceAdapter = new AtomSpaceAdapter();
    this.plnAdapter = new PLNAdapter(this.atomSpaceAdapter.getAtomSpace());
    
    this.defaultOptions = {
      includeTensorData: true,
      maxTensorSize: 100000,
      preserveMetadata: true,
      enableConsistencyCheck: true,
      attentionThreshold: 0.1,
      confidenceThreshold: 0.3,
      ...options
    };
  }

  /**
   * Convert kernel state to AtomSpace (forward conversion)
   */
  public async convertToAtomSpace(
    kernelState: CognitiveState, 
    stateId: string = 'default',
    options?: Partial<ConversionOptions>
  ): Promise<ConversionResult> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();

    try {
      // Clear previous state if exists
      if (this.conversionStates.has(stateId)) {
        this.atomSpaceAdapter.clear();
      }

      // Perform conversion
      const conversionResult = this.atomSpaceAdapter.convertCognitiveState(kernelState);

      // Create bidirectional mappings
      const mappings = this.createBidirectionalMappings(kernelState, this.atomSpaceAdapter.getAtomSpace());

      // Store conversion state
      const conversionState: ConversionState = {
        kernelState,
        atomSpace: this.atomSpaceAdapter.getAtomSpace(),
        conversionMetadata: {
          conversionTime: Date.now(),
          kernelToAtomMapping: mappings.kernelToAtom,
          atomToKernelMapping: mappings.atomToKernel,
          tensorMappings: mappings.tensorMappings
        },
        lastSync: Date.now(),
        options: opts
      };

      this.conversionStates.set(stateId, conversionState);

      // Perform consistency check if enabled
      if (opts.enableConsistencyCheck) {
        const consistencyResult = await this.checkConsistency(stateId);
        conversionResult.warnings.push(...consistencyResult.issues);
      }

      return conversionResult;

    } catch (error) {
      throw new Error(`Forward conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Convert AtomSpace back to kernel state (backward conversion)
   */
  public async convertFromAtomSpace(
    stateId: string = 'default',
    options?: Partial<ConversionOptions>
  ): Promise<CognitiveState> {
    const conversionState = this.conversionStates.get(stateId);
    if (!conversionState) {
      throw new Error(`No conversion state found for ID: ${stateId}`);
    }

    const opts = { ...this.defaultOptions, ...options };

    try {
      // Reconstruct cognitive state from AtomSpace
      const reconstructedState = await this.reconstructCognitiveState(conversionState, opts);

      // Update conversion state
      conversionState.kernelState = reconstructedState;
      conversionState.lastSync = Date.now();

      return reconstructedState;

    } catch (error) {
      throw new Error(`Backward conversion failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Synchronize changes between kernel state and AtomSpace
   */
  public async synchronize(stateId: string = 'default'): Promise<SyncResult> {
    const startTime = Date.now();
    const result: SyncResult = {
      atomsSynced: 0,
      atomsCreated: 0,
      atomsUpdated: 0,
      atomsRemoved: 0,
      success: false,
      errors: [],
      duration: 0
    };

    try {
      const conversionState = this.conversionStates.get(stateId);
      if (!conversionState) {
        result.errors.push(`No conversion state found for ID: ${stateId}`);
        return result;
      }

      // Detect changes in kernel state
      const kernelChanges = this.detectKernelChanges(conversionState);
      
      // Detect changes in AtomSpace
      const atomSpaceChanges = this.detectAtomSpaceChanges(conversionState);

      // Apply kernel changes to AtomSpace
      await this.applyKernelChangesToAtomSpace(kernelChanges, conversionState, result);

      // Apply AtomSpace changes to kernel state
      await this.applyAtomSpaceChangesToKernel(atomSpaceChanges, conversionState, result);

      // Update mappings
      this.updateMappings(conversionState);

      result.success = true;
      result.duration = Date.now() - startTime;

    } catch (error) {
      result.errors.push(`Synchronization failed: ${error instanceof Error ? error.message : String(error)}`);
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Perform reasoning query across agentic grammar
   */
  public async performReasoningQuery(
    query: PLNQuery,
    stateId: string = 'default'
  ): Promise<PLNInferenceResult> {
    const conversionState = this.conversionStates.get(stateId);
    if (!conversionState) {
      throw new Error(`No conversion state found for ID: ${stateId}`);
    }

    try {
      // Update PLN adapter with current AtomSpace
      this.plnAdapter = new PLNAdapter(conversionState.atomSpace);

      // Perform reasoning
      const result = await this.plnAdapter.processQuery(query);

      // Update AtomSpace with new inferred atoms
      if (result.success && result.conclusions.length > 0) {
        await this.integrateInferenceResults(result, conversionState);
      }

      return result;

    } catch (error) {
      throw new Error(`Reasoning query failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check consistency between kernel state and AtomSpace
   */
  public async checkConsistency(stateId: string = 'default'): Promise<ConsistencyResult> {
    const startTime = Date.now();
    const result: ConsistencyResult = {
      score: 1.0,
      issues: [],
      recommendations: [],
      atomsChecked: 0,
      inconsistenciesFound: 0,
      duration: 0
    };

    try {
      const conversionState = this.conversionStates.get(stateId);
      if (!conversionState) {
        result.issues.push(`No conversion state found for ID: ${stateId}`);
        result.score = 0.0;
        return result;
      }

      // Check mapping consistency
      await this.checkMappingConsistency(conversionState, result);

      // Check truth value consistency
      await this.checkTruthValueConsistency(conversionState, result);

      // Check attention value consistency
      await this.checkAttentionConsistency(conversionState, result);

      // Check structural consistency
      await this.checkStructuralConsistency(conversionState, result);

      // Calculate overall score
      result.score = Math.max(0.0, 1.0 - (result.inconsistenciesFound * 0.1));
      result.duration = Date.now() - startTime;

    } catch (error) {
      result.issues.push(`Consistency check failed: ${error instanceof Error ? error.message : String(error)}`);
      result.score = 0.0;
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Verify reasoning traceability
   */
  public verifyReasoningTraceability(
    inferenceResult: PLNInferenceResult,
    stateId: string = 'default'
  ): { traceable: boolean, issues: string[], trace: string[] } {
    const result = {
      traceable: true,
      issues: [] as string[],
      trace: [] as string[]
    };

    try {
      const conversionState = this.conversionStates.get(stateId);
      if (!conversionState) {
        result.issues.push(`No conversion state found for ID: ${stateId}`);
        result.traceable = false;
        return result;
      }

      // Trace each inference step back to original kernel state
      for (const step of inferenceResult.steps) {
        const traceInfo = this.traceInferenceStep(step, conversionState);
        result.trace.push(traceInfo.trace);
        if (!traceInfo.traceable) {
          result.issues.push(traceInfo.issue);
          result.traceable = false;
        }
      }

      // Verify conclusion origins
      for (const conclusion of inferenceResult.conclusions) {
        const originInfo = this.traceAtomOrigin(conclusion, conversionState);
        result.trace.push(originInfo.trace);
        if (!originInfo.traceable) {
          result.issues.push(originInfo.issue);
          result.traceable = false;
        }
      }

    } catch (error) {
      result.issues.push(`Traceability verification failed: ${error instanceof Error ? error.message : String(error)}`);
      result.traceable = false;
    }

    return result;
  }

  // Private helper methods

  private createBidirectionalMappings(kernelState: CognitiveState, atomSpace: AtomSpace) {
    const kernelToAtom = new Map<string, string>();
    const atomToKernel = new Map<string, string>();
    const tensorMappings = new Map<string, { atomIds: string[], tensorInfo: any }>();

    // Map hypergraph nodes
    if (kernelState.hypergraph) {
      kernelState.hypergraph.nodes.forEach((node, nodeId) => {
        const atoms = Array.from(atomSpace.atoms.values()).filter(atom => 
          atom.source.nodeId === nodeId
        );
        atoms.forEach(atom => {
          kernelToAtom.set(nodeId, atom.id);
          atomToKernel.set(atom.id, nodeId);
        });
      });

      // Map hypergraph edges
      kernelState.hypergraph.edges.forEach((edge, edgeId) => {
        const links = Array.from(atomSpace.links.values()).filter(link => 
          link.source.edgeId === edgeId
        );
        links.forEach(link => {
          kernelToAtom.set(edgeId, link.id);
          atomToKernel.set(link.id, edgeId);
        });
      });
    }

    // Map tensor components
    const tensorComponents = ['semantic', 'episodic', 'procedural', 'working', 'active', 'queued', 'attention'];
    tensorComponents.forEach(component => {
      const atoms = Array.from(atomSpace.atoms.values()).filter(atom => 
        atom.source.tensorComponent === component
      );
      if (atoms.length > 0) {
        tensorMappings.set(component, {
          atomIds: atoms.map(atom => atom.id),
          tensorInfo: { component, atomCount: atoms.length }
        });
      }
    });

    return { kernelToAtom, atomToKernel, tensorMappings };
  }

  private async reconstructCognitiveState(
    conversionState: ConversionState,
    options: ConversionOptions
  ): Promise<CognitiveState> {
    const atomSpace = conversionState.atomSpace;
    
    // Reconstruct hypergraph
    const hypergraph = this.reconstructHypergraph(atomSpace, conversionState);
    
    // Reconstruct memory tensors
    const memory = this.reconstructMemoryTensors(atomSpace, conversionState);
    
    // Reconstruct task tensors
    const task = this.reconstructTaskTensors(atomSpace, conversionState);
    
    // Reconstruct persona tensors
    const persona = this.reconstructPersonaTensors(atomSpace, conversionState);
    
    // Reconstruct meta-cognitive tensors
    const metaCognitive = this.reconstructMetaCognitiveTensors(atomSpace, conversionState);

    return {
      memory,
      task,
      persona,
      metaCognitive,
      hypergraph,
      timestamp: Date.now()
    };
  }

  private reconstructHypergraph(atomSpace: AtomSpace, conversionState: ConversionState): CognitiveHypergraph {
    const nodes = new Map<string, CognitiveNode>();
    const edges = new Map<string, CognitiveEdge>();
    const clusters = new Map<string, string[]>();

    // Reconstruct nodes from concept atoms
    const conceptAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.type === 'ConceptNode' && atom.source.kernelId === 'hypergraph'
    );

    conceptAtoms.forEach(atom => {
      if (atom.source.nodeId) {
        const node: CognitiveNode = {
          id: atom.source.nodeId,
          type: atom.metadata.originalType || 'concept',
          state: this.createTensorFromAtom(atom),
          metadata: { ...atom.metadata }
        };
        nodes.set(atom.source.nodeId, node);
      }
    });

    // Reconstruct edges from link atoms
    const linkAtoms = Array.from(atomSpace.links.values()).filter(link => 
      link.source.kernelId === 'hypergraph' && link.source.edgeId
    );

    linkAtoms.forEach(link => {
      if (link.source.edgeId && link.outgoing.length >= 2) {
        const edge: CognitiveEdge = {
          id: link.source.edgeId,
          type: link.metadata.originalType || 'semantic',
          source: link.outgoing[0],
          target: link.outgoing[1],
          weight: link.metadata.weight || link.truthValue.strength,
          properties: { ...link.metadata }
        };
        edges.set(link.source.edgeId, edge);
      }
    });

    // Reconstruct clusters from list links
    const clusterLinks = Array.from(atomSpace.links.values()).filter(link => 
      link.type === 'ListLink' && link.metadata.type === 'cluster'
    );

    clusterLinks.forEach(link => {
      const clusterId = link.name.replace('cluster_', '');
      clusters.set(clusterId, link.outgoing);
    });

    return { nodes, edges, clusters };
  }

  private reconstructMemoryTensors(atomSpace: AtomSpace, conversionState: ConversionState): any {
    const memory: any = {};

    // Reconstruct semantic memory
    const semanticAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'semantic_memory'
    );
    if (semanticAtoms.length > 0) {
      memory.semantic = this.createTensorFromAtoms(semanticAtoms, [semanticAtoms.length, 1024, 8]);
    }

    // Reconstruct episodic memory
    const episodicAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'episodic_memory'
    );
    if (episodicAtoms.length > 0) {
      memory.episodic = this.createTensorFromAtoms(episodicAtoms, [episodicAtoms.length, 512, 6]);
    }

    // Reconstruct procedural memory
    const proceduralAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'procedural_memory'
    );
    if (proceduralAtoms.length > 0) {
      memory.procedural = this.createTensorFromAtoms(proceduralAtoms, [proceduralAtoms.length, 256, 10]);
    }

    // Reconstruct working memory
    const workingAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'working_memory'
    );
    if (workingAtoms.length > 0) {
      memory.working = this.createTensorFromAtoms(workingAtoms, [workingAtoms.length, 128, 4]);
    }

    return memory;
  }

  private reconstructTaskTensors(atomSpace: AtomSpace, conversionState: ConversionState): any {
    const task: any = {};

    // Reconstruct active tasks
    const activeTaskAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'task_manager' && atom.metadata.taskType === 'active'
    );
    if (activeTaskAtoms.length > 0) {
      task.active = this.createTensorFromAtoms(activeTaskAtoms, [activeTaskAtoms.length, 256, 8]);
    }

    // Reconstruct queued tasks
    const queuedTaskAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'task_manager' && atom.metadata.taskType === 'queued'
    );
    if (queuedTaskAtoms.length > 0) {
      task.queue = this.createTensorFromAtoms(queuedTaskAtoms, [queuedTaskAtoms.length, 256, 8]);
    }

    // Reconstruct attention
    const attentionAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'attention_manager'
    );
    if (attentionAtoms.length > 0) {
      task.attention = this.createTensorFromAtoms(attentionAtoms, [attentionAtoms.length, 128, 6]);
    }

    return task;
  }

  private reconstructPersonaTensors(atomSpace: AtomSpace, conversionState: ConversionState): any {
    const persona: any = {};

    // Reconstruct traits
    const traitAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'persona' && atom.source.tensorComponent === 'traits'
    );
    if (traitAtoms.length > 0) {
      persona.traits = this.createTensorFromAtoms(traitAtoms, [traitAtoms.length, 64, 4]);
    }

    // Reconstruct parameters
    const paramAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'persona' && atom.source.tensorComponent === 'parameters'
    );
    if (paramAtoms.length > 0) {
      persona.parameters = this.createTensorFromAtoms(paramAtoms, [paramAtoms.length, 32, 4]);
    }

    // Reconstruct mutation coefficients
    const mutationAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'persona' && atom.source.tensorComponent === 'mutation_coeffs'
    );
    if (mutationAtoms.length > 0) {
      persona.mutationCoeffs = this.createTensorFromAtoms(mutationAtoms, [mutationAtoms.length, 16, 4]);
    }

    return persona;
  }

  private reconstructMetaCognitiveTensors(atomSpace: AtomSpace, conversionState: ConversionState): any {
    const metaCognitive: any = {};

    // Reconstruct self evaluation
    const selfEvalAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'meta_cognitive' && atom.source.tensorComponent === 'self_eval'
    );
    if (selfEvalAtoms.length > 0) {
      metaCognitive.selfEval = this.createTensorFromAtoms(selfEvalAtoms, [selfEvalAtoms.length, 32, 4]);
    }

    // Reconstruct adjustments
    const adjustmentAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'meta_cognitive' && atom.source.tensorComponent === 'adjustment'
    );
    if (adjustmentAtoms.length > 0) {
      metaCognitive.adjustment = this.createTensorFromAtoms(adjustmentAtoms, [adjustmentAtoms.length, 64, 4]);
    }

    // Reconstruct history
    const historyAtoms = Array.from(atomSpace.atoms.values()).filter(atom => 
      atom.source.kernelId === 'meta_cognitive' && atom.source.tensorComponent === 'history'
    );
    if (historyAtoms.length > 0) {
      metaCognitive.history = this.createTensorFromAtoms(historyAtoms, [historyAtoms.length, 128, 4]);
    }

    return metaCognitive;
  }

  private createTensorFromAtom(atom: Atom): Tensor {
    // Create a simple tensor from atom data
    const shape = atom.metadata.tensorShape || [1, 1, 1];
    const size = shape.reduce((a, b) => a * b, 1);
    const data = new Float32Array(size);
    
    // Fill with atom truth and attention values
    data[0] = atom.truthValue.strength;
    if (size > 1) data[1] = atom.truthValue.confidence;
    if (size > 2) data[2] = atom.attentionValue.sti;
    if (size > 3) data[3] = atom.attentionValue.lti;

    return {
      shape,
      data,
      type: 'f32',
      size
    };
  }

  private createTensorFromAtoms(atoms: Atom[], shape: number[]): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    const data = new Float32Array(size);
    
    // Fill tensor with atom data
    atoms.forEach((atom, index) => {
      const baseIndex = index * (shape[1] * shape[2]);
      if (baseIndex < size) {
        data[baseIndex] = atom.truthValue.strength;
        if (baseIndex + 1 < size) data[baseIndex + 1] = atom.truthValue.confidence;
        if (baseIndex + 2 < size) data[baseIndex + 2] = atom.attentionValue.sti;
        if (baseIndex + 3 < size) data[baseIndex + 3] = atom.attentionValue.lti;
      }
    });

    return {
      shape,
      data,
      type: 'f32',
      size
    };
  }

  private detectKernelChanges(conversionState: ConversionState): any {
    // Placeholder for detecting changes in kernel state
    // In a real implementation, this would compare current state with stored state
    return {
      nodesChanged: [],
      edgesChanged: [],
      tensorsChanged: []
    };
  }

  private detectAtomSpaceChanges(conversionState: ConversionState): any {
    // Placeholder for detecting changes in AtomSpace
    // In a real implementation, this would compare current AtomSpace with stored mappings
    return {
      atomsChanged: [],
      linksChanged: [],
      inferredAtomsAdded: []
    };
  }

  private async applyKernelChangesToAtomSpace(changes: any, conversionState: ConversionState, result: SyncResult): Promise<void> {
    // Placeholder for applying kernel changes to AtomSpace
    // This would update atoms based on kernel state changes
  }

  private async applyAtomSpaceChangesToKernel(changes: any, conversionState: ConversionState, result: SyncResult): Promise<void> {
    // Placeholder for applying AtomSpace changes to kernel state
    // This would update kernel state based on AtomSpace changes
  }

  private updateMappings(conversionState: ConversionState): void {
    // Update bidirectional mappings after synchronization
    const newMappings = this.createBidirectionalMappings(conversionState.kernelState, conversionState.atomSpace);
    conversionState.conversionMetadata.kernelToAtomMapping = newMappings.kernelToAtom;
    conversionState.conversionMetadata.atomToKernelMapping = newMappings.atomToKernel;
    conversionState.conversionMetadata.tensorMappings = newMappings.tensorMappings;
  }

  private async integrateInferenceResults(result: PLNInferenceResult, conversionState: ConversionState): Promise<void> {
    // Add inferred atoms to AtomSpace
    for (const conclusion of result.conclusions) {
      if (!conversionState.atomSpace.atoms.has(conclusion.id)) {
        conversionState.atomSpace.atoms.set(conclusion.id, conclusion);
        
        // Update indices
        if (!conversionState.atomSpace.typeIndex.has(conclusion.type)) {
          conversionState.atomSpace.typeIndex.set(conclusion.type, new Set());
        }
        conversionState.atomSpace.typeIndex.get(conclusion.type)!.add(conclusion.id);
        
        if (!conversionState.atomSpace.nameIndex.has(conclusion.name)) {
          conversionState.atomSpace.nameIndex.set(conclusion.name, new Set());
        }
        conversionState.atomSpace.nameIndex.get(conclusion.name)!.add(conclusion.id);
        
        const totalAttention = conclusion.attentionValue.sti + conclusion.attentionValue.lti + conclusion.attentionValue.vlti;
        conversionState.atomSpace.attentionIndex.set(conclusion.id, totalAttention);
      }
    }
  }

  private async checkMappingConsistency(conversionState: ConversionState, result: ConsistencyResult): Promise<void> {
    const { kernelToAtomMapping, atomToKernelMapping } = conversionState.conversionMetadata;
    
    // Check bidirectional mapping consistency
    for (const [kernelId, atomId] of kernelToAtomMapping.entries()) {
      if (atomToKernelMapping.get(atomId) !== kernelId) {
        result.issues.push(`Mapping inconsistency: kernel ${kernelId} -> atom ${atomId} not bidirectional`);
        result.inconsistenciesFound++;
      }
      result.atomsChecked++;
    }

    // Check for orphaned mappings
    const atomSpaceAtomIds = new Set(conversionState.atomSpace.atoms.keys());
    for (const [atomId, kernelId] of atomToKernelMapping.entries()) {
      if (!atomSpaceAtomIds.has(atomId)) {
        result.issues.push(`Orphaned mapping: atom ${atomId} not found in AtomSpace`);
        result.inconsistenciesFound++;
      }
    }
  }

  private async checkTruthValueConsistency(conversionState: ConversionState, result: ConsistencyResult): Promise<void> {
    // Check for truth value anomalies
    for (const atom of conversionState.atomSpace.atoms.values()) {
      if (atom.truthValue.strength < 0 || atom.truthValue.strength > 1) {
        result.issues.push(`Invalid truth strength for atom ${atom.id}: ${atom.truthValue.strength}`);
        result.inconsistenciesFound++;
      }
      
      if (atom.truthValue.confidence < 0 || atom.truthValue.confidence > 1) {
        result.issues.push(`Invalid truth confidence for atom ${atom.id}: ${atom.truthValue.confidence}`);
        result.inconsistenciesFound++;
      }
      
      result.atomsChecked++;
    }
  }

  private async checkAttentionConsistency(conversionState: ConversionState, result: ConsistencyResult): Promise<void> {
    // Check attention value consistency
    for (const atom of conversionState.atomSpace.atoms.values()) {
      const { sti, lti, vlti } = atom.attentionValue;
      
      if (sti < 0 || lti < 0 || vlti < 0) {
        result.issues.push(`Negative attention values for atom ${atom.id}: sti=${sti}, lti=${lti}, vlti=${vlti}`);
        result.inconsistenciesFound++;
      }
      
      const totalAttention = sti + lti + vlti;
      const indexedAttention = conversionState.atomSpace.attentionIndex.get(atom.id) || 0;
      
      if (Math.abs(totalAttention - indexedAttention) > 0.001) {
        result.issues.push(`Attention index mismatch for atom ${atom.id}: calculated=${totalAttention}, indexed=${indexedAttention}`);
        result.inconsistenciesFound++;
      }
      
      result.atomsChecked++;
    }
  }

  private async checkStructuralConsistency(conversionState: ConversionState, result: ConsistencyResult): Promise<void> {
    // Check link structural consistency
    for (const link of conversionState.atomSpace.links.values()) {
      for (const atomId of link.outgoing) {
        if (!conversionState.atomSpace.atoms.has(atomId)) {
          result.issues.push(`Link ${link.id} references non-existent atom ${atomId}`);
          result.inconsistenciesFound++;
        }
      }
      result.atomsChecked++;
    }

    // Check hypergraph consistency
    if (conversionState.kernelState.hypergraph) {
      for (const edge of conversionState.kernelState.hypergraph.edges.values()) {
        if (!conversionState.kernelState.hypergraph.nodes.has(edge.source)) {
          result.issues.push(`Edge ${edge.id} references non-existent source node ${edge.source}`);
          result.inconsistenciesFound++;
        }
        if (!conversionState.kernelState.hypergraph.nodes.has(edge.target)) {
          result.issues.push(`Edge ${edge.id} references non-existent target node ${edge.target}`);
          result.inconsistenciesFound++;
        }
      }
    }
  }

  private traceInferenceStep(step: any, conversionState: ConversionState): { traceable: boolean, issue: string, trace: string } {
    // Trace inference step back to kernel state
    const inputOrigins = step.inputs.map((inputId: string) => {
      const kernelId = conversionState.conversionMetadata.atomToKernelMapping.get(inputId);
      return kernelId ? `kernel:${kernelId}` : `atom:${inputId}`;
    });

    return {
      traceable: step.inputs.every((inputId: string) => 
        conversionState.conversionMetadata.atomToKernelMapping.has(inputId)
      ),
      issue: step.inputs.some((inputId: string) => 
        !conversionState.conversionMetadata.atomToKernelMapping.has(inputId)
      ) ? `Cannot trace input ${step.inputs.find((inputId: string) => 
        !conversionState.conversionMetadata.atomToKernelMapping.has(inputId)
      )} to kernel state` : '',
      trace: `Step ${step.stepIndex}: ${step.rule} applied to [${inputOrigins.join(', ')}] -> ${step.output}`
    };
  }

  private traceAtomOrigin(atom: Atom, conversionState: ConversionState): { traceable: boolean, issue: string, trace: string } {
    const kernelId = conversionState.conversionMetadata.atomToKernelMapping.get(atom.id);
    
    return {
      traceable: !!kernelId || !!atom.metadata.inferred,
      issue: !kernelId && !atom.metadata.inferred ? `Cannot trace atom ${atom.id} to kernel state or inference` : '',
      trace: kernelId ? 
        `Atom ${atom.id} originated from kernel element ${kernelId}` : 
        `Atom ${atom.id} was inferred via ${atom.metadata.inferenceType || 'unknown'} reasoning`
    };
  }

  /**
   * Get conversion state
   */
  public getConversionState(stateId: string = 'default'): ConversionState | undefined {
    return this.conversionStates.get(stateId);
  }

  /**
   * Clear conversion state
   */
  public clearConversionState(stateId: string = 'default'): void {
    this.conversionStates.delete(stateId);
    if (stateId === 'default') {
      this.atomSpaceAdapter.clear();
    }
  }

  /**
   * List all conversion states
   */
  public listConversionStates(): string[] {
    return Array.from(this.conversionStates.keys());
  }

  /**
   * Get AtomSpace adapter
   */
  public getAtomSpaceAdapter(): AtomSpaceAdapter {
    return this.atomSpaceAdapter;
  }

  /**
   * Get PLN adapter
   */
  public getPLNAdapter(): PLNAdapter {
    return this.plnAdapter;
  }
}