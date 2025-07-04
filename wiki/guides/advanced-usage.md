
# Advanced Usage Guide

This guide covers advanced usage patterns for developers working with the Marduk AGI Framework.

## Cognitive Cycle Customization

You can customize the cognitive cycles by modifying the `deliberation.ts` file:

```typescript
// Example of customizing the deliberation process
const customDeliberation = new Deliberation({
  divergenceFactor: 1.5,      // Increases creative thinking
  convergencePriority: 0.8,   // Emphasizes goal-oriented thinking
  memoryIntegration: true,    // Enables cross-subsystem memory access
  recursiveDepth: 3           // Sets maximum recursive thought depth
});
```

## Memory Subsystem Extensions

To extend memory capabilities with custom subsystems:

```typescript
// Example of creating a custom memory subsystem
class SpecializedMemory extends BaseMemorySubsystem {
  constructor() {
    super('specialized', {
      persistence: true,
      optimization: true,
      validation: true
    });
  }
  
  // Implement custom memory operations
  async storeSpecializedKnowledge(data: any): Promise<string> {
    // Implementation
  }
}

// Register with memory factory
memoryFactory.registerSubsystem('specialized', SpecializedMemory);
```

## Self-Optimization Configuration

You can configure the self-optimization behavior:

```typescript
// Example of configuring the autonomy system
const optimizationConfig = {
  frequency: 'daily',           // How often to run optimizations
  focus: ['memory', 'task'],    // Subsystems to focus on
  aggressiveness: 0.7,          // How aggressive optimizations should be (0-1)
  safeMode: true                // Enable extra validation checks
};

autonomyCoordinator.configure(optimizationConfig);
```

## Heartbeat Monitoring

For critical applications, you can set up advanced heartbeat monitoring:

```typescript
// Example of setting up advanced heartbeat monitoring
const heartbeatConfig = {
  intervalMs: 5000,                   // Check every 5 seconds
  criticalThreshold: 3,               // Number of missed beats before critical
  recoveryActions: ['restartSystem',  // Actions to take for recovery
    'rollbackChanges', 
    'notifyAdmin'],
  metricTracking: ['memory', 'cpu']   // Resources to monitor
};

const heartbeat = new HeartbeatMonitor(heartbeatConfig);
heartbeat.start();
```

## Meta-Cognitive Reflection

To enable system self-awareness and reflection:

```typescript
// Example of using the reflection engine
const reflectionEngine = new ReflectionEngine();

// Analyze system's decision patterns
const decisionPatterns = await reflectionEngine.analyzeDecisions({
  timeframe: '7d',              // Analyze last 7 days
  focusAreas: ['task-priority', 'memory-access'],
  depth: 'deep'                 // Level of analysis
});

// Apply insights to improve system
await reflectionEngine.applyInsights(decisionPatterns);
```

## Advanced Event Handling

You can tap into the system's internal events:

```typescript
// Example of advanced event handling
mardukCore.events.on('memory.optimization.complete', (result) => {
  console.log(`Memory optimization completed with ${result.changes.itemsModified} modifications`);
  
  // Trigger dependent processes
  if (result.changes.subsystemsAffected.includes('semantic')) {
    knowledgeGraph.rebuild();
  }
});
```

## Integration with External Systems

For integrating with external AI services:

```typescript
// Example of registering a custom AI provider
aiCoordinator.registerProvider('specialized-llm', {
  name: 'Specialized Language Model',
  capabilities: ['domain-expertise', 'code-generation'],
  endpoint: 'https://api.example.com/v1',
  authMethod: 'bearer',
  contextWindow: 16384,
  costPerToken: 0.0001
});

// Use the specialized model for specific tasks
const response = await aiCoordinator.process({
  task: 'generate-architecture',
  provider: 'specialized-llm',
  prompt: 'Design a modular system for...',
  parameters: {
    temperature: 0.7,
    maxTokens: 2000
  }
});
```
