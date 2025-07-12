/**
 * ECAN Attention Visualization and Meta-Cognitive Monitor
 * 
 * Provides visualization, logging, and meta-cognitive monitoring capabilities
 * for the ECAN attention allocation system.
 */

import { AttentionField, AttentionValue, AttentionEconomics, AttentionMetaCognition } from './ecan-attention-kernel.js';
import { ResourceOptimization, AttentionAllocationResult } from './ecan-attention-coordinator.js';

/**
 * Visualization data structure for attention patterns
 */
export interface AttentionVisualizationData {
  /** Attention heatmap data */
  heatmap: {
    kernels: string[];
    values: number[][];
    colorScale: string[];
  };
  /** Network graph of attention flow */
  network: {
    nodes: Array<{ id: string; value: number; type: string }>;
    edges: Array<{ source: string; target: string; weight: number }>;
  };
  /** Time series data */
  timeSeries: {
    timestamps: number[];
    metrics: Map<string, number[]>;
  };
  /** Resource utilization charts */
  resources: {
    allocation: Map<string, number>;
    efficiency: number[];
    bottlenecks: string[];
  };
}

/**
 * Meta-cognitive analysis report
 */
export interface MetaCognitiveReport {
  timestamp: number;
  overallEffectiveness: number;
  attentionPatterns: Array<{
    pattern: string;
    strength: number;
    description: string;
    recommendations: string[];
  }>;
  selfModificationEvents: Array<{
    timestamp: number;
    trigger: string;
    modification: any;
    outcome: string;
  }>;
  learningInsights: string[];
  predictiveAnalysis: {
    trendDirection: 'improving' | 'stable' | 'declining';
    confidence: number;
    projections: Map<string, number>;
  };
}

/**
 * Attention policy configuration
 */
export interface AttentionPolicyConfig {
  /** Attention value weights */
  weights: {
    utility: number;
    novelty: number;
    goalAlignment: number;
    resourceEfficiency: number;
  };
  /** Field dynamics parameters */
  dynamics: {
    diffusion: number;
    decay: number;
    amplification: number;
    coherence: number;
  };
  /** Economic policies */
  economics: {
    taxation: number;
    investment: number;
    conservation: number;
    inflation: number;
  };
  /** Self-modification thresholds */
  selfModification: {
    efficiencyThreshold: number;
    adaptationRate: number;
    safetyConstraints: string[];
  };
}

/**
 * ECAN Attention Visualization and Meta-Cognitive Monitor
 */
export class ECANAttentionMonitor {
  private visualizationHistory: AttentionVisualizationData[];
  private reportHistory: MetaCognitiveReport[];
  private policyConfigurations: AttentionPolicyConfig[];
  private isMonitoring: boolean;
  private monitoringInterval: number;
  private alertThresholds: Map<string, number>;

  constructor() {
    this.visualizationHistory = [];
    this.reportHistory = [];
    this.policyConfigurations = [];
    this.isMonitoring = false;
    this.monitoringInterval = 1000; // 1 second
    this.alertThresholds = new Map([
      ['efficiency', 0.5],
      ['utilization', 0.9],
      ['bottlenecks', 5],
      ['taskCoverage', 0.6]
    ]);
  }

  /**
   * Generate visualization data from attention allocation result
   */
  public generateVisualizationData(
    allocationResult: AttentionAllocationResult,
    kernelIds: string[]
  ): AttentionVisualizationData {
    const { allocations, field, optimization } = allocationResult;

    // Generate heatmap data
    const heatmap = this.generateAttentionHeatmap(allocations, kernelIds);

    // Generate network graph
    const network = this.generateAttentionNetwork(allocations, kernelIds);

    // Generate time series data
    const timeSeries = this.generateTimeSeries(allocationResult);

    // Generate resource utilization data
    const resources = this.generateResourceVisualization(optimization);

    const visualizationData: AttentionVisualizationData = {
      heatmap,
      network,
      timeSeries,
      resources
    };

    // Store in history
    this.visualizationHistory.push(visualizationData);
    
    // Keep only last 100 entries
    if (this.visualizationHistory.length > 100) {
      this.visualizationHistory.shift();
    }

    return visualizationData;
  }

