import { MemoryOptions, ValidationRule } from '../types/memory-interface.js';

export const defaultValidationRules: ValidationRule[] = [
  {
    field: 'id',
    validator: (value) => typeof value === 'string' || typeof value === 'number',
    message: 'ID must be a string or number'
  },
  {
    field: 'type',
    validator: (value) => typeof value === 'string' && value.length > 0,
    message: 'Type must be a non-empty string'
  },
  {
    field: 'content',
    validator: (value) => value !== undefined && value !== null,
    message: 'Content is required'
  }
];

export const memoryDefaults = {
  capacity: 1000,
  persistence: false,
  indexing: ['type', 'id'],
  cleanupThreshold: 0.9,
  validationRules: defaultValidationRules
};

export class MemoryConfigManager {
  private static instance: MemoryConfigManager;
  private configs: Map<string, Required<MemoryOptions>> = new Map();

  private constructor() {
    this.initializeDefaultConfigs();
  }

  static getInstance(): MemoryConfigManager {
    if (!MemoryConfigManager.instance) {
      MemoryConfigManager.instance = new MemoryConfigManager();
    }
    return MemoryConfigManager.instance;
  }

  private initializeDefaultConfigs(): void {
    // Declarative Memory Configuration
    this.setConfig('declarative', {
      capacity: 10000,
      persistence: true,
      indexing: ['type', 'tags', 'content'],
      cleanupThreshold: 0.85,
      validationRules: [
        ...defaultValidationRules,
        {
          field: 'metadata.confidence',
          validator: (value) => typeof value === 'number' && value >= 0 && value <= 1,
          message: 'Confidence must be a number between 0 and 1'
        }
      ]
    });

    // Episodic Memory Configuration
    this.setConfig('episodic', {
      capacity: 5000,
      persistence: true,
      indexing: ['type', 'timestamp', 'tags'],
      cleanupThreshold: 0.8,
      validationRules: [
        ...defaultValidationRules,
        {
          field: 'content.timestamp',
          validator: (value) => !isNaN(Date.parse(value)),
          message: 'Timestamp must be a valid date string'
        }
      ]
    });

    // Procedural Memory Configuration
    this.setConfig('procedural', {
      capacity: 5000,
      persistence: true,
      indexing: ['type', 'category', 'tags'],
      cleanupThreshold: 0.75,
      validationRules: [
        ...defaultValidationRules,
        {
          field: 'metadata.complexity',
          validator: (value) => typeof value === 'number' && value >= 1 && value <= 5,
          message: 'Complexity must be a number between 1 and 5'
        },
        {
          field: 'content.steps',
          validator: (value) => Array.isArray(value) && value.length > 0,
          message: 'Steps must be a non-empty array'
        }
      ]
    });

    // Semantic Memory Configuration
    this.setConfig('semantic', {
      capacity: 20000,
      persistence: true,
      indexing: ['type', 'category', 'relationships'],
      cleanupThreshold: 0.9,
      validationRules: [
        ...defaultValidationRules,
        {
          field: 'content.relationships',
          validator: (value) => Array.isArray(value),
          message: 'Relationships must be an array'
        },
        {
          field: 'metadata.confidence',
          validator: (value) => typeof value === 'number' && value >= 0 && value <= 1,
          message: 'Confidence must be a number between 0 and 1'
        }
      ]
    });
  }

  getConfig(subsystem: string): Required<MemoryOptions> {
    return this.configs.get(subsystem) || { ...memoryDefaults };
  }

  setConfig(subsystem: string, options: Partial<MemoryOptions>): void {
    const currentConfig = this.getConfig(subsystem);
    this.configs.set(subsystem, {
      ...currentConfig,
      ...options,
      validationRules: [
        ...currentConfig.validationRules,
        ...(options.validationRules || [])
      ]
    });
  }

  updateConfig(subsystem: string, updates: Partial<MemoryOptions>): void {
    const currentConfig = this.getConfig(subsystem);
    this.setConfig(subsystem, { ...currentConfig, ...updates });
  }
}