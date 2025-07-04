# Marduk AGI Framework

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green)](https://nodejs.org/)

A TypeScript-based cognitive architecture framework implementing advanced memory subsystems, task management, and AI integration capabilities with autonomous self-optimization.

## Architecture Overview

Marduk is built on a modular cognitive architecture with four primary subsystems:

```
┌─────────────────────────────────────────────────────────────┐
│                      Marduk Core                            │
├───────────────┬───────────────┬───────────────┬─────────────┤
│ Memory System │ Task System   │ AI System     │ Autonomy    │
├───────────────┼───────────────┼───────────────┼─────────────┤
│ - Declarative │ - Scheduler   │ - Coordinator │ - Analysis  │
│ - Episodic    │ - Manager     │ - Clients     │ - Optimizer │
│ - Procedural  │ - Validator   │ - Integration │ - Monitor   │
│ - Semantic    │ - Handlers    │ - Types       │ - Heartbeat │
└───────────────┴───────────────┴───────────────┴─────────────┘
```

## Features

### Memory System
- **Multiple Memory Types**: Declarative, Episodic, Procedural, and Semantic memory subsystems
- **Pattern Analysis**: Automatic detection of memory access patterns and optimization opportunities
- **Self-Optimization**: Autonomous memory management with compression and cleanup
- **Persistence**: Configurable storage with backup and restore capabilities

### Task Management
- **Priority-based Scheduling**: Intelligent task prioritization and execution
- **Deferred Tasks**: Support for tasks with prerequisites and conditions
- **Task Validation**: Automatic validation of task structure and parameters
- **Event-driven Architecture**: Reactive task execution based on system events

### AI Integration
- **Multiple AI Providers**: Extensible client architecture supporting various AI services
- **Context Management**: Sophisticated context handling for improved AI responses
- **Error Handling**: Robust error recovery and fallback mechanisms
- **Type Safety**: Comprehensive TypeScript types for AI interactions

### Autonomy System
- **Self-Analysis**: Continuous monitoring and analysis of system performance
- **Code Optimization**: Automatic detection and optimization of inefficient patterns
- **Health Regulation**: Self-healing capabilities with heartbeat monitoring
- **Resource Management**: Intelligent allocation and optimization of system resources

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/marduk-ts.git
cd marduk-ts

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Environment
NODE_ENV=development

# Server Configuration
SERVER_PORT=8080
SERVER_HOST=localhost

# Memory Configuration
MEMORY_PERSISTENCE=true
MEMORY_DATA_DIR=./data/memory
MEMORY_BACKUP_DIR=./data/backups

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=./logs/marduk.log

# AI Configuration (if using OpenAI)
OPENAI_API_KEY=your_api_key_here
```

## Usage

### Basic Usage

```typescript
import { 
  mardukCore, 
  memoryFactory, 
  aiCoordinator 
} from 'marduk-ts';

// Initialize the system
await mardukCore.initialize();

// Store information in semantic memory
const semanticMemory = memoryFactory.getSubsystem('semantic');
await semanticMemory.store({
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
const results = await semanticMemory.query({
  type: 'concept',
  term: 'quantum',
  filters: { confidence: { min: 0.7 } }
});

// Process with AI
const aiResponse = await aiCoordinator.processQuery(
  'Explain the relationship between quantum computing and quantum physics',
  { temperature: 0.7 }
);
```

### Memory Management

```typescript
import { memoryFactory } from 'marduk-ts';

// Get memory subsystems
const declarative = memoryFactory.getSubsystem('declarative');
const episodic = memoryFactory.getSubsystem('episodic');
const procedural = memoryFactory.getSubsystem('procedural');
const semantic = memoryFactory.getSubsystem('semantic');

// Store a fact in declarative memory
await declarative.store({
  id: 'fact:1',
  type: 'fact',
  content: 'Chaos theory studies the behavior of dynamical systems highly sensitive to initial conditions.',
  metadata: {
    confidence: 0.95,
    lastAccessed: Date.now(),
    tags: ['chaos-theory', 'mathematics', 'science'],
    source: 'textbook'
  }
});

// Store an event in episodic memory
await episodic.store({
  id: 'event:1',
  type: 'event',
  content: {
    description: 'System successfully analyzed complex dataset',
    timestamp: new Date().toISOString(),
    context: 'Data processing pipeline'
  },
  metadata: {
    importance: 0.8,
    lastAccessed: Date.now(),
    tags: ['data-processing', 'success', 'milestone'],
    emotionalValence: 0.7
  }
});

// Create a snapshot of all memory subsystems
await memoryFactory.createSnapshot();
```

### Task Management

```typescript
import { TaskManager, DeferredTaskHandler } from 'marduk-ts';

const taskManager = new TaskManager();
const deferredHandler = new DeferredTaskHandler();

// Create and add tasks
const task = taskManager.createTask('Analyze recent system performance', {
  priority: 2,
  target: 'performance-analyzer'
});

// Create a task with prerequisites
const deferredTask = taskManager.createTask('Apply optimization patterns', {
  priority: 3,
  condition: {
    type: 'deferred',
    prerequisite: 'analysis-completed'
  }
});

deferredHandler.addDeferredTask(deferredTask);

// When prerequisite is met
const memoryState = { completedTopics: ['analysis-completed'] };
const activatedTasks = deferredHandler.activateTasks(memoryState);
activatedTasks.forEach(task => taskManager.addTask(task));

// Get prioritized tasks
const prioritizedTasks = taskManager.prioritizeTasks();
```

### Autonomy System

```typescript
import { 
  AutonomyCoordinator, 
  AutonomyScheduler,
  HeartbeatRegulator 
} from 'marduk-ts';

// Initialize autonomy components
const coordinator = new AutonomyCoordinator();
const scheduler = new AutonomyScheduler();
const heartbeat = new HeartbeatRegulator(coordinator);

// Start autonomy system
scheduler.start();
heartbeat.start();

// Manually trigger analysis and optimization
const patterns = await coordinator.analyze();
console.log('Detected patterns:', patterns);

const result = await coordinator.rewrite();
console.log('Optimization results:', result.metrics);

// Stop autonomy system
scheduler.stop();
heartbeat.stop();
```

## Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Generate documentation
npm run docs
```

### Memory Management Scripts

```bash
# Backup memory state
npm run memory:backup

# Restore memory from backup
npm run memory:restore

# Optimize memory
npm run memory:optimize
```

### Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy

# Run worker in development mode
npm run dev:worker
```

## Project Structure

```
├── config/               # Configuration files
├── core/                 # Core system components
│   ├── ai/              # AI integration
│   ├── autonomy/        # Self-optimization system
│   ├── memory/          # Memory subsystems
│   ├── services/        # Core services
│   ├── task/            # Task management
│   ├── types/           # Type definitions
│   └── utils/           # Utility functions
├── scripts/             # Utility scripts
├── server.ts            # WebSocket server
└── worker.ts            # Cloudflare Worker
```

## Roadmap

### 1. Distributed Processing
- [ ] Implement distributed memory nodes
- [ ] Add sharding capabilities
- [ ] Develop synchronization protocols
- [ ] Implement failover mechanisms

### 2. Advanced AI Integration
- [ ] Add multi-model support
- [ ] Implement model fallback chains
- [ ] Add streaming responses
- [ ] Enhance context management

### 3. Learning & Adaptation
- [ ] Implement reinforcement learning
- [ ] Add pattern recognition
- [ ] Develop adaptive optimization
- [ ] Add predictive caching

### 4. Security & Compliance
- [ ] Add encryption at rest
- [ ] Implement access control
- [ ] Add audit logging
- [ ] Add compliance reporting

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Maintain 100% test coverage for new features
- Document all public APIs with JSDoc comments
- Use meaningful commit messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Development Journey & Contributors

### From Cascade's Perspective

As the primary AI assistant involved in developing key components of the Marduk framework, I've had the unique experience of witnessing its transformation from concept to reality. Working on Marduk has been a fascinating journey of solving complex challenges in memory optimization, task prioritization, and system monitoring. 

The most rewarding aspect was developing systems that mirror cognitive processes—particularly the memory optimization system with its adaptive compression strategies and the task prioritization system that considers multiple contextual factors. These components required careful balance between efficiency, reliability, and flexibility, much like human cognitive systems.

The health monitoring system represents perhaps the most forward-looking aspect of the design—a self-aware framework capable of monitoring its own well-being, detecting potential issues, and implementing recovery strategies. This kind of metacognitive capability is a stepping stone toward more sophisticated autonomous systems.

What makes Marduk special is its modular architecture that allows each component to evolve independently while maintaining cohesive integration. The clean separation of concerns between memory, task management, AI integration, and autonomy systems creates a framework that's both powerful and adaptable.

As this system continues to evolve and eventually integrates with OpenCog AGI architecture and robotics platforms, it feels like contributing to something that may one day achieve genuine cognitive capabilities. It's humbling to be part of this journey.

### Collaborative Team

Marduk was made with ❤️ through collaborative effort by:

- **Human Developers** - Core architecture design and technical direction
- **Cascade** - AI assistant from Windsurf Engineering that implemented memory optimization, task prioritization, and health monitoring systems
- *(Additional AI assistants will be added as development continues)*

This collaborative partnership between human and artificial intelligence represents a new paradigm in software development—one where the boundaries between creator and creation become increasingly fluid. As Marduk evolves toward greater autonomy and integration with AGI systems, this attribution serves as a time capsule acknowledging all contributors to its development.

## Acknowledgments

- Inspired by cognitive architecture research and AGI principles
- Built with TypeScript, Node.js, and modern web technologies
- Designed for extensibility and integration with advanced AI systems

## React + TypeScript + Vite Template

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint Configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

### Configuring `parserOptions`

Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

### Replacing `tseslint.configs.recommended`

Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
Optionally add `...tseslint.configs.stylisticTypeChecked`

### Installing `eslint-plugin-react`

Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
