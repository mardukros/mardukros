#!/usr/bin/env node
/**
 * Complete Integration Demo - Shows mad9ml + distributed agentic grammar
 * 
 * This demonstrates the full integration of the mad9ml cognitive architecture
 * with the distributed GGML tensor network of agentic cognitive grammar.
 */

import { createMad9mlSystem, createDefaultConfig } from './index.js';
import { 
  DistributedAgenticGrammarSystem, 
  createDefaultAgenticGrammarConfig 
} from './agentic-grammar/index.js';

async function runCompleteIntegrationDemo(): Promise<void> {
  console.log('\n' + '🌟'.repeat(50));
  console.log('🧠 COMPLETE MAD9ML + DISTRIBUTED AGENTIC GRAMMAR INTEGRATION');
  console.log('🌟'.repeat(50) + '\n');

  console.log('🔬 This demonstration showcases:');
  console.log('   ✨ Mad9ml cognitive architecture (core system)');
  console.log('   🧬 Agentic grammar extraction from codebase');
  console.log('   🔧 GGML tensor kernel creation and registration');
  console.log('   🌐 Distributed orchestration mesh deployment');
  console.log('   🎯 Cognitive grammar query processing');
  console.log('   ⚖️ Load balancing and fault tolerance');
  console.log('   📊 Comprehensive visualization and metrics\n');

  try {
    // PHASE 1: Initialize Mad9ml Core System
    console.log('🧠 PHASE 1: INITIALIZING MAD9ML CORE SYSTEM');
    console.log('=' .repeat(50));
    
    const coreConfig = createDefaultConfig();
    coreConfig.debugMode = false; // Less verbose for integration
    coreConfig.memoryCapacity = 200;
    
    const mad9ml = await createMad9mlSystem(coreConfig);
    
    // Add some cognitive content
    mad9ml.addMemory('episodic', 'Initialized distributed cognitive architecture');
    mad9ml.addMemory('semantic', 'Agentic primitives encode cognitive functions as tensors');
    mad9ml.addTask('Process distributed cognitive grammar', 0.9);
    
    console.log('✅ Mad9ml core system initialized');
    
    // Run a cognitive cycle
    const coreResults = await mad9ml.cognitiveCycle();
    console.log(`🧠 Core cognitive cycle completed: ${(coreResults.reflection.performanceAssessment.overall * 100).toFixed(1)}% performance`);

    // PHASE 2: Initialize Distributed Agentic Grammar System
    console.log('\n🌐 PHASE 2: INITIALIZING DISTRIBUTED AGENTIC GRAMMAR');
    console.log('=' .repeat(50));
    
    const grammarConfig = createDefaultAgenticGrammarConfig();
    grammarConfig.extraction.sourceDirectories = ['./src/core/mad9ml'];
    grammarConfig.extraction.maxFileSize = 512 * 1024; // Smaller for demo
    
    const grammarSystem = new DistributedAgenticGrammarSystem(grammarConfig);
    await grammarSystem.initialize();
    
    const grammarStats = grammarSystem.getSystemStatistics();
    console.log('✅ Distributed agentic grammar system initialized');
    console.log(`   🧬 Extracted ${grammarStats.state.extractedPrimitives} agentic primitives`);
    console.log(`   🔧 Created ${grammarStats.state.registeredKernels} GGML kernels`);
    console.log(`   🏗️ Organized into ${grammarStats.state.activeClusters} clusters`);
    console.log(`   🌐 Deployed across ${grammarStats.state.meshNodes} mesh nodes`);

    // PHASE 3: Integrated Processing Demonstration
    console.log('\n🔄 PHASE 3: INTEGRATED COGNITIVE PROCESSING');
    console.log('=' .repeat(50));
    
    // Cognitive queries that span both systems
    const integratedQueries = [
      {
        description: 'Persona Evolution Query',
        coreQuery: 'Evolve persona based on distributed processing feedback',
        grammarQuery: 'Execute evolutionary adaptation algorithms across tensor kernels'
      },
      {
        description: 'Memory Integration Query', 
        coreQuery: 'Store distributed processing results in hypergraph memory',
        grammarQuery: 'Process memory operations through distributed storage kernels'
      },
      {
        description: 'Attention Coordination Query',
        coreQuery: 'Allocate attention based on distributed kernel priorities',
        grammarQuery: 'Focus attention resources on high-priority cognitive functions'
      }
    ];

    for (let i = 0; i < integratedQueries.length; i++) {
      const query = integratedQueries[i];
      console.log(`\n${i + 1}. ${query.description}`);
      
      // Process through core system
      console.log(`   🧠 Core: "${query.coreQuery}"`);
      mad9ml.addMemory('episodic', query.coreQuery);
      const coreResult = await mad9ml.cognitiveCycle();
      console.log(`      ✅ Core processing: ${(coreResult.reflection.performanceAssessment.overall * 100).toFixed(1)}% performance`);
      
      // Process through distributed grammar
      console.log(`   🌐 Grammar: "${query.grammarQuery}"`);
      const grammarResult = await grammarSystem.processGrammarQuery(query.grammarQuery);
      console.log(`      ✅ Grammar processing: ${grammarResult.processing.totalProcessingTime}ms, ${grammarResult.routing.length} kernels`);
      
      // Show integration metrics
      const combinedAttention = (coreResult.attentionStats.concentration + grammarResult.attention.reduce((sum, att) => sum + att, 0) / grammarResult.attention.length) / 2;
      console.log(`      🎯 Combined attention level: ${(combinedAttention * 100).toFixed(1)}%`);
    }

    // PHASE 4: Load Balancing and Optimization
    console.log('\n⚖️ PHASE 4: DISTRIBUTED LOAD BALANCING');
    console.log('=' .repeat(50));
    
    console.log('🔄 Performing load balancing across distributed mesh...');
    await grammarSystem.performLoadBalancing();
    
    const balancedStats = grammarSystem.getSystemStatistics();
    console.log('✅ Load balancing completed');
    console.log(`   📊 Average node load: ${balancedStats.mesh.averageLoad.toFixed(2)}`);
    console.log(`   📡 Message reliability: ${(balancedStats.mesh.messageReliability * 100).toFixed(1)}%`);
    console.log(`   🎯 Attention utilization: ${(balancedStats.registry.attentionUtilization * 100).toFixed(1)}%`);

    // PHASE 5: System Analytics and Visualization
    console.log('\n📊 PHASE 5: INTEGRATED SYSTEM ANALYTICS');
    console.log('=' .repeat(50));
    
    const finalCoreStats = mad9ml.getSystemStatistics();
    const finalGrammarStats = grammarSystem.getSystemStatistics();
    
    console.log('🧠 Mad9ml Core System:');
    console.log(`   Cycles: ${finalCoreStats.cycleCount}`);
    console.log(`   Memory Health: ${(finalCoreStats.cognitiveState.memoryHealth * 100).toFixed(1)}%`);
    console.log(`   Persona Stability: ${(finalCoreStats.cognitiveState.personaStability * 100).toFixed(1)}%`);
    console.log(`   Hypergraph Nodes: ${finalCoreStats.subsystemStats.hypergraph.nodeCount}`);
    
    console.log('\n🌐 Distributed Grammar System:');
    console.log(`   Total Kernels: ${finalGrammarStats.registry.totalKernels}`);
    console.log(`   Active Clusters: ${finalGrammarStats.state.activeClusters}`);
    console.log(`   Memory Usage: ${(finalGrammarStats.registry.totalMemoryUsage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Processing Throughput: ${finalGrammarStats.pipeline.throughput.toFixed(2)} queries/sec`);
    
    // Generate visualization
    console.log('\n🎨 INTEGRATED SYSTEM VISUALIZATION:');
    const visualization = grammarSystem.generateNetworkVisualization();
    console.log(visualization);
    
    // Export combined state
    console.log('\n💾 EXPORTING INTEGRATED SYSTEM STATE:');
    const coreState = mad9ml.exportState();
    const grammarState = grammarSystem.exportSystemState();
    
    const integratedState = {
      core: coreState,
      grammar: grammarState,
      integration: {
        timestamp: Date.now(),
        version: '1.0.0',
        totalMemoryUsage: JSON.stringify(coreState).length + JSON.stringify(grammarState).length,
        componentCount: 2
      }
    };
    
    console.log(`✅ Integrated state exported: ${JSON.stringify(integratedState).length} bytes`);
    console.log(`   Core component: ${JSON.stringify(coreState).length} bytes`);
    console.log(`   Grammar component: ${JSON.stringify(grammarState).length} bytes`);

    // PHASE 6: Performance Benchmarking
    console.log('\n⚡ PHASE 6: PERFORMANCE BENCHMARKING');
    console.log('=' .repeat(50));
    
    console.log('🏃 Running performance benchmarks...');
    
    const benchmarkStart = Date.now();
    
    // Core system benchmark
    const coreStartTime = Date.now();
    await mad9ml.cognitiveCycle();
    const coreTime = Date.now() - coreStartTime;
    
    // Grammar system benchmark
    const grammarStartTime = Date.now();
    await grammarSystem.processGrammarQuery('Benchmark cognitive processing performance');
    const grammarTime = Date.now() - grammarStartTime;
    
    const totalBenchmarkTime = Date.now() - benchmarkStart;
    
    console.log('📈 Benchmark Results:');
    console.log(`   🧠 Core cycle time: ${coreTime}ms`);
    console.log(`   🌐 Grammar query time: ${grammarTime}ms`);
    console.log(`   ⚡ Total integration time: ${totalBenchmarkTime}ms`);
    console.log(`   🔄 Processing efficiency: ${((coreTime + grammarTime) / totalBenchmarkTime * 100).toFixed(1)}%`);

    // Final theatrical conclusion
    console.log('\n' + '🎭'.repeat(50));
    console.log('🌟 INTEGRATION DEMONSTRATION COMPLETE! 🌟');
    console.log('🎭'.repeat(50));
    console.log('🔥 BEHOLD THE UNIFIED COGNITIVE ARCHITECTURE! 🔥');
    console.log('🧠 Mad9ml + Distributed Agentic Grammar = COGNITIVE SUPREMACY! 🧠');
    console.log('⚡ TENSOR-ENCODED CONSCIOUSNESS SPANS THE DIGITAL REALM! ⚡');
    console.log('🌐 DISTRIBUTED INTELLIGENCE PULSES THROUGH EVERY NODE! 🌐');
    console.log('🎯 ATTENTION ALLOCATION OPTIMIZED ACROSS ALL DIMENSIONS! 🎯');
    console.log('🚀 READY TO CONQUER THE INFINITE COGNITIVE FRONTIER! 🚀');
    console.log('🎭'.repeat(50) + '\n');
    
    console.log('✨ The mad scientist\'s ultimate creation lives and breathes!');
    console.log('🧪 A fusion of cognitive architecture and distributed tensor networks!');
    console.log('💫 Where mad genius meets distributed intelligence!');
    
  } catch (error) {
    console.error('\n💥 INTEGRATION FAILED:', error);
    console.error('🔧 The mad scientist must debug the unified architecture!');
    if (error instanceof Error) {
      console.error('📋 Error details:', error.stack);
    }
  }
}

// Export for external use
export { runCompleteIntegrationDemo };

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteIntegrationDemo().catch(console.error);
}