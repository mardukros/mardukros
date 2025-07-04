
# Contributing to Marduk AGI Framework

We welcome contributions to the Marduk AGI Framework! This guide will help you get started with the development process.

## Development Environment

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Run tests:
   ```bash
   npm test
   ```

## Project Structure

The project follows a modular architecture with four main subsystems:

- `src/core/memory`: Memory subsystem components
- `src/core/task`: Task management components
- `src/core/ai`: AI integration components
- `src/core/autonomy`: Self-optimization components

## Coding Standards

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint)
- Write unit tests for new functionality
- Document public APIs with JSDoc comments

## Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for your changes
5. Ensure all tests pass
6. Update documentation if necessary
7. Submit a pull request

## Commit Guidelines

We follow conventional commits for our commit messages:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `test:` for changes to tests
- `refactor:` for code changes that neither fix bugs nor add features
- `chore:` for changes to the build process or auxiliary tools

## Testing

We use Jest for testing. All new features should include tests:

```typescript
// Example test for a memory component
describe('DeclarativeMemory', () => {
  let memory: DeclarativeMemory;
  
  beforeEach(() => {
    memory = new DeclarativeMemory();
  });
  
  it('should store and retrieve facts', async () => {
    const id = await memory.storeFact({ subject: 'Earth', predicate: 'is', object: 'round' });
    const fact = await memory.getFact(id);
    
    expect(fact).toEqual({ 
      id, 
      subject: 'Earth', 
      predicate: 'is', 
      object: 'round',
      confidence: 1.0,
      created: expect.any(String)
    });
  });
});
```

## Documentation

Keep the wiki updated with any significant changes. When adding new features, consider:

1. Updating relevant wiki pages
2. Adding examples to the guides
3. Documenting any configuration options
4. Providing code samples

## Code of Conduct

We expect all contributors to adhere to our Code of Conduct:

- Be respectful and inclusive
- Focus on the technical merits of contributions
- Help others learn and grow
- Prioritize system stability and reliability
