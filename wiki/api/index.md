
# API Reference

This section provides detailed documentation for the Marduk AGI Framework APIs.

## Core API

### MardukCore

The central orchestrator of the Marduk system.

```typescript
class MardukCore {
  async initialize(): Promise<void>
  async shutdown(): Promise<void>
  isInitialized(): boolean
  getStatus(): SystemStatus
}
```

## Memory API

### MemoryFactory

Factory for creating and accessing memory subsystems.

```typescript
class MemorySystemFactory {
  static getInstance(): MemorySystemFactory
  getSubsystem(type: MemoryType): MemorySubsystem
  createSnapshot(): Promise<string>
  restoreSnapshot(id: string): Promise<boolean>
}
```

### MemorySubsystem

Interface implemented by all memory subsystems.

```typescript
interface MemorySubsystem {
  store(item: MemoryItem): Promise<string>
  retrieve(id: string): Promise<MemoryItem | null>
  query(params: QueryParams): Promise<MemoryItem[]>
  update(id: string, updates: Partial<MemoryItem>): Promise<boolean>
  delete(id: string): Promise<boolean>
  optimize(): Promise<OptimizationResult>
}
```

## Task API

### TaskManager

Manages the creation and execution of tasks.

```typescript
class TaskManager {
  createTask(description: string, options: TaskOptions): Task
  addTask(task: Task): void
  removeTask(taskId: string): boolean
  prioritizeTasks(): Task[]
  executeTask(task: Task): Promise<TaskResult>
}
```

### DeferredTaskHandler

Handles tasks with prerequisites.

```typescript
class DeferredTaskHandler {
  addDeferredTask(task: Task): void
  activateTasks(state: any): Task[]
  hasDeferredTasks(): boolean
}
```

## AI API

### AiCoordinator

Coordinates AI service usage.

```typescript
class AiCoordinator {
  processQuery(query: string, options?: AiOptions): Promise<AiResponse>
  generateEmbeddings(text: string): Promise<number[]>
  classifyContent(content: string, categories: string[]): Promise<Classification>
}
```

## Autonomy API

### AutonomyCoordinator

Coordinates autonomy capabilities.

```typescript
class AutonomyCoordinator {
  analyze(): Promise<PatternResult[]>
  rewrite(): Promise<OptimizationResult>
  getMetrics(): SystemMetrics
}
```

### AutonomyScheduler

Schedules autonomy operations.

```typescript
class AutonomyScheduler {
  start(): void
  stop(): void
  setInterval(operation: AutonomyOperation, intervalMs: number): void
}
```

### HeartbeatRegulator

Maintains system health.

```typescript
class HeartbeatRegulator {
  start(): void
  stop(): void
  getStatus(): HeartbeatStatus
  setRecoveryAction(action: RecoveryAction): void
}
```

## Monitoring API

### Monitoring Tools

```typescript
const healthMonitor: {
  getStatus(): SystemHealthStatus
  checkComponent(component: string): ComponentHealth
}

const metricsCollector: {
  getMetrics(): SystemMetrics
  recordMetric(name: string, value: number): void
  getMetricHistory(name: string): MetricPoint[]
}

const logger: {
  info(message: string, meta?: object): void
  warn(message: string, meta?: object): void
  error(message: string, meta?: object): void
  debug(message: string, meta?: object): void
}
```

For more detailed API documentation, please refer to the TypeDoc generated documentation or the source code.
