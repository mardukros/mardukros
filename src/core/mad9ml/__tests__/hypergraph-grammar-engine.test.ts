/**
 * Hypergraph Grammar Engine Tests
 * 
 * Comprehensive tests for hypergraph pattern encoding, recursive pattern matching,
 * tensor transformations, and meta-cognitive self-analysis capabilities.
 */

import { HypergraphGrammarEngine, createDefaultHypergraphGrammarConfig } from '../hypergraph-grammar-engine';
import { AgenticPrimitive } from '../agentic-grammar/types';

describe('HypergraphGrammarEngine', () => {
  let engine: HypergraphGrammarEngine;
  let config: any;

  beforeEach(() => {
    config = createDefaultHypergraphGrammarConfig();
    engine = new HypergraphGrammarEngine(config);
  });

  describe('Initialization', () => {
    test('should initialize with default configuration', () => {
      expect(engine).toBeDefined();
      expect(config.extraction.sourceDirectories).toContain('./src');
      expect(config.tensorization.defaultPrecision).toBe('f32');
    });

    test('should initialize patterns and transformations', async () => {
      await engine.initialize();
      const stats = engine.getEngineStatistics();
      
      expect(stats.patterns).toBeGreaterThan(0);
      expect(stats.transformations).toBeGreaterThan(0);
    });
  });

  describe('Grammar Encoding as Hypergraph Patterns', () => {
    test('should encode agentic primitives as hypergraph nodes', async () => {
      await engine.initialize();

      const mockPrimitives: AgenticPrimitive[] = [
        {
          id: 'action_1',
          type: 'action',
          name: 'processData',
          sourceLocation: {
            filePath: 'test.ts',
            startLine: 1,
            endLine: 5,
            startColumn: 0,
            endColumn: 20
          },
          parameters: [
            { name: 'data', type: 'any[]' }
          ],
          semanticComplexity: 0.7,
          functionalDepth: 2,
          dependencies: ['memory_1'],
          metadata: { category: 'data-processing' }
        },
        {
          id: 'memory_1',
          type: 'memory',
          name: 'dataStore',
          sourceLocation: {
            filePath: 'test.ts',
            startLine: 10,
            endLine: 15,
            startColumn: 0,
            endColumn: 25
          },
          parameters: [],
          semanticComplexity: 0.5,
          functionalDepth: 1,
          dependencies: [],
          metadata: { category: 'storage' }
        },
        {
          id: 'decision_1',
          type: 'decision',
          name: 'validateInput',
          sourceLocation: {
            filePath: 'test.ts',
            startLine: 20,
            endLine: 30,
            startColumn: 0,
            endColumn: 30
          },
          parameters: [
            { name: 'input', type: 'any' }
          ],
          semanticComplexity: 0.8,
          functionalDepth: 3,
          dependencies: ['action_1'],
          metadata: { category: 'validation' }
        }
      ];

      const hypergraph = await engine.encodeGrammarAsHypergraph(mockPrimitives);
      
      expect(hypergraph.nodes.size).toBe(3);
      expect(hypergraph.edges.size).toBeGreaterThan(0);
      
      // Check that nodes have correct types
      const nodeTypes = Array.from(hypergraph.nodes.values()).map(n => n.type);
      expect(nodeTypes).toContain('action');
      expect(nodeTypes).toContain('memory');
      expect(nodeTypes).toContain('pattern'); // decision maps to pattern
    });

    test('should create pattern-based edges between related primitives', async () => {
      await engine.initialize();

      const mockPrimitives: AgenticPrimitive[] = [
        {
          id: 'percept_1',
          type: 'percept',
          name: 'readSensor',
          sourceLocation: { filePath: 'test.ts', startLine: 1, endLine: 5, startColumn: 0, endColumn: 20 },
          parameters: [],
          semanticComplexity: 0.6,
          functionalDepth: 1,
          dependencies: [],
          metadata: {}
        },
        {
          id: 'action_1',
          type: 'action',
          name: 'processReading',
          sourceLocation: { filePath: 'test.ts', startLine: 10, endLine: 15, startColumn: 0, endColumn: 25 },
          parameters: [{ name: 'reading', type: 'number' }],
          semanticComplexity: 0.7,
          functionalDepth: 2,
          dependencies: ['percept_1'],
          metadata: {}
        }
      ];

      const hypergraph = await engine.encodeGrammarAsHypergraph(mockPrimitives);
      
      // Should create edges for perception-action loop pattern
      expect(hypergraph.edges.size).toBeGreaterThan(0);
      
      const edgeTypes = Array.from(hypergraph.edges.values()).map(e => e.type);
      expect(edgeTypes).toContain('semantic');
    });

    test('should create pattern-based clusters', async () => {
      await engine.initialize();

      const mockPrimitives: AgenticPrimitive[] = [
        {
          id: 'planning_1',
          type: 'planning',
          name: 'createSchedule',
          sourceLocation: { filePath: 'test.ts', startLine: 1, endLine: 10, startColumn: 0, endColumn: 30 },
          parameters: [],
          semanticComplexity: 0.8,
          functionalDepth: 3,
          dependencies: [],
          metadata: {}
        },
        {
          id: 'planning_2',
          type: 'planning',
          name: 'optimizeRoute',
          sourceLocation: { filePath: 'test.ts', startLine: 15, endLine: 25, startColumn: 0, endColumn: 35 },
          parameters: [],
          semanticComplexity: 0.9,
          functionalDepth: 4,
          dependencies: [],
          metadata: {}
        }
      ];

      const hypergraph = await engine.encodeGrammarAsHypergraph(mockPrimitives);
      
      expect(hypergraph.clusters.size).toBeGreaterThan(0);
      
      // Should cluster planning primitives together
      const planningCluster = Array.from(hypergraph.clusters.entries())
        .find(([clusterId, nodeIds]) => clusterId.includes('planning'));
      
      expect(planningCluster).toBeDefined();
      expect(planningCluster![1].length).toBe(2);
    });
  });

  describe('Recursive Pattern Matching with Tensor Operations', () => {
    test('should perform recursive pattern matching', async () => {
      await engine.initialize();

      // Create mock primitives for pattern matching
      const mockPrimitives: AgenticPrimitive[] = [
        {
          id: 'action_sequence_1',
          type: 'action',
          name: 'initializeSystem',
          sourceLocation: { filePath: 'test.ts', startLine: 1, endLine: 5, startColumn: 0, endColumn: 20 },
          parameters: [],
          semanticComplexity: 0.5,
          functionalDepth: 1,
          dependencies: [],
          metadata: { sequence: 1 }
        },
        {
          id: 'action_sequence_2',
          type: 'action',
          name: 'processData',
          sourceLocation: { filePath: 'test.ts', startLine: 10, endLine: 15, startColumn: 0, endColumn: 25 },
          parameters: [],
          semanticComplexity: 0.7,
          functionalDepth: 2,
          dependencies: ['action_sequence_1'],
          metadata: { sequence: 2 }
        },
        {
          id: 'planning_1',
          type: 'planning',
          name: 'scheduleActions',
          sourceLocation: { filePath: 'test.ts', startLine: 20, endLine: 30, startColumn: 0, endColumn: 30 },
          parameters: [],
          semanticComplexity: 0.8,
          functionalDepth: 3,
          dependencies: ['action_sequence_1', 'action_sequence_2'],
          metadata: { coordinator: true }
        }
      ];

      await engine.encodeGrammarAsHypergraph(mockPrimitives);

      const results = await engine.performRecursivePatternMatching(
        'sequential action planning',
        3
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].confidence).toBeGreaterThan(0);
      expect(results[0].matchedNodes.length).toBeGreaterThan(0);
      expect(results[0].tensorRepresentation).toBeDefined();
      expect(results[0].recursionDepth).toBeGreaterThanOrEqual(0);
    });

    test('should limit recursion depth', async () => {
      await engine.initialize();

      const mockPrimitives: AgenticPrimitive[] = [
        {
          id: 'recursive_1',
          type: 'constraint',
          name: 'validateConstraint',
          sourceLocation: { filePath: 'test.ts', startLine: 1, endLine: 10, startColumn: 0, endColumn: 30 },
          parameters: [],
          semanticComplexity: 0.9,
          functionalDepth: 5,
          dependencies: [],
          metadata: { recursive: true }
        }
      ];

      await engine.encodeGrammarAsHypergraph(mockPrimitives);

      const maxDepth = 2;
      const results = await engine.performRecursivePatternMatching(
        'recursive constraint satisfaction',
        maxDepth
      );

      // Should respect recursion depth limit
      results.forEach(result => {
        expect(result.recursionDepth).toBeLessThanOrEqual(maxDepth);
      });
    });

    test('should apply tensor transformations for parallel execution', async () => {
      await engine.initialize();

      const mockPrimitives: AgenticPrimitive[] = [
        {
          id: 'attention_1',
          type: 'attention',
          name: 'focusOnTask',
          sourceLocation: { filePath: 'test.ts', startLine: 1, endLine: 5, startColumn: 0, endColumn: 20 },
          parameters: [],
          semanticComplexity: 0.6,
          functionalDepth: 2,
          dependencies: [],
          metadata: { attentionType: 'focused' }
        }
      ];

      await engine.encodeGrammarAsHypergraph(mockPrimitives);

      const results = await engine.performRecursivePatternMatching(
        'attention focus pattern',
        2
      );

      expect(results.length).toBeGreaterThan(0);
      
      // Tensor representation should have been transformed
      const result = results[0];
      expect(result.tensorRepresentation.shape.length).toBeGreaterThan(0);
      expect(result.tensorRepresentation.size).toBeGreaterThan(0);
    });
  });

  describe('Meta-Cognitive Self-Analysis', () => {
    test('should perform self-analysis and return metrics', async () => {
      await engine.initialize();

      const metrics = await engine.performSelfAnalysis();

      expect(metrics).toBeDefined();
      expect(metrics.patternEfficiency).toBeGreaterThanOrEqual(0);
      expect(metrics.patternEfficiency).toBeLessThanOrEqual(1);
      expect(metrics.evolutionRate).toBeGreaterThanOrEqual(0);
      expect(metrics.complexityGrowth).toBeGreaterThanOrEqual(0);
      expect(metrics.recursionStability).toBeGreaterThanOrEqual(0);
      expect(metrics.recursionStability).toBeLessThanOrEqual(1);
      expect(metrics.neuralSymbolicAlignment).toBeGreaterThanOrEqual(0);
      expect(metrics.neuralSymbolicAlignment).toBeLessThanOrEqual(1);
    });

    test('should track analysis history', async () => {
      await engine.initialize();

      await engine.performSelfAnalysis();
      await engine.performSelfAnalysis();

      const stats = engine.getEngineStatistics();
      expect(stats.analysisHistory.length).toBe(2);
    });

    test('should evolve patterns based on analysis', async () => {
      await engine.initialize();

      const initialStats = engine.getEngineStatistics();
      const initialTransformations = initialStats.transformations;

      // Perform analysis that should trigger evolution
      await engine.performSelfAnalysis();

      const finalStats = engine.getEngineStatistics();
      
      // Evolution state should have changed
      expect(finalStats.evolutionState).toBeDefined();
      expect(finalStats.evolutionState.length).toBeGreaterThan(0);
    });
  });

  describe('Pattern Evolution Capabilities', () => {
    test('should adapt patterns based on performance metrics', async () => {
      await engine.initialize();

      // Simulate multiple analysis cycles to trigger evolution
      for (let i = 0; i < 3; i++) {
        await engine.performSelfAnalysis();
      }

      const stats = engine.getEngineStatistics();
      expect(stats.analysisHistory.length).toBe(3);
      
      // Evolution should be tracked
      expect(stats.evolutionState.every(val => typeof val === 'number')).toBe(true);
    });

    test('should maintain pattern coherence during evolution', async () => {
      await engine.initialize();

      const initialStats = engine.getEngineStatistics();
      const initialPatterns = initialStats.patterns;

      await engine.performSelfAnalysis();

      const finalStats = engine.getEngineStatistics();
      
      // Should maintain core patterns while allowing evolution
      expect(finalStats.patterns).toBeGreaterThanOrEqual(initialPatterns);
    });
  });

  describe('Visualization and Output', () => {
    test('should generate hypergraph visualization', async () => {
      await engine.initialize();

      const mockPrimitives: AgenticPrimitive[] = [
        {
          id: 'viz_test_1',
          type: 'action',
          name: 'testAction',
          sourceLocation: { filePath: 'test.ts', startLine: 1, endLine: 5, startColumn: 0, endColumn: 20 },
          parameters: [],
          semanticComplexity: 0.5,
          functionalDepth: 1,
          dependencies: [],
          metadata: {}
        }
      ];

      await engine.encodeGrammarAsHypergraph(mockPrimitives);

      const visualization = engine.generateHypergraphVisualization();

      expect(visualization).toBeDefined();
      expect(visualization).toContain('# Hypergraph Grammar Patterns Visualization');
      expect(visualization).toContain('## Network Statistics');
      expect(visualization).toContain('## Patterns');
      expect(visualization).toContain('```mermaid');
      expect(visualization).toContain('graph TD');
    });

    test('should include pattern information in visualization', async () => {
      await engine.initialize();

      const visualization = engine.generateHypergraphVisualization();

      expect(visualization).toContain('Sequential Action Pattern');
      expect(visualization).toContain('Perception-Action Loop');
      expect(visualization).toContain('Memory-Goal Adaptation Pattern');
      expect(visualization).toContain('Recursive Constraint Satisfaction');
    });
  });

  describe('Integration and Performance', () => {
    test('should handle large numbers of primitives efficiently', async () => {
      await engine.initialize();

      // Create many mock primitives
      const largePrimitiveSet: AgenticPrimitive[] = [];
      for (let i = 0; i < 50; i++) {
        largePrimitiveSet.push({
          id: `primitive_${i}`,
          type: ['action', 'memory', 'decision', 'planning'][i % 4] as any,
          name: `function_${i}`,
          sourceLocation: { 
            filePath: `file_${Math.floor(i/10)}.ts`, 
            startLine: i, 
            endLine: i + 5, 
            startColumn: 0, 
            endColumn: 20 
          },
          parameters: [],
          semanticComplexity: Math.random(),
          functionalDepth: Math.floor(Math.random() * 5) + 1,
          dependencies: [],
          metadata: { index: i }
        });
      }

      const startTime = Date.now();
      await engine.encodeGrammarAsHypergraph(largePrimitiveSet);
      const endTime = Date.now();

      // Should complete within reasonable time (< 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);

      const stats = engine.getEngineStatistics();
      expect(stats.hypergraphStats.nodeCount).toBe(50);
    });

    test('should maintain consistency across pattern matching operations', async () => {
      await engine.initialize();

      const mockPrimitives: AgenticPrimitive[] = [
        {
          id: 'consistency_test',
          type: 'goal',
          name: 'achieveGoal',
          sourceLocation: { filePath: 'test.ts', startLine: 1, endLine: 5, startColumn: 0, endColumn: 20 },
          parameters: [],
          semanticComplexity: 0.7,
          functionalDepth: 2,
          dependencies: [],
          metadata: {}
        }
      ];

      await engine.encodeGrammarAsHypergraph(mockPrimitives);

      // Run pattern matching multiple times
      const results1 = await engine.performRecursivePatternMatching('goal achievement', 2);
      const results2 = await engine.performRecursivePatternMatching('goal achievement', 2);

      // Results should be consistent (same patterns found)
      expect(results1.length).toBe(results2.length);
      if (results1.length > 0 && results2.length > 0) {
        expect(results1[0].pattern.id).toBe(results2[0].pattern.id);
      }
    });
  });
});