  /**
   * Generate attention heatmap visualization
   */
  private generateAttentionHeatmap(
    allocations: Map<string, AttentionValue>,
    kernelIds: string[]
  ): AttentionVisualizationData['heatmap'] {
    const values: number[][] = [];
    const attentionComponents = ['sti', 'lti', 'vlti', 'activation', 'novelty', 'utility'];

    kernelIds.forEach(kernelId => {
      const attention = allocations.get(kernelId);
      if (attention) {
        const kernelValues = [
          attention.sti,
          attention.lti,
          attention.vlti,
          attention.activation,
          attention.novelty,
          attention.utility
        ];
        values.push(kernelValues);
      } else {
        values.push([0, 0, 0, 0, 0, 0]);
      }
    });

    // Generate color scale based on value ranges
    const colorScale = this.generateColorScale(values);

    return {
      kernels: kernelIds,
      values,
      colorScale
    };
  }

  /**
   * Generate color scale for heatmap
   */
  private generateColorScale(values: number[][]): string[] {
    const flatValues = values.flat();
    const minValue = Math.min(...flatValues);
    const maxValue = Math.max(...flatValues);
    const range = maxValue - minValue;

    const colorScale: string[] = [];
    const steps = 10;

    for (let i = 0; i <= steps; i++) {
      const intensity = i / steps;
      const red = Math.round(255 * intensity);
      const blue = Math.round(255 * (1 - intensity));
      const green = Math.round(128 * (1 - Math.abs(intensity - 0.5) * 2));
      colorScale.push(`rgb(${red}, ${green}, ${blue})`);
    }

    return colorScale;
  }

  /**
   * Generate attention network graph
   */
  private generateAttentionNetwork(
    allocations: Map<string, AttentionValue>,
    kernelIds: string[]
  ): AttentionVisualizationData['network'] {
    const nodes = kernelIds.map(kernelId => {
      const attention = allocations.get(kernelId);
      const value = attention ? attention.activation : 0;
      
      // Determine node type based on attention characteristics
      let type = 'standard';
      if (attention) {
        if (attention.novelty > 0.7) type = 'novelty';
        else if (attention.utility > 0.8) type = 'utility';
        else if (attention.activation > 0.8) type = 'active';
      }

      return { id: kernelId, value, type };
    });

    // Generate edges based on attention relationships
    const edges = [];
    for (let i = 0; i < kernelIds.length; i++) {
      for (let j = i + 1; j < kernelIds.length; j++) {
        const sourceAttention = allocations.get(kernelIds[i]);
        const targetAttention = allocations.get(kernelIds[j]);
        
        if (sourceAttention && targetAttention) {
          // Calculate relationship weight based on attention similarity
          const weight = this.calculateAttentionSimilarity(sourceAttention, targetAttention);
          
          if (weight > 0.3) { // Only include significant relationships
            edges.push({
              source: kernelIds[i],
              target: kernelIds[j],
              weight
            });
          }
        }
      }
    }

    return { nodes, edges };
  }

  /**
   * Calculate attention similarity between two attention values
   */
  private calculateAttentionSimilarity(
    attention1: AttentionValue,
    attention2: AttentionValue
  ): number {
    const stiSim = 1 - Math.abs(attention1.sti - attention2.sti);
    const ltiSim = 1 - Math.abs(attention1.lti - attention2.lti);
    const activationSim = 1 - Math.abs(attention1.activation - attention2.activation);
    const noveltySim = 1 - Math.abs(attention1.novelty - attention2.novelty);
    const utilitySim = 1 - Math.abs(attention1.utility - attention2.utility);

    return (stiSim + ltiSim + activationSim + noveltySim + utilitySim) / 5;
  }

  /**
   * Generate time series data
   */
  private generateTimeSeries(
    allocationResult: AttentionAllocationResult
  ): AttentionVisualizationData['timeSeries'] {
    const timestamp = Date.now();
    const metrics = new Map<string, number[]>();

    // Initialize or update metrics
    const currentMetrics = {
      efficiency: allocationResult.optimization.efficiency,
      utilization: allocationResult.optimization.utilization,
      effectiveness: allocationResult.metaAnalysis.effectiveness,
      avgActivation: this.calculateAverageActivation(allocationResult.allocations),
      avgNovelty: this.calculateAverageNovelty(allocationResult.allocations),
      avgUtility: this.calculateAverageUtility(allocationResult.allocations)
    };

    Object.entries(currentMetrics).forEach(([metric, value]) => {
      if (!metrics.has(metric)) {
        metrics.set(metric, []);
      }
      const values = metrics.get(metric)!;
      values.push(value);
      
      // Keep only last 50 data points
      if (values.length > 50) {
        values.shift();
      }
    });

    // Generate timestamps array
    const timestamps = Array.from({ length: metrics.get('efficiency')?.length || 1 }, 
      (_, i) => timestamp - (metrics.get('efficiency')!.length - 1 - i) * this.monitoringInterval);

    return { timestamps, metrics };
  }

