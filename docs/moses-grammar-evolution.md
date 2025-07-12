# MOSES Grammar Evolution Documentation

## Overview

The MOSES (Meta-Optimizing Semantic Evolutionary Search) Grammar Evolution system provides comprehensive evolutionary algorithms for optimizing agentic grammar modules. This system implements advanced evolutionary techniques with transparency, statistics, and emergent insights.

## Architecture

```
grammar-evolution/
├── index.ts                  # Main exports
├── types.ts                  # Type definitions
├── fitness-evaluator.ts      # Multi-objective fitness evaluation
├── evolution-engine.ts       # Core evolutionary algorithm
├── moses-pipeline.ts         # Complete MOSES pipeline
├── results-reporter.ts       # Comprehensive reporting
└── demo.ts                   # Demonstration and examples
```

## Key Features

### 🧬 Core Evolution Engine
- **Population Management**: Elite preservation, diversity maintenance
- **Selection Methods**: Tournament, roulette, rank-based, Pareto-optimal
- **Mutation Strategies**: Structural, parametric, adaptive scaling
- **Crossover Operations**: Uniform, semantic, multi-point
- **Termination Criteria**: Fitness threshold, stagnation detection, time limits

### 📊 Multi-Objective Fitness Evaluation
- **Performance Metrics**: Accuracy, completeness, precision, efficiency
- **Complexity Analysis**: Structural, parametric, computational complexity
- **Expressiveness Evaluation**: Semantic richness, syntactic flexibility
- **Adaptability Assessment**: Plasticity, robustness, generalization
- **Emergent Properties**: Novelty detection, creativity, insight generation

### 🔬 Meta-Optimization Capabilities
- **Parameter Self-Tuning**: Adaptive mutation rates, crossover probabilities
- **Strategy Evolution**: Evolution of evolution parameters
- **Real-Time Intervention**: Diversity injection, population restart
- **Performance Monitoring**: Generation tracking, efficiency analysis

### 📈 Transparency & Insights
- **Comprehensive Reporting**: Executive summaries, technical details
- **Statistical Analysis**: Convergence metrics, diversity tracking
- **Visualization Support**: Fitness landscapes, Pareto fronts
- **Lineage Tracking**: Evolutionary genealogy, mutation effectiveness

## Usage Examples

### Basic Evolution

```typescript
import { MOSESPipeline, createDefaultEvolutionParams, createMOSESConfig } from './moses-pipeline.js';
import { createSamplePrimitives } from './demo.js';

// Setup
const primitives = createSamplePrimitives();
const evolutionParams = createDefaultEvolutionParams();
const mosesConfig = createMOSESConfig();

// Run evolution
const pipeline = new MOSESPipeline(evolutionParams, mosesConfig);
await pipeline.initialize();
const result = await pipeline.run(primitives);

console.log(`Best fitness: ${result.bestGenome.fitness}`);
```

### Multi-Objective Optimization

```typescript
// Configure for multi-objective optimization
evolutionParams.selection.method = 'pareto';
evolutionParams.selection.paretoFronts = true;
mosesConfig.objective = 'multi';

const pipeline = new MOSESPipeline(evolutionParams, mosesConfig);
const result = await pipeline.run(primitives);

// Access Pareto front
console.log(`Pareto front size: ${result.paretoFront?.length}`);
```

### Meta-Optimization

```typescript
const pipeline = new MOSESPipeline(evolutionParams, mosesConfig);
await pipeline.initialize();

// Meta-optimize parameters
const optimizedParams = await pipeline.metaOptimize(primitives, 5);

// Run with optimized parameters
const result = await pipeline.run(primitives);
```

### Statistical Analysis

```typescript
// Run multiple independent experiments
const results = await pipeline.runMultiple(primitives, 10);

// Analyze results
const fitnesses = results.map(r => r.bestGenome.fitness);
const avgFitness = fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length;
console.log(`Average fitness: ${avgFitness}`);
```

## Command Line Tools

### MOSES Runner Script

```bash
# Basic usage
node scripts/moses/moses-runner.js --generations 100 --population 50

# Meta-optimization
node scripts/moses/moses-runner.js --meta-optimize 5 --verbose

# Multi-run experiments
node scripts/moses/moses-runner.js --multi-run 10 --objective performance

# Custom configuration
node scripts/moses/moses-runner.js \
  --generations 75 \
  --population 30 \
  --mutation-rate 0.2 \
  --crossover-rate 0.7 \
  --objective balanced \
  --output results/
```

### Batch Experiments

```bash
# Run comprehensive batch experiments
./scripts/moses/batch-experiments.sh

# Results will be saved to moses-experiments/batch_TIMESTAMP/
```

## Output and Reporting

### Generated Reports
- **summary.md**: Executive summary with key results
- **detailed-report.md**: Comprehensive technical analysis
- **statistics.md**: Statistical analysis and metrics
- **insights.md**: Discoveries and recommendations
- **visualization-data.json**: Data for plotting and analysis

### Visualization Support
- **Fitness convergence plots**: Evolution progress over time
- **Population diversity graphs**: Diversity maintenance analysis
- **Pareto front visualization**: Multi-objective trade-offs
- **Mutation effectiveness charts**: Mutation strategy analysis

---

*This documentation covers the MOSES Grammar Evolution system implementation for agentic grammar optimization. For additional details, see the source code documentation and example implementations.*