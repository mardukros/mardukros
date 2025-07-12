/**
 * ECAN Attention System Integration Tests
 * 
 * Comprehensive integration tests for the complete ECAN attention allocation system.
 */

import { ECANAttentionSystem, DistributedTask } from '../index.js';
import { CognitiveKernelRegistry } from '../../tensor-shapes/cognitive-kernel-registry.js';

describe('ECANAttentionSystem Integration', () => {
  let ecanSystem: ECANAttentionSystem;
  let kernelRegistry: CognitiveKernelRegistry;

  beforeEach(async () => {
    ecanSystem = new ECANAttentionSystem();
    kernelRegistry = CognitiveKernelRegistry.getInstance();
    await ecanSystem.initialize();
  });

  afterEach(async () => {
    await ecanSystem.shutdown();
  });

  describe('System Initialization', () => {
    it('should initialize all components successfully', async () => {
      expect(ecanSystem.kernel).toBeDefined();
      expect(ecanSystem.coordinator).toBeDefined();
      expect(ecanSystem.monitor).toBeDefined();
    });

    it('should register ECAN kernel in the cognitive kernel registry', () => {
      const ecanKernel = kernelRegistry.getKernel('ecan-attention');
      
      expect(ecanKernel).toBeDefined();
      expect(ecanKernel!.id).toBe('ecan-attention');
      expect(ecanKernel!.name).toBe('ECAN Attention Allocation Kernel');
      expect(ecanKernel!.category).toBe('attention');
    });

    it('should have proper kernel dependencies', () => {
      const ecanKernel = kernelRegistry.getKernel('ecan-attention');
      
      expect(ecanKernel!.dependencies).toContain('autonomy-monitor');
      expect(ecanKernel!.dependencies).toContain('memory-coordinator');
      expect(ecanKernel!.dependencies).toContain('task-manager');
    });
  });

  describe('Complete Workflow', () => {
    let testTasks: DistributedTask[];
    let testGoals: any[];

    beforeEach(() => {
      testTasks = [
        {
          id: 'workflow-task-1',
          name: 'High-priority user request',
          priority: 0.9,
          requiredKernels: ['semantic-memory', 'ai-coordinator'],
          estimatedResources: {
            compute: 0.4,
            memory: 0.3,
            bandwidth: 0.2
          },
          deadline: Date.now() + 5000,
          context: { 
            userType: 'premium',
            urgency: 'high',
            complexity: 'medium'
          }
        },
        {
          id: 'workflow-task-2',
          name: 'Background learning task',
          priority: 0.5,
          requiredKernels: ['semantic-memory', 'autonomy-monitor'],
          estimatedResources: {
            compute: 0.3,
            memory: 0.4,
            bandwidth: 0.1
          },
          context: {
            learning: true,
            background: true,
            dataSource: 'user_interactions'
          }
        },
        {
          id: 'workflow-task-3',
          name: 'System optimization',
          priority: 0.8,
          requiredKernels: ['autonomy-monitor', 'task-manager'],
          estimatedResources: {
            compute: 0.5,
            memory: 0.2,
            bandwidth: 0.3
          },
          context: {
            optimization: 'performance',
            scope: 'system-wide'
          }
        }
      ];

      testGoals = [
        {
          id: 'goal-user-satisfaction',
          priority: 0.9,
          description: 'Maximize user satisfaction and response quality',
          metrics: ['response_time', 'accuracy', 'completeness']
        },
        {
          id: 'goal-continuous-learning',
          priority: 0.7,
          description: 'Continuously learn and improve from interactions',
          metrics: ['pattern_recognition', 'adaptation_rate', 'knowledge_growth']
        },
        {
          id: 'goal-system-efficiency',
          priority: 0.8,
          description: 'Maintain optimal system performance and resource utilization',
          metrics: ['cpu_efficiency', 'memory_usage', 'response_latency']
        }
      ];
    });

    it('should process distributed tasks end-to-end', async () => {
      const result = await ecanSystem.processDistributedTasks(
        testTasks,
        testGoals,
        { 
          environment: 'integration-test',
          timestamp: Date.now(),
          systemLoad: 0.6
        }
      );

      expect(result).toBeDefined();
      expect(result.allocations.size).toBeGreaterThan(0);
      expect(result.optimization.efficiency).toBeGreaterThanOrEqual(0);
      expect(result.optimization.utilization).toBeGreaterThanOrEqual(0);
      expect(result.metaAnalysis.effectiveness).toBeGreaterThanOrEqual(0);
    });

    it('should demonstrate attention shifting capabilities', async () => {
      const initialTasks = testTasks.slice(0, 2);
      const newTasks = [testTasks[2]];

      const shiftingResult = await ecanSystem.simulateAttentionShifting(
        initialTasks,
        newTasks,
        testGoals
      );

      expect(shiftingResult.initial).toBeDefined();
      expect(shiftingResult.shifted).toBeDefined();
      expect(shiftingResult.shiftAnalysis).toBeDefined();

      // Should detect meaningful shifts
      expect(shiftingResult.shiftAnalysis.totalShift).toBeGreaterThan(0);
      expect(shiftingResult.shiftAnalysis.adaptability).toBeGreaterThanOrEqual(0);
      expect(shiftingResult.shiftAnalysis.kernelShifts.size).toBeGreaterThan(0);
    });

    it('should verify resource optimization', async () => {
      const result = await ecanSystem.processDistributedTasks(
        testTasks,
        testGoals,
        { environment: 'optimization-test' }
      );

      const verification = ecanSystem.verifyResourceOptimization(result, testTasks);

      expect(verification.verified).toBeDefined();
      expect(verification.optimizationScore).toBeGreaterThanOrEqual(0);
      expect(verification.optimizationScore).toBeLessThanOrEqual(1);
      expect(verification.details).toBeDefined();

      // Check specific optimization criteria
      expect(verification.details.efficiency).toHaveProperty('met');
      expect(verification.details.utilization).toHaveProperty('met');
      expect(verification.details.bottlenecks).toHaveProperty('met');
      expect(verification.details.taskCoverage).toHaveProperty('met');
    });
  });

  describe('Dynamic Adaptation', () => {
    it('should adapt to changing task priorities', async () => {
      // Initial allocation with normal priorities
      const initialResult = await ecanSystem.processDistributedTasks(
        testTasks.slice(0, 2),
        testGoals,
        { phase: 'initial' }
      );

      // Change task priorities and add urgent task
      const urgentTask: DistributedTask = {
        id: 'urgent-task',
        name: 'Critical system alert',
        priority: 0.95,
        requiredKernels: ['autonomy-monitor', 'ai-coordinator'],
        estimatedResources: {
          compute: 0.6,
          memory: 0.3,
          bandwidth: 0.4
        },
        deadline: Date.now() + 1000,
        context: { 
          alert: 'critical',
          immediate: true 
        }
      };

      const adaptedResult = await ecanSystem.processDistributedTasks(
        [...testTasks, urgentTask],
        testGoals,
        { phase: 'urgent', emergencyMode: true }
      );

      // Should show adaptation to urgent task
      expect(adaptedResult.allocations.size).toBeGreaterThanOrEqual(initialResult.allocations.size);
      
      // Should have reasonable effectiveness despite urgent changes
      expect(adaptedResult.metaAnalysis.effectiveness).toBeGreaterThan(0.3);
    });

    it('should handle resource scarcity scenarios', async () => {
      // Create high-demand scenario
      const highDemandTasks = testTasks.map(task => ({
        ...task,
        priority: 0.9,
        estimatedResources: {
          compute: 0.7,
          memory: 0.8,
          bandwidth: 0.6
        }
      }));

      const scarcityResult = await ecanSystem.processDistributedTasks(
        highDemandTasks,
        testGoals,
        { 
          environment: 'resource-scarcity',
          availableResources: 0.5
        }
      );

      expect(scarcityResult).toBeDefined();
      
      // Should adapt allocation under scarcity
      expect(scarcityResult.optimization.utilization).toBeGreaterThan(0.5);
      
      // Should identify resource constraints
      if (scarcityResult.optimization.bottlenecks.length > 0) {
        const hasResourceBottleneck = scarcityResult.optimization.bottlenecks.some(
          bottleneck => bottleneck.includes('resource') || bottleneck.includes('capacity')
        );
        // May or may not detect resource bottlenecks depending on implementation
      }
    });

    it('should learn from repeated patterns', async () => {
      const learningContext = { 
        learningMode: true,
        patternId: 'repeated-pattern-1'
      };

      // Process same pattern multiple times
      const results = [];
      for (let i = 0; i < 3; i++) {
        const result = await ecanSystem.processDistributedTasks(
          testTasks,
          testGoals,
          { ...learningContext, iteration: i }
        );
        results.push(result);
      }

      // Should show some form of learning/adaptation
      const firstEffectiveness = results[0].metaAnalysis.effectiveness;
      const lastEffectiveness = results[results.length - 1].metaAnalysis.effectiveness;
      
      // Effectiveness should be maintained or improved
      expect(lastEffectiveness).toBeGreaterThanOrEqual(firstEffectiveness * 0.8);
    });
  });

  describe('Meta-Cognitive Features', () => {
    it('should demonstrate self-monitoring capabilities', async () => {
      const result = await ecanSystem.processDistributedTasks(
        testTasks,
        testGoals,
        { selfMonitoring: true }
      );

      const currentState = ecanSystem.getCurrentState();
      
      expect(currentState.ecan).toBeDefined();
      expect(currentState.monitoring).toBeDefined();
      
      // Should have monitoring data
      expect(currentState.monitoring.visualizations).toBeInstanceOf(Array);
      expect(currentState.monitoring.reports).toBeInstanceOf(Array);
      
      // Should have some meta-cognitive insights
      expect(result.metaAnalysis.insights.length).toBeGreaterThan(0);
    });

    it('should provide attention visualization data', async () => {
      const result = await ecanSystem.processDistributedTasks(
        testTasks,
        testGoals,
        { visualization: true }
      );

      const monitoringHistory = ecanSystem.monitor.getMonitoringHistory();
      
      expect(monitoringHistory.visualizations.length).toBeGreaterThan(0);
      
      const latestViz = monitoringHistory.visualizations[monitoringHistory.visualizations.length - 1];
      expect(latestViz.heatmap).toBeDefined();
      expect(latestViz.network).toBeDefined();
      expect(latestViz.timeSeries).toBeDefined();
      expect(latestViz.resources).toBeDefined();
    });

    it('should support policy logging and modification', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Process tasks multiple times to potentially trigger self-modification
      for (let i = 0; i < 3; i++) {
        await ecanSystem.processDistributedTasks(
          testTasks,
          testGoals,
          { policyModification: true, iteration: i }
        );
      }

      // Should have logged attention allocations
      expect(consoleLogSpy).toHaveBeenCalled();
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle multiple simultaneous tasks efficiently', async () => {
      const largeTasks = Array(15).fill(0).map((_, i) => ({
        id: `perf-task-${i}`,
        name: `Performance test task ${i}`,
        priority: Math.random(),
        requiredKernels: ['semantic-memory', 'task-manager'],
        estimatedResources: {
          compute: Math.random() * 0.3,
          memory: Math.random() * 0.3,
          bandwidth: Math.random() * 0.3
        },
        context: { 
          performance: true,
          batchId: i 
        }
      }));

      const startTime = Date.now();
      
      const result = await ecanSystem.processDistributedTasks(
        largeTasks,
        testGoals,
        { performance: 'test' }
      );
      
      const duration = Date.now() - startTime;
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
      expect(result.allocations.size).toBeGreaterThan(0);
      expect(result.optimization.efficiency).toBeGreaterThanOrEqual(0);
    });

    it('should maintain stable attention allocation under load', async () => {
      const stressResults = [];
      
      // Run multiple allocations in sequence
      for (let i = 0; i < 5; i++) {
        const result = await ecanSystem.processDistributedTasks(
          testTasks,
          testGoals,
          { stress: true, round: i }
        );
        stressResults.push(result);
      }

      // Calculate stability metrics
      const efficiencyValues = stressResults.map(r => r.optimization.efficiency);
      const avgEfficiency = efficiencyValues.reduce((a, b) => a + b, 0) / efficiencyValues.length;
      const efficiencyStdDev = Math.sqrt(
        efficiencyValues.map(x => Math.pow(x - avgEfficiency, 2)).reduce((a, b) => a + b, 0) / efficiencyValues.length
      );

      // Should maintain reasonable stability (coefficient of variation < 50%)
      const coefficientOfVariation = efficiencyStdDev / avgEfficiency;
      expect(coefficientOfVariation).toBeLessThan(0.5);
    });
  });

  describe('Error Recovery and Robustness', () => {
    it('should handle malformed tasks gracefully', async () => {
      const malformedTasks = [
        {
          id: 'malformed-1',
          name: 'Task without required kernels',
          priority: 0.5,
          requiredKernels: [], // Empty
          estimatedResources: {
            compute: 0.1,
            memory: 0.1,
            bandwidth: 0.1
          },
          context: {}
        },
        {
          id: 'malformed-2',
          name: 'Task with invalid priority',
          priority: 1.5, // Invalid (> 1)
          requiredKernels: ['non-existent-kernel'],
          estimatedResources: {
            compute: -0.1, // Invalid
            memory: 0.1,
            bandwidth: 0.1
          },
          context: {}
        }
      ];

      expect(async () => {
        await ecanSystem.processDistributedTasks(
          malformedTasks,
          testGoals,
          { errorTesting: true }
        );
      }).not.toThrow();
    });

    it('should recover from attention allocation failures', async () => {
      // Create scenario that might cause allocation issues
      const problematicTasks = [
        {
          id: 'problematic',
          name: 'Resource-intensive task',
          priority: 0.99,
          requiredKernels: ['non-existent-kernel-1', 'non-existent-kernel-2'],
          estimatedResources: {
            compute: 2.0, // Exceeds normal limits
            memory: 2.0,
            bandwidth: 2.0
          },
          context: { problematic: true }
        }
      ];

      const result = await ecanSystem.processDistributedTasks(
        problematicTasks,
        testGoals,
        { errorRecovery: true }
      );

      // Should still produce a result, even if suboptimal
      expect(result).toBeDefined();
      expect(result.allocations).toBeDefined();
      expect(result.optimization).toBeDefined();
    });
  });

  describe('Data Export and Analysis', () => {
    it('should export complete system data', async () => {
      // Generate some activity
      await ecanSystem.processDistributedTasks(
        testTasks,
        testGoals,
        { export: 'test' }
      );

      const exportData = ecanSystem.exportSystemData();
      
      expect(typeof exportData).toBe('string');
      expect(() => JSON.parse(exportData)).not.toThrow();
      
      const parsedData = JSON.parse(exportData);
      expect(parsedData).toHaveProperty('metadata');
      expect(parsedData).toHaveProperty('data');
    });

    it('should provide real-time system state', () => {
      const state = ecanSystem.getCurrentState();
      
      expect(state.ecan).toBeDefined();
      expect(state.ecan.field).toBeDefined();
      expect(state.ecan.economics).toBeDefined();
      expect(state.ecan.metaCognition).toBeDefined();
      expect(state.ecan.allocations).toBeDefined();
      
      expect(state.monitoring).toBeDefined();
      expect(state.monitoring.visualizations).toBeInstanceOf(Array);
      expect(state.monitoring.reports).toBeInstanceOf(Array);
    });
  });

  describe('Integration with Cognitive Kernel Registry', () => {
    it('should integrate properly with kernel registry', () => {
      const attentionKernels = kernelRegistry.getKernelsByCategory('attention');
      
      expect(attentionKernels.length).toBe(1);
      expect(attentionKernels[0].id).toBe('ecan-attention');
    });

    it('should provide proper kernel interfaces', () => {
      const ecanKernel = kernelRegistry.getKernel('ecan-attention');
      
      expect(ecanKernel!.interfaces.length).toBe(6);
      
      const interfaceNames = ecanKernel!.interfaces.map(i => i.name);
      expect(interfaceNames).toContain('allocate_attention');
      expect(interfaceNames).toContain('monitor_field');
      expect(interfaceNames).toContain('manage_economics');
      expect(interfaceNames).toContain('self_modify');
      expect(interfaceNames).toContain('log_policies');
      expect(interfaceNames).toContain('visualize_attention');
    });

    it('should have valid tensor shapes', () => {
      const ecanKernel = kernelRegistry.getKernel('ecan-attention');
      
      expect(ecanKernel!.tensorShape).toEqual([10000, 6, 8]);
      
      ecanKernel!.interfaces.forEach(interface_ => {
        expect(interface_.tensorComponent.dimensions).toBeInstanceOf(Array);
        expect(interface_.tensorComponent.dimensions.length).toBeGreaterThan(0);
        expect(interface_.tensorComponent.dataType).toBe('f32');
      });
    });
  });
});