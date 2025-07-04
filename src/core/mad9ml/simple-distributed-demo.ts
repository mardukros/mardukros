/**
 * Simple Demo for Distributed Agentic Grammar System
 * 
 * Demonstrates the distributed GGML tensor network in action
 */

import { 
  DistributedAgenticGrammarSystem, 
  createDefaultAgenticGrammarConfig 
} from './agentic-grammar/index.js';

/**
 * Simple demonstration of the distributed agentic grammar system
 */
async function runDistributedGrammarDemo(): Promise<void> {
  console.log('\n🌟 DISTRIBUTED AGENTIC GRAMMAR SYSTEM DEMO');
  console.log('==========================================\n');
  
  try {
    // Create and configure the system
    console.log('🔧 Creating distributed agentic grammar system...');
    const config = createDefaultAgenticGrammarConfig();
    const system = new DistributedAgenticGrammarSystem(config);
    
    // Initialize the system
    console.log('🚀 Initializing distributed tensor network...');
    await system.initialize();
    
    // Get initial statistics
    const stats = system.getSystemStatistics();
    console.log('\n📊 System Initialized Successfully!');
    console.log(`   🧬 Extracted ${stats.state.extractedPrimitives} agentic primitives`);
    console.log(`   🔧 Created ${stats.state.registeredKernels} GGML kernels`);
    console.log(`   🏗️ Organized into ${stats.state.activeClusters} clusters`);
    console.log(`   🌐 Deployed across ${stats.state.meshNodes} mesh nodes`);
    console.log(`   💾 Memory usage: ${(stats.registry.totalMemoryUsage / 1024 / 1024).toFixed(2)} MB`);
    
    // Test some queries
    console.log('\n🔍 Testing Cognitive Grammar Queries:');
    console.log('=====================================');
    
    const testQueries = [
      'Execute tensor operations for cognitive processing',
      'Remember the current system state',
      'Decide on optimal resource allocation',
      'Plan the next sequence of operations'
    ];
    
    for (let i = 0; i < testQueries.length; i++) {
      const query = testQueries[i];
      console.log(`\n${i + 1}. "${query}"`);
      
      try {
        const result = await system.processGrammarQuery(query);
        console.log(`   ✅ Processed in ${result.processing.totalProcessingTime}ms`);
        console.log(`   🎯 Used ${result.routing.length} kernels`);
        console.log(`   📊 Result tensor: [${result.result.shape.join('×')}]`);
      } catch (error) {
        console.log(`   ❌ Failed: ${error}`);
      }
    }
    
    // Show network visualization
    console.log('\n📊 Network Visualization:');
    console.log('=========================');
    const visualization = system.generateNetworkVisualization();
    console.log(visualization);
    
    console.log('\n🎉 Demo completed successfully!');
    console.log('✨ The distributed agentic grammar system is operational!');
    
  } catch (error) {
    console.error('\n💥 Demo failed:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  }
}

// Export for use in other demos
export { runDistributedGrammarDemo };

// Run if this is the main module
if (require.main === module) {
  runDistributedGrammarDemo().catch(console.error);
}