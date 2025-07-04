/**
 * Distributed Agentic Grammar System Tests
 * 
 * Tests for the complete distributed GGML tensor network implementation
 */

import { 
  DistributedAgenticGrammarSystem, 
  createDefaultAgenticGrammarConfig,
  AgenticGrammarExtractor,
  CognitiveKernelRegistry
} from '../agentic-grammar/index.js';

describe('Distributed Agentic Grammar System', () => {
  let system: DistributedAgenticGrammarSystem;
  let config: any;

  beforeEach(() => {
    config = createDefaultAgenticGrammarConfig();
    // Use smaller test directories
    config.extraction.sourceDirectories = ['./src/core/mad9ml'];
    config.extraction.maxFileSize = 512 * 1024; // 512KB for tests
    
    system = new DistributedAgenticGrammarSystem(config);
  });

  describe('System Initialization', () => {
    test('should create system with default config', () => {
      expect(system).toBeDefined();
      expect(config).toBeDefined();
      expect(config.extraction.sourceDirectories).toContain('./src/core/mad9ml');
    });

    test('should initialize successfully', async () => {
      await system.initialize();
      
      const stats = system.getSystemStatistics();
      expect(stats.state.extractedPrimitives).toBeGreaterThan(0);
      expect(stats.state.registeredKernels).toBeGreaterThan(0);
      expect(stats.state.meshNodes).toBeGreaterThan(0);
    }, 30000); // Longer timeout for initialization

    test('should extract agentic primitives', async () => {
      await system.initialize();
      
      const stats = system.getSystemStatistics();
      expect(stats.extraction.totalPrimitives).toBeGreaterThan(0);
      expect(stats.extraction.averageComplexity).toBeGreaterThan(0);
      expect(stats.extraction.primitivesByType).toBeDefined();
    }, 30000);
  });

  describe('Grammar Processing', () => {
    beforeEach(async () => {
      await system.initialize();
    });

    test('should process action queries', async () => {
      const result = await system.processGrammarQuery('Execute the tensor operation');
      
      expect(result).toBeDefined();
      expect(result.result).toBeDefined();
      expect(result.result.shape).toBeDefined();
      expect(result.processing.totalProcessingTime).toBeGreaterThan(0);
      expect(result.routing.length).toBeGreaterThan(0);
    }, 15000);

    test('should process memory queries', async () => {
      const result = await system.processGrammarQuery('Remember the cognitive state');
      
      expect(result).toBeDefined();
      expect(result.routing).toContain(expect.stringMatching(/memory/));
    }, 15000);

    test('should process decision queries', async () => {
      const result = await system.processGrammarQuery('Decide which path to take');
      
      expect(result).toBeDefined();
      expect(result.attention.length).toBeGreaterThan(0);
      expect(result.processing.throughput).toBeGreaterThan(0);
    }, 15000);

    test('should handle complex multi-type queries', async () => {
      const complexQuery = 'Perceive the environment, remember the context, decide on action, and execute plan';
      const result = await system.processGrammarQuery(complexQuery);
      
      expect(result).toBeDefined();
      expect(result.routing.length).toBeGreaterThanOrEqual(2);
      expect(result.processing.totalProcessingTime).toBeGreaterThan(0);
    }, 15000);
  });

  describe('Load Balancing', () => {
    beforeEach(async () => {
      await system.initialize();
    });

    test('should perform load balancing', async () => {
      const beforeStats = system.getSystemStatistics();
      
      await system.performLoadBalancing();
      
      const afterStats = system.getSystemStatistics();
      expect(afterStats.mesh.activeNodes).toBeGreaterThan(0);
      expect(afterStats.mesh.messageReliability).toBeGreaterThan(0);
    }, 10000);
  });

  describe('System Export and Visualization', () => {
    beforeEach(async () => {
      await system.initialize();
    });

    test('should export system state', () => {
      const exportedState = system.exportSystemState();
      
      expect(exportedState).toBeDefined();
      expect(exportedState.config).toBeDefined();
      expect(exportedState.systemState).toBeDefined();
      expect(exportedState.extractedPrimitives).toBeDefined();
      expect(exportedState.registeredKernels).toBeDefined();
      expect(exportedState.timestamp).toBeGreaterThan(0);
    });

    test('should generate network visualization', () => {
      const visualization = system.generateNetworkVisualization();
      
      expect(visualization).toBeDefined();
      expect(visualization).toContain('mermaid');
      expect(visualization).toContain('Distributed GGML Tensor Network');
      expect(visualization).toContain('System Metrics');
    });
  });
});

describe('Agentic Grammar Extractor', () => {
  let extractor: AgenticGrammarExtractor;
  let config: any;

  beforeEach(() => {
    config = createDefaultAgenticGrammarConfig();
    config.extraction.sourceDirectories = ['./src/core/mad9ml'];
    extractor = new AgenticGrammarExtractor(config);
  });

  test('should extract primitives from codebase', async () => {
    const primitives = await extractor.extractAgenticPrimitives();
    
    expect(primitives.size).toBeGreaterThan(0);
    
    // Check that we found different types of primitives
    const types = new Set();
    for (const primitive of primitives.values()) {
      types.add(primitive.type);
    }
    
    expect(types.size).toBeGreaterThan(1); // Should find multiple types
  }, 20000);

  test('should calculate extraction statistics', async () => {
    await extractor.extractAgenticPrimitives();
    const stats = extractor.getExtractionStatistics();
    
    expect(stats.totalPrimitives).toBeGreaterThan(0);
    expect(stats.averageComplexity).toBeGreaterThan(0);
    expect(stats.averageDepth).toBeGreaterThan(0);
    expect(Object.keys(stats.primitivesByType)).toContain('action');
  }, 20000);
});

