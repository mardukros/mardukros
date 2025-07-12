/**
 * Quick Validation Test for MOSES Grammar Evolution
 * 
 * Tests core functionality to ensure everything works correctly.
 */

import { 
  runQuickTest, 
  createSamplePrimitives, 
  createDefaultEvolutionParams,
  createMOSESConfig 
} from './src/core/mad9ml/grammar-evolution/demo.js';

import { GrammarFitnessEvaluator } from './src/core/mad9ml/grammar-evolution/fitness-evaluator.js';
import { GrammarEvolutionEngine } from './src/core/mad9ml/grammar-evolution/evolution-engine.js';

async function validateComponents() {
  console.log('🔍 Validating MOSES components...');
  
  try {
    // Test primitive creation
    console.log('  ✓ Testing primitive creation...');
    const primitives = createSamplePrimitives();
    if (primitives.length === 0) throw new Error('No primitives created');
    
    // Test parameter creation
    console.log('  ✓ Testing parameter creation...');
    const params = createDefaultEvolutionParams();
    if (!params.population || !params.mutation) throw new Error('Invalid parameters');
    
    // Test MOSES config
    console.log('  ✓ Testing MOSES config...');
    const config = createMOSESConfig();
    if (!config.transparency) throw new Error('Invalid config');
    
    // Test fitness evaluator
    console.log('  ✓ Testing fitness evaluator...');
    const evaluator = new GrammarFitnessEvaluator();
    
    // Create a simple test genome
    const testGenome = {
      id: 'test_genome',
      primitives: primitives.slice(0, 3),
      structure: {
        nodes: [{
          id: 'node1',
          type: 'action',
          activation: { shape: [4], data: new Float32Array([0.1, 0.2, 0.3, 0.4]), type: 'f32', size: 4 },
          complexity: 0.5,
          connections: []
        }],
        edges: [],
        patterns: []
      },
      parameters: {
        complexity: { shape: [4], data: new Float32Array([0.1, 0.2, 0.3, 0.4]), type: 'f32', size: 4 },
        expressiveness: { shape: [4], data: new Float32Array([0.2, 0.3, 0.4, 0.5]), type: 'f32', size: 4 },
        efficiency: { shape: [4], data: new Float32Array([0.3, 0.4, 0.5, 0.6]), type: 'f32', size: 4 },
        adaptability: { shape: [4], data: new Float32Array([0.4, 0.5, 0.6, 0.7]), type: 'f32', size: 4 }
      },
      fitness: 0,
      generation: 0,
      lineage: []
    };
    
    const metrics = await evaluator.evaluateFitness(testGenome);
    if (!metrics.performance || !metrics.complexity) throw new Error('Invalid fitness metrics');
    
    console.log('  ✓ All components validated successfully!');
    return true;
    
  } catch (error) {
    console.error('  ❌ Component validation failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧬 MOSES Grammar Evolution - Validation Test');
  console.log('===========================================');
  
  const componentTest = await validateComponents();
  
  if (componentTest) {
    console.log('\n⚡ Running quick integration test...');
    await runQuickTest();
  } else {
    console.error('\n❌ Skipping integration test due to component failures');
    process.exit(1);
  }
  
  console.log('\n🎉 All validation tests passed!');
  console.log('\n📚 Available demos:');
  console.log('  - node validation-test.js              # This test');
  console.log('  - node src/core/mad9ml/grammar-evolution/demo.js basic');
  console.log('  - node src/core/mad9ml/grammar-evolution/demo.js multi');
  console.log('  - node src/core/mad9ml/grammar-evolution/demo.js all');
  console.log('  - node scripts/moses/moses-runner.js --help');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}