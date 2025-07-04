
# Getting Started with Marduk

This guide will help you set up and start using the Marduk AGI Framework.

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
SERVER_HOST=0.0.0.0

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

## Basic Usage

### Initialize the System

```typescript
import { mardukCore } from 'marduk-ts';

// Initialize the system
await mardukCore.initialize();
```

### Using Memory

```typescript
import { memoryFactory } from 'marduk-ts';

// Get the declarative memory subsystem
const declarative = memoryFactory.getSubsystem('declarative');

// Store a fact
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

// Retrieve facts
const facts = await declarative.query({
  tags: ['chaos-theory'],
  filters: { confidence: { min: 0.7 } }
});
```

### Using Tasks

```typescript
import { TaskManager } from 'marduk-ts';

const taskManager = new TaskManager();

// Create a task
const task = taskManager.createTask('Analyze data patterns', {
  priority: 2,
  target: 'pattern-analyzer'
});

// Add the task to be executed
taskManager.addTask(task);

// Get prioritized tasks
const prioritizedTasks = taskManager.prioritizeTasks();
```

### Using AI

```typescript
import { aiCoordinator } from 'marduk-ts';

// Process a query with AI
const response = await aiCoordinator.processQuery(
  'What are the implications of chaos theory for predictive modeling?',
  { 
    temperature: 0.7,
    model: 'gpt-4-1106-preview'
  }
);

console.log(response.content);
```

## Running the Server

```bash
# Start the server
npm run dev
```

This will start the WebSocket server and initialize the Marduk core.

## Next Steps

Once you have the basic system running:

1. Explore the [Architecture Overview](../architecture/overview.md) to understand the system design
2. Check out the [API Reference](../api/index.md) for detailed function documentation
3. Review the [Development Guide](../development/index.md) for best practices

For more detailed information about each subsystem, see their respective pages in this wiki.
