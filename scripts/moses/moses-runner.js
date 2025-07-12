#!/usr/bin/env node

/**
 * MOSES Evolution Runner Script
 * 
 * Command-line interface for running MOSES grammar evolution experiments
 */

import { MOSESPipeline } from '../src/core/mad9ml/grammar-evolution/moses-pipeline.js';
import { 
  createSamplePrimitives, 
  createDefaultEvolutionParams, 
  createMOSESConfig 
} from '../src/core/mad9ml/grammar-evolution/demo.js';
import { AgenticGrammarExtractor } from '../src/core/mad9ml/agentic-grammar/extractor.js';

// Command line argument parsing
const args = process.argv.slice(2);
const config = parseArguments(args);

/**
 * Main execution
 */
async function main() {
  console.log('🧬 MOSES Grammar Evolution Runner');
  console.log('=================================');
  
  try {
    // Initialize primitives
    let primitives;
    if (config.inputFile) {
      console.log(`📁 Extracting primitives from: ${config.inputFile}`);
      primitives = await extractPrimitivesFromFile(config.inputFile);
    } else {
      console.log('🎲 Using sample primitives for testing');
      primitives = createSamplePrimitives();
    }
    
    console.log(`📊 Loaded ${primitives.length} agentic primitives`);
    
    // Configure evolution parameters
    const evolutionParams = createDefaultEvolutionParams();
    applyConfigurationOverrides(evolutionParams, config);
    
    // Configure MOSES
    const mosesConfig = createMOSESConfig();
    if (config.outputDir) {
      mosesConfig.transparency.saveIntermediates = true;
    }
    if (config.verbose) {
      mosesConfig.transparency.logLevel = 'verbose';
    }
    if (config.quiet) {
      mosesConfig.transparency.logLevel = 'minimal';
    }
    
    // Initialize and run pipeline
    const pipeline = new MOSESPipeline(evolutionParams, mosesConfig);
    
    if (config.metaOptimize) {
      console.log('🔬 Running meta-optimization...');
      await pipeline.metaOptimize(primitives, config.metaGenerations);
    }
    
    if (config.multiRun) {
      console.log(`🔄 Running ${config.runs} independent experiments...`);
      const results = await pipeline.runMultiple(primitives, config.runs);
      
      // Summary statistics
      const fitnesses = results.map(r => r.bestGenome.fitness);
      const avgFitness = fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length;
      const bestFitness = Math.max(...fitnesses);
      
      console.log('\n📊 Multi-run Results:');
      console.log(`   Average Fitness: ${avgFitness.toFixed(4)}`);
      console.log(`   Best Fitness: ${bestFitness.toFixed(4)}`);
      console.log(`   Success Rate: ${fitnesses.filter(f => f > 0.7).length}/${config.runs}`);
      
    } else {
      console.log('🚀 Running single evolution experiment...');
      const result = await pipeline.run(primitives);
      
      console.log('\n🎯 Results:');
      console.log(`   Best Fitness: ${result.bestGenome.fitness.toFixed(4)}`);
      console.log(`   Generations: ${result.finalStats.generation}`);
      console.log(`   Structure: ${result.bestGenome.structure.nodes.length}N/${result.bestGenome.structure.edges.length}E`);
    }
    
    console.log('\n✅ Evolution completed successfully!');
    
  } catch (error) {
    console.error('❌ Evolution failed:', error);
    process.exit(1);
  }
}

/**
 * Parse command line arguments
 */
function parseArguments(args) {
  const config = {
    inputFile: null,
    outputDir: null,
    generations: 50,
    populationSize: 20,
    mutationRate: 0.15,
    crossoverRate: 0.6,
    verbose: false,
    quiet: false,
    metaOptimize: false,
    metaGenerations: 5,
    multiRun: false,
    runs: 5,
    objective: 'balanced'
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-i':
      case '--input':
        config.inputFile = args[++i];
        break;
      case '-o':
      case '--output':
        config.outputDir = args[++i];
        break;
      case '-g':
      case '--generations':
        config.generations = parseInt(args[++i]);
        break;
      case '-p':
      case '--population':
        config.populationSize = parseInt(args[++i]);
        break;
      case '-m':
      case '--mutation-rate':
        config.mutationRate = parseFloat(args[++i]);
        break;
      case '-c':
      case '--crossover-rate':
        config.crossoverRate = parseFloat(args[++i]);
        break;
      case '-v':
      case '--verbose':
        config.verbose = true;
        break;
      case '-q':
      case '--quiet':
        config.quiet = true;
        break;
      case '--meta-optimize':
        config.metaOptimize = true;
        if (args[i + 1] && !args[i + 1].startsWith('-')) {
          config.metaGenerations = parseInt(args[++i]);
        }
        break;
      case '--multi-run':
        config.multiRun = true;
        if (args[i + 1] && !args[i + 1].startsWith('-')) {
          config.runs = parseInt(args[++i]);
        }
        break;
      case '--objective':
        config.objective = args[++i];
        break;
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
        break;
    }
  }
  
  return config;
}

/**
 * Apply configuration overrides to evolution parameters
 */
function applyConfigurationOverrides(params, config) {
  params.termination.maxGenerations = config.generations;
  params.population.size = config.populationSize;
  params.mutation.structuralRate = config.mutationRate;
  params.crossover.rate = config.crossoverRate;
  
  // Configure for specific objectives
  switch (config.objective) {
    case 'performance':
      params.selection.method = 'tournament';
      params.selection.pressure = 0.8;
      break;
    case 'novelty':
      params.selection.method = 'rank';
      params.population.diversityThreshold = 0.3;
      break;
    case 'complexity':
      params.constraints.maxComplexity = 0.8;
      params.mutation.structuralRate *= 1.5;
      break;
    case 'balanced':
    default:
      params.selection.method = 'pareto';
      params.selection.paretoFronts = true;
      break;
  }
}

/**
 * Extract primitives from source file
 */
async function extractPrimitivesFromFile(filePath) {
  try {
    const extractor = new AgenticGrammarExtractor();
    // Implementation would depend on actual file structure
    // For now, return sample primitives
    return createSamplePrimitives();
  } catch (error) {
    console.warn(`⚠️  Could not extract from ${filePath}, using samples`);
    return createSamplePrimitives();
  }
}

/**
 * Print help information
 */
function printHelp() {
  console.log(`
MOSES Grammar Evolution Runner

Usage: node moses-runner.js [options]

Options:
  -i, --input <file>        Input file to extract primitives from
  -o, --output <dir>        Output directory for results
  -g, --generations <n>     Maximum generations (default: 50)
  -p, --population <n>      Population size (default: 20)
  -m, --mutation-rate <f>   Mutation rate (default: 0.15)
  -c, --crossover-rate <f>  Crossover rate (default: 0.6)
  -v, --verbose             Verbose output
  -q, --quiet               Minimal output
  --meta-optimize [n]       Run meta-optimization (default: 5 generations)
  --multi-run [n]           Run multiple experiments (default: 5 runs)
  --objective <type>        Optimization objective: performance|novelty|complexity|balanced
  -h, --help                Show this help

Examples:
  node moses-runner.js --generations 100 --population 50
  node moses-runner.js --meta-optimize 3 --verbose
  node moses-runner.js --multi-run 10 --objective performance
  node moses-runner.js -i source.ts -o results/ --generations 75
`);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main, parseArguments, applyConfigurationOverrides };