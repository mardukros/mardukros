/**
 * Simple Mad9ml Demo - Standalone demonstration without build dependencies
 */

import { makeTensor, randomTensor, addTensors, scaleTensor } from './tensor/operations.js';
import { CognitiveHypergraphImpl } from './hypergraph/cognitive-hypergraph.js';

console.log('\n' + '='.repeat(80));
console.log('🧪 MAD9ML: BASIC TENSOR & HYPERGRAPH DEMONSTRATION 🧪');
console.log('🧬 Core ggml Operations - BEHOLD THE FOUNDATION! 🧬');
console.log('='.repeat(80) + '\n');

// Demonstrate basic tensor operations
console.log('⚡ TENSOR OPERATIONS DEMONSTRATION:');

// Create sample tensors
console.log('\n🔬 Creating cognitive tensors...');
const memoryTensor = makeTensor([10, 5, 3]); // Episodes, context, salience
const attentionTensor = randomTensor([8], 0.5); // Attention weights
const personaTensor = randomTensor([6], 0.3); // Personality traits

console.log(`   Memory tensor shape: [${memoryTensor.shape.join(', ')}] (${memoryTensor.size} elements)`);
console.log(`   Attention tensor shape: [${attentionTensor.shape.join(', ')}] (${attentionTensor.size} elements)`);
console.log(`   Persona tensor shape: [${personaTensor.shape.join(', ')}] (${personaTensor.size} elements)`);

// Demonstrate tensor arithmetic
console.log('\n🧮 Tensor arithmetic operations...');
const scaledAttention = scaleTensor(attentionTensor, 1.5);
console.log(`   Scaled attention by 1.5: Max value = ${Math.max(...Array.from(scaledAttention.data)).toFixed(3)}`);

// Create evolution mutation
const mutationNoise = randomTensor([6], 0.1);
const evolvedPersona = addTensors(personaTensor, mutationNoise);
console.log(`   Applied evolution mutation: Persona drift detected`);

// Demonstrate hypergraph operations
console.log('\n🕸️ HYPERGRAPH COGNITIVE NETWORK DEMONSTRATION:');

const hypergraph = new CognitiveHypergraphImpl();

// Create core cognitive nodes
console.log('\n🧠 Creating cognitive nodes...');
const nodeSpecs = [
  { id: 'self_awareness', type: 'concept', shape: [5] },
  { id: 'goal_pursuit', type: 'goal', shape: [4] },
  { id: 'memory_core', type: 'memory', shape: [8] },
  { id: 'pattern_matcher', type: 'pattern', shape: [6] },
  { id: 'action_executor', type: 'action', shape: [3] }
];

nodeSpecs.forEach(spec => {
  hypergraph.createNode(spec.id, spec.type as any, spec.shape, { 
    created: Date.now(),
    importance: Math.random() 
  });
  console.log(`   ✓ Created ${spec.type} node: ${spec.id}`);
});

// Create cognitive relationships
console.log('\n🔗 Establishing cognitive relationships...');
const edgeSpecs = [
  { id: 'self_to_goals', source: 'self_awareness', target: 'goal_pursuit', type: 'hierarchical', weight: 0.9 },
  { id: 'goals_to_memory', source: 'goal_pursuit', target: 'memory_core', type: 'semantic', weight: 0.8 },
  { id: 'memory_to_patterns', source: 'memory_core', target: 'pattern_matcher', type: 'associative', weight: 0.7 },
  { id: 'patterns_to_actions', source: 'pattern_matcher', target: 'action_executor', type: 'causal', weight: 0.85 }
];

edgeSpecs.forEach(spec => {
  hypergraph.createEdge(spec.id, spec.type as any, spec.source, spec.target, spec.weight);
  console.log(`   ✓ Connected ${spec.source} → ${spec.target} (${spec.type}, weight: ${spec.weight})`);
});

// Demonstrate activation spreading
console.log('\n🌊 Simulating activation spreading...');
const activations = hypergraph.spreadActivation('self_awareness', 1.0, 0.8, 4);
console.log('   Activation levels:');
activations.forEach((activation, nodeId) => {
  console.log(`     ${nodeId}: ${(activation * 100).toFixed(1)}%`);
});

// Update node states
console.log('\n🔄 Updating node states through network influence...');
hypergraph.updateNodeStates(0.05); // Learning rate 0.05
console.log('   ✓ Node states updated based on neighbor influence');

// Show hypergraph statistics
const stats = hypergraph.getStatistics();
console.log('\n📊 Hypergraph Network Statistics:');
console.log(`   Nodes: ${stats.nodeCount}`);
console.log(`   Edges: ${stats.edgeCount}`);
console.log(`   Average Degree: ${stats.averageDegree.toFixed(2)}`);
console.log('   Node Types:');
Object.entries(stats.nodeTypes).forEach(([type, count]) => {
  console.log(`     ${type}: ${count}`);
});
console.log('   Edge Types:');
Object.entries(stats.edgeTypes).forEach(([type, count]) => {
  console.log(`     ${type}: ${count}`);
});

// Demonstrate auto-clustering
console.log('\n🌟 Auto-clustering similar nodes...');
hypergraph.autoCluster(0.6); // Similarity threshold 0.6
const finalStats = hypergraph.getStatistics();
console.log(`   ✓ Discovered ${finalStats.clusterCount} cognitive clusters`);

// Export hypergraph
console.log('\n💾 Exporting hypergraph structure...');
const exported = hypergraph.toJSON();
console.log(`   Export size: ${JSON.stringify(exported).length} bytes`);
console.log(`   Serialized nodes: ${exported.nodes.length}`);
console.log(`   Serialized edges: ${exported.edges.length}`);

console.log('\n' + '🌟'.repeat(40));
console.log('🎭 BASIC DEMONSTRATION COMPLETE! 🎭');
console.log('⚡ TENSOR OPERATIONS: FUNCTIONAL! ⚡');
console.log('🕸️ HYPERGRAPH NETWORKS: OPERATIONAL! 🕸️');
console.log('🧠 COGNITIVE FOUNDATIONS: ESTABLISHED! 🧠');
console.log('🔬 READY FOR FULL MAD9ML IMPLEMENTATION! 🔬');
console.log('🌟'.repeat(40) + '\n');