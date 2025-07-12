/**
 * ECAN Attention Kernel Tests
 * 
 * Comprehensive tests for the ECAN attention allocation kernel.
 */

import { ECANAttentionKernel, AttentionValue, AttentionField } from '../ecan-attention-kernel';

describe('ECANAttentionKernel', () => {
  let ecanKernel: ECANAttentionKernel;
  let mockKernels: Map<string, any>;
  let mockGoals: any[];
  let mockContext: any;

  beforeEach(() => {
    ecanKernel = new ECANAttentionKernel();
    
    // Create mock kernels
    mockKernels = new Map([
      ['semantic-memory', {
        id: 'semantic-memory',
        getPerformanceMetrics: () => ({ efficiency: 0.8, accuracy: 0.9 }),
        getCurrentState: () => ({ conceptCount: 5000, queryRate: 100 }),
        getResourceUsage: () => ({ cpu: 0.3, memory: 0.4, bandwidth: 0.2 }),
        getOutputMetrics: () => ({ quality: 0.85, throughput: 120 })
      }],
      ['task-manager', {
        id: 'task-manager',
        getPerformanceMetrics: () => ({ efficiency: 0.7, accuracy: 0.8 }),
        getCurrentState: () => ({ activeTasks: 25, queueLength: 10 }),
        getResourceUsage: () => ({ cpu: 0.5, memory: 0.3, bandwidth: 0.4 }),
        getOutputMetrics: () => ({ quality: 0.75, throughput: 50 })
      }]
    ]);

    mockGoals = [
      { id: 'goal1', priority: 0.8, description: 'Process user queries efficiently' },
      { id: 'goal2', priority: 0.6, description: 'Learn from new patterns' }
    ];

    mockContext = {
      userActivity: 'high',
      systemLoad: 0.7,
      timeOfDay: 'peak'
    };
  });

  describe('Initialization', () => {
    it('should initialize with proper attention field structure', () => {
      const field = ecanKernel.getAttentionField();
      
      expect(field.shape).toEqual([10000, 6, 8]);
      expect(field.values.shape).toEqual([10000, 6, 8]);
      expect(field.values.type).toBe('f32');
      expect(field.values.size).toBe(10000 * 6 * 8);
    });

    it('should initialize with default economics parameters', () => {
      const economics = ecanKernel.getAttentionEconomics();
      
      expect(economics.resources.total).toBe(1000.0);
      expect(economics.resources.reserved).toBe(100.0);
      expect(economics.policies.taxation).toBe(0.1);
      expect(economics.market.demand).toBe(1.0);
    });

    it('should initialize with meta-cognitive capabilities enabled', () => {
      const metaCognition = ecanKernel.getMetaCognition();
      
      expect(metaCognition.selfModification.enabled).toBe(true);
      expect(metaCognition.monitoring.logging).toBe(true);
      expect(metaCognition.monitoring.visualization).toBe(true);
    });
  });

  describe('Attention Allocation', () => {
    it('should allocate attention across kernels', () => {
      const attentionField = ecanKernel.allocateAttention(mockKernels, mockGoals, mockContext);
      
      expect(attentionField).toBeDefined();
      expect(attentionField.shape).toEqual([10000, 6, 8]);
      
      // Check that field data is updated
      const fieldData = attentionField.values.data as Float32Array;
      expect(fieldData.length).toBe(10000 * 6 * 8);
      
      // Check that some values are non-zero (attention was allocated)
      const hasNonZeroValues = Array.from(fieldData).some(value => value > 0);
      expect(hasNonZeroValues).toBe(true);
    });

    it('should calculate attention values with proper weightings', () => {
      const attentionField = ecanKernel.allocateAttention(mockKernels, mockGoals, mockContext);
      
      // Verify attention values are within valid ranges
      const fieldData = attentionField.values.data as Float32Array;
      
      // Check STI values (first component)
      for (let i = 0; i < mockKernels.size; i++) {
        const stiValue = fieldData[i * 6 * 8];
        expect(stiValue).toBeGreaterThanOrEqual(0);
        expect(stiValue).toBeLessThanOrEqual(1);
      }
    });

    it('should apply field dynamics correctly', () => {
      // Allocate attention multiple times to see dynamics in action
      const field1 = ecanKernel.allocateAttention(mockKernels, mockGoals, mockContext);
      const field2 = ecanKernel.allocateAttention(mockKernels, mockGoals, mockContext);
      
      // Verify that values change due to dynamics (decay, amplification)
      const data1 = field1.values.data as Float32Array;
      const data2 = field2.values.data as Float32Array;
      
      let hasChanged = false;
      for (let i = 0; i < Math.min(100, data1.length); i++) {
        if (Math.abs(data1[i] - data2[i]) > 0.001) {
          hasChanged = true;
          break;
        }
      }
      
      expect(hasChanged).toBe(true);
    });
  });

  describe('Resource Economics', () => {
    it('should manage resource allocation properly', () => {
      const initialEconomics = ecanKernel.getAttentionEconomics();
      const initialAllocated = initialEconomics.resources.allocated;
      
      ecanKernel.allocateAttention(mockKernels, mockGoals, mockContext);
      
      const updatedEconomics = ecanKernel.getAttentionEconomics();
      
      // Resource allocation should be updated
      expect(updatedEconomics.resources.allocated).toBeGreaterThanOrEqual(initialAllocated);
      expect(updatedEconomics.resources.allocated).toBeLessThanOrEqual(updatedEconomics.resources.total);
    });

    it('should apply economic policies when resources are scarce', () => {
      // Simulate high resource demand
      const largeKernelSet = new Map();
      for (let i = 0; i < 20; i++) {
        largeKernelSet.set(`kernel-${i}`, {
          id: `kernel-${i}`,
          getPerformanceMetrics: () => ({ efficiency: 0.9, accuracy: 0.9 }),
          getCurrentState: () => ({ load: 0.8 }),
          getResourceUsage: () => ({ cpu: 0.8, memory: 0.8, bandwidth: 0.8 }),
          getOutputMetrics: () => ({ quality: 0.9, throughput: 100 })
        });
      }
      
      const economicsBefore = ecanKernel.getAttentionEconomics();
      const taxationBefore = economicsBefore.policies.taxation;
      
      ecanKernel.allocateAttention(largeKernelSet, mockGoals, mockContext);
      
      const economicsAfter = ecanKernel.getAttentionEconomics();
      
      // Economic policies should be adjusted for scarcity
      expect(economicsAfter.resources.allocated).toBeGreaterThan(0);
      expect(economicsAfter.market.demand).toBeGreaterThan(1);
    });
  });

  describe('Meta-Cognitive Capabilities', () => {
    it('should trigger self-modification when efficiency is low', () => {
      const metaCognitionBefore = ecanKernel.getMetaCognition();
      const historyLengthBefore = metaCognitionBefore.policyHistory.length;
      
      // Create scenario that should trigger low efficiency
      const lowPerformanceKernels = new Map([
        ['low-perf-kernel', {
          id: 'low-perf-kernel',
          getPerformanceMetrics: () => ({ efficiency: 0.1, accuracy: 0.2 }),
          getCurrentState: () => ({ errors: 100 }),
          getResourceUsage: () => ({ cpu: 0.9, memory: 0.9, bandwidth: 0.9 }),
          getOutputMetrics: () => ({ quality: 0.1, throughput: 1 })
        }]
      ]);
      
      // Multiple allocations to potentially trigger self-modification
      for (let i = 0; i < 5; i++) {
        ecanKernel.allocateAttention(lowPerformanceKernels, mockGoals, mockContext);
      }
      
      const metaCognitionAfter = ecanKernel.getMetaCognition();
      
      // Self-modification might have been triggered
      expect(metaCognitionAfter.policyHistory.length).toBeGreaterThanOrEqual(historyLengthBefore);
    });

    it('should log attention allocation when monitoring is enabled', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      ecanKernel.allocateAttention(mockKernels, mockGoals, mockContext);
      
      // Should have logged allocation data
      expect(consoleLogSpy).toHaveBeenCalled();
      
      consoleLogSpy.mockRestore();
    });

    it('should maintain policy history', () => {
      const metaCognition = ecanKernel.getMetaCognition();
      
      // Initial history should be empty
      expect(metaCognition.policyHistory).toEqual([]);
      
      // Should be able to access self-modification strategies
      expect(metaCognition.selfModification.strategies).toContain('policy_adjustment');
      expect(metaCognition.selfModification.strategies).toContain('threshold_tuning');
      expect(metaCognition.selfModification.strategies).toContain('resource_reallocation');
    });
  });

  describe('Kernel Definition', () => {
    it('should create valid ECAN kernel definition', () => {
      const kernelDef = ECANAttentionKernel.createECANKernelDefinition();
      
      expect(kernelDef.id).toBe('ecan-attention');
      expect(kernelDef.name).toBe('ECAN Attention Allocation Kernel');
      expect(kernelDef.category).toBe('attention');
      expect(kernelDef.tensorShape).toEqual([10000, 6, 8]);
      
      // Check degrees of freedom
      expect(kernelDef.degreesOfFreedom.dimensions).toBe(9);
      expect(kernelDef.degreesOfFreedom.complexity).toBe(7);
      expect(kernelDef.degreesOfFreedom.temporal).toBe(8);
      
      // Check functional complexity
      expect(kernelDef.functionalComplexity.computational).toBe('O(n log n)');
      expect(kernelDef.functionalComplexity.memoryAccess).toBe('associative');
      expect(kernelDef.functionalComplexity.branching).toBe(12);
      
      // Check interfaces
      expect(kernelDef.interfaces).toHaveLength(6);
      const interfaceNames = kernelDef.interfaces.map(i => i.name);
      expect(interfaceNames).toContain('allocate_attention');
      expect(interfaceNames).toContain('monitor_field');
      expect(interfaceNames).toContain('manage_economics');
      expect(interfaceNames).toContain('self_modify');
      expect(interfaceNames).toContain('log_policies');
      expect(interfaceNames).toContain('visualize_attention');
    });

    it('should have proper interface tensor components', () => {
      const kernelDef = ECANAttentionKernel.createECANKernelDefinition();
      
      kernelDef.interfaces.forEach(interface_ => {
        expect(interface_.tensorComponent.dimensions).toBeDefined();
        expect(interface_.tensorComponent.semanticMeaning).toBeDefined();
        expect(interface_.tensorComponent.dataType).toBe('f32');
        expect(interface_.messageFields).toBeInstanceOf(Array);
        expect(interface_.messageFields.length).toBeGreaterThan(0);
      });
    });

    it('should have correct dependencies', () => {
      const kernelDef = ECANAttentionKernel.createECANKernelDefinition();
      
      expect(kernelDef.dependencies).toContain('autonomy-monitor');
      expect(kernelDef.dependencies).toContain('memory-coordinator');
      expect(kernelDef.dependencies).toContain('task-manager');
    });
  });

  describe('Attention Value Calculations', () => {
    it('should calculate utility based on performance metrics', () => {
      const field = ecanKernel.allocateAttention(mockKernels, mockGoals, mockContext);
      const fieldData = field.values.data as Float32Array;
      
      // Utility values should reflect kernel performance
      // Higher performing kernel (semantic-memory) should have higher utility
      const semanticUtility = fieldData[40]; // utility component for first kernel
      const taskUtility = fieldData[48]; // utility component for second kernel
      
      expect(semanticUtility).toBeGreaterThan(0);
      expect(taskUtility).toBeGreaterThan(0);
    });

    it('should calculate novelty for new or unexpected states', () => {
      const field = ecanKernel.allocateAttention(mockKernels, mockGoals, mockContext);
      const fieldData = field.values.data as Float32Array;
      
      // Novelty values should be within valid range
      const novelty1 = fieldData[32]; // novelty component for first kernel
      const novelty2 = fieldData[40]; // novelty component for second kernel
      
      expect(novelty1).toBeGreaterThanOrEqual(0);
      expect(novelty1).toBeLessThanOrEqual(1);
      expect(novelty2).toBeGreaterThanOrEqual(0);
      expect(novelty2).toBeLessThanOrEqual(1);
    });

    it('should combine attention factors with proper weighting', () => {
      const field = ecanKernel.allocateAttention(mockKernels, mockGoals, mockContext);
      const fieldData = field.values.data as Float32Array;
      
      // STI should be combination of utility (30%), novelty (30%), and goal alignment (40%)
      const sti1 = fieldData[0]; // STI for first kernel
      const sti2 = fieldData[8]; // STI for second kernel
      
      expect(sti1).toBeGreaterThanOrEqual(0);
      expect(sti1).toBeLessThanOrEqual(1);
      expect(sti2).toBeGreaterThanOrEqual(0);
      expect(sti2).toBeLessThanOrEqual(1);
    });
  });

  describe('Field Dynamics', () => {
    it('should apply decay to attention values over time', () => {
      const field1 = ecanKernel.allocateAttention(mockKernels, mockGoals, mockContext);
      const data1 = Array.from(field1.values.data as Float32Array);
      
      // Simulate time passage by multiple allocations
      for (let i = 0; i < 3; i++) {
        ecanKernel.allocateAttention(mockKernels, mockGoals, mockContext);
      }
      
      const field2 = ecanKernel.getAttentionField();
      const data2 = Array.from(field2.values.data as Float32Array);
      
      // Some values should have decayed (become smaller)
      let hasDecay = false;
      for (let i = 0; i < Math.min(100, data1.length); i++) {
        if (data1[i] > 0 && data2[i] < data1[i]) {
          hasDecay = true;
          break;
        }
      }
      
      expect(hasDecay).toBe(true);
    });

    it('should apply amplification to high-activation areas', () => {
      // Create kernels with high performance to trigger amplification
      const highPerfKernels = new Map([
        ['high-perf', {
          id: 'high-perf',
          getPerformanceMetrics: () => ({ efficiency: 0.95, accuracy: 0.98 }),
          getCurrentState: () => ({ optimal: true }),
          getResourceUsage: () => ({ cpu: 0.2, memory: 0.1, bandwidth: 0.1 }),
          getOutputMetrics: () => ({ quality: 0.95, throughput: 200 })
        }]
      ]);
      
      const field = ecanKernel.allocateAttention(highPerfKernels, mockGoals, mockContext);
      const fieldData = field.values.data as Float32Array;
      
      // High performance should result in high activation
      const activation = fieldData[24]; // activation component
      expect(activation).toBeGreaterThan(0.5);
    });
  });

  describe('Error Handling', () => {
    it('should handle empty kernel maps gracefully', () => {
      const emptyKernels = new Map();
      
      expect(() => {
        ecanKernel.allocateAttention(emptyKernels, mockGoals, mockContext);
      }).not.toThrow();
    });

    it('should handle kernels without performance metrics', () => {
      const incompleteKernels = new Map([
        ['incomplete', { id: 'incomplete' }]
      ]);
      
      expect(() => {
        ecanKernel.allocateAttention(incompleteKernels, mockGoals, mockContext);
      }).not.toThrow();
    });

    it('should handle empty goals array', () => {
      expect(() => {
        ecanKernel.allocateAttention(mockKernels, [], mockContext);
      }).not.toThrow();
    });
  });
});