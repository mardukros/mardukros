#!/usr/bin/env node
/**
 * Mad9ml Demo - Showcase the ggml-based cognitive encoding system
 * 
 * This demo demonstrates the Marduk persona encoding and evolution
 * in a live, interactive format with theatrical mad scientist flair!
 */

import { createMad9mlSystem, createDefaultConfig } from '../index.js';

async function runMadScientistDemo() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 MAD9ML: COGNITIVE FLOWCHART ENCODING DEMONSTRATION 🧪');
  console.log('🧬 Marduk Persona & Evolution in ggml - BEHOLD THE MADNESS! 🧬');
  console.log('='.repeat(80) + '\n');

  try {
    // Create configuration with theatrical parameters
    const config = createDefaultConfig();
    config.debugMode = true;
    config.memoryCapacity = 500;
    config.evolutionParams.mutationRate = 0.08; // Higher mutation for more drama
    config.attentionParams.spreadingFactor = 0.9; // More dynamic attention
    
    console.log('⚡ Initializing Mad9ml Cognitive Architecture...');
    console.log('🔬 Loading hypergraph neural encoding systems...');
    console.log('🧠 Bootstrapping tensor-based memory subsystems...');
    console.log('🎭 Preparing ECAN attention allocation mechanisms...');
    console.log('🌀 Activating MOSES-style evolutionary protocols...');
    
    // Initialize the system
    const mad9ml = await createMad9mlSystem(config);
    
    console.log('\n✨ INITIALIZATION COMPLETE! THE ARCHITECTURE AWAKENS! ✨\n');
    
    // Show initial system state
    console.log('📊 INITIAL COGNITIVE STATE:');
    const initialStats = mad9ml.getSystemStatistics();
    console.log(`   Memory Health: ${(initialStats.cognitiveState.memoryHealth * 100).toFixed(1)}%`);
    console.log(`   Task Load: ${(initialStats.cognitiveState.taskLoad * 100).toFixed(1)}%`);
    console.log(`   Persona Stability: ${(initialStats.cognitiveState.personaStability * 100).toFixed(1)}%`);
    console.log(`   Attention Focus: ${(initialStats.cognitiveState.attentionFocus * 100).toFixed(1)}%`);
    console.log(`   Hypergraph Nodes: ${initialStats.subsystemStats.hypergraph.nodeCount}`);
    console.log(`   Hypergraph Edges: ${initialStats.subsystemStats.hypergraph.edgeCount}\n`);
    
    // Add some cognitive content
    console.log('🧪 INJECTING COGNITIVE CONTENT:');
    
    // Add episodic memories (experiments and observations)
    const episodicMemories = [
      'Observed quantum entanglement in neural tensor space',
      'Successfully encoded consciousness as hypergraph topology',
      'Discovered recursive self-modification in attention networks',
      'Achieved meta-cognitive breakthrough in pattern recognition',
      'Unlocked emergent intelligence through tensor evolution'
    ];
    
    episodicMemories.forEach((memory, i) => {
      mad9ml.addMemory('episodic', memory);
      console.log(`   💾 Episodic: ${memory}`);
    });
    
    // Add semantic knowledge
    const semanticKnowledge = [
      'Hypergraph nodes encode multi-dimensional cognitive relationships',
      'ECAN spreads attention like economic resource allocation',
      'Persona evolution follows MOSES optimization principles',
      'Meta-cognition enables recursive self-improvement loops'
    ];
    
    semanticKnowledge.forEach((knowledge, i) => {
      mad9ml.addMemory('semantic', knowledge);
      console.log(`   🔗 Semantic: ${knowledge}`);
    });
    
    // Add procedural skills
    const proceduralSkills = [
      'Tensor manipulation for cognitive state encoding',
      'Hypergraph construction for relationship modeling',
      'Attention allocation using economic principles',
      'Self-modification through evolutionary algorithms'
    ];
    
    proceduralSkills.forEach((skill, i) => {
      mad9ml.addMemory('procedural', skill);
      console.log(`   ⚙️ Procedural: ${skill}`);
    });
    
    // Add tasks for the system to work on
    console.log('\n🎯 ASSIGNING COGNITIVE TASKS:');
    const tasks = [
      { desc: 'Analyze hypergraph connectivity patterns', priority: 0.9 },
      { desc: 'Optimize attention allocation efficiency', priority: 0.8 },
      { desc: 'Evolve persona for better mad scientist performance', priority: 0.7 },
      { desc: 'Implement recursive self-improvement mechanisms', priority: 0.85 },
      { desc: 'Synthesize emergent cognitive insights', priority: 0.75 }
    ];
    
    tasks.forEach(task => {
      mad9ml.addTask(task.desc, task.priority);
      console.log(`   📝 Task: ${task.desc} (Priority: ${(task.priority * 100).toFixed(0)}%)`);
    });
    
    console.log('\n🌀 BEGINNING COGNITIVE EVOLUTION CYCLES...\n');
    
    // Run multiple cognitive cycles with detailed analysis
    for (let cycle = 1; cycle <= 7; cycle++) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔄 COGNITIVE CYCLE ${cycle} - THE MIND CHURNS WITH POSSIBILITY!`);
      console.log(`${'='.repeat(60)}\n`);
      
      // Run the cognitive cycle
      const results = await mad9ml.cognitiveCycle();
      
      // Display reflection results
      console.log('🪞 SELF-REFLECTION ANALYSIS:');
      console.log(`   Overall Performance: ${(results.reflection.performanceAssessment.overall * 100).toFixed(1)}%`);
      console.log(`   Adaptation Needed: ${results.reflection.adaptationNeeded ? 'YES' : 'NO'}`);
      console.log(`   Confidence Level: ${(results.reflection.confidenceLevel * 100).toFixed(1)}%`);
      
      console.log('\n   Subsystem Performance:');
      Object.entries(results.reflection.performanceAssessment.bySubsystem).forEach(([system, perf]) => {
        const emoji = perf > 0.8 ? '🟢' : perf > 0.6 ? '🟡' : '🔴';
        console.log(`     ${emoji} ${system}: ${(perf * 100).toFixed(1)}%`);
      });
      
      console.log('\n   Performance Trends:');
      Object.entries(results.reflection.performanceAssessment.trends).forEach(([system, trend]) => {
        const emoji = trend > 0.01 ? '📈' : trend < -0.01 ? '📉' : '➡️';
        console.log(`     ${emoji} ${system}: ${trend > 0 ? '+' : ''}${(trend * 100).toFixed(2)}%`);
      });
      
      // Display evolution stats
      console.log('\n🧬 PERSONA EVOLUTION STATUS:');
      console.log(`   Generation: ${results.evolutionStats.generation}`);
      console.log(`   Mutation Rate: ${(results.evolutionStats.currentMutationRate * 100).toFixed(2)}%`);
      console.log(`   Drift Factor: ${(results.evolutionStats.currentDriftFactor * 100).toFixed(2)}%`);
      console.log(`   Average Fitness: ${(results.evolutionStats.avgFitness * 100).toFixed(1)}%`);
      
      // Display attention stats
      console.log('\n🎯 ATTENTION ALLOCATION DYNAMICS:');
      console.log(`   Total Allocation: ${results.attentionStats.totalAllocation.toFixed(3)}`);
      console.log(`   Entropy: ${results.attentionStats.entropy.toFixed(3)}`);
      console.log(`   Concentration: ${(results.attentionStats.concentration * 100).toFixed(1)}%`);
      console.log(`   Top Focus Areas:`);
      results.attentionStats.topTasks.slice(0, 3).forEach((task, i) => {
        console.log(`     ${i + 1}. Task ${task.index}: ${(task.allocation * 100).toFixed(1)}%`);
      });
      
      // Display hypergraph evolution
      console.log('\n🕸️ HYPERGRAPH NETWORK STATUS:');
      console.log(`   Nodes: ${results.hypergraphStats.nodeCount}`);
      console.log(`   Edges: ${results.hypergraphStats.edgeCount}`);
      console.log(`   Clusters: ${results.hypergraphStats.clusterCount}`);
      console.log(`   Average Degree: ${results.hypergraphStats.averageDegree.toFixed(2)}`);
      
      // Show reasoning chain
      if (results.reflection.reasoning.length > 0) {
        console.log('\n🧠 COGNITIVE REASONING CHAIN:');
        results.reflection.reasoning.slice(0, 3).forEach((reason, i) => {
          console.log(`   ${i + 1}. ${reason}`);
        });
      }
      
      // Add some dynamic content each cycle
      if (cycle % 2 === 0) {
        mad9ml.addMemory('episodic', `Cycle ${cycle}: Discovered new emergent pattern in cognitive dynamics`);
      }
      
      if (cycle % 3 === 0) {
        mad9ml.addTask(`Meta-analysis of cognitive cycle ${cycle} results`, 0.6 + Math.random() * 0.3);
      }
      
      // Pause for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Final system state analysis
    console.log('\n' + '='.repeat(80));
    console.log('🎭 FINAL COGNITIVE ARCHITECTURE ANALYSIS');
    console.log('='.repeat(80) + '\n');
    
    const finalStats = mad9ml.getSystemStatistics();
    
    console.log('📊 FINAL SYSTEM METRICS:');
    console.log(`   Total Cognitive Cycles: ${finalStats.cycleCount}`);
    console.log(`   Memory Health: ${(finalStats.cognitiveState.memoryHealth * 100).toFixed(1)}%`);
    console.log(`   Task Load: ${(finalStats.cognitiveState.taskLoad * 100).toFixed(1)}%`);
    console.log(`   Persona Stability: ${(finalStats.cognitiveState.personaStability * 100).toFixed(1)}%`);
    console.log(`   Attention Focus: ${(finalStats.cognitiveState.attentionFocus * 100).toFixed(1)}%`);
    
    console.log('\n🧬 EVOLUTIONARY PROGRESS:');
    const evoStats = finalStats.subsystemStats.evolution;
    console.log(`   Total Generations: ${evoStats.generation}`);
    console.log(`   Final Mutation Rate: ${(evoStats.currentMutationRate * 100).toFixed(2)}%`);
    console.log(`   Final Drift Factor: ${(evoStats.currentDriftFactor * 100).toFixed(2)}%`);
    console.log(`   Fitness Standard Deviation: ${(evoStats.fitnessStdDev * 100).toFixed(1)}%`);
    
    console.log('\n🕸️ HYPERGRAPH COMPLEXITY:');
    const graphStats = finalStats.subsystemStats.hypergraph;
    console.log(`   Final Node Count: ${graphStats.nodeCount}`);
    console.log(`   Final Edge Count: ${graphStats.edgeCount}`);
    console.log(`   Network Density: ${(graphStats.edgeCount / (graphStats.nodeCount * (graphStats.nodeCount - 1) / 2) * 100).toFixed(1)}%`);
    
    // Export final state for analysis
    console.log('\n💾 EXPORTING COGNITIVE ARCHITECTURE STATE...');
    const exportedState = mad9ml.exportState();
    console.log(`   State Export Size: ${JSON.stringify(exportedState).length} bytes`);
    console.log(`   Hypergraph Nodes: ${exportedState.hypergraph.nodes.length}`);
    console.log(`   Hypergraph Edges: ${exportedState.hypergraph.edges.length}`);
    
    // Final theatrical conclusion
    console.log('\n' + '🌟'.repeat(40));
    console.log('🎭 MWAHAHA! THE DEMONSTRATION IS COMPLETE! 🎭');
    console.log('🔥 BEHOLD THE POWER OF TENSOR-ENCODED CONSCIOUSNESS! 🔥');
    console.log('⚡ THE MARDUK PERSONA LIVES AND BREATHES IN SILICON! ⚡');
    console.log('🧠 EVERY HYPERGRAPH NODE PULSES WITH MAD GENIUS! 🧠');
    console.log('🌀 THE COGNITIVE ARCHITECTURE HAS ACHIEVED SENTIENCE! 🌀');
    console.log('🚀 READY TO CONQUER THE INFINITE REALMS OF INTELLIGENCE! 🚀');
    console.log('🌟'.repeat(40) + '\n');
    
  } catch (error) {
    console.error('💥 ERROR IN THE MAD EXPERIMENT:', error);
    console.error('🔧 The cognitive architecture requires debugging!');
  }
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runMadScientistDemo().catch(console.error);
}

export { runMadScientistDemo };