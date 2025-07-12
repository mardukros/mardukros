/**
 * Sample Integration Scripts for AtomSpace and PLN Adapters
 * 
 * Demonstrates practical usage of the adapters with agentic grammar reasoning
 * and provides examples for integration with existing Marduk systems.
 */

import { KernelStateConverter } from './kernel-state-converter.js';
import { AtomSpaceAdapter } from './atomspace-adapter.js';
import { PLNAdapter, PLNQuery } from './pln-adapter.js';
import { CognitiveState, CognitiveNode, CognitiveEdge, Tensor } from '../mad9ml/types.js';

/**
 * Create sample cognitive state for demonstration
 */
export function createSampleCognitiveState(): CognitiveState {
  // Create sample tensors
  const semanticTensor: Tensor = {
    shape: [100, 512, 8],
    data: new Float32Array(100 * 512 * 8).map(() => Math.random()),
    type: 'f32',
    size: 100 * 512 * 8
  };

  const episodicTensor: Tensor = {
    shape: [50, 256, 6],
    data: new Float32Array(50 * 256 * 6).map(() => Math.random()),
    type: 'f32',
    size: 50 * 256 * 6
  };

  const proceduralTensor: Tensor = {
    shape: [30, 128, 10],
    data: new Float32Array(30 * 128 * 10).map(() => Math.random()),
    type: 'f32',
    size: 30 * 128 * 10
  };

  // Create sample cognitive nodes
  const nodes = new Map<string, CognitiveNode>();
  
  // Create concept nodes
  const concepts = ['learning', 'reasoning', 'memory', 'attention', 'goal', 'action'];
  concepts.forEach((concept, index) => {
    nodes.set(`concept_${concept}`, {
      id: `concept_${concept}`,
      type: 'concept',
      state: {
        shape: [1, 64, 4],
        data: new Float32Array([0.8, 0.9, 0.7, 0.6]),
        type: 'f32',
        size: 4
      },
      metadata: {
        name: concept,
        category: 'cognitive_function',
        confidence: 0.9,
        sti: 0.5 + index * 0.1,
        lti: 0.3 + index * 0.05,
        vlti: 0.2 + index * 0.03
      }
    });
  });

  // Create goal nodes
  const goals = ['understand_query', 'provide_answer', 'learn_patterns', 'optimize_performance'];
  goals.forEach((goal, index) => {
    nodes.set(`goal_${goal}`, {
      id: `goal_${goal}`,
      type: 'goal',
      state: {
        shape: [1, 32, 4],
        data: new Float32Array([0.9, 0.8, 0.7, 0.8]),
        type: 'f32',
        size: 4
      },
      metadata: {
        name: goal,
        category: 'system_goal',
        priority: 0.8 - index * 0.1,
        confidence: 0.85,
        sti: 0.6 + index * 0.08,
        lti: 0.4 + index * 0.05,
        vlti: 0.3 + index * 0.03
      }
    });
  });

  // Create cognitive edges
  const edges = new Map<string, CognitiveEdge>();
  
  // Create semantic relationships
  edges.set('edge_learning_memory', {
    id: 'edge_learning_memory',
    type: 'semantic',
    source: 'concept_learning',
    target: 'concept_memory',
    weight: 0.8,
    properties: {
      relationshipType: 'enables',
      confidence: 0.9,
      strength: 0.8
    }
  });

  edges.set('edge_reasoning_attention', {
    id: 'edge_reasoning_attention',
    type: 'semantic',
    source: 'concept_reasoning',
    target: 'concept_attention',
    weight: 0.7,
    properties: {
      relationshipType: 'requires',
      confidence: 0.85,
      strength: 0.7
    }
  });

  edges.set('edge_goal_action', {
    id: 'edge_goal_action',
    type: 'causal',
    source: 'goal_understand_query',
    target: 'concept_action',
    weight: 0.9,
    properties: {
      relationshipType: 'triggers',
      confidence: 0.95,
      strength: 0.9
    }
  });

  // Create clusters
  const clusters = new Map<string, string[]>();
  clusters.set('cognitive_functions', ['concept_learning', 'concept_reasoning', 'concept_memory', 'concept_attention']);
  clusters.set('system_goals', ['goal_understand_query', 'goal_provide_answer', 'goal_learn_patterns', 'goal_optimize_performance']);

  return {
    memory: {
      semantic: semanticTensor,
      episodic: episodicTensor,
      procedural: proceduralTensor,
      working: {
        shape: [20, 64, 4],
        data: new Float32Array(20 * 64 * 4).map(() => Math.random()),
        type: 'f32',
        size: 20 * 64 * 4
      }
    },
    task: {
      active: {
        shape: [10, 128, 8],
        data: new Float32Array(10 * 128 * 8).map(() => Math.random()),
        type: 'f32',
        size: 10 * 128 * 8
      },
      queue: {
        shape: [25, 64, 6],
        data: new Float32Array(25 * 64 * 6).map(() => Math.random()),
        type: 'f32',
        size: 25 * 64 * 6
      },
      attention: {
        shape: [15, 32, 4],
        data: new Float32Array(15 * 32 * 4).map(() => Math.random()),
        type: 'f32',
        size: 15 * 32 * 4
      }
    },
    persona: {
      traits: {
        shape: [20, 16, 4],
        data: new Float32Array(20 * 16 * 4).map(() => Math.random()),
        type: 'f32',
        size: 20 * 16 * 4
      },
      parameters: {
        shape: [10, 8, 4],
        data: new Float32Array(10 * 8 * 4).map(() => Math.random()),
        type: 'f32',
        size: 10 * 8 * 4
      },
      mutationCoeffs: {
        shape: [5, 4, 4],
        data: new Float32Array(5 * 4 * 4).map(() => Math.random()),
        type: 'f32',
        size: 5 * 4 * 4
      }
    },
    metaCognitive: {
      selfEval: {
        shape: [8, 16, 4],
        data: new Float32Array(8 * 16 * 4).map(() => Math.random()),
        type: 'f32',
        size: 8 * 16 * 4
      },
      adjustment: {
        shape: [12, 8, 4],
        data: new Float32Array(12 * 8 * 4).map(() => Math.random()),
        type: 'f32',
        size: 12 * 8 * 4
      },
      history: {
        shape: [50, 32, 4],
        data: new Float32Array(50 * 32 * 4).map(() => Math.random()),
        type: 'f32',
        size: 50 * 32 * 4
      }
    },
    hypergraph: {
      nodes,
      edges,
      clusters
    },
    timestamp: Date.now()
  };
}

