/**
 * Mad9ml Core Tests - Validation of ggml-based cognitive encoding
 */

import { Mad9mlSystem, createDefaultConfig, makeTensor, randomTensor } from '../index.js';

describe('Mad9ml Core System', () => {
  let mad9ml: Mad9mlSystem;

  beforeEach(async () => {
    const config = createDefaultConfig();
    config.debugMode = true;
    config.memoryCapacity = 100; // Smaller for tests
    
    mad9ml = new Mad9mlSystem(config);
    await mad9ml.initialize();
  });

  test('should initialize successfully', () => {
    expect(mad9ml).toBeDefined();
  });

  test('should perform cognitive cycles', async () => {
    const results = await mad9ml.cognitiveCycle();
    
    expect(results.reflection).toBeDefined();
    expect(results.reflection.performanceAssessment).toBeDefined();
    expect(results.reflection.performanceAssessment.overall).toBeGreaterThanOrEqual(0);
    expect(results.reflection.performanceAssessment.overall).toBeLessThanOrEqual(1);
    
    expect(results.evolutionStats).toBeDefined();
    expect(results.attentionStats).toBeDefined();
    expect(results.hypergraphStats).toBeDefined();
  });

  test('should add memories and tasks', () => {
    mad9ml.addMemory('episodic', 'Test memory content');
    mad9ml.addTask('Test task', 0.8, []);
    
    const stats = mad9ml.getSystemStatistics();
    expect(stats.subsystemStats.hypergraph.nodeCount).toBeGreaterThan(6); // Initial + added nodes
  });

  test('should evolve persona over multiple cycles', async () => {
    const initialStats = mad9ml.getSystemStatistics();
    const initialGeneration = initialStats.subsystemStats.evolution.generation;
    
    // Run multiple cycles to trigger evolution
    for (let i = 0; i < 3; i++) {
      await mad9ml.cognitiveCycle();
    }
    
    const finalStats = mad9ml.getSystemStatistics();
    const finalGeneration = finalStats.subsystemStats.evolution.generation;
    
    expect(finalGeneration).toBeGreaterThanOrEqual(initialGeneration);
  });

  test('should maintain system stability', async () => {
    const stats1 = mad9ml.getSystemStatistics();
    
    await mad9ml.cognitiveCycle();
    
    const stats2 = mad9ml.getSystemStatistics();
    
    // System should remain stable
    expect(stats2.cognitiveState.memoryHealth).toBeGreaterThan(0.5);
    expect(stats2.cognitiveState.personaStability).toBeGreaterThan(0);
  });

  test('should export and handle system state', () => {
    const exportedState = mad9ml.exportState();
    
    expect(exportedState).toBeDefined();
    expect(exportedState.config).toBeDefined();
    expect(exportedState.cognitiveState).toBeDefined();
    expect(exportedState.hypergraph).toBeDefined();
    expect(exportedState.cycleCount).toBeDefined();
  });
});

describe('Tensor Operations', () => {
  test('should create tensors with correct shapes', () => {
    const tensor = makeTensor([3, 4, 5]);
    
    expect(tensor.shape).toEqual([3, 4, 5]);
    expect(tensor.size).toBe(60);
    expect(tensor.data.length).toBe(60);
  });

  test('should create random tensors', () => {
    const tensor = randomTensor([2, 3], 1.0);
    
    expect(tensor.shape).toEqual([2, 3]);
    expect(tensor.size).toBe(6);
    
    // Check that values are actually random (not all zeros)
    const data = Array.from(tensor.data);
    const allZeros = data.every(val => val === 0);
    expect(allZeros).toBe(false);
  });

  test('should handle tensor operations', () => {
    const a = makeTensor([2, 2], [1, 2, 3, 4]);
    const b = makeTensor([2, 2], [2, 3, 4, 5]);
    
    // Test addition
    const sum = require('../tensor/operations.js').addTensors(a, b);
    expect(Array.from(sum.data)).toEqual([3, 5, 7, 9]);
    
    // Test scalar multiplication
    const scaled = require('../tensor/operations.js').scaleTensor(a, 2);
    expect(Array.from(scaled.data)).toEqual([2, 4, 6, 8]);
  });
});

describe('Integration Test - Mad Scientist Demo', () => {
  test('should run the mad scientist demonstration', async () => {
    const config = createDefaultConfig();
    config.debugMode = false; // Less verbose for test
    config.memoryCapacity = 50;
    
    const system = new Mad9mlSystem(config);
    await system.initialize();
    
    // Suppress console output during test
    const originalLog = console.log;
    console.log = jest.fn();
    
    try {
      await system.demonstrateMadScientistMadness();
      
      const stats = system.getSystemStatistics();
      expect(stats.cycleCount).toBeGreaterThan(0);
      expect(stats.subsystemStats.hypergraph.nodeCount).toBeGreaterThan(6);
    } finally {
      console.log = originalLog;
    }
  }, 10000); // Longer timeout for integration test
});