/**
 * Comprehensive Tests for AtomSpace and PLN Adapters
 * 
 * Tests all adapter functionality including conversion, reasoning, consistency,
 * and traceability to ensure robust integration with OpenCog paradigms.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { AtomSpaceAdapter, AtomSpace, Atom, TruthValue } from '../atomspace-adapter.js';
import { PLNAdapter, PLNQuery, TruthValueOperations } from '../pln-adapter.js';
import { KernelStateConverter } from '../kernel-state-converter.js';
import { CognitiveState, CognitiveNode, CognitiveEdge, Tensor } from '../../mad9ml/types.js';

// Test utilities
function createMockTensor(shape: number[]): Tensor {
  const size = shape.reduce((a, b) => a * b, 1);
  return {
    shape,
    data: new Float32Array(size).map(() => Math.random()),
    type: 'f32',
    size
  };
}

function createMockCognitiveNode(id: string, type: any = 'concept'): CognitiveNode {
  return {
    id,
    type,
    state: createMockTensor([1, 4, 4]),
    metadata: {
      confidence: 0.8,
      sti: 0.5,
      lti: 0.3,
      vlti: 0.2
    }
  };
}

function createMockCognitiveEdge(id: string, source: string, target: string): CognitiveEdge {
  return {
    id,
    type: 'semantic',
    source,
    target,
    weight: 0.7,
    properties: {
      confidence: 0.8,
      strength: 0.7
    }
  };
}

function createMockCognitiveState(): CognitiveState {
  const nodes = new Map<string, CognitiveNode>();
  const edges = new Map<string, CognitiveEdge>();
  const clusters = new Map<string, string[]>();

  // Create test nodes
  nodes.set('node1', createMockCognitiveNode('node1', 'concept'));
  nodes.set('node2', createMockCognitiveNode('node2', 'memory'));
  nodes.set('node3', createMockCognitiveNode('node3', 'goal'));

  // Create test edges
  edges.set('edge1', createMockCognitiveEdge('edge1', 'node1', 'node2'));
  edges.set('edge2', createMockCognitiveEdge('edge2', 'node2', 'node3'));

  // Create test cluster
  clusters.set('cluster1', ['node1', 'node2']);

  return {
    memory: {
      semantic: createMockTensor([10, 512, 8]),
      episodic: createMockTensor([5, 256, 6]),
      procedural: createMockTensor([3, 128, 10]),
      working: createMockTensor([2, 64, 4])
    },
    task: {
      active: createMockTensor([5, 128, 8]),
      queue: createMockTensor([10, 64, 6]),
      attention: createMockTensor([3, 32, 4])
    },
    persona: {
      traits: createMockTensor([5, 16, 4]),
      parameters: createMockTensor([3, 8, 4]),
      mutationCoeffs: createMockTensor([2, 4, 4])
    },
    metaCognitive: {
      selfEval: createMockTensor([2, 16, 4]),
      adjustment: createMockTensor([3, 8, 4]),
      history: createMockTensor([10, 32, 4])
    },
    hypergraph: {
      nodes,
      edges,
      clusters
    },
    timestamp: Date.now()
  };
}

describe('AtomSpaceAdapter', () => {
  let adapter: AtomSpaceAdapter;
  let mockState: CognitiveState;

  beforeEach(() => {
    adapter = new AtomSpaceAdapter();
    mockState = createMockCognitiveState();
  });

  afterEach(() => {
    adapter.clear();
  });

  describe('Basic Conversion', () => {
    it('should convert cognitive state to AtomSpace', async () => {
      const result = adapter.convertCognitiveState(mockState);

      expect(result.nodesConverted).toBe(3);
      expect(result.edgesConverted).toBe(2);
      expect(result.atomsCreated).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should create correct atom types for different node types', () => {
      adapter.convertCognitiveState(mockState);
      const atomSpace = adapter.getAtomSpace();

      const conceptAtoms = adapter.queryByType('ConceptNode');
      expect(conceptAtoms.length).toBeGreaterThan(0);

      // Check that concept node was mapped correctly
      const conceptAtom = conceptAtoms.find(atom => atom.source.nodeId === 'node1');
      expect(conceptAtom).toBeDefined();
      expect(conceptAtom!.type).toBe('ConceptNode');
    });

    it('should create correct link types for different edge types', () => {
      adapter.convertCognitiveState(mockState);

      const similarityLinks = adapter.queryByType('SimilarityLink');
      expect(similarityLinks.length).toBeGreaterThan(0);

      // Check that edge was mapped correctly
      const semanticLink = similarityLinks.find(link => 
        (link as any).source?.edgeId === 'edge1'
      );
      expect(semanticLink).toBeDefined();
    });

    it('should preserve truth values during conversion', () => {
      adapter.convertCognitiveState(mockState);
      const atomSpace = adapter.getAtomSpace();

      for (const atom of atomSpace.atoms.values()) {
        expect(atom.truthValue.strength).toBeGreaterThanOrEqual(0);
        expect(atom.truthValue.strength).toBeLessThanOrEqual(1);
        expect(atom.truthValue.confidence).toBeGreaterThanOrEqual(0);
        expect(atom.truthValue.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should preserve attention values during conversion', () => {
      adapter.convertCognitiveState(mockState);
      const atomSpace = adapter.getAtomSpace();

      for (const atom of atomSpace.atoms.values()) {
        expect(atom.attentionValue.sti).toBeGreaterThanOrEqual(0);
        expect(atom.attentionValue.lti).toBeGreaterThanOrEqual(0);
        expect(atom.attentionValue.vlti).toBeGreaterThanOrEqual(0);
      }
    });

    it('should handle tensor conversion limits', () => {
      // Create state with large tensors
      const largeState = createMockCognitiveState();
      largeState.memory.semantic = createMockTensor([2000, 512, 8]); // Large tensor

      const result = adapter.convertCognitiveState(largeState);
      
      // Should succeed but limit conversion
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Querying', () => {
    beforeEach(() => {
      adapter.convertCognitiveState(mockState);
    });

    it('should query atoms by type', () => {
      const conceptNodes = adapter.queryByType('ConceptNode');
      expect(conceptNodes.length).toBeGreaterThan(0);
      
      for (const atom of conceptNodes) {
        expect(atom.type).toBe('ConceptNode');
      }
    });

    it('should query atoms by name', () => {
      // Get a known atom name
      const atomSpace = adapter.getAtomSpace();
      const firstAtom = Array.from(atomSpace.atoms.values())[0];
      
      const results = adapter.queryByName(firstAtom.name);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe(firstAtom.name);
    });

    it('should get top attention atoms', () => {
      const topAtoms = adapter.getTopAttentionAtoms(5);
      expect(topAtoms.length).toBeLessThanOrEqual(5);
      
      // Should be sorted by attention
      for (let i = 1; i < topAtoms.length; i++) {
        const prev = topAtoms[i-1].attentionValue.sti + topAtoms[i-1].attentionValue.lti + topAtoms[i-1].attentionValue.vlti;
        const curr = topAtoms[i].attentionValue.sti + topAtoms[i].attentionValue.lti + topAtoms[i].attentionValue.vlti;
        expect(prev).toBeGreaterThanOrEqual(curr);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty cognitive state', () => {
      const emptyState: CognitiveState = {
        memory: {} as any,
        task: {} as any,
        persona: {} as any,
        metaCognitive: {} as any,
        hypergraph: {
          nodes: new Map(),
          edges: new Map(),
          clusters: new Map()
        },
        timestamp: Date.now()
      };

      const result = adapter.convertCognitiveState(emptyState);
      expect(result.nodesConverted).toBe(0);
      expect(result.edgesConverted).toBe(0);
    });

    it('should handle malformed tensors gracefully', () => {
      const malformedState = createMockCognitiveState();
      // Create tensor with mismatched shape and data
      malformedState.memory.semantic = {
        shape: [10, 10, 10],
        data: new Float32Array(5), // Too small for shape
        type: 'f32',
        size: 5
      };

      const result = adapter.convertCognitiveState(malformedState);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should clear all data when requested', () => {
      adapter.convertCognitiveState(mockState);
      const atomSpace = adapter.getAtomSpace();
      expect(atomSpace.atoms.size).toBeGreaterThan(0);

      adapter.clear();
      
      expect(atomSpace.atoms.size).toBe(0);
      expect(atomSpace.links.size).toBe(0);
      expect(atomSpace.typeIndex.size).toBe(0);
    });
  });
});

describe('TruthValueOperations', () => {
  let truthValue1: TruthValue;
  let truthValue2: TruthValue;

  beforeEach(() => {
    truthValue1 = { strength: 0.8, confidence: 0.9, count: 5 };
    truthValue2 = { strength: 0.6, confidence: 0.7, count: 3 };
  });

  it('should perform deduction correctly', () => {
    const result = TruthValueOperations.deduction(truthValue1, truthValue2);
    
    expect(result.strength).toBe(0.8 * 0.6);
    expect(result.confidence).toBeLessThanOrEqual(Math.min(0.9, 0.7));
    expect(result.count).toBe(Math.min(5, 3));
  });

  it('should perform induction correctly', () => {
    const result = TruthValueOperations.induction(truthValue1, truthValue2);
    
    expect(result.strength).toBeGreaterThanOrEqual(0);
    expect(result.strength).toBeLessThanOrEqual(1);
    expect(result.confidence).toBeLessThanOrEqual(Math.min(0.9, 0.7));
  });

  it('should perform conjunction correctly', () => {
    const result = TruthValueOperations.conjunction(truthValue1, truthValue2);
    
    expect(result.strength).toBe(0.8 * 0.6);
    expect(result.confidence).toBeLessThanOrEqual(Math.min(0.9, 0.7));
  });

  it('should perform disjunction correctly', () => {
    const result = TruthValueOperations.disjunction(truthValue1, truthValue2);
    
    const expectedStrength = 0.8 + 0.6 - (0.8 * 0.6);
    expect(result.strength).toBeCloseTo(expectedStrength, 5);
    expect(result.confidence).toBeLessThanOrEqual(Math.min(0.9, 0.7));
  });

  it('should perform negation correctly', () => {
    const result = TruthValueOperations.negation(truthValue1);
    
    expect(result.strength).toBe(1.0 - 0.8);
    expect(result.confidence).toBeLessThanOrEqual(0.9);
  });

  it('should handle edge cases in truth value operations', () => {
    const zeroTruth: TruthValue = { strength: 0, confidence: 0 };
    const oneTruth: TruthValue = { strength: 1, confidence: 1 };

    const conjResult = TruthValueOperations.conjunction(zeroTruth, oneTruth);
    expect(conjResult.strength).toBe(0);

    const disjResult = TruthValueOperations.disjunction(zeroTruth, oneTruth);
    expect(disjResult.strength).toBe(1);
  });
});

describe('PLNAdapter', () => {
  let plnAdapter: PLNAdapter;
  let atomSpaceAdapter: AtomSpaceAdapter;
  let mockState: CognitiveState;

  beforeEach(() => {
    atomSpaceAdapter = new AtomSpaceAdapter();
    mockState = createMockCognitiveState();
    atomSpaceAdapter.convertCognitiveState(mockState);
    plnAdapter = new PLNAdapter(atomSpaceAdapter.getAtomSpace());
  });

  afterEach(() => {
    atomSpaceAdapter.clear();
    plnAdapter.clearHistory();
  });

  describe('Basic Reasoning', () => {
    it('should process inheritance queries', async () => {
      const query: PLNQuery = {
        type: 'inheritance',
        targets: ['node1', 'node2'],
        minConfidence: 0.1
      };

      const result = await plnAdapter.processQuery(query);
      
      expect(result.success).toBe(true);
      expect(result.query).toEqual(query);
      expect(result.duration).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should process similarity queries', async () => {
      const query: PLNQuery = {
        type: 'similarity',
        targets: ['node1', 'node2', 'node3'],
        minConfidence: 0.2
      };

      const result = await plnAdapter.processQuery(query);
      
      expect(result.success).toBe(true);
      expect(result.conclusions.length).toBeGreaterThanOrEqual(0);
      expect(result.steps.length).toBeGreaterThanOrEqual(0);
    });

    it('should process evaluation queries', async () => {
      const query: PLNQuery = {
        type: 'evaluation',
        targets: ['node1'],
        minConfidence: 0.1
      };

      const result = await plnAdapter.processQuery(query);
      
      expect(result.success).toBe(true);
      expect(result.trace.length).toBeGreaterThan(0);
    });

    it('should process implication queries', async () => {
      const query: PLNQuery = {
        type: 'implication',
        targets: ['node1', 'node2'],
        minConfidence: 0.1
      };

      const result = await plnAdapter.processQuery(query);
      
      expect(result.success).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
    });

    it('should process conjunction queries', async () => {
      const query: PLNQuery = {
        type: 'conjunction',
        targets: ['node1', 'node2'],
        minConfidence: 0.2
      };

      const result = await plnAdapter.processQuery(query);
      
      expect(result.success).toBe(true);
    });
  });

  describe('Advanced Reasoning', () => {
    it('should handle attention-guided reasoning', async () => {
      const query: PLNQuery = {
        type: 'similarity',
        targets: ['node1', 'node2'],
        useAttention: true,
        minConfidence: 0.1
      };

      const result = await plnAdapter.processQuery(query);
      
      expect(result.success).toBe(true);
      // Conclusions should be filtered/weighted by attention
      for (const conclusion of result.conclusions) {
        expect(conclusion.attentionValue).toBeDefined();
      }
    });

    it('should generate meta-cognitive insights', async () => {
      // Update context to enable meta-cognition
      plnAdapter.updateContext({ includeMetaCognition: true });

      const query: PLNQuery = {
        type: 'custom',
        targets: ['node1', 'node2', 'node3'],
        minConfidence: 0.1
      };

      const result = await plnAdapter.processQuery(query);
      
      expect(result.success).toBe(true);
      // Should have some meta-insights when meta-cognition is enabled
      expect(result.metaInsights).toBeDefined();
    });

    it('should respect confidence thresholds', async () => {
      const highThreshold = 0.9;
      const query: PLNQuery = {
        type: 'similarity',
        targets: ['node1', 'node2', 'node3'],
        minConfidence: highThreshold
      };

      const result = await plnAdapter.processQuery(query);
      
      // All conclusions should meet the high threshold
      for (const conclusion of result.conclusions) {
        expect(conclusion.truthValue.confidence).toBeGreaterThanOrEqual(highThreshold);
      }
    });

    it('should limit inference depth', async () => {
      const query: PLNQuery = {
        type: 'custom',
        targets: ['node1', 'node2'],
        maxDepth: 2,
        minConfidence: 0.1
      };

      const result = await plnAdapter.processQuery(query);
      
      expect(result.success).toBe(true);
      // Check that inference depth is respected
      const maxStepIndex = Math.max(...result.steps.map(step => step.stepIndex));
      expect(maxStepIndex).toBeLessThanOrEqual(2);
    });
  });

  describe('Inference History', () => {
    it('should maintain inference history', async () => {
      const query1: PLNQuery = {
        type: 'similarity',
        targets: ['node1', 'node2'],
        minConfidence: 0.1
      };

      const query2: PLNQuery = {
        type: 'inheritance',
        targets: ['node2', 'node3'],
        minConfidence: 0.1
      };

      await plnAdapter.processQuery(query1);
      await plnAdapter.processQuery(query2);

      const history = plnAdapter.getInferenceHistory();
      expect(history).toHaveLength(2);
      expect(history[0].query.type).toBe('similarity');
      expect(history[1].query.type).toBe('inheritance');
    });

    it('should clear history when requested', async () => {
      const query: PLNQuery = {
        type: 'similarity',
        targets: ['node1', 'node2'],
        minConfidence: 0.1
      };

      await plnAdapter.processQuery(query);
      expect(plnAdapter.getInferenceHistory()).toHaveLength(1);

      plnAdapter.clearHistory();
      expect(plnAdapter.getInferenceHistory()).toHaveLength(0);
    });
  });

  describe('Context Management', () => {
    it('should update and retrieve context', () => {
      const newContext = {
        maxDepth: 10,
        confidenceThreshold: 0.5,
        attentionBias: 0.2
      };

      plnAdapter.updateContext(newContext);
      const context = plnAdapter.getContext();

      expect(context.maxDepth).toBe(10);
      expect(context.confidenceThreshold).toBe(0.5);
      expect(context.attentionBias).toBe(0.2);
    });

    it('should handle partial context updates', () => {
      const originalContext = plnAdapter.getContext();
      const partialUpdate = { maxDepth: 15 };

      plnAdapter.updateContext(partialUpdate);
      const updatedContext = plnAdapter.getContext();

      expect(updatedContext.maxDepth).toBe(15);
      expect(updatedContext.confidenceThreshold).toBe(originalContext.confidenceThreshold);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid target atoms gracefully', async () => {
      const query: PLNQuery = {
        type: 'similarity',
        targets: ['nonexistent_node'],
        minConfidence: 0.1
      };

      const result = await plnAdapter.processQuery(query);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle empty target list', async () => {
      const query: PLNQuery = {
        type: 'similarity',
        targets: [],
        minConfidence: 0.1
      };

      const result = await plnAdapter.processQuery(query);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe('KernelStateConverter', () => {
  let converter: KernelStateConverter;
  let mockState: CognitiveState;

  beforeEach(() => {
    converter = new KernelStateConverter();
    mockState = createMockCognitiveState();
  });

  afterEach(() => {
    converter.clearConversionState();
  });

  describe('Forward Conversion', () => {
    it('should convert kernel state to AtomSpace', async () => {
      const result = await converter.convertToAtomSpace(mockState, 'test_state');
      
      expect(result.atomsCreated).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);

      const conversionState = converter.getConversionState('test_state');
      expect(conversionState).toBeDefined();
      expect(conversionState!.atomSpace.atoms.size).toBeGreaterThan(0);
    });

    it('should create bidirectional mappings', async () => {
      await converter.convertToAtomSpace(mockState, 'test_state');
      
      const conversionState = converter.getConversionState('test_state');
      expect(conversionState).toBeDefined();
      
      const { kernelToAtomMapping, atomToKernelMapping } = conversionState!.conversionMetadata;
      expect(kernelToAtomMapping.size).toBeGreaterThan(0);
      expect(atomToKernelMapping.size).toBeGreaterThan(0);

      // Check bidirectional consistency
      for (const [kernelId, atomId] of kernelToAtomMapping.entries()) {
        expect(atomToKernelMapping.get(atomId)).toBe(kernelId);
      }
    });

    it('should handle conversion options', async () => {
      const options = {
        includeTensorData: false,
        maxTensorSize: 1000,
        enableConsistencyCheck: false
      };

      const result = await converter.convertToAtomSpace(mockState, 'test_state', options);
      
      const conversionState = converter.getConversionState('test_state');
      expect(conversionState!.options.includeTensorData).toBe(false);
      expect(conversionState!.options.maxTensorSize).toBe(1000);
    });
  });

  describe('Backward Conversion', () => {
    it('should convert AtomSpace back to kernel state', async () => {
      await converter.convertToAtomSpace(mockState, 'test_state');
      
      const reconstructedState = await converter.convertFromAtomSpace('test_state');
      
      expect(reconstructedState).toBeDefined();
      expect(reconstructedState.hypergraph.nodes.size).toBeGreaterThan(0);
      expect(reconstructedState.hypergraph.edges.size).toBeGreaterThan(0);
      expect(reconstructedState.memory).toBeDefined();
      expect(reconstructedState.task).toBeDefined();
    });

    it('should preserve essential structure in round-trip conversion', async () => {
      await converter.convertToAtomSpace(mockState, 'test_state');
      const reconstructedState = await converter.convertFromAtomSpace('test_state');
      
      // Check that basic structure is preserved
      expect(reconstructedState.hypergraph.nodes.size).toBe(mockState.hypergraph.nodes.size);
      expect(reconstructedState.hypergraph.edges.size).toBe(mockState.hypergraph.edges.size);
      
      // Check that node IDs are preserved
      for (const nodeId of mockState.hypergraph.nodes.keys()) {
        expect(reconstructedState.hypergraph.nodes.has(nodeId)).toBe(true);
      }
    });
  });

  describe('Reasoning Integration', () => {
    it('should perform reasoning queries on converted state', async () => {
      await converter.convertToAtomSpace(mockState, 'test_state');
      
      const query: PLNQuery = {
        type: 'similarity',
        targets: ['node1', 'node2'],
        minConfidence: 0.1
      };

      const result = await converter.performReasoningQuery(query, 'test_state');
      
      expect(result.success).toBe(true);
      expect(result.query).toEqual(query);
    });

    it('should integrate inference results into AtomSpace', async () => {
      await converter.convertToAtomSpace(mockState, 'test_state');
      
      const initialAtomSpace = converter.getConversionState('test_state')!.atomSpace;
      const initialAtomCount = initialAtomSpace.atoms.size;

      const query: PLNQuery = {
        type: 'similarity',
        targets: ['node1', 'node2', 'node3'],
        minConfidence: 0.1
      };

      const result = await converter.performReasoningQuery(query, 'test_state');
      
      if (result.success && result.conclusions.length > 0) {
        const finalAtomSpace = converter.getConversionState('test_state')!.atomSpace;
        expect(finalAtomSpace.atoms.size).toBeGreaterThanOrEqual(initialAtomCount);
      }
    });
  });

  describe('Consistency Checking', () => {
    it('should check consistency between kernel state and AtomSpace', async () => {
      await converter.convertToAtomSpace(mockState, 'test_state');
      
      const consistencyResult = await converter.checkConsistency('test_state');
      
      expect(consistencyResult.score).toBeGreaterThanOrEqual(0);
      expect(consistencyResult.score).toBeLessThanOrEqual(1);
      expect(consistencyResult.atomsChecked).toBeGreaterThan(0);
      expect(consistencyResult.duration).toBeGreaterThan(0);
    });

    it('should detect mapping inconsistencies', async () => {
      await converter.convertToAtomSpace(mockState, 'test_state');
      
      // Manually corrupt mapping to test detection
      const conversionState = converter.getConversionState('test_state')!;
      conversionState.conversionMetadata.kernelToAtomMapping.set('fake_kernel_id', 'fake_atom_id');
      
      const consistencyResult = await converter.checkConsistency('test_state');
      
      expect(consistencyResult.inconsistenciesFound).toBeGreaterThan(0);
      expect(consistencyResult.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Reasoning Traceability', () => {
    it('should verify reasoning traceability', async () => {
      await converter.convertToAtomSpace(mockState, 'test_state');
      
      const query: PLNQuery = {
        type: 'similarity',
        targets: ['node1', 'node2'],
        minConfidence: 0.1
      };

      const inferenceResult = await converter.performReasoningQuery(query, 'test_state');
      
      if (inferenceResult.success) {
        const traceabilityResult = converter.verifyReasoningTraceability(inferenceResult, 'test_state');
        
        expect(traceabilityResult.trace.length).toBeGreaterThan(0);
        expect(typeof traceabilityResult.traceable).toBe('boolean');
        
        if (!traceabilityResult.traceable) {
          expect(traceabilityResult.issues.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('State Management', () => {
    it('should manage multiple conversion states', async () => {
      await converter.convertToAtomSpace(mockState, 'state1');
      await converter.convertToAtomSpace(mockState, 'state2');
      
      const stateList = converter.listConversionStates();
      expect(stateList).toContain('state1');
      expect(stateList).toContain('state2');
      expect(stateList.length).toBeGreaterThanOrEqual(2);
    });

    it('should clear specific conversion states', async () => {
      await converter.convertToAtomSpace(mockState, 'state1');
      await converter.convertToAtomSpace(mockState, 'state2');
      
      converter.clearConversionState('state1');
      
      const stateList = converter.listConversionStates();
      expect(stateList).not.toContain('state1');
      expect(stateList).toContain('state2');
    });

    it('should provide access to adapters', () => {
      const atomSpaceAdapter = converter.getAtomSpaceAdapter();
      const plnAdapter = converter.getPLNAdapter();
      
      expect(atomSpaceAdapter).toBeInstanceOf(AtomSpaceAdapter);
      expect(plnAdapter).toBeInstanceOf(PLNAdapter);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing conversion state gracefully', async () => {
      const query: PLNQuery = {
        type: 'similarity',
        targets: ['node1'],
        minConfidence: 0.1
      };

      await expect(converter.performReasoningQuery(query, 'nonexistent_state'))
        .rejects.toThrow('No conversion state found');
    });

    it('should handle backward conversion without forward conversion', async () => {
      await expect(converter.convertFromAtomSpace('nonexistent_state'))
        .rejects.toThrow('No conversion state found');
    });

    it('should handle consistency check without conversion state', async () => {
      const consistencyResult = await converter.checkConsistency('nonexistent_state');
      
      expect(consistencyResult.score).toBe(0.0);
      expect(consistencyResult.issues.length).toBeGreaterThan(0);
    });
  });
});

describe('Integration Tests', () => {
  let converter: KernelStateConverter;
  let mockState: CognitiveState;

  beforeEach(() => {
    converter = new KernelStateConverter({
      enableConsistencyCheck: true,
      includeMetaCognition: true
    });
    mockState = createMockCognitiveState();
  });

  afterEach(() => {
    converter.clearConversionState();
  });

  it('should perform complete workflow: convert, reason, trace, verify', async () => {
    // 1. Convert to AtomSpace
    const conversionResult = await converter.convertToAtomSpace(mockState, 'integration_test');
    expect(conversionResult.atomsCreated).toBeGreaterThan(0);

    // 2. Perform reasoning
    const query: PLNQuery = {
      type: 'custom',
      targets: ['node1', 'node2', 'node3'],
      minConfidence: 0.1,
      useAttention: true
    };

    const reasoningResult = await converter.performReasoningQuery(query, 'integration_test');
    expect(reasoningResult.success).toBe(true);

    // 3. Verify traceability
    const traceabilityResult = converter.verifyReasoningTraceability(reasoningResult, 'integration_test');
    expect(traceabilityResult.trace.length).toBeGreaterThan(0);

    // 4. Check consistency
    const consistencyResult = await converter.checkConsistency('integration_test');
    expect(consistencyResult.score).toBeGreaterThan(0);

    // 5. Convert back
    const reconstructedState = await converter.convertFromAtomSpace('integration_test');
    expect(reconstructedState.hypergraph.nodes.size).toBeGreaterThan(0);
  });

  it('should maintain consistency across multiple reasoning operations', async () => {
    await converter.convertToAtomSpace(mockState, 'consistency_test');

    // Perform multiple reasoning operations
    const queries: PLNQuery[] = [
      { type: 'similarity', targets: ['node1', 'node2'], minConfidence: 0.1 },
      { type: 'inheritance', targets: ['node2', 'node3'], minConfidence: 0.1 },
      { type: 'implication', targets: ['node1', 'node3'], minConfidence: 0.1 }
    ];

    for (const query of queries) {
      const result = await converter.performReasoningQuery(query, 'consistency_test');
      expect(result.success).toBe(true);
    }

    // Check that consistency is maintained
    const consistencyResult = await converter.checkConsistency('consistency_test');
    expect(consistencyResult.score).toBeGreaterThan(0.5); // Reasonable consistency threshold
  });

  it('should handle complex agentic grammar scenarios', async () => {
    // Add agentic elements to mock state
    mockState.hypergraph.nodes.set('agent_self', createMockCognitiveNode('agent_self', 'concept'));
    mockState.hypergraph.nodes.set('grammar_rules', createMockCognitiveNode('grammar_rules', 'pattern'));
    mockState.hypergraph.edges.set('agent_grammar', createMockCognitiveEdge('agent_grammar', 'agent_self', 'grammar_rules'));

    await converter.convertToAtomSpace(mockState, 'agentic_test');

    // Test agentic reasoning
    const agenticQuery: PLNQuery = {
      type: 'evaluation',
      targets: ['agent_self', 'grammar_rules'],
      parameters: { agentic_mode: true },
      minConfidence: 0.1,
      useAttention: true
    };

    const result = await converter.performReasoningQuery(agenticQuery, 'agentic_test');
    expect(result.success).toBe(true);

    // Verify meta-cognitive insights for agentic reasoning
    expect(result.metaInsights).toBeDefined();
    expect(result.metaInsights.length).toBeGreaterThanOrEqual(0);
  });
});