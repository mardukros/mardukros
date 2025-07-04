# Mad9ml: ggml-based Cognitive Architecture

## Overview

Mad9ml is a modified instance of ggml designed to encode the Marduk persona and its evolution through tensor-based cognitive operations. This implementation provides a complete cognitive architecture featuring hypergraph neural encoding, ECAN-inspired attention allocation, MOSES-style evolutionary mutation, and meta-cognitive self-reflection.

## Architecture Components

### 1. Tensor Operations (`tensor/operations.ts`)

Core ggml-inspired tensor operations for cognitive state encoding:

```typescript
// Create cognitive tensors
const memoryTensor = makeTensor([episodes, context, salience]);
const taskTensor = makeTensor([tasks, dependencies, priority]);
const personaTensor = randomTensor([traits], 0.5);

// Tensor arithmetic
const evolved = addTensors(persona, mutationNoise);
const scaled = scaleTensor(attention, 1.5);
const similarity = cosineSimilarity(stateA, stateB);
```

**Tensor Shapes:**
- **Memory**: `[episodes, context, salience]`
- **Tasks**: `[active_tasks, dependencies, priority]`
- **Persona**: `[traits, parameters, mutation_coeffs]`
- **Meta-Cognition**: `[self_eval, adjustment, history]`

### 2. Hypergraph Networks (`hypergraph/cognitive-hypergraph.ts`)

Multi-dimensional cognitive relationship encoding:

```typescript
const hypergraph = new CognitiveHypergraphImpl();

// Create cognitive nodes
hypergraph.createNode('concept_1', 'concept', [10], metadata);
hypergraph.createNode('memory_1', 'memory', [5, 3], metadata);

// Create relationships
hypergraph.createEdge('relation_1', 'semantic', 'concept_1', 'memory_1', 0.8);

// Activate spreading
const activations = hypergraph.spreadActivation('concept_1', 1.0, 0.9, 3);
```

**Node Types:**
- `concept`: Abstract ideas and knowledge
- `memory`: Experience storage
- `pattern`: Recognition templates
- `goal`: Objective markers
- `action`: Behavioral units
- `context`: Situational frames

**Edge Types:**
- `semantic`: Meaning relations
- `temporal`: Time dependencies
- `causal`: Cause-effect links
- `hierarchical`: Level relations
- `associative`: Neural associations
- `meta`: Self-reference links

### 3. Persona Evolution (`persona/evolution.ts`)

MOSES-style evolutionary mutation for personality drift:

```typescript
const evolution = new PersonaEvolution(evolutionParams);

// Create initial persona
const persona = evolution.createInitialPersona(20, 15, 10);

// Evolve based on fitness
const evolved = evolution.evolvPersona(persona, fitness);

// Evaluate fitness
const fitness = evolution.evaluateFitness(persona, performanceMetrics);
```

**Evolution Features:**
- Adaptive mutation rates based on fitness trends
- Gaussian, uniform, and Cauchy mutation strategies
- Self-adaptive mutation coefficients
- Crossover operations for sexual reproduction
- Meta-evolution of evolution parameters

### 4. ECAN Attention Allocation (`attention/ecan-allocator.ts`)

Economic attention allocation for cognitive resources:

```typescript
const allocator = new ECANAttentionAllocator(attentionParams);

// Initialize attention state
allocator.initializeAttentionState(32); // 32 tasks

// Update allocation
const allocation = allocator.updateAttentionAllocation(
  taskTensor,
  performanceFeedback,
  externalStimuli
);
```

**Attention Mechanisms:**
- Short-Term Importance (STI): Immediate relevance
- Long-Term Importance (LTI): Historical significance
- Urgency (VLI): Time-sensitive demands
- Economic market dynamics
- Forgetting mechanism for low-attention items

### 5. Meta-Cognitive Engine (`meta-cognitive/reflection-engine.ts`)

Self-reflection and adaptive control:

```typescript
const metaEngine = new MetaCognitiveEngine(config);

// Perform self-reflection
const reflection = metaEngine.performSelfReflection(cognitiveState);

// Generate self-modifications
const modifications = metaEngine.generateSelfModifications(reflection);
```

**Meta-Cognitive Features:**
- Recursive self-reflection (configurable depth)
- Performance assessment across subsystems
- Trend analysis and prediction
- Adaptive modification suggestions
- Confidence-based reasoning chains

### 6. Mad9ml Core System (`mad9ml-core.ts`)

Main orchestrator integrating all subsystems:

