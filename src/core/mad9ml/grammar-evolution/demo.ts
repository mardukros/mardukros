/**
 * MOSES Grammar Evolution Demo - Demonstration of evolutionary grammar pipelines
 * 
 * Shows how to configure and run MOSES evolution for agentic grammar modules.
 */

import { MOSESPipeline } from './moses-pipeline.js';
import { 
  GrammarEvolutionParams, 
  MOSESConfig,
  EvolutionaryResult 
} from './types.js';
import { AgenticPrimitive, AgenticPrimitiveType } from '../agentic-grammar/types.js';
import { makeTensor, randomTensor } from '../tensor/operations.js';

/**
 * Creates sample agentic primitives for testing
 */
function createSamplePrimitives(): AgenticPrimitive[] {
  const primitiveTypes: AgenticPrimitiveType[] = [
    'action', 'percept', 'memory', 'decision', 'planning',
    'communication', 'adaptation', 'attention', 'goal', 'constraint'
  ];

  return primitiveTypes.map((type, index) => ({
    id: `primitive_${index}`,
    type,
    name: `${type}_primitive`,
    sourceLocation: {
      filePath: `./examples/${type}.ts`,
      startLine: 1,
      endLine: 10,
      startColumn: 0,
      endColumn: 50
    },
    parameters: [
      { name: 'input', type: 'any', defaultValue: null },
      { name: 'config', type: 'object', defaultValue: {} }
    ],
    semanticComplexity: Math.random() * 0.8 + 0.2,
    functionalDepth: Math.floor(Math.random() * 5) + 1,
    dependencies: index > 0 ? [`primitive_${index - 1}`] : [],
    metadata: {
      category: type,
      priority: Math.random(),
      efficiency: Math.random() * 0.9 + 0.1
    }
  }));
}

/**
 * Creates default evolution parameters for grammar evolution
 */
function createDefaultEvolutionParams(): GrammarEvolutionParams {
  return {
    population: {
      size: 20,
      eliteRatio: 0.2,
      diversityThreshold: 0.4
    },
    mutation: {
      structuralRate: 0.15,
      parametricRate: 0.25,
      adaptiveScaling: true
    },
    crossover: {
      rate: 0.6,
      method: 'semantic'
    },
    selection: {
      method: 'tournament',
      pressure: 0.7,
      paretoFronts: false
    },
    termination: {
      maxGenerations: 50,
      fitnessThreshold: 0.9,
      stagnationLimit: 15,
      timeLimit: 300000 // 5 minutes
    },
    constraints: {
      maxComplexity: 0.7,
      maxNodes: 12,
      maxDepth: 6,
      minPerformance: 0.3
    }
  };
}

/**
 * Creates MOSES configuration
 */
function createMOSESConfig(): MOSESConfig {
  return {
    objective: 'multi',
    metaOptimization: true,
    transparency: {
      logLevel: 'normal',
      trackLineage: true,
      saveIntermediates: true,
      reportInterval: 10
    },
    parallelization: {
      enabled: false,
      workerCount: 1,
      chunkSize: 5
    },
    memoryManagement: {
      archiveSize: 50,
      compressionThreshold: 100,
      garbageCollectionInterval: 20
    }
  };
}

/**
 * Basic MOSES demo
 */