  /**
   * Calculate average activation across allocations
   */
  private calculateAverageActivation(allocations: Map<string, AttentionValue>): number {
    const values = Array.from(allocations.values());
    return values.reduce((sum, a) => sum + a.activation, 0) / values.length;
  }

  /**
   * Calculate average novelty across allocations
   */
  private calculateAverageNovelty(allocations: Map<string, AttentionValue>): number {
    const values = Array.from(allocations.values());
    return values.reduce((sum, a) => sum + a.novelty, 0) / values.length;
  }

  /**
   * Calculate average utility across allocations
   */
  private calculateAverageUtility(allocations: Map<string, AttentionValue>): number {
    const values = Array.from(allocations.values());
    return values.reduce((sum, a) => sum + a.utility, 0) / values.length;
  }

  /**
   * Generate resource utilization visualization
   */
  private generateResourceVisualization(
    optimization: ResourceOptimization
  ): AttentionVisualizationData['resources'] {
    return {
      allocation: optimization.allocation,
      efficiency: [optimization.efficiency],
      bottlenecks: optimization.bottlenecks
    };
  }

  /**
   * Generate meta-cognitive analysis report
   */
  public generateMetaCognitiveReport(
    allocationResult: AttentionAllocationResult,
    metaCognition: AttentionMetaCognition,
    economics: AttentionEconomics
  ): MetaCognitiveReport {
    const timestamp = Date.now();
    const overallEffectiveness = allocationResult.metaAnalysis.effectiveness;

    // Analyze attention patterns
    const attentionPatterns = this.analyzeAttentionPatterns(allocationResult);

    // Extract self-modification events
    const selfModificationEvents = metaCognition.policyHistory.slice(-10).map(entry => ({
      timestamp: entry.timestamp,
      trigger: 'efficiency_threshold',
      modification: entry.policy,
      outcome: entry.outcomes
    }));

    // Generate learning insights
    const learningInsights = this.generateLearningInsights(allocationResult, metaCognition);

    // Perform predictive analysis
    const predictiveAnalysis = this.performPredictiveAnalysis();

    const report: MetaCognitiveReport = {
      timestamp,
      overallEffectiveness,
      attentionPatterns,
      selfModificationEvents,
      learningInsights,
      predictiveAnalysis
    };

    // Store in history
    this.reportHistory.push(report);
    
    // Keep only last 50 reports
    if (this.reportHistory.length > 50) {
      this.reportHistory.shift();
    }

    return report;
  }

  /**
   * Analyze attention patterns for meta-cognitive insights
   */
  private analyzeAttentionPatterns(
    allocationResult: AttentionAllocationResult
  ): MetaCognitiveReport['attentionPatterns'] {
    const patterns: MetaCognitiveReport['attentionPatterns'] = [];
    const allocations = allocationResult.allocations;

    // Pattern 1: High activation concentration
    const highActivationKernels = Array.from(allocations.entries())
      .filter(([_, attention]) => attention.activation > 0.8);
    
    if (highActivationKernels.length > 0) {
      patterns.push({
        pattern: 'high_activation_concentration',
        strength: highActivationKernels.length / allocations.size,
        description: `${highActivationKernels.length} kernels showing high activation`,
        recommendations: [
          'Monitor for resource contention',
          'Consider load balancing if performance degrades'
        ]
      });
    }

    // Pattern 2: Novelty-driven allocation
    const noveltyDrivenKernels = Array.from(allocations.entries())
      .filter(([_, attention]) => attention.novelty > 0.6 && attention.activation > 0.5);
    
    if (noveltyDrivenKernels.length > 0) {
      patterns.push({
        pattern: 'novelty_driven_allocation',
        strength: noveltyDrivenKernels.length / allocations.size,
        description: `${noveltyDrivenKernels.length} kernels receiving attention due to novelty`,
        recommendations: [
          'Validate novelty detection accuracy',
          'Monitor learning outcomes from novel situations'
        ]
      });
    }

    // Pattern 3: Utility optimization
    const utilityOptimizedKernels = Array.from(allocations.entries())
      .filter(([_, attention]) => attention.utility > 0.7 && attention.lti > 0.6);
    
    if (utilityOptimizedKernels.length > 0) {
      patterns.push({
        pattern: 'utility_optimization',
        strength: utilityOptimizedKernels.length / allocations.size,
        description: `${utilityOptimizedKernels.length} kernels optimized for high utility`,
        recommendations: [
          'Maintain current utility calculation methods',
          'Consider expanding high-utility kernel capabilities'
        ]
      });
    }

    return patterns;
  }

