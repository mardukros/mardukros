# OpenCog AtomSpace & PLN Integration

This module provides bidirectional adapters for integrating Marduk kernel states with OpenCog's AtomSpace and Probabilistic Logic Networks (PLN) for advanced reasoning capabilities.

## Overview

The integration enables:
- **Bidirectional conversion** between kernel states and AtomSpace format
- **PLN reasoning** with probabilistic inference rules
- **Consistency verification** between representations
- **Reasoning traceability** back to original kernel state
- **Attention-guided inference** using ECAN principles
- **Meta-cognitive insights** for reasoning quality assessment

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Kernel State   │◄──►│  AtomSpace       │◄──►│  PLN Reasoning  │
│  (Tensors,      │    │  (Atoms, Links,  │    │  (Inference,    │
│   Hypergraph)   │    │   Truth Values)  │    │   Rules, Meta)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                        ▲                        ▲
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Consistency    │    │  Bidirectional   │    │  Traceability   │
│  Verification   │    │  Mapping         │    │  & Provenance   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Components

### 1. AtomSpaceAdapter

Converts Marduk kernel states (cognitive nodes, edges, tensors) to OpenCog AtomSpace format.

**Key Features:**
- Maps cognitive nodes to ConceptNode, PredicateNode, NumberNode
- Maps cognitive edges to InheritanceLink, SimilarityLink, EvaluationLink
- Converts tensor data to atoms with truth and attention values
- Maintains bidirectional ID mappings
- Supports efficient querying by type, name, and attention

### 2. PLNAdapter

Implements Probabilistic Logic Networks reasoning over AtomSpace.

**Supported Rules:**
- **Deduction:** P(A→C) from P(A→B) and P(B→C)
- **Induction:** P(B→A) from P(A→B) and P(A)
- **Abduction:** P(A) from P(A→B) and P(B)
- **Conjunction:** P(A ∧ B)
- **Disjunction:** P(A ∨ B)
- **Bayes Rule:** P(A|B) from P(B|A), P(A), P(B)
- **Inheritance Transitivity**
- **Similarity Symmetry**
- **Attention-weighted combinations**

### 3. KernelStateConverter

Provides high-level bidirectional conversion with consistency checking.

**Features:**
- Forward/backward conversion between kernel states and AtomSpace
- Reasoning integration with automatic result incorporation
- Consistency verification across representations
- Reasoning traceability and provenance tracking
- State synchronization and change detection

## Quick Start

### Basic Usage

```typescript
import { createOpenCogIntegration, createPLNQueries } from './opencog/index.js';
import { createSampleCognitiveState } from './opencog/integration-examples.js';

// Create integration with default settings
const integration = createOpenCogIntegration({
  enableConsistencyCheck: true,
  includeMetaCognition: true,
  attentionThreshold: 0.1,
  confidenceThreshold: 0.3
});

// Create sample cognitive state
const cognitiveState = createSampleCognitiveState();

// Convert to AtomSpace with reasoning capabilities
const { conversionResult, reason, checkConsistency, convertBack } = 
  await integration.convertWithReasoning(cognitiveState, 'demo');

console.log(`Converted ${conversionResult.atomsCreated} atoms`);

// Create PLN queries
const queries = createPLNQueries();

// Perform similarity reasoning
const similarityResult = await reason(
  queries.similarity(['concept_learning', 'concept_memory'], 0.3)
);

console.log(`Found ${similarityResult.conclusions.length} relationships`);

// Check consistency
const consistency = await checkConsistency();
console.log(`Consistency score: ${consistency.score}`);
```

### Advanced Usage

```typescript
import { KernelStateConverter, PLNQuery } from './opencog/index.js';

const converter = new KernelStateConverter({
  includeTensorData: true,
  maxTensorSize: 50000,
  enableConsistencyCheck: true,
  attentionThreshold: 0.2,
  confidenceThreshold: 0.4
});

// Convert kernel state
const result = await converter.convertToAtomSpace(cognitiveState, 'advanced');

// Custom PLN query with agentic grammar
const agenticQuery: PLNQuery = {
  type: 'custom',
  targets: ['agent_self', 'grammar_rules', 'concept_reasoning'],
  parameters: {
    agentic_mode: true,
    grammar_constraints: true,
    self_reference: true,
    meta_reasoning: true
  },
  minConfidence: 0.2,
  maxDepth: 4,
  useAttention: true
};

// Perform reasoning
const reasoningResult = await converter.performReasoningQuery(agenticQuery, 'advanced');

// Verify traceability
const traceability = converter.verifyReasoningTraceability(reasoningResult, 'advanced');
console.log(`Traceable: ${traceability.traceable}`);
console.log(`Trace steps: ${traceability.trace.length}`);

// Convert back to kernel state
const reconstructed = await converter.convertFromAtomSpace('advanced');
```

## PLN Query Types