describe('Cognitive Kernel Registry', () => {
  let registry: CognitiveKernelRegistry;

  beforeEach(() => {
    registry = new CognitiveKernelRegistry();
  });

  test('should create and register kernels', () => {
    const mockPrimitive = {
      id: 'test_action_1',
      type: 'action' as const,
      name: 'testAction',
      sourceLocation: {
        filePath: 'test.ts',
        startLine: 1,
        endLine: 1,
        startColumn: 0,
        endColumn: 10
      },
      parameters: [],
      semanticComplexity: 1.5,
      functionalDepth: 2,
      dependencies: [],
      metadata: {}
    };

    const kernel = registry.createKernelFromPrimitive(mockPrimitive);
    
    expect(kernel).toBeDefined();
    expect(kernel.id).toContain('kernel_test_action_1');
    expect(kernel.tensorShape.length).toBeGreaterThan(0);
    expect(kernel.primeFactorization.length).toBeGreaterThan(0);
    expect(kernel.inputPorts.length).toBeGreaterThan(0);
    expect(kernel.outputPorts.length).toBeGreaterThan(0);
  });

  test('should find kernels by category', () => {
    const mockPrimitive = {
      id: 'test_memory_1',
      type: 'memory' as const,
      name: 'testMemory',
      sourceLocation: {
        filePath: 'test.ts',
        startLine: 1,
        endLine: 1,
        startColumn: 0,
        endColumn: 10
      },
      parameters: [],
      semanticComplexity: 1.0,
      functionalDepth: 1,
      dependencies: [],
      metadata: {}
    };

    registry.createKernelFromPrimitive(mockPrimitive);
    const memoryKernels = registry.findKernelsByCategory('storage');
    
    expect(memoryKernels.length).toBeGreaterThan(0);
    expect(memoryKernels[0].agenticFunction.type).toBe('memory');
  });

  test('should create kernel clusters', () => {
    // Create some test kernels
    const kernelIds = [];
    for (let i = 0; i < 3; i++) {
      const mockPrimitive = {
        id: `test_action_${i}`,
        type: 'action' as const,
        name: `testAction${i}`,
        sourceLocation: {
          filePath: 'test.ts',
          startLine: i + 1,
          endLine: i + 1,
          startColumn: 0,
          endColumn: 10
        },
        parameters: [],
        semanticComplexity: 1.0,
        functionalDepth: 1,
        dependencies: [],
        metadata: {}
      };
      
      const kernel = registry.createKernelFromPrimitive(mockPrimitive);
      kernelIds.push(kernel.id);
    }

    const cluster = registry.createKernelCluster(
      'test_cluster',
      'Test Cluster',
      kernelIds,
      kernelIds[0]
    );

    expect(cluster).toBeDefined();
    expect(cluster.kernels.length).toBe(3);
    expect(cluster.coordinator).toBe(kernelIds[0]);
  });

  test('should manage attention allocation', () => {
    const mockPrimitive = {
      id: 'test_attention_1',
      type: 'attention' as const,
      name: 'testAttention',
      sourceLocation: {
        filePath: 'test.ts',
        startLine: 1,
        endLine: 1,
        startColumn: 0,
        endColumn: 10
      },
      parameters: [],
      semanticComplexity: 1.0,
      functionalDepth: 1,
      dependencies: [],
      metadata: {}
    };

    const kernel = registry.createKernelFromPrimitive(mockPrimitive);
    
    // Update attention allocation
    registry.updateAttentionAllocation(kernel.id, 0.8);
    
    const stats = registry.getRegistryStatistics();
    expect(stats.attentionUtilization).toBeGreaterThan(0);
  });

  test('should get registry statistics', () => {
    const stats = registry.getRegistryStatistics();
    
    expect(stats).toBeDefined();
    expect(stats.totalKernels).toBeGreaterThanOrEqual(0);
    expect(stats.kernelsByCategory).toBeDefined();
    expect(stats.totalClusters).toBeGreaterThanOrEqual(0);
    expect(stats.attentionUtilization).toBeGreaterThanOrEqual(0);
  });
});

describe('Configuration', () => {
  test('should create default config', () => {
    const config = createDefaultAgenticGrammarConfig();
    
    expect(config).toBeDefined();
    expect(config.extraction).toBeDefined();
    expect(config.tensorization).toBeDefined();
    expect(config.distribution).toBeDefined();
    expect(config.primeFactorization).toBeDefined();
    
    expect(config.extraction.sourceDirectories).toContain('./src');
    expect(config.extraction.fileExtensions).toContain('.ts');
    expect(config.tensorization.defaultPrecision).toBe('f32');
    expect(config.distribution.loadBalancingStrategy).toBe('complexity-based');
  });

  test('config should have reasonable defaults', () => {
    const config = createDefaultAgenticGrammarConfig();
    
    expect(config.extraction.maxFileSize).toBeGreaterThan(0);
    expect(config.tensorization.maxTensorDimensions).toBeGreaterThan(0);
    expect(config.distribution.maxKernelsPerCluster).toBeGreaterThan(0);
    expect(config.primeFactorization.maxFactors).toBeGreaterThan(0);
  });
});