/**
 * Integration tests for the complete hypergraph grammar engine workflow
 */
describe('HypergraphGrammarEngine Integration', () => {
  test('should complete full workflow: extract -> encode -> match -> analyze -> evolve', async () => {
    const config = createDefaultHypergraphGrammarConfig();
    const engine = new HypergraphGrammarEngine(config);

    // 1. Initialize
    await engine.initialize();
    expect(engine.getEngineStatistics().patterns).toBeGreaterThan(0);

    // 2. Encode grammar
    const mockPrimitives: AgenticPrimitive[] = [
      {
        id: 'workflow_action',
        type: 'action',
        name: 'executeWorkflow',
        sourceLocation: { filePath: 'workflow.ts', startLine: 1, endLine: 10, startColumn: 0, endColumn: 30 },
        parameters: [{ name: 'data', type: 'any' }],
        semanticComplexity: 0.8,
        functionalDepth: 3,
        dependencies: [],
        metadata: { workflow: true }
      },
      {
        id: 'workflow_memory',
        type: 'memory',
        name: 'storeResult',
        sourceLocation: { filePath: 'workflow.ts', startLine: 15, endLine: 20, startColumn: 0, endColumn: 25 },
        parameters: [],
        semanticComplexity: 0.5,
        functionalDepth: 1,
        dependencies: ['workflow_action'],
        metadata: { workflow: true }
      }
    ];

    const hypergraph = await engine.encodeGrammarAsHypergraph(mockPrimitives);
    expect(hypergraph.nodes.size).toBe(2);

    // 3. Pattern matching
    const matchResults = await engine.performRecursivePatternMatching('workflow execution', 3);
    expect(matchResults.length).toBeGreaterThan(0);

    // 4. Self-analysis
    const metrics = await engine.performSelfAnalysis();
    expect(metrics.patternEfficiency).toBeGreaterThanOrEqual(0);

    // 5. Visualization
    const visualization = engine.generateHypergraphVisualization();
    expect(visualization).toContain('Hypergraph Grammar Patterns Visualization');

    // 6. Final statistics
    const finalStats = engine.getEngineStatistics();
    expect(finalStats.analysisHistory.length).toBe(1);
    expect(finalStats.evolutionState.length).toBeGreaterThan(0);
  });
});