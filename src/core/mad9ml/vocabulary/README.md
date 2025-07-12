# GGML Adaptive Vocabulary Catalog

A comprehensive system for cataloging, validating, and managing GGML-adaptive vocabularies with tensor metadata and real-time inconsistency detection.

## Overview

The GGML Vocabulary Registry provides a living catalog of functions, libraries, dictionaries, kernels, and operators, each annotated with:

- **Tensor Shape Metadata**: Precise shape definitions with semantic meanings
- **Function Signatures**: Complete parameter and return type specifications  
- **Adaptation Parameters**: Evolution and learning configuration
- **Implementation Status**: Real vs stub implementation detection
- **Performance Metrics**: Computational complexity and resource usage
- **Integration Hooks**: Kernel and membrane system integration

## Key Features

### 🔍 Auto-Discovery
- Scans codebase for vocabulary items using pattern matching
- Extracts function signatures, tensor metadata, and documentation
- Detects implementation status (implemented/stub/deprecated/experimental)
- Updates registry automatically when code changes

### ✅ Validation & Quality Assessment  
- Validates vocabulary items for completeness and correctness
- Detects stub implementations vs real implementations
- Assesses code quality based on documentation, error handling, types
- Flags inconsistencies and missing implementations

### 🧠 Meta-Cognitive Enhancement
- Auto-updates registry and flags inconsistencies
- Tracks adaptation history and learning metrics
- Provides feedback mechanisms for continuous improvement
- Maintains stability while enabling evolution

### 🔗 Integration Hooks
- Seamless integration with existing kernel registries
- Membrane system integration for message routing
- Event-driven architecture for extensibility
- Performance monitoring and optimization hints

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                GGML Vocabulary Registry                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Auto-Discovery  │  │   Validation    │  │ Integration │ │
│  │    Scanner      │  │    Engine       │  │   Hooks     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ Vocabulary      │  │ Tensor Metadata │  │ Adaptation  │ │
│  │   Storage       │  │   Management    │  │  Control    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│         ┌─────────────────────────────────────────┐         │
│         │        Export & Integration             │         │
│         │    JSON | TypeScript | Markdown        │         │
│         └─────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Usage

### Basic Setup

```typescript
import { 
  createVocabularyRegistry,
  initializeDefaultRegistry,
  createLoggingKernelHook 
} from './vocabulary/index.js';

// Create a registry for your project
const registry = createVocabularyRegistry(
  'my-ggml-project',
  'My GGML Project Vocabulary',
  ['src/core', 'src/kernels'] // Scan paths
);

// Add monitoring hooks
registry.addKernelHook(createLoggingKernelHook());

// Initialize with auto-discovery
await registry.initialize();
```

### Manual Registration

```typescript
import { VocabularyItem } from './vocabulary/vocabulary-types.js';

const customFunction: VocabularyItem = {
  id: 'custom:my_tensor_op',
  name: 'my_tensor_operation',
  type: 'function',
  description: 'Custom tensor operation for specialized processing',
  category: 'custom',
  tags: ['tensor', 'custom', 'math'],
  
  // Function signature
  signature: {
    name: 'my_tensor_operation',
    parameters: [{
      name: 'input',
      type: 'ggml_tensor*',
      tensorShape: [1024, 768],
      optional: false,
      description: 'Input tensor'
    }],
    returnType: {
      type: 'ggml_tensor*',
      tensorShape: [1024, 768],
      dataType: 'f32',
      description: 'Processed tensor'
    },
    isAsync: false,
    isVarArgs: false,
    contextRequirements: ['valid_context']
  },
  
  // Tensor metadata
  tensorMetadata: {
    shape: [1024, 768],
    dataType: 'f32',
    memoryLayout: 'row-major',
    alignment: 32,
    semantics: {
      dimensionMeanings: ['batch_size', 'feature_dim'],
      interpretations: {
        'batch_size': 'processing batch size',
        'feature_dim': 'feature vector dimension'
      },
      cognitiveRole: 'intermediate',
      abstraction: 'concrete'
    }
  },
  
  // Adaptation metadata
  adaptationMetadata: {
    mutability: 'moderate',
    adaptationRate: 0.1,
    // ... evolution parameters
  },
  
  implementationStatus: 'implemented',
  // ... other required fields
};

await registry.registerItem(customFunction);
```

