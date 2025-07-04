
# AI System

The AI System provides intelligence capabilities to Marduk, integrating external AI services and managing AI resources.

## Components

### Coordinator

The AI Coordinator manages AI resource allocation and orchestrates interactions:

- Service selection
- Request prioritization
- Cost management
- Response handling

**Technical Implementation**: `AiCoordinator` class with service selection logic.

### Clients

Interfaces with external AI providers:

- OpenAI client
- Potential other provider clients (Anthropic, etc.)
- Local model clients
- Mock clients for testing

**Technical Implementation**: `OpenAiClient` and other provider-specific client classes.

### Integration

Connects AI capabilities with other subsystems:

- Memory augmentation
- Task enhancement
- Autonomy analysis
- Data processing

**Technical Implementation**: Integration service classes that bridge AI capabilities with other subsystems.

### Types

Defines structured data formats for AI interactions:

- Request formats
- Response structures
- Context management
- Parameter specifications

**Technical Implementation**: TypeScript interfaces for strongly-typed AI interactions.

## Features

### Context Management

Sophisticated context handling for improved AI responses:

- Dynamic context assembly from memory
- Context window optimization
- Relevance filtering
- Token management

### Multi-Provider Support

Support for different AI service providers:

- Provider-agnostic interfaces
- Automatic fallback mechanisms
- Capability-based routing
- Cost optimization

### Error Handling

Robust error recovery mechanisms:

- Retry logic
- Fallback strategies
- Error classification
- Graceful degradation

## Usage Example

```typescript
import { aiCoordinator } from 'marduk-ts';

// Process a query with the AI system
const aiResponse = await aiCoordinator.processQuery(
  'Explain the relationship between quantum computing and quantum physics',
  { 
    temperature: 0.7,
    maxTokens: 500,
    contextItems: [
      { type: 'concept', id: 'quantum-computing' },
      { type: 'concept', id: 'quantum-physics' }
    ]
  }
);

// Use the response
console.log(aiResponse.content);

// Store the response in memory if valuable
if (aiResponse.metadata.confidence > 0.8) {
  const memoryFactory = await import('marduk-ts').then(m => m.memoryFactory);
  const declarative = memoryFactory.getSubsystem('declarative');
  
  await declarative.store({
    id: `ai-response:${Date.now()}`,
    type: 'explanation',
    content: aiResponse.content,
    metadata: {
      source: 'ai',
      confidence: aiResponse.metadata.confidence,
      query: 'quantum computing and physics relationship',
      timestamp: Date.now()
    }
  });
}
```

## Integration with Other Subsystems

The AI System integrates with:

- **Memory System**: Retrieves context information and stores AI-generated content
- **Task System**: Provides intelligence for task execution
- **Autonomy System**: Assists with system analysis and optimization

The AI System serves as the "brain" that augments the other systems with advanced reasoning capabilities.

See the [Architecture Overview](../architecture/overview.md) for more details on system interactions.