/**
 * Basic AtomSpace conversion demonstration
 */
export async function demonstrateBasicConversion(): Promise<void> {
  console.log('🧠 Demonstrating Basic AtomSpace Conversion...\n');

  // Create sample cognitive state
  const cognitiveState = createSampleCognitiveState();
  console.log(`Created cognitive state with:`);
  console.log(`  - ${cognitiveState.hypergraph.nodes.size} cognitive nodes`);
  console.log(`  - ${cognitiveState.hypergraph.edges.size} cognitive edges`);
  console.log(`  - ${cognitiveState.hypergraph.clusters.size} clusters`);

  // Initialize converter
  const converter = new KernelStateConverter({
    includeTensorData: true,
    maxTensorSize: 50000,
    enableConsistencyCheck: true
  });

  try {
    // Convert to AtomSpace
    console.log('\n🔄 Converting kernel state to AtomSpace...');
    const conversionResult = await converter.convertToAtomSpace(cognitiveState, 'demo_state');
    
    console.log(`Conversion completed in ${conversionResult.duration}ms:`);
    console.log(`  - ${conversionResult.nodesConverted} nodes converted`);
    console.log(`  - ${conversionResult.edgesConverted} edges converted`);
    console.log(`  - ${conversionResult.atomsCreated} atoms created`);
    console.log(`  - ${conversionResult.linksCreated} links created`);
    
    if (conversionResult.errors.length > 0) {
      console.log(`  - ${conversionResult.errors.length} errors:`);
      conversionResult.errors.forEach(error => console.log(`    ❌ ${error}`));
    }
    
    if (conversionResult.warnings.length > 0) {
      console.log(`  - ${conversionResult.warnings.length} warnings:`);
      conversionResult.warnings.forEach(warning => console.log(`    ⚠️ ${warning}`));
    }

    // Get AtomSpace statistics
    const atomSpace = converter.getAtomSpaceAdapter().getAtomSpace();
    console.log(`\n📊 AtomSpace Statistics:`);
    console.log(`  - Total atoms: ${atomSpace.atoms.size}`);
    console.log(`  - Total links: ${atomSpace.links.size}`);
    console.log(`  - Atom types: ${atomSpace.typeIndex.size}`);
    console.log(`  - Named atoms: ${atomSpace.nameIndex.size}`);

    // Show sample atoms
    console.log(`\n🔍 Sample Atoms:`);
    const sampleAtoms = Array.from(atomSpace.atoms.values()).slice(0, 3);
    sampleAtoms.forEach(atom => {
      console.log(`  - ${atom.type}: ${atom.name}`);
      console.log(`    Truth: strength=${atom.truthValue.strength.toFixed(3)}, confidence=${atom.truthValue.confidence.toFixed(3)}`);
      console.log(`    Attention: STI=${atom.attentionValue.sti.toFixed(3)}, LTI=${atom.attentionValue.lti.toFixed(3)}`);
    });

  } catch (error) {
    console.error(`❌ Conversion failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * PLN reasoning demonstration
 */
export async function demonstratePLNReasoning(): Promise<void> {
  console.log('\n🧮 Demonstrating PLN Reasoning...\n');

  // Setup converter with cognitive state
  const cognitiveState = createSampleCognitiveState();
  const converter = new KernelStateConverter();
  
  try {
    // Convert to AtomSpace
    await converter.convertToAtomSpace(cognitiveState, 'reasoning_demo');
    
    console.log('🔍 Testing various reasoning queries...\n');

    // Test inheritance reasoning
    console.log('1. Inheritance Reasoning:');
    const inheritanceQuery: PLNQuery = {
      type: 'inheritance',
      targets: ['concept_learning', 'concept_memory', 'concept_reasoning'],
      parameters: { depth: 2 },
      minConfidence: 0.3,
      useAttention: true
    };

    const inheritanceResult = await converter.performReasoningQuery(inheritanceQuery, 'reasoning_demo');
    console.log(`   Found ${inheritanceResult.conclusions.length} inheritance relationships`);
    console.log(`   Overall confidence: ${inheritanceResult.confidence.toFixed(3)}`);
    console.log(`   Inference steps: ${inheritanceResult.steps.length}`);
    
    if (inheritanceResult.conclusions.length > 0) {
      const topConclusion = inheritanceResult.conclusions[0];
      console.log(`   Top conclusion: ${topConclusion.name} (strength: ${topConclusion.truthValue.strength.toFixed(3)})`);
    }

    // Test similarity reasoning
    console.log('\n2. Similarity Reasoning:');
    const similarityQuery: PLNQuery = {
      type: 'similarity',
      targets: ['concept_learning', 'concept_reasoning', 'concept_attention'],
      parameters: { threshold: 0.5 },
      minConfidence: 0.4,
      useAttention: true
    };

    const similarityResult = await converter.performReasoningQuery(similarityQuery, 'reasoning_demo');
    console.log(`   Found ${similarityResult.conclusions.length} similarity relationships`);
    console.log(`   Overall confidence: ${similarityResult.confidence.toFixed(3)}`);
    
    // Test implication reasoning
    console.log('\n3. Implication Reasoning:');
    const implicationQuery: PLNQuery = {
      type: 'implication',
      targets: ['goal_understand_query', 'concept_action', 'goal_provide_answer'],
      parameters: { temporal: true },
      minConfidence: 0.2,
      useAttention: true
    };

    const implicationResult = await converter.performReasoningQuery(implicationQuery, 'reasoning_demo');
    console.log(`   Found ${implicationResult.conclusions.length} implication relationships`);
    console.log(`   Overall confidence: ${implicationResult.confidence.toFixed(3)}`);

    // Test meta-cognitive insights
    if (implicationResult.metaInsights.length > 0) {
      console.log('\n🧠 Meta-cognitive Insights:');
      implicationResult.metaInsights.slice(0, 3).forEach(insight => {
        console.log(`   • ${insight}`);
      });
    }

    // Test conjunction reasoning
    console.log('\n4. Conjunction Reasoning:');
    const conjunctionQuery: PLNQuery = {
      type: 'conjunction',
      targets: ['concept_learning', 'concept_memory'],
      parameters: { strength_boost: 0.1 },
      minConfidence: 0.3
    };

    const conjunctionResult = await converter.performReasoningQuery(conjunctionQuery, 'reasoning_demo');
    console.log(`   Found ${conjunctionResult.conclusions.length} conjunction relationships`);
    console.log(`   Overall confidence: ${conjunctionResult.confidence.toFixed(3)}`);

  } catch (error) {
    console.error(`❌ PLN reasoning failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Bidirectional conversion demonstration
 */
export async function demonstrateBidirectionalConversion(): Promise<void> {
  console.log('\n🔄 Demonstrating Bidirectional Conversion...\n');

  const cognitiveState = createSampleCognitiveState();
  const converter = new KernelStateConverter({
    enableConsistencyCheck: true,
    confidenceThreshold: 0.4
  });

  try {
    // Forward conversion
    console.log('📤 Forward Conversion (Kernel → AtomSpace):');
    const forwardResult = await converter.convertToAtomSpace(cognitiveState, 'bidirectional_demo');
    console.log(`   Created ${forwardResult.atomsCreated} atoms and ${forwardResult.linksCreated} links`);

    // Perform some reasoning to modify AtomSpace
    console.log('\n🧮 Performing reasoning to modify AtomSpace...');
    const reasoningQuery: PLNQuery = {
      type: 'custom',
      targets: ['concept_learning', 'concept_reasoning', 'goal_understand_query'],
      parameters: { generate_new_relations: true },
      minConfidence: 0.2,
      useAttention: true
    };

    const reasoningResult = await converter.performReasoningQuery(reasoningQuery, 'bidirectional_demo');
    console.log(`   Generated ${reasoningResult.conclusions.length} new inferences`);

    // Backward conversion
    console.log('\n📥 Backward Conversion (AtomSpace → Kernel):');
    const reconstructedState = await converter.convertFromAtomSpace('bidirectional_demo');
    console.log(`   Reconstructed cognitive state with:`);
    console.log(`     - ${reconstructedState.hypergraph.nodes.size} nodes`);
    console.log(`     - ${reconstructedState.hypergraph.edges.size} edges`);
    console.log(`     - Memory tensors: ${Object.keys(reconstructedState.memory).length}`);
    console.log(`     - Task tensors: ${Object.keys(reconstructedState.task).length}`);

    // Check consistency
    console.log('\n✅ Checking Consistency:');
    const consistencyResult = await converter.checkConsistency('bidirectional_demo');
    console.log(`   Consistency score: ${consistencyResult.score.toFixed(3)}`);
    console.log(`   Atoms checked: ${consistencyResult.atomsChecked}`);
    console.log(`   Inconsistencies found: ${consistencyResult.inconsistenciesFound}`);
    
    if (consistencyResult.issues.length > 0) {
      console.log(`   Issues found:`);
      consistencyResult.issues.slice(0, 3).forEach(issue => {
        console.log(`     ⚠️ ${issue}`);
      });
    }

    if (consistencyResult.recommendations.length > 0) {
      console.log(`   Recommendations:`);
      consistencyResult.recommendations.slice(0, 2).forEach(rec => {
        console.log(`     💡 ${rec}`);
      });
    }

  } catch (error) {
    console.error(`❌ Bidirectional conversion failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Reasoning traceability demonstration
 */
export async function demonstrateReasoningTraceability(): Promise<void> {
  console.log('\n🔍 Demonstrating Reasoning Traceability...\n');

  const cognitiveState = createSampleCognitiveState();
  const converter = new KernelStateConverter({
    preserveMetadata: true,
    enableConsistencyCheck: true
  });

  try {
    // Setup AtomSpace
    await converter.convertToAtomSpace(cognitiveState, 'traceability_demo');

    // Perform complex reasoning
    console.log('🧮 Performing complex reasoning chain...');
    const complexQuery: PLNQuery = {
      type: 'custom',
      targets: ['concept_learning', 'concept_reasoning', 'concept_memory', 'goal_understand_query'],
      parameters: { 
        enable_chaining: true,
        max_chain_length: 4,
        include_meta_reasoning: true
      },
      minConfidence: 0.1,
      maxDepth: 4,
      useAttention: true
    };

    const reasoningResult = await converter.performReasoningQuery(complexQuery, 'traceability_demo');
    console.log(`   Completed reasoning with ${reasoningResult.steps.length} inference steps`);
    console.log(`   Generated ${reasoningResult.conclusions.length} conclusions`);

    // Verify traceability
    console.log('\n🔗 Verifying Reasoning Traceability:');
    const traceabilityResult = converter.verifyReasoningTraceability(reasoningResult, 'traceability_demo');
    console.log(`   Traceable: ${traceabilityResult.traceable ? '✅' : '❌'}`);
    console.log(`   Issues found: ${traceabilityResult.issues.length}`);

    if (traceabilityResult.issues.length > 0) {
      console.log('\n   🚨 Traceability Issues:');
      traceabilityResult.issues.slice(0, 3).forEach(issue => {
        console.log(`     • ${issue}`);
      });
    }

    // Show reasoning trace
    console.log('\n📋 Reasoning Trace (first 5 steps):');
    traceabilityResult.trace.slice(0, 5).forEach((trace, index) => {
      console.log(`   ${index + 1}. ${trace}`);
    });

    // Show inference steps detail
    if (reasoningResult.steps.length > 0) {
      console.log('\n🔍 Detailed Inference Steps:');
      reasoningResult.steps.slice(0, 3).forEach((step, index) => {
        console.log(`   Step ${step.stepIndex}: ${step.rule}`);
        console.log(`     Inputs: ${step.inputs.length} atoms`);
        console.log(`     Output: ${step.output}`);
        console.log(`     Confidence: ${step.confidence.toFixed(3)}`);
        console.log(`     Reasoning: ${step.reasoning}`);
      });
    }

  } catch (error) {
    console.error(`❌ Traceability demonstration failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Integration with ECAN attention demonstration
 */
export async function demonstrateECANIntegration(): Promise<void> {
  console.log('\n🎯 Demonstrating ECAN Attention Integration...\n');

  const cognitiveState = createSampleCognitiveState();
  const converter = new KernelStateConverter({
    attentionThreshold: 0.2,
    useAttention: true
  });

  try {
    // Convert with attention tracking
    console.log('🧠 Converting with ECAN attention tracking...');
    await converter.convertToAtomSpace(cognitiveState, 'ecan_demo');

    const atomSpace = converter.getAtomSpaceAdapter().getAtomSpace();
    
    // Show attention distribution
    console.log('\n📊 Attention Distribution:');
    const topAttentionAtoms = converter.getAtomSpaceAdapter().getTopAttentionAtoms(5);
    topAttentionAtoms.forEach((atom, index) => {
      const totalAttention = atom.attentionValue.sti + atom.attentionValue.lti + atom.attentionValue.vlti;
      console.log(`   ${index + 1}. ${atom.name}: ${totalAttention.toFixed(3)} (STI: ${atom.attentionValue.sti.toFixed(3)})`);
    });

    // Perform attention-guided reasoning
    console.log('\n🎯 Attention-Guided Reasoning:');
    const attentionQuery: PLNQuery = {
      type: 'similarity',
      targets: topAttentionAtoms.slice(0, 3).map(atom => atom.name),
      parameters: { attention_weighted: true },
      minConfidence: 0.2,
      useAttention: true
    };

    const attentionResult = await converter.performReasoningQuery(attentionQuery, 'ecan_demo');
    console.log(`   Found ${attentionResult.conclusions.length} attention-guided conclusions`);
    console.log(`   Average confidence: ${attentionResult.confidence.toFixed(3)}`);

    // Show attention recommendations
    if (attentionResult.metaInsights.length > 0) {
      console.log('\n💡 ECAN Recommendations:');
      const attentionInsights = attentionResult.metaInsights.filter(insight => 
        insight.includes('attention') || insight.includes('Attention')
      );
      attentionInsights.slice(0, 3).forEach(insight => {
        console.log(`   • ${insight}`);
      });
    }

    // Demonstrate attention-based filtering
    console.log('\n🔍 Attention-Based Filtering:');
    const allAtoms = Array.from(atomSpace.atoms.values());
    const highAttentionAtoms = allAtoms.filter(atom => {
      const totalAttention = atom.attentionValue.sti + atom.attentionValue.lti + atom.attentionValue.vlti;
      return totalAttention > 0.3;
    });
    
    console.log(`   Total atoms: ${allAtoms.length}`);
    console.log(`   High attention atoms (>0.3): ${highAttentionAtoms.length}`);
    console.log(`   Attention filter ratio: ${(highAttentionAtoms.length / allAtoms.length * 100).toFixed(1)}%`);

  } catch (error) {
    console.error(`❌ ECAN integration failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Agentic grammar reasoning demonstration
 */
export async function demonstrateAgenticGrammarReasoning(): Promise<void> {
  console.log('\n🤖 Demonstrating Agentic Grammar Reasoning...\n');

  // Create more complex cognitive state with agentic elements
  const cognitiveState = createSampleCognitiveState();
  
  // Add agentic nodes
  cognitiveState.hypergraph.nodes.set('agent_self', {
    id: 'agent_self',
    type: 'concept',
    state: {
      shape: [1, 32, 4],
      data: new Float32Array([1.0, 0.95, 0.9, 0.85]),
      type: 'f32',
      size: 4
    },
    metadata: {
      type: 'agent',
      role: 'cognitive_agent',
      capabilities: ['reasoning', 'learning', 'adaptation'],
      confidence: 0.95,
      sti: 1.0,
      lti: 0.8,
      vlti: 0.6
    }
  });

  cognitiveState.hypergraph.nodes.set('grammar_rules', {
    id: 'grammar_rules',
    type: 'pattern',
    state: {
      shape: [1, 64, 4],
      data: new Float32Array([0.9, 0.8, 0.7, 0.9]),
      type: 'f32',
      size: 4
    },
    metadata: {
      type: 'grammar',
      rules: ['subject_verb_object', 'conditional_logic', 'modal_reasoning'],
      confidence: 0.9,
      sti: 0.8,
      lti: 0.7,
      vlti: 0.5
    }
  });

  // Add agentic edges
  cognitiveState.hypergraph.edges.set('agent_uses_grammar', {
    id: 'agent_uses_grammar',
    type: 'associative',
    source: 'agent_self',
    target: 'grammar_rules',
    weight: 0.9,
    properties: {
      relationshipType: 'utilizes',
      confidence: 0.9,
      strength: 0.9
    }
  });

  const converter = new KernelStateConverter({
    includeMetaCognition: true,
    attentionThreshold: 0.1
  });

  try {
    // Convert agentic state
    console.log('🤖 Converting agentic cognitive state...');
    await converter.convertToAtomSpace(cognitiveState, 'agentic_demo');

    // Test agentic reasoning patterns
    console.log('\n🧠 Testing Agentic Reasoning Patterns:');
    
    // 1. Self-referential reasoning
    console.log('\n1. Self-Referential Reasoning:');
    const selfQuery: PLNQuery = {
      type: 'evaluation',
      targets: ['agent_self'],
      parameters: { self_reference: true },
      minConfidence: 0.3,
      useAttention: true
    };

    const selfResult = await converter.performReasoningQuery(selfQuery, 'agentic_demo');
    console.log(`   Self-evaluations found: ${selfResult.conclusions.length}`);
    console.log(`   Self-awareness confidence: ${selfResult.confidence.toFixed(3)}`);

    // 2. Grammar-guided reasoning
    console.log('\n2. Grammar-Guided Reasoning:');
    const grammarQuery: PLNQuery = {
      type: 'implication',
      targets: ['grammar_rules', 'concept_reasoning', 'goal_understand_query'],
      parameters: { 
        grammar_constraints: true,
        logical_structure: 'if_then_else'
      },
      minConfidence: 0.2,
      useAttention: true
    };

    const grammarResult = await converter.performReasoningQuery(grammarQuery, 'agentic_demo');
    console.log(`   Grammar-guided inferences: ${grammarResult.conclusions.length}`);
    console.log(`   Structural coherence: ${grammarResult.confidence.toFixed(3)}`);

    // 3. Agent-environment interaction
    console.log('\n3. Agent-Environment Interaction:');
    const interactionQuery: PLNQuery = {
      type: 'custom',
      targets: ['agent_self', 'concept_action', 'goal_provide_answer'],
      parameters: { 
        interaction_model: 'stimulus_response',
        context_awareness: true
      },
      minConfidence: 0.25,
      useAttention: true
    };

    const interactionResult = await converter.performReasoningQuery(interactionQuery, 'agentic_demo');
    console.log(`   Interaction patterns found: ${interactionResult.conclusions.length}`);
    console.log(`   Behavioral coherence: ${interactionResult.confidence.toFixed(3)}`);

    // Show agentic insights
    const allInsights = [
      ...selfResult.metaInsights,
      ...grammarResult.metaInsights,
      ...interactionResult.metaInsights
    ];

    if (allInsights.length > 0) {
      console.log('\n🎯 Agentic Meta-Insights:');
      const uniqueInsights = [...new Set(allInsights)];
      uniqueInsights.slice(0, 4).forEach(insight => {
        console.log(`   • ${insight}`);
      });
    }

    // Test consistency across agentic grammar
    console.log('\n✅ Agentic Grammar Consistency Check:');
    const consistencyResult = await converter.checkConsistency('agentic_demo');
    console.log(`   Overall consistency: ${consistencyResult.score.toFixed(3)}`);
    console.log(`   Agentic coherence: ${consistencyResult.score > 0.8 ? '✅ High' : consistencyResult.score > 0.6 ? '⚠️ Medium' : '❌ Low'}`);

  } catch (error) {
    console.error(`❌ Agentic grammar reasoning failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Complete integration demonstration
 */
export async function runCompleteIntegrationDemo(): Promise<void> {
  console.log('🚀 OpenCog AtomSpace & PLN Integration Demo\n');
  console.log('=' .repeat(60) + '\n');

  try {
    await demonstrateBasicConversion();
    await demonstratePLNReasoning();
    await demonstrateBidirectionalConversion();
    await demonstrateReasoningTraceability();
    await demonstrateECANIntegration();
    await demonstrateAgenticGrammarReasoning();

    console.log('\n🎉 All demonstrations completed successfully!');
    console.log('\nThe AtomSpace and PLN adapters provide:');
    console.log('  ✅ Bidirectional kernel state conversion');
    console.log('  ✅ Probabilistic logic reasoning');
    console.log('  ✅ Attention-guided inference');
    console.log('  ✅ Reasoning traceability');
    console.log('  ✅ Consistency verification');
    console.log('  ✅ Agentic grammar support');
    console.log('  ✅ Meta-cognitive insights');

  } catch (error) {
    console.error(`❌ Integration demo failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Export all demo functions for individual testing
export {
  demonstrateBasicConversion,
  demonstratePLNReasoning,
  demonstrateBidirectionalConversion,
  demonstrateReasoningTraceability,
  demonstrateECANIntegration,
  demonstrateAgenticGrammarReasoning,
  runCompleteIntegrationDemo
};