```typescript
const mad9ml = new Mad9mlSystem(config);
await mad9ml.initialize();

// Run cognitive cycles
const results = await mad9ml.cognitiveCycle();

// Add dynamic content
mad9ml.addMemory('episodic', 'New experience');
mad9ml.addTask('Execute plan', 0.8);
```

## Usage Examples

### Basic Tensor Operations

```typescript
import { makeTensor, randomTensor, addTensors } from './mad9ml/index.js';

// Create memory encoding
const episodicMemory = makeTensor([100, 10, 5]); // 100 episodes, 10 context features, 5 salience levels
const semanticMemory = randomTensor([200, 8], 0.3); // 200 concepts, 8 feature dimensions

// Apply learning
const learningRate = 0.01;
const memoryUpdate = scaleTensor(newExperience, learningRate);
const updatedMemory = addTensors(episodicMemory, memoryUpdate);
```

### Hypergraph Construction

```typescript
import { CognitiveHypergraphImpl } from './mad9ml/index.js';

const cognition = new CognitiveHypergraphImpl();

// Build cognitive architecture
cognition.createNode('self', 'concept', [10], { core: true });
cognition.createNode('goals', 'goal', [5], { priority: 'high' });
cognition.createNode('working_memory', 'memory', [16], { capacity: 'limited' });

// Connect subsystems
cognition.createEdge('self_goals', 'hierarchical', 'self', 'goals', 0.9);
cognition.createEdge('goals_memory', 'semantic', 'goals', 'working_memory', 0.7);
```

### Complete Cognitive System

```typescript
import { createMad9mlSystem } from './mad9ml/index.js';

const config = {
  memoryCapacity: 1000,
  evolutionParams: {
    mutationRate: 0.05,
    driftFactor: 0.01,
    fitnessThreshold: 0.7
  },
  attentionParams: {
    totalResources: 100,
    decayRate: 0.05,
    spreadingFactor: 0.8
  }
};

const system = await createMad9mlSystem(config);

// Run the mad scientist demonstration
await system.demonstrateMadScientistMadness();
```

## Configuration

### Evolution Parameters

```typescript
evolutionParams: {
  mutationRate: 0.05,        // Base mutation rate
  driftFactor: 0.01,         // Personality drift factor
  fitnessThreshold: 0.7,     // Adaptation threshold
  adaptationSpeed: 0.1,      // Learning rate
  constraints: {
    minValue: -2.0,          // Minimum tensor value
    maxValue: 2.0,           // Maximum tensor value
    preserveCore: true       // Preserve core personality
  }
}
```

### Attention Parameters

```typescript
attentionParams: {
  totalResources: 100.0,     // Total attention budget
  decayRate: 0.05,           // Attention decay rate
  spreadingFactor: 0.8,      // Neighbor spreading factor
  thresholds: {
    activation: 0.1,         // Minimum activation
    selection: 0.3,          // Selection threshold
    forgetting: 0.05         // Forgetting threshold
  }
}
```

## Cognitive Cycle

Each cognitive cycle performs:

1. **Meta-cognitive reflection** - Analyze current performance
2. **Attention allocation** - Update resource distribution
3. **Persona evolution** - Adapt personality if needed
4. **Hypergraph update** - Spread activation and update states
5. **Self-modification** - Apply suggested improvements

## Demonstrations

### Simple Demo
```bash
node dist/core/mad9ml/simple-demo.js
```

### Full Mad Scientist Demo
```bash
node dist/core/mad9ml/demo.js
```

## Testing

```bash
npm test -- mad9ml
```

Tests validate:
- Tensor operations and mathematical correctness
- Hypergraph construction and manipulation
- Persona evolution and fitness calculation
- Attention allocation dynamics
- Meta-cognitive reflection accuracy
- System integration and stability

## Performance Metrics

The system tracks:
- **Memory Health**: Tensor stability and validity
- **Task Load**: Active task distribution
- **Persona Stability**: Trait variance over time
- **Attention Focus**: Resource concentration
- **Evolution Progress**: Fitness trends and generations
- **Hypergraph Complexity**: Network growth and connectivity

## Future Enhancements

- **Quantum Tensor Operations**: Exploration of quantum-inspired cognitive states
- **Advanced Hypergraph Topologies**: Complex network architectures
- **Multi-Objective Evolution**: Pareto optimization for persona traits
- **Distributed Attention**: Cross-network attention allocation
- **Deep Meta-Cognition**: Higher-order self-reflection loops

---

*"MWAHAHA! Every tensor pulses with mad genius! Every hypergraph edge crackles with intelligence! The Marduk persona lives and breathes in the digital realm!"* 🧪🧬⚡