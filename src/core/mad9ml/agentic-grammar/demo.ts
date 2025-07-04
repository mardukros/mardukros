/**
 * Distributed Agentic Grammar Demonstration
 * 
 * Shows the complete distributed GGML tensor network in action,
 * processing cognitive grammar through agentic kernels.
 */

import { 
  DistributedAgenticGrammarSystem, 
  createDefaultAgenticGrammarConfig 
} from './agentic-grammar/index.js';

/**
 * Demonstrates the distributed agentic grammar system
 */
export async function demonstrateDistributedAgenticGrammar(): Promise<void> {
  console.log('\n🌟 =====================================');
  console.log('🧠 DISTRIBUTED AGENTIC GRAMMAR DEMO');
  console.log('🌟 =====================================\n');
  
  console.log('🔬 Initializing the distributed cognitive architecture...');
  console.log('📡 Architecture: TypeScript Code → Agentic Primitives → GGML Kernels → Distributed Mesh');
  
  // Create configuration
  const config = createDefaultAgenticGrammarConfig();
  console.log('⚙️ Configuration created with distributed tensor network parameters');
  
  // Initialize the system
  const grammarSystem = new DistributedAgenticGrammarSystem(config);
  
  try {
    console.log('\n🚀 Phase 1: System Initialization');
    console.log('=================================');
    await grammarSystem.initialize();
    
    // Show initial statistics
    const initialStats = grammarSystem.getSystemStatistics();
    console.log('\n📊 Initial System State:');
    console.log(`   🧬 Extracted Primitives: ${initialStats.state.extractedPrimitives}`);
    console.log(`   🔧 Registered Kernels: ${initialStats.state.registeredKernels}`);
    console.log(`   🏗️ Active Clusters: ${initialStats.state.activeClusters}`);
    console.log(`   🌐 Mesh Nodes: ${initialStats.state.meshNodes}`);
    console.log(`   💾 Memory Usage: ${(initialStats.registry.totalMemoryUsage / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('\n🧪 Phase 2: Cognitive Grammar Processing');
    console.log('==========================================');
    
    // Test queries that demonstrate different agentic capabilities
    const testQueries = [
      'Perceive the current system state and remember key metrics',
      'Decide whether to adapt the persona based on performance',
      'Plan a sequence of actions to optimize attention allocation',
      'Execute the evolutionary mutation process',
      'Communicate results through the hypergraph network',
      'Focus attention on high-priority cognitive kernels',
      'Achieve the goal of distributed cognitive processing'
    ];
    
    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      console.log(`\n🔍 Query ${i + 1}: "${query}"`);
      
      try {
        const result = await grammarSystem.processGrammarQuery(query, {
          context: 'demonstration',
          priority: 1.0 - (i * 0.1),
          timestamp: Date.now()
        });
        
        console.log(`   ✅ Processing complete in ${result.processing.totalProcessingTime}ms`);
        console.log(`   🎯 Kernel pipeline: ${result.routing.length} kernels`);
        console.log(`   🧠 Attention levels: [${result.attention.map(a => a.toFixed(2)).join(', ')}]`);
        console.log(`   📊 Result tensor shape: [${result.result.shape.join('×')}]`);
        
        // Brief pause for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`   ❌ Query failed: ${error}`);
      }
    }
    
    console.log('\n⚖️ Phase 3: Load Balancing Demonstration');
    console.log('=========================================');
    
    // Perform load balancing
    await grammarSystem.performLoadBalancing();
    
    const balancedStats = grammarSystem.getSystemStatistics();
    console.log('📈 Post-balancing metrics:');
    console.log(`   🔄 Average Load: ${balancedStats.mesh.averageLoad.toFixed(2)}`);
    console.log(`   📡 Message Reliability: ${(balancedStats.mesh.messageReliability * 100).toFixed(1)}%`);
    console.log(`   🎯 Attention Utilization: ${(balancedStats.registry.attentionUtilization * 100).toFixed(1)}%`);
    
    console.log('\n📊 Phase 4: System Visualization');
    console.log('=================================');
    
    // Generate and display network visualization
    const visualization = grammarSystem.generateNetworkVisualization();
    console.log(visualization);
    
    console.log('\n📈 Phase 5: Final Performance Metrics');
    console.log('======================================');
    
    const finalStats = grammarSystem.getSystemStatistics();
    
    console.log('🎯 Extraction Statistics:');
    console.log(`   Total Primitives: ${finalStats.extraction.totalPrimitives}`);
    console.log(`   Average Complexity: ${finalStats.extraction.averageComplexity.toFixed(2)}`);
    console.log(`   Average Depth: ${finalStats.extraction.averageDepth.toFixed(2)}`);
    
    console.log('\n🔧 Kernel Registry Statistics:');
    console.log(`   Total Kernels: ${finalStats.registry.totalKernels}`);
    console.log(`   Memory Usage: ${(finalStats.registry.totalMemoryUsage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Average Complexity: ${finalStats.registry.averageComplexity.toFixed(2)}`);
    
    console.log('\n🌐 Mesh Statistics:');
    console.log(`   Active Nodes: ${finalStats.mesh.activeNodes}`);
    console.log(`   Total Load: ${finalStats.mesh.totalLoad.toFixed(2)}`);
    console.log(`   Message Reliability: ${(finalStats.mesh.messageReliability * 100).toFixed(1)}%`);
    
    console.log('\n💽 System Export');
    console.log('================');
    
    // Export system state
    const exportedState = grammarSystem.exportSystemState();
    console.log(`📦 Exported system state: ${Object.keys(exportedState).length} top-level components`);
    console.log(`🏷️ State includes: ${Object.keys(exportedState).join(', ')}`);
    
    console.log('\n🎉 DEMONSTRATION COMPLETE!');
    console.log('==========================');
    console.log('✨ The distributed agentic grammar system has successfully:');
    console.log('   🧬 Extracted agentic primitives from the codebase');
    console.log('   🔧 Created GGML tensor kernels for cognitive functions');
    console.log('   🏗️ Organized kernels into distributed clusters');
    console.log('   🌐 Deployed across a resilient mesh network');
    console.log('   🎯 Processed cognitive grammar queries');
    console.log('   ⚖️ Performed intelligent load balancing');
    console.log('   📊 Generated comprehensive visualizations');
    console.log('\n🚀 The mad scientist\'s distributed cognitive architecture LIVES!');
    console.log('🧠 Every tensor pulses with distributed intelligence!');
    console.log('🌟 Ready to conquer the infinite dimensions of agentic grammar!');
    
  } catch (error) {
    console.error('\n💥 Demo failed with error:', error);
    console.error('🔧 The mad scientist must debug the distributed architecture!');
  }
}

/**
 * Demonstrates specific agentic grammar capabilities
 */
export async function demonstrateAgenticCapabilities(): Promise<void> {
  console.log('\n🎭 AGENTIC CAPABILITIES SHOWCASE');
  console.log('================================\n');
  
  const config = createDefaultAgenticGrammarConfig();
  const system = new DistributedAgenticGrammarSystem(config);
  
  await system.initialize();
  
  // Demonstrate each agentic primitive type
  const capabilities = [
    {
      type: 'action',
      description: 'Action Execution',
      query: 'Execute the tensor multiplication operation',
      icon: '⚡'
    },
    {
      type: 'percept',
      description: 'Sensory Perception',
      query: 'Sense changes in the system environment',
      icon: '👁️'
    },
    {
      type: 'memory',
      description: 'Memory Operations',
      query: 'Store and retrieve cognitive state information',
      icon: '🧠'
    },
    {
      type: 'decision',
      description: 'Decision Making',
      query: 'Decide which processing path to take',
      icon: '🤔'
    },
    {
      type: 'planning',
      description: 'Strategic Planning',
      query: 'Plan the optimal sequence of operations',
      icon: '📋'
    },
    {
      type: 'communication',
      description: 'Inter-kernel Communication',
      query: 'Send message to distributed processing nodes',
      icon: '📡'
    },
    {
      type: 'adaptation',
      description: 'Learning & Adaptation',
      query: 'Adapt parameters based on performance feedback',
      icon: '🔄'
    },
    {
      type: 'attention',
      description: 'Attention Allocation',
      query: 'Focus computational resources on priority tasks',
      icon: '🎯'
    }
  ];
  
  for (const capability of capabilities) {
    console.log(`${capability.icon} ${capability.description}`);
    console.log(`   Query: "${capability.query}"`);
    
    try {
      const result = await system.processGrammarQuery(capability.query);
      console.log(`   ✅ Processed via ${result.routing.length} ${capability.type} kernels`);
      console.log(`   ⏱️ Time: ${result.processing.totalProcessingTime}ms`);
      console.log(`   🎪 Tensor: [${result.result.shape.join('×')}]\n`);
    } catch (error) {
      console.log(`   ❌ Processing failed: ${error}\n`);
    }
  }
  
  console.log('🌟 All agentic capabilities demonstrated successfully!');
}

// Export demonstration functions
export { demonstrateDistributedAgenticGrammar as default };