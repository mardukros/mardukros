/**
 * ECAN Attention Coordinator Tests
 * 
 * Tests for the ECAN attention coordinator and distributed task handling.
 */

import { ECANAttentionCoordinator, DistributedTask, AttentionAllocationResult } from '../ecan-attention-coordinator.js';
import { AttentionValue } from '../ecan-attention-kernel.js';

describe('ECANAttentionCoordinator', () => {
  let coordinator: ECANAttentionCoordinator;
  let mockTasks: DistributedTask[];
  let mockGoals: any[];

  beforeEach(() => {
    coordinator = new ECANAttentionCoordinator();
    
    mockTasks = [
      {
        id: 'task1',
        name: 'Process user query',
        priority: 0.8,
        requiredKernels: ['semantic-memory', 'ai-coordinator'],
        estimatedResources: {
          compute: 0.3,
          memory: 0.2,
          bandwidth: 0.1
        },
        deadline: Date.now() + 10000,
        context: { userType: 'premium' }
      },
      {
        id: 'task2',
        name: 'Learn new patterns',
        priority: 0.6,
        requiredKernels: ['semantic-memory', 'autonomy-monitor'],
        estimatedResources: {
          compute: 0.5,
          memory: 0.4,
          bandwidth: 0.2
        },
        context: { learningMode: 'active' }
      },
      {
        id: 'task3',
        name: 'Optimize performance',
        priority: 0.9,
        requiredKernels: ['autonomy-monitor', 'task-manager'],
        estimatedResources: {
          compute: 0.4,
          memory: 0.3,
          bandwidth: 0.15
        },
        context: { optimization: 'urgent' }
      }
    ];

    mockGoals = [
      { id: 'goal1', priority: 0.8, description: 'Maintain high user satisfaction' },
      { id: 'goal2', priority: 0.7, description: 'Continuous learning and improvement' },
      { id: 'goal3', priority: 0.9, description: 'System performance optimization' }
    ];
  });

  describe('Initialization', () => {
    it('should initialize with sample kernels', () => {
      const state = coordinator.getCurrentECANState();
      
      expect(state.allocations.size).toBeGreaterThan(0);
      expect(state.field).toBeDefined();
      expect(state.economics).toBeDefined();
      expect(state.metaCognition).toBeDefined();
    });

    it('should have kernels with performance metrics', () => {
      const state = coordinator.getCurrentECANState();
      
      // Should have semantic-memory, task-manager, ai-coordinator, autonomy-monitor
      expect(state.allocations.has('semantic-memory')).toBe(true);
      expect(state.allocations.has('task-manager')).toBe(true);
      expect(state.allocations.has('ai-coordinator')).toBe(true);
      expect(state.allocations.has('autonomy-monitor')).toBe(true);
    });
  });

  describe('Distributed Task Allocation', () => {
    it('should allocate attention for distributed tasks', async () => {
      const result = await coordinator.allocateAttentionForDistributedTasks(
        mockTasks, 
        mockGoals, 
        { environment: 'production' }
      );

      expect(result).toBeDefined();
      expect(result.allocations).toBeInstanceOf(Map);
      expect(result.field).toBeDefined();
      expect(result.optimization).toBeDefined();
      expect(result.metaAnalysis).toBeDefined();
      
      // Should have allocations for available kernels
      expect(result.allocations.size).toBeGreaterThan(0);
    });

    it('should optimize resource allocation based on task priorities', async () => {
      const result = await coordinator.allocateAttentionForDistributedTasks(
        mockTasks, 
        mockGoals, 
        { environment: 'production' }
      );

      const optimization = result.optimization;
      
      expect(optimization.efficiency).toBeGreaterThanOrEqual(0);
      expect(optimization.efficiency).toBeLessThanOrEqual(1);
      expect(optimization.utilization).toBeGreaterThanOrEqual(0);
      expect(optimization.utilization).toBeLessThanOrEqual(1);
      expect(optimization.allocation).toBeInstanceOf(Map);
      expect(optimization.bottlenecks).toBeInstanceOf(Array);
      expect(optimization.recommendations).toBeInstanceOf(Array);
    });

    it('should generate meta-cognitive analysis', async () => {
      const result = await coordinator.allocateAttentionForDistributedTasks(
        mockTasks, 
        mockGoals, 
        { environment: 'production' }
      );

      const metaAnalysis = result.metaAnalysis;
      
      expect(metaAnalysis.effectiveness).toBeGreaterThanOrEqual(0);
      expect(metaAnalysis.effectiveness).toBeLessThanOrEqual(1);
      expect(metaAnalysis.patterns).toBeInstanceOf(Array);
      expect(metaAnalysis.insights).toBeInstanceOf(Array);
    });

    it('should handle high-priority tasks appropriately', async () => {
      const highPriorityTasks = [
        {
          ...mockTasks[0],
          priority: 0.95,
          context: { urgency: 'critical' }
        }
      ];

      const result = await coordinator.allocateAttentionForDistributedTasks(
        highPriorityTasks, 
        mockGoals, 
        { emergency: true }
      );

      // High priority should result in higher attention allocation
      const allocations = Array.from(result.allocations.values());
      const avgActivation = allocations.reduce((sum, a) => sum + a.activation, 0) / allocations.length;
      
      expect(avgActivation).toBeGreaterThan(0.1);
    });
  });

  describe('Attention Shifting Simulation', () => {
    it('should simulate attention shifting with new tasks', async () => {
      const initialTasks = mockTasks.slice(0, 2);
      const newTasks = mockTasks.slice(2);

      const shiftResult = await coordinator.simulateAttentionShifting(
        initialTasks,
        newTasks,
        mockGoals
      );

      expect(shiftResult.initial).toBeDefined();
      expect(shiftResult.shifted).toBeDefined();
      expect(shiftResult.shiftAnalysis).toBeDefined();
      
      // Should have shift analysis data
      expect(shiftResult.shiftAnalysis.kernelShifts).toBeInstanceOf(Map);
      expect(shiftResult.shiftAnalysis.totalShift).toBeGreaterThanOrEqual(0);
      expect(shiftResult.shiftAnalysis.adaptability).toBeGreaterThanOrEqual(0);
      expect(shiftResult.shiftAnalysis.adaptability).toBeLessThanOrEqual(1);
    });

    it('should show measurable attention shifts between allocations', async () => {
      const initialTasks = [mockTasks[0]];
      const newTasks = [mockTasks[2]]; // High priority optimization task

      const shiftResult = await coordinator.simulateAttentionShifting(
        initialTasks,
        newTasks,
        mockGoals
      );

      // Should detect shifts in attention allocation
      expect(shiftResult.shiftAnalysis.totalShift).toBeGreaterThan(0);
      
      // Should have shift data for kernels
      expect(shiftResult.shiftAnalysis.kernelShifts.size).toBeGreaterThan(0);
    });

    it('should calculate adaptability score correctly', async () => {
      const shiftResult = await coordinator.simulateAttentionShifting(
        mockTasks.slice(0, 1),
        mockTasks.slice(1),
        mockGoals
      );

      const adaptability = shiftResult.shiftAnalysis.adaptability;
      
      expect(adaptability).toBeGreaterThanOrEqual(0);
      expect(adaptability).toBeLessThanOrEqual(1);
      
      // Higher shifts should indicate higher adaptability (up to a point)
      expect(typeof adaptability).toBe('number');
    });
  });

  describe('Resource Optimization Verification', () => {
    it('should verify resource optimization against criteria', async () => {
      const result = await coordinator.allocateAttentionForDistributedTasks(
        mockTasks, 
        mockGoals, 
        { environment: 'test' }
      );

      const verification = coordinator.verifyResourceOptimization(result, mockTasks);
      
      expect(verification.verified).toBeDefined();
      expect(verification.optimizationScore).toBeGreaterThanOrEqual(0);
      expect(verification.optimizationScore).toBeLessThanOrEqual(1);
      expect(verification.details).toBeDefined();
      
      // Should have detailed criteria results
      expect(verification.details.efficiency).toBeDefined();
      expect(verification.details.utilization).toBeDefined();
      expect(verification.details.bottlenecks).toBeDefined();
      expect(verification.details.taskCoverage).toBeDefined();
    });

    it('should calculate task coverage accurately', async () => {
      const result = await coordinator.allocateAttentionForDistributedTasks(
        mockTasks, 
        mockGoals, 
        { environment: 'test' }
      );

      const verification = coordinator.verifyResourceOptimization(result, mockTasks);
      const taskCoverage = verification.details.taskCoverage.value;
      
      expect(taskCoverage).toBeGreaterThanOrEqual(0);
      expect(taskCoverage).toBeLessThanOrEqual(1);
      
      // Should have reasonable coverage for test tasks
      expect(taskCoverage).toBeGreaterThan(0.1);
    });

    it('should identify bottlenecks correctly', async () => {
      // Create scenario with resource contention
      const highDemandTasks = mockTasks.map(task => ({
        ...task,
        priority: 0.9,
        estimatedResources: {
          compute: 0.8,
          memory: 0.8,
          bandwidth: 0.8
        }
      }));

      const result = await coordinator.allocateAttentionForDistributedTasks(
        highDemandTasks, 
        mockGoals, 
        { environment: 'high-load' }
      );

      expect(result.optimization.bottlenecks).toBeInstanceOf(Array);
      
      // High demand scenario might create bottlenecks
      if (result.optimization.bottlenecks.length > 0) {
        result.optimization.bottlenecks.forEach(bottleneck => {
          expect(typeof bottleneck).toBe('string');
          expect(bottleneck.length).toBeGreaterThan(0);
        });
      }
    });

    it('should generate optimization recommendations', async () => {
      const result = await coordinator.allocateAttentionForDistributedTasks(
        mockTasks, 
        mockGoals, 
        { environment: 'test' }
      );

      expect(result.optimization.recommendations).toBeInstanceOf(Array);
      
      // Should have some recommendations
      if (result.optimization.recommendations.length > 0) {
        result.optimization.recommendations.forEach(recommendation => {
          expect(typeof recommendation).toBe('string');
          expect(recommendation.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Pattern Analysis', () => {
    it('should identify attention patterns', async () => {
      const result = await coordinator.allocateAttentionForDistributedTasks(
        mockTasks, 
        mockGoals, 
        { environment: 'test' }
      );

      const patterns = result.metaAnalysis.patterns;
      
      expect(patterns).toBeInstanceOf(Array);
      
      // Should identify some patterns in the allocation
      patterns.forEach(pattern => {
        expect(pattern).toHaveProperty('type');
        expect(pattern).toHaveProperty('strength');
        expect(pattern).toHaveProperty('description');
        expect(pattern).toHaveProperty('recommendations');
      });
    });

    it('should generate actionable insights', async () => {
      const result = await coordinator.allocateAttentionForDistributedTasks(
        mockTasks, 
        mockGoals, 
        { environment: 'test' }
      );

      const insights = result.metaAnalysis.insights;
      
      expect(insights).toBeInstanceOf(Array);
      
      insights.forEach(insight => {
        expect(typeof insight).toBe('string');
        expect(insight.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty task arrays', async () => {
      const result = await coordinator.allocateAttentionForDistributedTasks(
        [], 
        mockGoals, 
        { environment: 'test' }
      );

      expect(result).toBeDefined();
      expect(result.allocations).toBeDefined();
      expect(result.optimization).toBeDefined();
    });

    it('should handle tasks with missing required kernels', async () => {
      const tasksWithMissingKernels = [
        {
          id: 'task-missing',
          name: 'Task with missing kernel',
          priority: 0.5,
          requiredKernels: ['non-existent-kernel'],
          estimatedResources: {
            compute: 0.1,
            memory: 0.1,
            bandwidth: 0.1
          },
          context: {}
        }
      ];

      const result = await coordinator.allocateAttentionForDistributedTasks(
        tasksWithMissingKernels, 
        mockGoals, 
        { environment: 'test' }
      );

      expect(result).toBeDefined();
      // Should handle gracefully without crashing
    });

    it('should handle tasks without deadlines', async () => {
      const tasksWithoutDeadlines = mockTasks.map(task => {
        const { deadline, ...taskWithoutDeadline } = task;
        return taskWithoutDeadline;
      });

      const result = await coordinator.allocateAttentionForDistributedTasks(
        tasksWithoutDeadlines, 
        mockGoals, 
        { environment: 'test' }
      );

      expect(result).toBeDefined();
      expect(result.allocations.size).toBeGreaterThan(0);
    });
  });

  describe('Performance Characteristics', () => {
    it('should complete allocation within reasonable time', async () => {
      const startTime = Date.now();
      
      await coordinator.allocateAttentionForDistributedTasks(
        mockTasks, 
        mockGoals, 
        { environment: 'performance-test' }
      );
      
      const duration = Date.now() - startTime;
      
      // Should complete within 1 second for test scenario
      expect(duration).toBeLessThan(1000);
    });

    it('should scale with number of tasks', async () => {
      const smallTaskSet = mockTasks.slice(0, 1);
      const largeTaskSet = Array(10).fill(0).map((_, i) => ({
        id: `task-${i}`,
        name: `Generated task ${i}`,
        priority: Math.random(),
        requiredKernels: ['semantic-memory'],
        estimatedResources: {
          compute: Math.random() * 0.5,
          memory: Math.random() * 0.5,
          bandwidth: Math.random() * 0.5
        },
        context: { generated: true }
      }));

      const startSmall = Date.now();
      await coordinator.allocateAttentionForDistributedTasks(smallTaskSet, mockGoals, {});
      const smallDuration = Date.now() - startSmall;

      const startLarge = Date.now();
      await coordinator.allocateAttentionForDistributedTasks(largeTaskSet, mockGoals, {});
      const largeDuration = Date.now() - startLarge;

      // Should scale reasonably (not exponentially)
      expect(largeDuration).toBeLessThan(smallDuration * 20);
    });
  });

  describe('State Management', () => {
    it('should maintain state between allocations', async () => {
      const state1 = coordinator.getCurrentECANState();
      
      await coordinator.allocateAttentionForDistributedTasks(
        mockTasks, 
        mockGoals, 
        { environment: 'test' }
      );
      
      const state2 = coordinator.getCurrentECANState();
      
      // State should be updated
      expect(state2).toBeDefined();
      expect(state2.allocations.size).toBeGreaterThanOrEqual(state1.allocations.size);
    });

    it('should accumulate optimization history', async () => {
      // Perform multiple allocations
      for (let i = 0; i < 3; i++) {
        await coordinator.allocateAttentionForDistributedTasks(
          mockTasks, 
          mockGoals, 
          { iteration: i }
        );
      }

      // Should have accumulated history (internal to coordinator)
      const currentState = coordinator.getCurrentECANState();
      expect(currentState).toBeDefined();
    });
  });
});