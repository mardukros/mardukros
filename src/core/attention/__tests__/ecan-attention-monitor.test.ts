/**
 * ECAN Attention Monitor Tests
 * 
 * Tests for the ECAN attention monitoring and visualization system.
 */

import { ECANAttentionMonitor, AttentionVisualizationData, MetaCognitiveReport } from '../ecan-attention-monitor.js';
import { AttentionAllocationResult } from '../ecan-attention-coordinator.js';
import { AttentionValue, AttentionMetaCognition, AttentionEconomics } from '../ecan-attention-kernel.js';

describe('ECANAttentionMonitor', () => {
  let monitor: ECANAttentionMonitor;
  let mockAllocationResult: AttentionAllocationResult;
  let mockKernelIds: string[];

  beforeEach(() => {
    monitor = new ECANAttentionMonitor();
    
    mockKernelIds = ['semantic-memory', 'task-manager', 'ai-coordinator', 'autonomy-monitor'];
    
    // Create mock attention allocations
    const mockAllocations = new Map<string, AttentionValue>();
    mockKernelIds.forEach((kernelId, index) => {
      mockAllocations.set(kernelId, {
        sti: 0.5 + (index * 0.1),
        lti: 0.6 + (index * 0.05),
        vlti: 0.7 + (index * 0.03),
        activation: 0.4 + (index * 0.15),
        novelty: 0.3 + (index * 0.08),
        utility: 0.8 - (index * 0.05)
      });
    });

    mockAllocationResult = {
      allocations: mockAllocations,
      field: {
        shape: [10000, 6, 8],
        values: {
          shape: [10000, 6, 8],
          data: new Float32Array(10000 * 6 * 8),
          type: 'f32',
          size: 10000 * 6 * 8
        },
        dynamics: {
          diffusion: 0.1,
          decay: 0.01,
          amplification: 1.2,
          coherence: 0.8
        },
        allocation: {
          compute: 0.4,
          memory: 0.3,
          bandwidth: 0.2,
          priority: 0.1
        }
      },
      optimization: {
        efficiency: 0.75,
        utilization: 0.6,
        allocation: new Map([
          ['semantic-memory', 200],
          ['task-manager', 150],
          ['ai-coordinator', 180],
          ['autonomy-monitor', 100]
        ]),
        bottlenecks: ['task-manager: High activation but low utility'],
        recommendations: ['Consider redistributing attention to higher-performing kernels']
      },
      metaAnalysis: {
        effectiveness: 0.7,
        patterns: [
          {
            type: 'high_activation',
            kernels: ['ai-coordinator'],
            description: 'Kernels with high attention activation'
          }
        ],
        insights: ['High efficiency achieved - attention allocation is well-optimized']
      }
    };
  });

  describe('Initialization', () => {
    it('should initialize with empty history', () => {
      const history = monitor.getMonitoringHistory();
      
      expect(history.visualizations).toEqual([]);
      expect(history.reports).toEqual([]);
      expect(history.policies).toEqual([]);
    });

    it('should start and stop monitoring', () => {
      expect(() => monitor.startMonitoring()).not.toThrow();
      expect(() => monitor.stopMonitoring()).not.toThrow();
    });
  });

  describe('Visualization Data Generation', () => {
    it('should generate complete visualization data', () => {
      const vizData = monitor.generateVisualizationData(mockAllocationResult, mockKernelIds);
      
      expect(vizData).toBeDefined();
      expect(vizData.heatmap).toBeDefined();
      expect(vizData.network).toBeDefined();
      expect(vizData.timeSeries).toBeDefined();
      expect(vizData.resources).toBeDefined();
    });

    it('should generate heatmap with correct structure', () => {
      const vizData = monitor.generateVisualizationData(mockAllocationResult, mockKernelIds);
      const heatmap = vizData.heatmap;
      
      expect(heatmap.kernels).toEqual(mockKernelIds);
      expect(heatmap.values).toBeInstanceOf(Array);
      expect(heatmap.values.length).toBe(mockKernelIds.length);
      expect(heatmap.colorScale).toBeInstanceOf(Array);
      expect(heatmap.colorScale.length).toBeGreaterThan(0);
      
      // Each kernel should have 6 attention components
      heatmap.values.forEach(kernelValues => {
        expect(kernelValues).toBeInstanceOf(Array);
        expect(kernelValues.length).toBe(6);
        kernelValues.forEach(value => {
          expect(typeof value).toBe('number');
          expect(value).toBeGreaterThanOrEqual(0);
          expect(value).toBeLessThanOrEqual(1);
        });
      });
    });

    it('should generate network graph with nodes and edges', () => {
      const vizData = monitor.generateVisualizationData(mockAllocationResult, mockKernelIds);
      const network = vizData.network;
      
      expect(network.nodes).toBeInstanceOf(Array);
      expect(network.edges).toBeInstanceOf(Array);
      expect(network.nodes.length).toBe(mockKernelIds.length);
      
      network.nodes.forEach(node => {
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('value');
        expect(node).toHaveProperty('type');
        expect(mockKernelIds).toContain(node.id);
        expect(typeof node.value).toBe('number');
        expect(['standard', 'novelty', 'utility', 'active']).toContain(node.type);
      });
      
      network.edges.forEach(edge => {
        expect(edge).toHaveProperty('source');
        expect(edge).toHaveProperty('target');
        expect(edge).toHaveProperty('weight');
        expect(mockKernelIds).toContain(edge.source);
        expect(mockKernelIds).toContain(edge.target);
        expect(typeof edge.weight).toBe('number');
        expect(edge.weight).toBeGreaterThan(0.3); // Only significant relationships
      });
    });

    it('should generate time series data', () => {
      const vizData = monitor.generateVisualizationData(mockAllocationResult, mockKernelIds);
      const timeSeries = vizData.timeSeries;
      
      expect(timeSeries.timestamps).toBeInstanceOf(Array);
      expect(timeSeries.metrics).toBeInstanceOf(Map);
      
      // Should have standard metrics
      const expectedMetrics = ['efficiency', 'utilization', 'effectiveness', 'avgActivation', 'avgNovelty', 'avgUtility'];
      expectedMetrics.forEach(metric => {
        expect(timeSeries.metrics.has(metric)).toBe(true);
        const values = timeSeries.metrics.get(metric)!;
        expect(values).toBeInstanceOf(Array);
        expect(values.length).toBeGreaterThan(0);
      });
    });

    it('should generate resource visualization', () => {
      const vizData = monitor.generateVisualizationData(mockAllocationResult, mockKernelIds);
      const resources = vizData.resources;
      
      expect(resources.allocation).toBeInstanceOf(Map);
      expect(resources.efficiency).toBeInstanceOf(Array);
      expect(resources.bottlenecks).toBeInstanceOf(Array);
      
      expect(resources.efficiency.length).toBeGreaterThan(0);
      expect(resources.allocation.size).toBeGreaterThan(0);
    });

    it('should store visualization history', () => {
      const initialHistory = monitor.getMonitoringHistory();
      const initialLength = initialHistory.visualizations.length;
      
      monitor.generateVisualizationData(mockAllocationResult, mockKernelIds);
      
      const updatedHistory = monitor.getMonitoringHistory();
      expect(updatedHistory.visualizations.length).toBe(initialLength + 1);
    });

    it('should limit history size', () => {
      // Generate more than the limit (100) to test trimming
      for (let i = 0; i < 105; i++) {
        monitor.generateVisualizationData(mockAllocationResult, mockKernelIds);
      }
      
      const history = monitor.getMonitoringHistory();
      expect(history.visualizations.length).toBe(100);
    });
  });

  describe('Meta-Cognitive Report Generation', () => {
    let mockMetaCognition: AttentionMetaCognition;
    let mockEconomics: AttentionEconomics;

    beforeEach(() => {
      mockMetaCognition = {
        policyHistory: [
          {
            timestamp: Date.now() - 10000,
            policy: { dynamics: { decay: 0.01 } },
            effectiveness: 0.8,
            outcomes: 'improvement_detected'
          }
        ],
        selfModification: {
          enabled: true,
          threshold: 0.8,
          strategies: ['policy_adjustment'],
          safetyConstraints: ['max_change_rate']
        },
        monitoring: {
          logging: true,
          visualization: true,
          metrics: ['attention_distribution'],
          alerts: []
        }
      };

      mockEconomics = {
        resources: {
          total: 1000,
          allocated: 600,
          reserved: 100,
          emergency: 50
        },
        policies: {
          inflation: 0.02,
          taxation: 0.1,
          investment: 0.15,
          conservation: 0.05
        },
        market: {
          demand: 1.2,
          supply: 0.9,
          competition: 0.5,
          collaboration: 0.7
        }
      };
    });

    it('should generate complete meta-cognitive report', () => {
      const report = monitor.generateMetaCognitiveReport(
        mockAllocationResult,
        mockMetaCognition,
        mockEconomics
      );
      
      expect(report).toBeDefined();
      expect(report.timestamp).toBeGreaterThan(0);
      expect(report.overallEffectiveness).toBe(mockAllocationResult.metaAnalysis.effectiveness);
      expect(report.attentionPatterns).toBeInstanceOf(Array);
      expect(report.selfModificationEvents).toBeInstanceOf(Array);
      expect(report.learningInsights).toBeInstanceOf(Array);
      expect(report.predictiveAnalysis).toBeDefined();
    });

    it('should analyze attention patterns correctly', () => {
      const report = monitor.generateMetaCognitiveReport(
        mockAllocationResult,
        mockMetaCognition,
        mockEconomics
      );
      
      const patterns = report.attentionPatterns;
      expect(patterns).toBeInstanceOf(Array);
      
      patterns.forEach(pattern => {
        expect(pattern).toHaveProperty('pattern');
        expect(pattern).toHaveProperty('strength');
        expect(pattern).toHaveProperty('description');
        expect(pattern).toHaveProperty('recommendations');
        expect(typeof pattern.strength).toBe('number');
        expect(pattern.strength).toBeGreaterThanOrEqual(0);
        expect(pattern.strength).toBeLessThanOrEqual(1);
      });
    });

    it('should extract self-modification events', () => {
      const report = monitor.generateMetaCognitiveReport(
        mockAllocationResult,
        mockMetaCognition,
        mockEconomics
      );
      
      const events = report.selfModificationEvents;
      expect(events).toBeInstanceOf(Array);
      expect(events.length).toBe(1); // From mock data
      
      events.forEach(event => {
        expect(event).toHaveProperty('timestamp');
        expect(event).toHaveProperty('trigger');
        expect(event).toHaveProperty('modification');
        expect(event).toHaveProperty('outcome');
      });
    });

    it('should generate learning insights', () => {
      const report = monitor.generateMetaCognitiveReport(
        mockAllocationResult,
        mockMetaCognition,
        mockEconomics
      );
      
      const insights = report.learningInsights;
      expect(insights).toBeInstanceOf(Array);
      
      insights.forEach(insight => {
        expect(typeof insight).toBe('string');
        expect(insight.length).toBeGreaterThan(0);
      });
    });

    it('should perform predictive analysis', () => {
      const report = monitor.generateMetaCognitiveReport(
        mockAllocationResult,
        mockMetaCognition,
        mockEconomics
      );
      
      const prediction = report.predictiveAnalysis;
      expect(prediction).toBeDefined();
      expect(['improving', 'stable', 'declining']).toContain(prediction.trendDirection);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(prediction.projections).toBeInstanceOf(Map);
    });

    it('should store report history', () => {
      const initialHistory = monitor.getMonitoringHistory();
      const initialLength = initialHistory.reports.length;
      
      monitor.generateMetaCognitiveReport(
        mockAllocationResult,
        mockMetaCognition,
        mockEconomics
      );
      
      const updatedHistory = monitor.getMonitoringHistory();
      expect(updatedHistory.reports.length).toBe(initialLength + 1);
    });
  });

  describe('Pattern Analysis', () => {
    it('should identify high activation patterns', () => {
      // Create allocation with high activation
      const highActivationAllocations = new Map<string, AttentionValue>();
      mockKernelIds.forEach(kernelId => {
        highActivationAllocations.set(kernelId, {
          sti: 0.7,
          lti: 0.6,
          vlti: 0.5,
          activation: 0.85, // High activation
          novelty: 0.3,
          utility: 0.7
        });
      });

      const modifiedResult = {
        ...mockAllocationResult,
        allocations: highActivationAllocations
      };

      const vizData = monitor.generateVisualizationData(modifiedResult, mockKernelIds);
      expect(vizData).toBeDefined();
      
      // Should detect high activation in the pattern analysis (tested in report generation)
      const mockMetaCognition: AttentionMetaCognition = {
        policyHistory: [],
        selfModification: { enabled: true, threshold: 0.8, strategies: [], safetyConstraints: [] },
        monitoring: { logging: true, visualization: true, metrics: [], alerts: [] }
      };

      const mockEconomics: AttentionEconomics = {
        resources: { total: 1000, allocated: 600, reserved: 100, emergency: 50 },
        policies: { inflation: 0.02, taxation: 0.1, investment: 0.15, conservation: 0.05 },
        market: { demand: 1.0, supply: 1.0, competition: 0.5, collaboration: 0.7 }
      };

      const report = monitor.generateMetaCognitiveReport(modifiedResult, mockMetaCognition, mockEconomics);
      const highActivationPattern = report.attentionPatterns.find(p => p.pattern === 'high_activation_concentration');
      
      expect(highActivationPattern).toBeDefined();
      expect(highActivationPattern!.strength).toBeGreaterThan(0.5);
    });

    it('should identify novelty-driven patterns', () => {
      const noveltyDrivenAllocations = new Map<string, AttentionValue>();
      mockKernelIds.forEach(kernelId => {
        noveltyDrivenAllocations.set(kernelId, {
          sti: 0.6,
          lti: 0.5,
          vlti: 0.4,
          activation: 0.7,
          novelty: 0.8, // High novelty
          utility: 0.5
        });
      });

      const modifiedResult = {
        ...mockAllocationResult,
        allocations: noveltyDrivenAllocations
      };

      const mockMetaCognition: AttentionMetaCognition = {
        policyHistory: [],
        selfModification: { enabled: true, threshold: 0.8, strategies: [], safetyConstraints: [] },
        monitoring: { logging: true, visualization: true, metrics: [], alerts: [] }
      };

      const mockEconomics: AttentionEconomics = {
        resources: { total: 1000, allocated: 600, reserved: 100, emergency: 50 },
        policies: { inflation: 0.02, taxation: 0.1, investment: 0.15, conservation: 0.05 },
        market: { demand: 1.0, supply: 1.0, competition: 0.5, collaboration: 0.7 }
      };

      const report = monitor.generateMetaCognitiveReport(modifiedResult, mockMetaCognition, mockEconomics);
      const noveltyPattern = report.attentionPatterns.find(p => p.pattern === 'novelty_driven_allocation');
      
      expect(noveltyPattern).toBeDefined();
    });
  });

  describe('Alert System', () => {
    it('should check for efficiency alerts', () => {
      const lowEfficiencyResult = {
        ...mockAllocationResult,
        optimization: {
          ...mockAllocationResult.optimization,
          efficiency: 0.3 // Below default threshold of 0.5
        }
      };

      const alerts = monitor.checkAlerts(lowEfficiencyResult);
      expect(alerts).toBeInstanceOf(Array);
      
      const efficiencyAlert = alerts.find(alert => alert.includes('efficiency'));
      expect(efficiencyAlert).toBeDefined();
    });

    it('should check for utilization alerts', () => {
      const highUtilizationResult = {
        ...mockAllocationResult,
        optimization: {
          ...mockAllocationResult.optimization,
          utilization: 0.95 // Above default threshold of 0.9
        }
      };

      const alerts = monitor.checkAlerts(highUtilizationResult);
      const utilizationAlert = alerts.find(alert => alert.includes('utilization'));
      expect(utilizationAlert).toBeDefined();
    });

    it('should check for bottleneck alerts', () => {
      const manyBottlenecksResult = {
        ...mockAllocationResult,
        optimization: {
          ...mockAllocationResult.optimization,
          bottlenecks: Array(10).fill('bottleneck') // More than default threshold of 5
        }
      };

      const alerts = monitor.checkAlerts(manyBottlenecksResult);
      const bottleneckAlert = alerts.find(alert => alert.includes('bottlenecks'));
      expect(bottleneckAlert).toBeDefined();
    });
  });

  describe('Policy Logging', () => {
    it('should log policy changes', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const oldPolicy = {
        weights: { utility: 0.3, novelty: 0.3, goalAlignment: 0.4, resourceEfficiency: 0.0 },
        dynamics: { diffusion: 0.1, decay: 0.01, amplification: 1.2, coherence: 0.8 },
        economics: { taxation: 0.1, investment: 0.15, conservation: 0.05, inflation: 0.02 },
        selfModification: { efficiencyThreshold: 0.8, adaptationRate: 0.1, safetyConstraints: [] }
      };

      const newPolicy = {
        weights: { utility: 0.4, novelty: 0.3, goalAlignment: 0.3, resourceEfficiency: 0.0 },
        dynamics: { diffusion: 0.12, decay: 0.01, amplification: 1.2, coherence: 0.8 },
        economics: { taxation: 0.11, investment: 0.15, conservation: 0.05, inflation: 0.02 },
        selfModification: { efficiencyThreshold: 0.75, adaptationRate: 0.1, safetyConstraints: [] }
      };

      monitor.logPolicyChange(oldPolicy, newPolicy, 'efficiency_improvement', 0.85);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('ECAN Policy Change:', expect.any(Object));
      
      consoleLogSpy.mockRestore();
    });

    it('should store policy configurations', () => {
      const policy = {
        weights: { utility: 0.3, novelty: 0.3, goalAlignment: 0.4, resourceEfficiency: 0.0 },
        dynamics: { diffusion: 0.1, decay: 0.01, amplification: 1.2, coherence: 0.8 },
        economics: { taxation: 0.1, investment: 0.15, conservation: 0.05, inflation: 0.02 },
        selfModification: { efficiencyThreshold: 0.8, adaptationRate: 0.1, safetyConstraints: [] }
      };

      const initialHistory = monitor.getMonitoringHistory();
      const initialPolicyCount = initialHistory.policies.length;

      monitor.logPolicyChange(policy, policy, 'test', 0.8);

      const updatedHistory = monitor.getMonitoringHistory();
      expect(updatedHistory.policies.length).toBe(initialPolicyCount + 1);
    });
  });

  describe('Data Export', () => {
    it('should export monitoring data as JSON', () => {
      // Generate some data first
      monitor.generateVisualizationData(mockAllocationResult, mockKernelIds);
      
      const exportData = monitor.exportMonitoringData();
      
      expect(typeof exportData).toBe('string');
      expect(() => JSON.parse(exportData)).not.toThrow();
      
      const parsedData = JSON.parse(exportData);
      expect(parsedData).toHaveProperty('metadata');
      expect(parsedData).toHaveProperty('data');
      expect(parsedData.metadata).toHaveProperty('exportTimestamp');
      expect(parsedData.metadata).toHaveProperty('historyLength');
    });

    it('should include complete monitoring history in export', () => {
      // Generate some data
      monitor.generateVisualizationData(mockAllocationResult, mockKernelIds);
      
      const mockMetaCognition: AttentionMetaCognition = {
        policyHistory: [],
        selfModification: { enabled: true, threshold: 0.8, strategies: [], safetyConstraints: [] },
        monitoring: { logging: true, visualization: true, metrics: [], alerts: [] }
      };

      const mockEconomics: AttentionEconomics = {
        resources: { total: 1000, allocated: 600, reserved: 100, emergency: 50 },
        policies: { inflation: 0.02, taxation: 0.1, investment: 0.15, conservation: 0.05 },
        market: { demand: 1.0, supply: 1.0, competition: 0.5, collaboration: 0.7 }
      };

      monitor.generateMetaCognitiveReport(mockAllocationResult, mockMetaCognition, mockEconomics);
      
      const exportData = monitor.exportMonitoringData();
      const parsedData = JSON.parse(exportData);
      
      expect(parsedData.data).toHaveProperty('visualizations');
      expect(parsedData.data).toHaveProperty('reports');
      expect(parsedData.data).toHaveProperty('policies');
      expect(parsedData.data.visualizations.length).toBeGreaterThan(0);
      expect(parsedData.data.reports.length).toBeGreaterThan(0);
    });
  });

  describe('Trend Analysis', () => {
    it('should calculate trends from historical data', () => {
      // Generate multiple reports to establish trend
      const mockMetaCognition: AttentionMetaCognition = {
        policyHistory: [],
        selfModification: { enabled: true, threshold: 0.8, strategies: [], safetyConstraints: [] },
        monitoring: { logging: true, visualization: true, metrics: [], alerts: [] }
      };

      const mockEconomics: AttentionEconomics = {
        resources: { total: 1000, allocated: 600, reserved: 100, emergency: 50 },
        policies: { inflation: 0.02, taxation: 0.1, investment: 0.15, conservation: 0.05 },
        market: { demand: 1.0, supply: 1.0, competition: 0.5, collaboration: 0.7 }
      };

      // Generate reports with improving effectiveness
      for (let i = 0; i < 5; i++) {
        const improvingResult = {
          ...mockAllocationResult,
          metaAnalysis: {
            ...mockAllocationResult.metaAnalysis,
            effectiveness: 0.5 + (i * 0.1) // Improving trend
          }
        };
        monitor.generateMetaCognitiveReport(improvingResult, mockMetaCognition, mockEconomics);
      }

      const history = monitor.getMonitoringHistory();
      expect(history.reports.length).toBe(5);
      
      // Last report should show improving trend
      const lastReport = history.reports[history.reports.length - 1];
      expect(lastReport.predictiveAnalysis.trendDirection).toBe('improving');
    });
  });
});