  /**
   * Generate learning insights from meta-cognitive analysis
   */
  private generateLearningInsights(
    allocationResult: AttentionAllocationResult,
    metaCognition: AttentionMetaCognition
  ): string[] {
    const insights: string[] = [];

    // Effectiveness trend analysis
    if (this.reportHistory.length >= 2) {
      const previousEffectiveness = this.reportHistory[this.reportHistory.length - 1].overallEffectiveness;
      const currentEffectiveness = allocationResult.metaAnalysis.effectiveness;
      const trend = currentEffectiveness - previousEffectiveness;

      if (trend > 0.05) {
        insights.push('Attention allocation effectiveness is improving');
      } else if (trend < -0.05) {
        insights.push('Attention allocation effectiveness is declining - investigate causes');
      }
    }

    // Self-modification effectiveness
    if (metaCognition.policyHistory.length > 0) {
      const recentModifications = metaCognition.policyHistory.slice(-5);
      const avgEffectiveness = recentModifications.reduce((sum, mod) => sum + mod.effectiveness, 0) / recentModifications.length;
      
      if (avgEffectiveness > 0.8) {
        insights.push('Self-modification strategies are highly effective');
      } else if (avgEffectiveness < 0.5) {
        insights.push('Self-modification strategies need improvement');
      }
    }

    // Resource utilization insights
    const utilization = allocationResult.optimization.utilization;
    if (utilization > 0.9) {
      insights.push('System approaching resource limits - consider scaling or optimization');
    } else if (utilization < 0.3) {
      insights.push('System underutilized - opportunity for increased task complexity');
    }

    // Pattern stability insights
    if (this.visualizationHistory.length >= 5) {
      const patternStability = this.calculatePatternStability();
      if (patternStability > 0.8) {
        insights.push('Attention patterns are stable and predictable');
      } else if (patternStability < 0.4) {
        insights.push('Attention patterns are highly variable - may indicate system instability');
      }
    }

    return insights;
  }

  /**
   * Calculate pattern stability across recent history
   */
  private calculatePatternStability(): number {
    if (this.visualizationHistory.length < 2) return 1.0;

    const recent = this.visualizationHistory.slice(-5);
    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 1; i < recent.length; i++) {
      const similarity = this.calculateVisualizationSimilarity(recent[i-1], recent[i]);
      totalSimilarity += similarity;
      comparisons++;
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 1.0;
  }

  /**
   * Calculate similarity between two visualization data sets
   */
  private calculateVisualizationSimilarity(
    vis1: AttentionVisualizationData,
    vis2: AttentionVisualizationData
  ): number {
    // Compare heatmap values
    let heatmapSimilarity = 0;
    const minLength = Math.min(vis1.heatmap.values.length, vis2.heatmap.values.length);
    
    for (let i = 0; i < minLength; i++) {
      const row1 = vis1.heatmap.values[i];
      const row2 = vis2.heatmap.values[i];
      const rowLength = Math.min(row1.length, row2.length);
      
      for (let j = 0; j < rowLength; j++) {
        heatmapSimilarity += 1 - Math.abs(row1[j] - row2[j]);
      }
    }
    
    const totalComparisons = minLength * (vis1.heatmap.values[0]?.length || 6);
    return totalComparisons > 0 ? heatmapSimilarity / totalComparisons : 1.0;
  }

  /**
   * Perform predictive analysis based on historical data
   */
  private performPredictiveAnalysis(): MetaCognitiveReport['predictiveAnalysis'] {
    if (this.reportHistory.length < 3) {
      return {
        trendDirection: 'stable',
        confidence: 0.5,
        projections: new Map()
      };
    }

    const recentReports = this.reportHistory.slice(-5);
    const effectivenessValues = recentReports.map(r => r.overallEffectiveness);

    // Calculate trend
    const trend = this.calculateTrend(effectivenessValues);
    const trendDirection = trend > 0.02 ? 'improving' : trend < -0.02 ? 'declining' : 'stable';

    // Calculate confidence based on trend consistency
    const confidence = this.calculateTrendConfidence(effectivenessValues);

    // Generate projections
    const projections = new Map<string, number>();
    projections.set('effectiveness_next', effectivenessValues[effectivenessValues.length - 1] + trend);
    projections.set('efficiency_trend', trend);
    projections.set('stability_score', this.calculatePatternStability());

    return {
      trendDirection,
      confidence,
      projections
    };
  }