### Search and Discovery

```typescript
// Find all tensor operations
const tensorOps = registry.findItems({ 
  tags: ['tensor'] 
});

// Find functions by category
const mathFunctions = registry.findItems({ 
  category: 'math' 
});

// Find stub implementations
const stubs = registry.findItems({ 
  implementationStatus: 'stub' 
});

// Get specific item
const item = registry.getItem('ggml:attention');
```

### Validation and Quality

```typescript
// Validate all items
const validationResults = await registry.validateAllItems();

// Check for inconsistencies
const inconsistencies = await registry.detectInconsistencies();

for (const report of inconsistencies) {
  console.log(`${report.itemId}: ${report.severity}`);
  for (const issue of report.inconsistencies) {
    console.log(`  - ${issue.type}: ${issue.description}`);
  }
}
```

### Export Capabilities

```typescript
// Export as JSON
const jsonCatalog = await registry.exportCatalog('json');

// Export as TypeScript definitions
const tsDefinitions = await registry.exportCatalog('typescript');

// Export as Markdown documentation
const documentation = await registry.exportCatalog('markdown');

// Save to file
import { writeFileSync } from 'fs';
writeFileSync('vocabulary-catalog.json', jsonCatalog);
```

### Event Monitoring

```typescript
// Listen for registry events
registry.addEventListener('item_registered', (event) => {
  console.log(`New item registered: ${event.itemId}`);
});

registry.addEventListener('inconsistency_detected', (event) => {
  console.log(`Inconsistencies found: ${event.data.reports.length}`);
});

// Get recent events
const recentEvents = registry.getEvents(50);
```

## Vocabulary Types

### Functions
- **GGML C functions**: Core tensor operations (allocation, math, etc.)
- **TypeScript functions**: Higher-level cognitive operations
- **Kernel functions**: Hardware-optimized implementations

### Operators
- **Mathematical operators**: Matrix multiplication, convolution, etc.
- **Logical operators**: Branching, comparison, selection
- **Tensor operators**: Shape manipulation, broadcasting

### Libraries
- **Class definitions**: Data structures and abstractions
- **Module collections**: Related functionality groupings
- **Framework components**: Reusable cognitive building blocks

### Dictionaries
- **Type definitions**: Interfaces and type aliases
- **Configuration schemas**: Parameter specifications
- **Message formats**: Inter-component communication structures

### Kernels
- **Attention mechanisms**: Multi-head attention, ECAN attention
- **Memory systems**: Episodic, semantic, procedural memory
- **Processing pipelines**: Multi-stage cognitive workflows

## Tensor Metadata

### Shape Specifications
```typescript
{
  shape: [batch_size, sequence_length, hidden_dim],
  dataType: 'f16',
  memoryLayout: 'row-major',
  alignment: 16
}
```

### Semantic Annotations
```typescript
{
  semantics: {
    dimensionMeanings: ['batch', 'sequence', 'features'],
    interpretations: {
      'batch': 'processing batch size',
      'sequence': 'input sequence length', 
      'features': 'feature vector dimension'
    },
    cognitiveRole: 'input', // input|output|state|parameter
    abstraction: 'concrete' // concrete|symbolic|meta|emergent
  }
}
```

### Quantization Support
```typescript
{
  quantization: {
    method: 'q8_0',
    bitsPerWeight: 8,
    compressionRatio: 4.0,
    accuracy: 0.98
  }
}
```

## Adaptation Metadata