async function runBasicDemo(): Promise<void> {
  console.log('\n🚀 MOSES Grammar Evolution - Basic Demo');
  console.log('======================================');

  try {
    // Create sample primitives
    const primitives = createSamplePrimitives();
    console.log(`📊 Created ${primitives.length} sample agentic primitives`);

    // Configure evolution
    const evolutionParams = createDefaultEvolutionParams();
    const mosesConfig = createMOSESConfig();

    // Initialize pipeline
    const pipeline = new MOSESPipeline(evolutionParams, mosesConfig);
    await pipeline.initialize();

    // Run evolution
    console.log('\n🧬 Starting evolution...');
    const result = await pipeline.run(primitives);

    // Display results
    console.log('\n✅ Evolution completed successfully!');
    console.log(`🎯 Best fitness: ${result.bestGenome.fitness.toFixed(4)}`);
    console.log(`📈 Generations: ${result.finalStats.generation}`);
    console.log(`🔬 Discoveries: ${result.insights.discoveries.length}`);
    
    if (result.insights.discoveries.length > 0) {
      console.log('\n🔍 Key Discoveries:');
      result.insights.discoveries.slice(0, 3).forEach(d => console.log(`  • ${d}`));
    }

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

/**
 * Multi-objective optimization demo
 */
async function runMultiObjectiveDemo(): Promise<void> {
  console.log('\n🎯 MOSES Grammar Evolution - Multi-Objective Demo');
  console.log('==================================================');

  try {
    const primitives = createSamplePrimitives();
    
    // Configure for multi-objective optimization
    const evolutionParams = createDefaultEvolutionParams();
    evolutionParams.selection.method = 'pareto';
    evolutionParams.selection.paretoFronts = true;
    evolutionParams.population.size = 30; // Larger population for multi-objective

    const mosesConfig = createMOSESConfig();
    mosesConfig.objective = 'multi';

    const pipeline = new MOSESPipeline(evolutionParams, mosesConfig);
    await pipeline.initialize();

    console.log('\n🧬 Running multi-objective evolution...');
    const result = await pipeline.run(primitives);

    console.log('\n✅ Multi-objective evolution completed!');
    console.log(`🎯 Best fitness: ${result.bestGenome.fitness.toFixed(4)}`);
    console.log(`📊 Pareto front size: ${result.paretoFront?.length || 0}`);
    console.log(`⚖️ Trade-offs discovered: ${result.paretoFront ? 'Yes' : 'No'}`);

    if (result.paretoFront && result.paretoFront.length > 1) {
      console.log('\n🔄 Pareto Front Solutions:');
      result.paretoFront.slice(0, 5).forEach((genome, i) => {
        console.log(`  ${i + 1}. Fitness: ${genome.fitness.toFixed(3)}, Complexity: ${genome.structure.nodes.length + genome.structure.edges.length}`);
      });
    }

  } catch (error) {
    console.error('❌ Multi-objective demo failed:', error);
  }
}

/**
 * Adaptive optimization demo
 */
async function runAdaptiveDemo(): Promise<void> {
  console.log('\n🔧 MOSES Grammar Evolution - Adaptive Optimization Demo');
  console.log('========================================================');

  try {
    const primitives = createSamplePrimitives();
    
    // Configure for adaptive optimization
    const evolutionParams = createDefaultEvolutionParams();
    evolutionParams.mutation.adaptiveScaling = true;
    evolutionParams.termination.maxGenerations = 75; // Longer run for adaptation

    const mosesConfig = createMOSESConfig();
    mosesConfig.metaOptimization = true;
    mosesConfig.transparency.logLevel = 'verbose';

    const pipeline = new MOSESPipeline(evolutionParams, mosesConfig);
    
    // Configure for different objectives and run
    console.log('\n🎯 Testing different optimization objectives...');
    
    for (const objective of ['performance', 'novelty', 'balanced']) {
      console.log(`\n--- ${objective.toUpperCase()} Optimization ---`);
      
      await pipeline.initialize();
      pipeline.configureForObjective(objective as any);
      
      const result = await pipeline.run(primitives);
      
      console.log(`✅ ${objective} optimization completed`);
      console.log(`   Fitness: ${result.bestGenome.fitness.toFixed(4)}`);
      console.log(`   Generations: ${result.finalStats.generation}`);
      console.log(`   Structure: ${result.bestGenome.structure.nodes.length}N/${result.bestGenome.structure.edges.length}E`);
    }

  } catch (error) {
    console.error('❌ Adaptive demo failed:', error);
  }
}

/**
 * Meta-optimization demo
 */
async function runMetaOptimizationDemo(): Promise<void> {
  console.log('\n🔬 MOSES Grammar Evolution - Meta-Optimization Demo');
  console.log('==================================================');

  try {
    const primitives = createSamplePrimitives().slice(0, 6); // Smaller set for faster meta-optimization
    
    const evolutionParams = createDefaultEvolutionParams();
    evolutionParams.population.size = 15; // Smaller for faster testing
    evolutionParams.termination.maxGenerations = 25;

    const mosesConfig = createMOSESConfig();
    mosesConfig.metaOptimization = true;

    const pipeline = new MOSESPipeline(evolutionParams, mosesConfig);
    await pipeline.initialize();

    console.log('\n🔧 Running meta-optimization...');
    const optimizedParams = await pipeline.metaOptimize(primitives, 3);

    console.log('\n✅ Meta-optimization completed!');
    console.log('📊 Optimized Parameters:');
    console.log(`   Structural Mutation Rate: ${optimizedParams.mutation.structuralRate.toFixed(3)}`);
    console.log(`   Parametric Mutation Rate: ${optimizedParams.mutation.parametricRate.toFixed(3)}`);
    console.log(`   Crossover Rate: ${optimizedParams.crossover.rate.toFixed(3)}`);
    console.log(`   Selection Method: ${optimizedParams.selection.method}`);

    // Run final evolution with optimized parameters
    console.log('\n🚀 Running final evolution with optimized parameters...');
    const finalResult = await pipeline.run(primitives);
    
    console.log(`🎯 Final optimized fitness: ${finalResult.bestGenome.fitness.toFixed(4)}`);

  } catch (error) {
    console.error('❌ Meta-optimization demo failed:', error);
  }
}

/**
 * Statistical analysis demo
 */
async function runStatisticalDemo(): Promise<void> {
  console.log('\n📊 MOSES Grammar Evolution - Statistical Analysis Demo');
  console.log('======================================================');

  try {
    const primitives = createSamplePrimitives().slice(0, 8);
    
    const evolutionParams = createDefaultEvolutionParams();
    evolutionParams.population.size = 20;
    evolutionParams.termination.maxGenerations = 30;

    const mosesConfig = createMOSESConfig();
    mosesConfig.transparency.logLevel = 'normal';

    const pipeline = new MOSESPipeline(evolutionParams, mosesConfig);

    console.log('\n🔄 Running multiple independent evolution runs...');
    const results = await pipeline.runMultiple(primitives, 5);

    console.log('\n📈 Statistical Analysis:');
    const fitnesses = results.map(r => r.bestGenome.fitness);
    const generations = results.map(r => r.finalStats.generation);

    const avgFitness = fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length;
    const avgGenerations = generations.reduce((sum, g) => sum + g, 0) / generations.length;
    const bestFitness = Math.max(...fitnesses);
    const worstFitness = Math.min(...fitnesses);

    console.log(`   Average Fitness: ${avgFitness.toFixed(4)} ± ${calculateStdDev(fitnesses).toFixed(4)}`);
    console.log(`   Best Fitness: ${bestFitness.toFixed(4)}`);
    console.log(`   Worst Fitness: ${worstFitness.toFixed(4)}`);
    console.log(`   Average Generations: ${avgGenerations.toFixed(1)}`);
    console.log(`   Success Rate: ${fitnesses.filter(f => f > 0.6).length}/${results.length} (${(fitnesses.filter(f => f > 0.6).length / results.length * 100).toFixed(1)}%)`);

    // Analyze consistency
    const stdDev = calculateStdDev(fitnesses);
    const consistency = stdDev < 0.1 ? 'High' : stdDev < 0.2 ? 'Medium' : 'Low';
    console.log(`   Consistency: ${consistency} (σ = ${stdDev.toFixed(4)})`);

  } catch (error) {
    console.error('❌ Statistical demo failed:', error);
  }
}

/**
 * Helper function to calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Main demo runner
 */
async function runAllDemos(): Promise<void> {
  console.log('🧬 MOSES Grammar Evolution - Complete Demo Suite');
  console.log('=================================================');
  console.log('This demonstration showcases various capabilities of the MOSES');
  console.log('evolutionary pipeline for agentic grammar optimization.\n');

  try {
    await runBasicDemo();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Brief pause between demos

    await runMultiObjectiveDemo();
    await new Promise(resolve => setTimeout(resolve, 2000));

    await runAdaptiveDemo();
    await new Promise(resolve => setTimeout(resolve, 2000));

    await runMetaOptimizationDemo();
    await new Promise(resolve => setTimeout(resolve, 2000));

    await runStatisticalDemo();

    console.log('\n🎉 All demos completed successfully!');
    console.log('\n📚 Summary of Demonstrated Features:');
    console.log('  ✅ Basic MOSES evolution pipeline');
    console.log('  ✅ Multi-objective optimization with Pareto fronts');
    console.log('  ✅ Adaptive parameter optimization');
    console.log('  ✅ Meta-optimization of evolution parameters');
    console.log('  ✅ Statistical analysis across multiple runs');
    console.log('  ✅ Comprehensive reporting and insights');
    
    console.log('\n🔧 Check the generated reports for detailed analysis!');

  } catch (error) {
    console.error('❌ Demo suite failed:', error);
  }
}

/**
 * Quick validation test
 */
async function runQuickTest(): Promise<void> {
  console.log('\n⚡ MOSES Grammar Evolution - Quick Validation Test');
  console.log('=================================================');

  try {
    const primitives = createSamplePrimitives().slice(0, 5);
    
    const evolutionParams = createDefaultEvolutionParams();
    evolutionParams.population.size = 10;
    evolutionParams.termination.maxGenerations = 10;

    const mosesConfig = createMOSESConfig();
    mosesConfig.transparency.logLevel = 'minimal';
    mosesConfig.transparency.saveIntermediates = false;

    const pipeline = new MOSESPipeline(evolutionParams, mosesConfig);
    await pipeline.initialize();

    const result = await pipeline.run(primitives);

    console.log(`✅ Quick test passed! Fitness: ${result.bestGenome.fitness.toFixed(4)}`);
    console.log(`📊 Structure: ${result.bestGenome.structure.nodes.length} nodes, ${result.bestGenome.structure.edges.length} edges`);

  } catch (error) {
    console.error('❌ Quick test failed:', error);
    throw error;
  }
}

// Export demo functions for use
export {
  runBasicDemo,
  runMultiObjectiveDemo,
  runAdaptiveDemo,
  runMetaOptimizationDemo,
  runStatisticalDemo,
  runAllDemos,
  runQuickTest,
  createSamplePrimitives,
  createDefaultEvolutionParams,
  createMOSESConfig
};

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const demo = process.argv[2] || 'all';
  
  switch (demo) {
    case 'basic':
      runBasicDemo();
      break;
    case 'multi':
      runMultiObjectiveDemo();
      break;
    case 'adaptive':
      runAdaptiveDemo();
      break;
    case 'meta':
      runMetaOptimizationDemo();
      break;
    case 'stats':
      runStatisticalDemo();
      break;
    case 'quick':
      runQuickTest();
      break;
    case 'all':
    default:
      runAllDemos();
      break;
  }
}