  /**
   * Calculate trend from array of values
   */
  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = values.length;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  /**
   * Calculate confidence in trend prediction
   */
  private calculateTrendConfidence(values: number[]): number {
    if (values.length < 3) return 0.5;

    // Calculate R-squared for trend line fit
    const trend = this.calculateTrend(values);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    let totalVariation = 0;
    let explainedVariation = 0;

    values.forEach((value, index) => {
      const predicted = values[0] + trend * index;
      totalVariation += Math.pow(value - mean, 2);
      explainedVariation += Math.pow(predicted - mean, 2);
    });

    const rSquared = totalVariation > 0 ? explainedVariation / totalVariation : 0;
    return Math.min(1.0, Math.max(0.0, rSquared));
  }

  /**
   * Log attention policy changes for meta-cognitive analysis
   */
  public logPolicyChange(
    oldPolicy: AttentionPolicyConfig,
    newPolicy: AttentionPolicyConfig,
    reason: string,
    effectiveness: number
  ): void {
    const policyChange = {
      timestamp: Date.now(),
      oldPolicy,
      newPolicy,
      reason,
      effectiveness,
      changes: this.calculatePolicyChanges(oldPolicy, newPolicy)
    };

    console.log('ECAN Policy Change:', policyChange);

    // Store policy configuration
    this.policyConfigurations.push(newPolicy);
    
    // Keep only last 20 configurations
    if (this.policyConfigurations.length > 20) {
      this.policyConfigurations.shift();
    }
  }

  /**
   * Calculate specific changes between policy configurations
   */
  private calculatePolicyChanges(
    oldPolicy: AttentionPolicyConfig,
    newPolicy: AttentionPolicyConfig
  ): any {
    return {
      weights: {
        utility: newPolicy.weights.utility - oldPolicy.weights.utility,
        novelty: newPolicy.weights.novelty - oldPolicy.weights.novelty,
        goalAlignment: newPolicy.weights.goalAlignment - oldPolicy.weights.goalAlignment,
        resourceEfficiency: newPolicy.weights.resourceEfficiency - oldPolicy.weights.resourceEfficiency
      },
      dynamics: {
        diffusion: newPolicy.dynamics.diffusion - oldPolicy.dynamics.diffusion,
        decay: newPolicy.dynamics.decay - oldPolicy.dynamics.decay,
        amplification: newPolicy.dynamics.amplification - oldPolicy.dynamics.amplification,
        coherence: newPolicy.dynamics.coherence - oldPolicy.dynamics.coherence
      },
      economics: {
        taxation: newPolicy.economics.taxation - oldPolicy.economics.taxation,
        investment: newPolicy.economics.investment - oldPolicy.economics.investment,
        conservation: newPolicy.economics.conservation - oldPolicy.economics.conservation
      }
    };
  }

  /**
   * Start continuous monitoring of attention system
   */
  public startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('ECAN Attention Monitor: Started continuous monitoring');
  }

  /**
   * Stop continuous monitoring
   */
  public stopMonitoring(): void {
    this.isMonitoring = false;
    console.log('ECAN Attention Monitor: Stopped continuous monitoring');
  }

  /**
   * Check for alerts based on current metrics
   */
  public checkAlerts(allocationResult: AttentionAllocationResult): string[] {
    const alerts: string[] = [];

    // Efficiency alert
    if (allocationResult.optimization.efficiency < this.alertThresholds.get('efficiency')!) {
      alerts.push(`Low efficiency alert: ${allocationResult.optimization.efficiency.toFixed(3)}`);
    }

    // Utilization alert
    if (allocationResult.optimization.utilization > this.alertThresholds.get('utilization')!) {
      alerts.push(`High utilization alert: ${allocationResult.optimization.utilization.toFixed(3)}`);
    }

    // Bottleneck alert
    if (allocationResult.optimization.bottlenecks.length > this.alertThresholds.get('bottlenecks')!) {
      alerts.push(`Multiple bottlenecks detected: ${allocationResult.optimization.bottlenecks.length}`);
    }

    return alerts;
  }

  /**
   * Get monitoring history for analysis
   */
  public getMonitoringHistory(): {
    visualizations: AttentionVisualizationData[];
    reports: MetaCognitiveReport[];
    policies: AttentionPolicyConfig[];
  } {
    return {
      visualizations: [...this.visualizationHistory],
      reports: [...this.reportHistory],
      policies: [...this.policyConfigurations]
    };
  }

  /**
   * Export monitoring data for external analysis
   */
  public exportMonitoringData(): string {
    const exportData = {
      metadata: {
        exportTimestamp: Date.now(),
        monitoringInterval: this.monitoringInterval,
        alertThresholds: Object.fromEntries(this.alertThresholds),
        historyLength: {
          visualizations: this.visualizationHistory.length,
          reports: this.reportHistory.length,
          policies: this.policyConfigurations.length
        }
      },
      data: this.getMonitoringHistory()
    };

    return JSON.stringify(exportData, null, 2);
  }
}