### Learning Constraints
```typescript
{
  learningConstraints: {
    maxMutationRate: 0.5,
    preserveStructure: true,
    constrainedDimensions: [0], // Don't adapt batch dimension
    invariantProperties: ['attention_mechanism'],
    adaptationBounds: { min: 0.1, max: 0.9 }
  }
}
```

### Evolution Parameters
```typescript
{
  evolutionParameters: {
    selectionPressure: 1.2,
    crossoverRate: 0.8,
    mutationProbability: 0.1,
    elitismRatio: 0.1,
    diversityPreservation: 0.2,
    fitnessFunction: 'performance_efficiency'
  }
}
```

### Stability Metrics
```typescript
{
  stabilityMetrics: {
    convergenceRate: 0.9,
    oscillationAmplitude: 0.1,
    driftMagnitude: 0.05,
    robustness: 0.8,
    resilience: 0.85,
    adaptability: 0.7
  }
}
```

## Integration Examples

### Kernel Integration Hook
```typescript
const kernelHook: KernelHook = async (item: VocabularyItem) => {
  // Register with existing kernel registry
  if (item.type === 'kernel') {
    const kernelRegistry = CognitiveKernelRegistry.getInstance();
    await kernelRegistry.registerExternalKernel({
      id: item.id,
      name: item.name,
      tensorShape: item.tensorMetadata.shape,
      // ... map other properties
    });
  }
  
  // Update usage statistics
  item.usageStatistics.callCount++;
  item.usageStatistics.lastUsed = Date.now();
};

registry.addKernelHook(kernelHook);
```

### Membrane Integration
```typescript
{
  membraneIntegration: {
    membraneId: 'attention-membrane',
    channelMappings: [{
      vocabularyChannel: 'attention_input',
      membraneChannel: 'cognitive_input',
      messageFormat: 'tensor_stream',
      serialization: 'protobuf'
    }],
    routingRules: [{
      condition: 'attention_weight > threshold',
      action: 'route',
      target: 'priority_channel',
      priority: 10
    }]
  }
}
```

## Configuration

### Registry Configuration
```typescript
{
  id: 'my-ggml-registry',
  name: 'My GGML Registry',
  autoDiscovery: true,        // Enable automatic scanning
  autoValidation: true,       // Enable automatic validation
  autoUpdate: true,          // Enable periodic updates
  scanPaths: ['src/core'],   // Directories to scan
  excludePatterns: [         // Files/directories to exclude
    'node_modules',
    '\\.test\\.',
    '__tests__'
  ],
  validationRules: [{         // Custom validation rules
    name: 'require_implementation',
    type: 'semantic',
    severity: 'error',
    condition: 'implementationStatus !== "stub"',
    message: 'Core items must be implemented'
  }],
  cachingEnabled: true,       // Enable result caching
  cacheSize: 10000,          // Maximum cache entries
  metadataRetention: 604800000 // 7 days in ms
}
```

### Scanner Configuration
```typescript
{
  rootPath: '/project/root',
  scanPaths: ['src/core', 'src/kernels'],
  excludePatterns: ['node_modules', '\\.git', 'dist'],
  fileExtensions: ['.ts', '.js', '.c', '.cpp'],
  maxFileSize: 1048576,      // 1MB
  maxDepth: 10,              // Directory traversal depth
  followSymlinks: false,
  cacheResults: true,
  verbose: false
}
```

## Statistics and Monitoring

### Registry Statistics
```typescript
{
  totalItems: 15,
  implementedItems: 10,
  stubItems: 3,
  deprecatedItems: 1,
  validItems: 14,
  invalidItems: 1,
  averageQuality: 0.82,
  healthScore: 0.87,
  categoryDistribution: {
    'math': 5,
    'memory': 3,
    'attention': 2
  },
  typeDistribution: {
    'function': 8,
    'operator': 4,
    'kernel': 2
  }
}
```

