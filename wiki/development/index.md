
# Development Guide

This section provides guidance for developers working with the Marduk AGI Framework.

## Development Environment

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

## Coding Standards

- Follow TypeScript best practices
- Maintain high test coverage for new features
- Document all public APIs with JSDoc comments
- Use meaningful commit messages

## Adding a New Feature

1. Determine which subsystem the feature belongs to
2. Create necessary interfaces in the appropriate types directory
3. Implement the feature in the appropriate subsystem
4. Add tests for the new functionality
5. Update documentation

## Memory Subsystem Development

When developing for the memory subsystem:

1. Extend the appropriate base classes
2. Implement required interfaces
3. Add validation for new memory types
4. Consider persistence implications
5. Add optimization strategies

## Task Subsystem Development

When developing for the task subsystem:

1. Define task types clearly
2. Implement validation rules
3. Consider task priority mechanisms
4. Handle task failures gracefully

## AI Subsystem Development

When developing for the AI subsystem:

1. Maintain provider-agnostic interfaces
2. Implement robust error handling
3. Optimize token usage
4. Consider context management carefully

## Autonomy Subsystem Development

When developing for the autonomy subsystem:

1. Define clear metrics for analysis
2. Implement safe optimization strategies
3. Add thorough validation
4. Consider potential side effects

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For more detailed guidance, see the specific development guides for each subsystem.