### 1. Similarity Reasoning
Finds conceptual similarities between atoms:
```typescript
const similarityQuery: PLNQuery = {
  type: 'similarity',
  targets: ['concept_A', 'concept_B'],
  minConfidence: 0.4,
  useAttention: true
};
```

### 2. Inheritance Reasoning
Discovers hierarchical relationships:
```typescript
const inheritanceQuery: PLNQuery = {
  type: 'inheritance',
  targets: ['specific_concept', 'general_concept'],
  maxDepth: 3,
  minConfidence: 0.5
};
```

### 3. Implication Reasoning
Infers causal or logical implications:
```typescript
const implicationQuery: PLNQuery = {
  type: 'implication',
  targets: ['condition', 'consequence'],
  parameters: { temporal: true },
  minConfidence: 0.3
};
```

### 4. Evaluation Reasoning
Assesses predicate-object relationships:
```typescript
const evaluationQuery: PLNQuery = {
  type: 'evaluation',
  targets: ['predicate', 'object'],
  parameters: { context_aware: true },
  minConfidence: 0.4
};
```

### 5. Agentic Grammar Reasoning
Advanced reasoning with self-reference and meta-cognition:
```typescript
const agenticQuery: PLNQuery = {
  type: 'custom',
  targets: ['agent_self', 'grammar_rules'],
  parameters: {
    agentic_mode: true,
    grammar_constraints: true,
    self_reference: true
  },
  minConfidence: 0.2,
  useAttention: true
};
```

## Attention Integration (ECAN)

The integration supports Economic Attention Networks for attention-guided reasoning:

```typescript
// Enable attention-guided reasoning
const query: PLNQuery = {
  type: 'similarity',
  targets: ['high_attention_concept'],
  useAttention: true,
  minConfidence: 0.3
};

// Get top attention atoms
const topAtoms = adapter.getTopAttentionAtoms(10);

// Apply attention bias in PLN context
plnAdapter.updateContext({
  attentionBias: 0.2,  // Boost confidence based on attention
  useAttention: true
});
```

## Consistency Verification

Check consistency between kernel state and AtomSpace:

```typescript
const consistency = await converter.checkConsistency('state_id');

console.log(`Consistency score: ${consistency.score}`);
console.log(`Atoms checked: ${consistency.atomsChecked}`);
console.log(`Issues found: ${consistency.inconsistenciesFound}`);

if (consistency.issues.length > 0) {
  console.log('Issues:');
  consistency.issues.forEach(issue => console.log(`  - ${issue}`));
}

if (consistency.recommendations.length > 0) {
  console.log('Recommendations:');
  consistency.recommendations.forEach(rec => console.log(`  - ${rec}`));
}
```

## Reasoning Traceability

Verify that all reasoning steps can be traced back to original kernel state:

```typescript
const traceability = converter.verifyReasoningTraceability(inferenceResult, 'state_id');

console.log(`Reasoning traceable: ${traceability.traceable}`);

if (!traceability.traceable) {
  console.log('Traceability issues:');
  traceability.issues.forEach(issue => console.log(`  - ${issue}`));
}

console.log('Reasoning trace:');
traceability.trace.forEach((step, index) => {
  console.log(`  ${index + 1}. ${step}`);
});
```

## Truth Value Operations

PLN supports various truth value operations:

```typescript
import { TruthValueOperations } from './opencog/index.js';

const tv1 = { strength: 0.8, confidence: 0.9 };
const tv2 = { strength: 0.6, confidence: 0.7 };

// Logical operations
const conjunction = TruthValueOperations.conjunction(tv1, tv2);
const disjunction = TruthValueOperations.disjunction(tv1, tv2);
const negation = TruthValueOperations.negation(tv1);

// Inference operations
const deduction = TruthValueOperations.deduction(tv1, tv2);
const induction = TruthValueOperations.induction(tv1, tv2);
const abduction = TruthValueOperations.abduction(tv1, tv2);

// Bayesian operations
const bayes = TruthValueOperations.bayes(tv1, tv2, tv3);

// Attention-weighted combination
const attentionWeighted = TruthValueOperations.attentionWeighted(
  tv1, tv2, attention1, attention2
);
```

## Meta-Cognitive Insights

PLN provides meta-cognitive analysis of reasoning processes:

```typescript
const result = await plnAdapter.processQuery(query);

if (result.metaInsights.length > 0) {
  console.log('Meta-cognitive insights:');
  result.metaInsights.forEach(insight => {
    console.log(`  • ${insight}`);
  });
}

// Insights include:
// - Reasoning pattern analysis
// - Inference quality assessment
// - Attention allocation recommendations
// - Alternative reasoning path suggestions
// - Coherence evaluation
```

## Configuration Options

### KernelStateConverter Options
```typescript
const options = {
  includeTensorData: true,        // Include tensor data in conversion
  maxTensorSize: 100000,         // Maximum tensor size to process
  preserveMetadata: true,        // Preserve original metadata
  enableConsistencyCheck: true,  // Enable automatic consistency checking
  attentionThreshold: 0.1,       // Minimum attention for filtering
  confidenceThreshold: 0.3       // Minimum confidence for results
};
```