### Performance Metrics
```typescript
{
  computationalComplexity: 'O(n²)',
  memoryComplexity: 'O(n)',
  parallelizability: 0.85,
  cacheEfficiency: 0.7,
  throughput: 1000,          // ops/second
  latency: 5.2,              // milliseconds
  resourceUtilization: {
    cpu: 0.6,
    memory: 0.4,
    bandwidth: 0.3,
    storage: 0.1,
    gpu: 0.8
  }
}
```

## Best Practices

### 1. Comprehensive Documentation
- Provide detailed descriptions for all vocabulary items
- Include usage examples and parameter explanations
- Document tensor shape semantics and interpretations

### 2. Proper Categorization
- Use consistent category names across your project
- Apply meaningful tags for discoverability
- Maintain category hierarchy for organization

### 3. Tensor Metadata Precision
- Specify exact tensor shapes with semantic meanings
- Include data type and memory layout information
- Document dimension interpretations clearly

### 4. Implementation Status Tracking
- Mark stub implementations clearly
- Update status as implementation progresses
- Deprecate obsolete functionality properly

### 5. Quality Monitoring
- Run validation regularly to catch issues early
- Monitor health scores and address declining quality
- Use inconsistency detection to maintain coherence

### 6. Performance Optimization
- Profile vocabulary items for performance bottlenecks
- Use appropriate data types and quantization
- Optimize memory layouts for cache efficiency

## Advanced Features

### Custom Validation Rules
```typescript
const customRule: ValidationRule = {
  name: 'tensor_shape_validation',
  type: 'semantic',
  severity: 'error',
  condition: 'tensorMetadata.shape.every(dim => dim > 0)',
  message: 'Tensor dimensions must be positive',
  enabled: true
};

registry.config.validationRules.push(customRule);
```

### Adaptive Learning Integration
```typescript
// Configure adaptive parameters
const adaptiveItem = {
  // ... base item properties
  adaptationMetadata: {
    mutability: 'dynamic',
    adaptationRate: 0.2,
    feedbackMechanisms: [{
      type: 'performance',
      weight: 0.8,
      threshold: 0.5,
      enabled: true
    }]
  }
};
```

### Multi-Registry Federation
```typescript
// Create specialized registries
const mathRegistry = createVocabularyRegistry('math-vocab', 'Math Operations');
const memoryRegistry = createVocabularyRegistry('memory-vocab', 'Memory Systems');

// Cross-registry discovery
const allMathOps = mathRegistry.findItems({ type: 'operator' });
const allMemoryItems = memoryRegistry.findItems({ category: 'memory' });
```

## Troubleshooting

### Common Issues

**Q: Auto-discovery not finding my functions**
A: Check that your scan paths include the directories containing your functions, and ensure file extensions are configured correctly.

**Q: Validation failing for implemented functions**
A: Verify that function signatures match actual implementation and tensor metadata is complete.

**Q: High memory usage**
A: Reduce cache size or enable cleanup intervals for large registries.

**Q: Inconsistency reports showing false positives**
A: Adjust validation rules or update implementation status for legitimate edge cases.

### Performance Tuning

- Use specific scan paths to avoid unnecessary file scanning
- Enable caching for repeated operations
- Configure appropriate cleanup intervals
- Use exclude patterns to skip irrelevant files

### Integration Debugging

- Enable verbose logging in scanner configuration
- Monitor registry events for integration issues
- Use validation results to identify integration problems
- Check kernel and membrane integration configurations

## Contributing

The GGML Vocabulary Registry is designed to be extensible and adaptable. Key extension points:

1. **Custom Vocabulary Types**: Add new vocabulary types beyond the built-in ones
2. **Pattern Matchers**: Extend auto-discovery with custom pattern recognition
3. **Validation Rules**: Create domain-specific validation logic
4. **Integration Hooks**: Build bridges to other cognitive systems
5. **Export Formats**: Add new export formats for different use cases

## License

This implementation is part of the mad9ml project and follows the project's licensing terms.