
# Marduk Reference Documentation

This directory contains reference materials for the Marduk system, including:

- Persona definitions and characteristics
- System architecture references
- Historical design documents
- Core principles and methodologies

## Structure

- `/persona`: Contains the definitions of Marduk's persona characteristics
  - `marduk-v0.md`: The original "Mad Scientist" persona specification
  - Additional versions as the system evolves

## Usage

The reference materials can be accessed programmatically using the index files in each directory.

```typescript
import { getPersonaContent, listPersonaVersions } from './reference/persona/index.js';

// Get the current persona specification
const currentPersona = getPersonaContent('v0');

// List all available persona versions
const versions = listPersonaVersions();
```

The materials here serve both as documentation and as runtime reference data that the system can use for:

1. Self-understanding and introspection
2. Guiding behavior patterns
3. Preserving design intent across system evolution
4. Providing context for external systems interacting with Marduk