### PLN Context Options
```typescript
const plnContext = {
  maxDepth: 5,                   // Maximum inference depth
  confidenceThreshold: 0.1,      // Minimum confidence for conclusions
  maxResults: 50,                // Maximum number of results
  attentionBias: 0.1,           // Attention boost factor
  temporalWindow: 3600000,       // Temporal reasoning window (ms)
  includeMetaCognition: true,    // Enable meta-cognitive analysis
  ruleWeights: new Map([         // Rule importance weights
    ['DeductionRule', 1.0],
    ['InductionRule', 0.8],
    ['AbductionRule', 0.6]
  ])
};
```

## Examples and Demos

### Running the Demo
```bash
cd src/core/opencog
npm run build
node demo-cli.js
```

### Individual Examples
```typescript
import {
  demonstrateBasicConversion,
  demonstratePLNReasoning,
  demonstrateBidirectionalConversion,
  demonstrateReasoningTraceability,
  demonstrateECANIntegration,
  demonstrateAgenticGrammarReasoning
} from './opencog/integration-examples.js';

// Run individual demonstrations
await demonstrateBasicConversion();
await demonstratePLNReasoning();
await demonstrateBidirectionalConversion();
await demonstrateReasoningTraceability();
await demonstrateECANIntegration();
await demonstrateAgenticGrammarReasoning();
```

## Testing

Run the comprehensive test suite:

```bash
npm test src/core/opencog/__tests__/adapters.test.ts
```

Tests cover:
- Basic AtomSpace conversion
- PLN reasoning operations
- Truth value operations
- Bidirectional conversion consistency
- Reasoning traceability
- Error handling and edge cases
- Integration workflows

## API Reference

### AtomSpaceAdapter
- `convertCognitiveState(state)` - Convert kernel state to AtomSpace
- `queryByType(atomType)` - Query atoms by type
- `queryByName(name)` - Query atoms by name
- `getTopAttentionAtoms(limit)` - Get highest attention atoms
- `getAtomSpace()` - Get current AtomSpace
- `clear()` - Clear all atoms and links

### PLNAdapter
- `processQuery(query)` - Process PLN reasoning query
- `getInferenceHistory()` - Get reasoning history
- `updateContext(context)` - Update reasoning context
- `getContext()` - Get current context
- `clearHistory()` - Clear inference history

### KernelStateConverter
- `convertToAtomSpace(state, id, options)` - Forward conversion
- `convertFromAtomSpace(id, options)` - Backward conversion
- `performReasoningQuery(query, id)` - Reasoning on converted state
- `checkConsistency(id)` - Verify consistency
- `verifyReasoningTraceability(result, id)` - Check traceability
- `synchronize(id)` - Sync changes between representations
- `getConversionState(id)` - Get conversion state
- `listConversionStates()` - List all states
- `clearConversionState(id)` - Clear specific state

## Constants and Enums

```typescript
import { OPENCOG_CONSTANTS } from './opencog/index.js';

// Atom types
OPENCOG_CONSTANTS.ATOM_TYPES.CONCEPT_NODE
OPENCOG_CONSTANTS.ATOM_TYPES.INHERITANCE_LINK

// PLN rules
OPENCOG_CONSTANTS.PLN_RULES.DEDUCTION
OPENCOG_CONSTANTS.PLN_RULES.BAYES

// Default thresholds
OPENCOG_CONSTANTS.DEFAULT_THRESHOLDS.CONFIDENCE
OPENCOG_CONSTANTS.DEFAULT_LIMITS.MAX_INFERENCE_DEPTH
```

## Error Handling

The adapters provide robust error handling with detailed error messages:

```typescript
try {
  const result = await converter.convertToAtomSpace(state);
  if (result.errors.length > 0) {
    console.log('Conversion errors:', result.errors);
  }
  if (result.warnings.length > 0) {
    console.log('Conversion warnings:', result.warnings);
  }
} catch (error) {
  console.error('Conversion failed:', error.message);
}
```

## Performance Considerations

- **Tensor Size Limits:** Large tensors are automatically limited to prevent memory issues
- **Attention Filtering:** Use attention thresholds to focus on relevant atoms
- **Confidence Thresholds:** Set appropriate confidence levels to filter low-quality inferences
- **Inference Depth:** Limit reasoning depth to prevent exponential explosion
- **Batch Processing:** Process multiple queries in batches for efficiency

## Future Extensions

The adapter architecture supports easy extension for:
- Additional PLN inference rules
- Custom atom types and link types
- Integration with other OpenCog components
- Distributed AtomSpace support
- Advanced attention allocation strategies
- Real-time reasoning and streaming updates

## License

This OpenCog integration is part of the Marduk AGI Framework and follows the same MIT license.