
# Memory System

The Memory System forms the cognitive foundation of Marduk, providing sophisticated storage, retrieval, and analysis capabilities across multiple memory types.

## Memory Types

### Declarative Memory

Declarative memory stores explicit facts and knowledge - information that can be consciously recalled and articulated. This includes:

- Historical data
- Configuration settings
- Environmental facts
- Explicit rules and constraints

**Technical Implementation**: `DeclarativeMemory` class that implements the `MemorySubsystem` interface.

### Episodic Memory

Episodic memory records events, experiences, and temporal sequences. This includes:

- System events
- Interaction histories
- Temporal data
- Sequences of operations

**Technical Implementation**: `EpisodicMemory` class with specialized indexing for temporal queries.

### Procedural Memory

Procedural memory contains methods, workflows, and action sequences - information about how to perform tasks. This includes:

- Algorithms
- Workflows
- Methods
- Programmatic recipes

**Technical Implementation**: `ProceduralMemory` class with execution capabilities.

### Semantic Memory

Semantic memory maintains concepts, meanings, and relationships - the network of understanding that connects other memory types. This includes:

- Concept definitions
- Relationship mappings
- Taxonomies
- Meaning networks

**Technical Implementation**: `SemanticMemory` class with graph relationship capabilities.

## Features

### Pattern Analysis

The memory system automatically detects patterns in stored information, identifying:

- Frequently accessed items
- Related concepts
- Temporal patterns
- Usage clusters

### Self-Optimization

Memory automatically optimizes itself through:

- Compression of repetitive information
- Prioritization of high-value data
- Pruning of low-relevance items
- Reorganization for efficient access

### Persistence

Memory can be saved and restored with:

- Configurable storage locations
- Automatic backups
- Multiple persistence strategies
- Import/export capabilities

## Usage Example

```typescript
import { memoryFactory } from 'marduk-ts';

// Get the semantic memory subsystem
const semantic = memoryFactory.getSubsystem('semantic');

// Store a concept
await semantic.store({
  id: 'concept:quantum-computing',
  type: 'concept',
  content: {
    name: 'Quantum Computing',
    description: 'Computing using quantum-mechanical phenomena',
    relationships: [
      {
        type: 'is_related_to',
        target: 'Quantum Physics',
        strength: 0.9
      }
    ]
  },
  metadata: {
    confidence: 0.95,
    lastAccessed: Date.now(),
    tags: ['quantum', 'computing', 'physics'],
    category: ['technology', 'science']
  }
});

// Query memory
const results = await semantic.query({
  type: 'concept',
  term: 'quantum',
  filters: { confidence: { min: 0.7 } }
});
```

## Integration with Other Subsystems

The Memory System integrates with:

- **Task System**: Provides context and information for task execution
- **AI System**: Stores and retrieves AI-generated content
- **Autonomy System**: Subject to analysis and optimization by autonomy processes

See the [Architecture Overview](../architecture/overview.md) for more details on system interactions.
