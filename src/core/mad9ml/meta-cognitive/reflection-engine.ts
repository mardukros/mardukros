/**
 * Meta-Cognitive Engine - Self-reflection and adaptive control system
 * 
 * Implements meta-cognitive routines for self-reflection, performance monitoring,
 * and adaptive control of the cognitive architecture. Enables the system to
 * analyze and modify its own cognitive processes.
 */

import { MetaCognitiveTensor, CognitiveState, Mad9mlConfig, Tensor } from '../types.js';
import { 
  makeTensor, 
  addTensors, 
  scaleTensor, 
  multiplyTensors,
  cloneTensor,
  cosineSimilarity,
  norm
} from '../tensor/operations.js';

/**
 * Meta-cognitive reflection results
 */
export interface ReflectionResult {
  performanceAssessment: {
    overall: number;
    bySubsystem: Record<string, number>;
    trends: Record<string, number>;
  };
  adaptationNeeded: boolean;
  suggestedModifications: {
    persona: boolean;
    attention: boolean;
    memory: boolean;
    parameters: boolean;
  };
  confidenceLevel: number;
  reasoning: string[];
}

/**
 * Self-modification recommendations
 */
export interface SelfModification {
  type: 'parameter_adjustment' | 'structure_change' | 'strategy_change' | 'goal_modification';
  target: string;
  modification: any;
  justification: string;
  priority: number;
  riskLevel: number;
}

/**
 * Meta-cognitive engine for self-awareness and adaptation
 */
export class MetaCognitiveEngine {
  private config: Mad9mlConfig;
  private metaState: MetaCognitiveTensor | null = null;
  private performanceHistory: Array<{ timestamp: number; metrics: Record<string, number> }> = [];
  private modificationHistory: SelfModification[] = [];
  private reflectionDepth: number = 3; // Number of recursive reflection levels

  constructor(config: Mad9mlConfig) {
    this.config = config;
  }

  /**
   * Initializes meta-cognitive state
   */
  initializeMetaCognitiveState(
    numMetrics: number,
    numAdjustments: number,
    historySize: number
  ): MetaCognitiveTensor {
    this.metaState = {
      selfEval: makeTensor([numMetrics]),
      adjustment: makeTensor([numAdjustments]),
      history: makeTensor([historySize, 3]) // [time, metric_type, value]
    };

    return this.metaState;
  }

  /**
   * Performs comprehensive self-reflection and analysis
   */
  performSelfReflection(cognitiveState: CognitiveState): ReflectionResult {
    if (!this.metaState) {
      throw new Error('Meta-cognitive state not initialized');
    }

    // Multi-level recursive reflection
    const reflection = this.recursiveReflection(cognitiveState, this.reflectionDepth);
    
    // Update meta-cognitive state based on reflection
    this.updateMetaState(reflection, cognitiveState);
    
    return reflection;
  }

  /**
   * Implements recursive self-reflection with multiple depth levels
   */
  private recursiveReflection(cognitiveState: CognitiveState, depth: number): ReflectionResult {
    if (depth <= 0) {
      return this.baseReflection(cognitiveState);
    }

    // Perform reflection at current level
    const currentReflection = this.baseReflection(cognitiveState);
    
    // Reflect on the reflection itself (meta-meta-cognition)
    const metaReflection = this.recursiveReflection(cognitiveState, depth - 1);
    
    // Combine insights from different reflection levels
    return this.combineReflections(currentReflection, metaReflection);
  }

  /**
   * Performs base-level reflection and analysis
   */
  private baseReflection(cognitiveState: CognitiveState): ReflectionResult {
    const performanceAssessment = this.assessPerformance(cognitiveState);
    const adaptationNeeded = this.determineAdaptationNeed(performanceAssessment);
    const suggestedModifications = this.analyzeSuggestedModifications(cognitiveState, performanceAssessment);
    const confidenceLevel = this.calculateConfidenceLevel(performanceAssessment);
    const reasoning = this.generateReasoningChain(performanceAssessment, adaptationNeeded);

    return {
      performanceAssessment,
      adaptationNeeded,
      suggestedModifications,
      confidenceLevel,
      reasoning
    };
  }

  /**
   * Assesses performance across cognitive subsystems
   */
  private assessPerformance(cognitiveState: CognitiveState): ReflectionResult['performanceAssessment'] {
    const metrics = {
      memory: this.assessMemoryPerformance(cognitiveState.memory),
      task: this.assessTaskPerformance(cognitiveState.task),
      persona: this.assessPersonaPerformance(cognitiveState.persona),
      attention: this.assessAttentionPerformance(cognitiveState.task.attention),
      hypergraph: this.assessHypergraphPerformance(cognitiveState.hypergraph)
    };

    const overall = Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.keys(metrics).length;
    
    // Calculate trends from performance history
    const trends = this.calculatePerformanceTrends(metrics);

    return {
      overall,
      bySubsystem: metrics,
      trends
    };
  }

  /**
   * Assesses memory subsystem performance
   */
  private assessMemoryPerformance(memory: any): number {
    // Evaluate memory efficiency, recall accuracy, and consolidation
    const episodicHealth = this.evaluateTensorHealth(memory.episodic);
    const semanticHealth = this.evaluateTensorHealth(memory.semantic);
    const proceduralHealth = this.evaluateTensorHealth(memory.procedural);
    const workingHealth = this.evaluateTensorHealth(memory.working);

    return (episodicHealth + semanticHealth + proceduralHealth + workingHealth) / 4;
  }

  /**
   * Assesses task system performance
   */
  private assessTaskPerformance(task: any): number {
    // Evaluate task completion rates, scheduling efficiency, resource utilization
    const activeTasksHealth = this.evaluateTensorHealth(task.active);
    const queueHealth = this.evaluateTensorHealth(task.queue);
    const attentionHealth = this.evaluateTensorHealth(task.attention);

    return (activeTasksHealth + queueHealth + attentionHealth) / 3;
  }

  /**
   * Assesses persona stability and adaptation
   */
  private assessPersonaPerformance(persona: any): number {
    // Evaluate persona coherence, adaptation rate, and stability
    const traitStability = this.evaluateTensorStability(persona.traits);
    const parameterHealth = this.evaluateTensorHealth(persona.parameters);
    const mutationBalance = this.evaluateMutationBalance(persona.mutationCoeffs);

    return (traitStability + parameterHealth + mutationBalance) / 3;
  }

  /**
   * Assesses attention allocation effectiveness
   */
  private assessAttentionPerformance(attention: Tensor): number {
    // Evaluate attention distribution, focus quality, and resource efficiency
    const distribution = this.evaluateAttentionDistribution(attention);
    const focus = this.evaluateAttentionFocus(attention);
    const efficiency = this.evaluateAttentionEfficiency(attention);

    return (distribution + focus + efficiency) / 3;
  }

  /**
   * Assesses hypergraph structure and connectivity
   */
  private assessHypergraphPerformance(hypergraph: any): number {
    // Evaluate connectivity, clustering quality, and information flow
    const nodeHealth = hypergraph.nodes.size > 0 ? 0.8 : 0.2;
    const edgeHealth = hypergraph.edges.size > 0 ? 0.8 : 0.2;
    const clusterHealth = hypergraph.clusters.size > 0 ? 0.9 : 0.5;

    return (nodeHealth + edgeHealth + clusterHealth) / 3;
  }

  /**
   * Evaluates tensor health (magnitude, distribution, stability)
   */
  private evaluateTensorHealth(tensor: Tensor): number {
    const data = tensor.data as Float32Array;
    
    // Check for NaN or infinite values
    const hasInvalidValues = Array.from(data).some(val => !isFinite(val));
    if (hasInvalidValues) return 0.1;

    // Evaluate magnitude distribution
    const magnitude = norm(tensor);
    const magnitudeHealth = Math.min(1.0, magnitude / tensor.size); // Normalized magnitude

    // Evaluate value distribution (avoid all zeros or extreme values)
    const mean = Array.from(data).reduce((sum, val) => sum + val, 0) / data.length;
    const variance = Array.from(data).reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const distributionHealth = Math.min(1.0, variance / (mean * mean + 0.01)); // Coefficient of variation

    // Combine metrics
    return (magnitudeHealth * 0.6 + distributionHealth * 0.4);
  }

  /**
   * Evaluates tensor stability over time
   */
  private evaluateTensorStability(tensor: Tensor): number {
    // For now, return based on magnitude and variance
    // In a full implementation, this would compare with historical values
    const health = this.evaluateTensorHealth(tensor);
    const stability = 1.0 - Math.min(1.0, norm(tensor) / (tensor.size * 2)); // Penalize extreme values
    
    return (health + stability) / 2;
  }

  /**
   * Evaluates mutation coefficient balance
   */
  private evaluateMutationBalance(mutationCoeffs: Tensor): number {
    const data = mutationCoeffs.data as Float32Array;
    const mean = Array.from(data).reduce((sum, val) => sum + val, 0) / data.length;
    
    // Good mutation balance: not too high (chaos) or too low (stagnation)
    const idealRange = [0.01, 0.1];
    
    if (mean < idealRange[0]) {
      return 0.5; // Too low mutation
    } else if (mean > idealRange[1]) {
      return 0.3; // Too high mutation
    } else {
      return 0.9; // Good balance
    }
  }

  /**
   * Evaluates attention distribution quality
   */
  private evaluateAttentionDistribution(attention: Tensor): number {
    const data = attention.data as Float32Array;
    
    // Calculate entropy of distribution
    let entropy = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i] > 0) {
        entropy -= data[i] * Math.log2(data[i]);
      }
    }
    
    // Normalize entropy (0 = completely focused, 1 = uniform distribution)
    const maxEntropy = Math.log2(data.length);
    const normalizedEntropy = entropy / maxEntropy;
    
    // Ideal is somewhere in the middle (focused but not too narrow)
    return 1.0 - Math.abs(normalizedEntropy - 0.6);
  }

  /**
   * Evaluates attention focus quality
   */
  private evaluateAttentionFocus(attention: Tensor): number {
    const data = attention.data as Float32Array;
    
    // Find top attention values
    const sorted = Array.from(data).sort((a, b) => b - a);
    const topThreeSum = sorted.slice(0, 3).reduce((sum, val) => sum + val, 0);
    
    // Good focus = top three tasks get significant attention
    return Math.min(1.0, topThreeSum * 2);
  }

  /**
   * Evaluates attention efficiency
   */
  private evaluateAttentionEfficiency(attention: Tensor): number {
    // Efficiency = how well attention correlates with actual needs
    // For now, use simple heuristics
    const health = this.evaluateTensorHealth(attention);
    return health;
  }

  /**
   * Calculates performance trends from history
   */
  private calculatePerformanceTrends(currentMetrics: Record<string, number>): Record<string, number> {
    const trends: Record<string, number> = {};
    
    if (this.performanceHistory.length < 2) {
      // Not enough history for trends
      Object.keys(currentMetrics).forEach(key => {
        trends[key] = 0;
      });
      return trends;
    }

    const recentHistory = this.performanceHistory.slice(-5);
    
    Object.keys(currentMetrics).forEach(key => {
      const values = recentHistory.map(entry => entry.metrics[key] || 0);
      
      if (values.length >= 2) {
        // Calculate simple linear trend
        const trend = (values[values.length - 1] - values[0]) / values.length;
        trends[key] = trend;
      } else {
        trends[key] = 0;
      }
    });

    return trends;
  }

  /**
   * Determines if adaptation is needed based on performance
   */
  private determineAdaptationNeed(performanceAssessment: ReflectionResult['performanceAssessment']): boolean {
    const overallThreshold = 0.6;
    const trendThreshold = -0.1;
    
    // Adaptation needed if overall performance is low
    if (performanceAssessment.overall < overallThreshold) {
      return true;
    }
    
    // Adaptation needed if negative trends in critical subsystems
    const criticalSubsystems = ['memory', 'task', 'attention'];
    for (const subsystem of criticalSubsystems) {
      if (performanceAssessment.trends[subsystem] < trendThreshold) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Analyzes what modifications are suggested
   */
  private analyzeSuggestedModifications(
    cognitiveState: CognitiveState,
    performanceAssessment: ReflectionResult['performanceAssessment']
  ): ReflectionResult['suggestedModifications'] {
    return {
      persona: performanceAssessment.bySubsystem.persona < 0.7,
      attention: performanceAssessment.bySubsystem.attention < 0.7,
      memory: performanceAssessment.bySubsystem.memory < 0.7,
      parameters: performanceAssessment.overall < 0.6
    };
  }

  /**
   * Calculates confidence level in the reflection
   */
  private calculateConfidenceLevel(performanceAssessment: ReflectionResult['performanceAssessment']): number {
    // Confidence based on data quality and consistency
    const dataQuality = Math.min(...Object.values(performanceAssessment.bySubsystem));
    const trendConsistency = 1.0 - Math.abs(performanceAssessment.overall - 
      Object.values(performanceAssessment.bySubsystem).reduce((sum, val) => sum + val, 0) / 
      Object.keys(performanceAssessment.bySubsystem).length);
    
    return (dataQuality * 0.6 + trendConsistency * 0.4);
  }

  /**
   * Generates reasoning chain for reflection conclusions
   */
  private generateReasoningChain(
    performanceAssessment: ReflectionResult['performanceAssessment'],
    adaptationNeeded: boolean
  ): string[] {
    const reasoning: string[] = [];
    
    reasoning.push(`Overall performance: ${(performanceAssessment.overall * 100).toFixed(1)}%`);
    
    // Analyze subsystem performance
    const sortedSubsystems = Object.entries(performanceAssessment.bySubsystem)
      .sort(([,a], [,b]) => a - b);
    
    const weakest = sortedSubsystems[0];
    const strongest = sortedSubsystems[sortedSubsystems.length - 1];
    
    reasoning.push(`Weakest subsystem: ${weakest[0]} (${(weakest[1] * 100).toFixed(1)}%)`);
    reasoning.push(`Strongest subsystem: ${strongest[0]} (${(strongest[1] * 100).toFixed(1)}%)`);
    
    // Analyze trends
    const positiveTrends = Object.entries(performanceAssessment.trends)
      .filter(([,trend]) => trend > 0.05);
    const negativeTrends = Object.entries(performanceAssessment.trends)
      .filter(([,trend]) => trend < -0.05);
    
    if (positiveTrends.length > 0) {
      reasoning.push(`Improving: ${positiveTrends.map(([name]) => name).join(', ')}`);
    }
    
    if (negativeTrends.length > 0) {
      reasoning.push(`Declining: ${negativeTrends.map(([name]) => name).join(', ')}`);
    }
    
    // Adaptation recommendation
    if (adaptationNeeded) {
      reasoning.push('Recommendation: System adaptation required');
      reasoning.push('Suggested focus: Address weakest performing subsystems');
    } else {
      reasoning.push('Recommendation: Continue current cognitive strategy');
      reasoning.push('Focus: Maintain current performance levels');
    }

    return reasoning;
  }

  /**
   * Combines multiple levels of reflection
   */
  private combineReflections(current: ReflectionResult, meta: ReflectionResult): ReflectionResult {
    // Weight current reflection more heavily, but incorporate meta insights
    const combinedPerformance = {
      overall: current.performanceAssessment.overall * 0.7 + meta.performanceAssessment.overall * 0.3,
      bySubsystem: { ...current.performanceAssessment.bySubsystem },
      trends: { ...current.performanceAssessment.trends }
    };

    return {
      performanceAssessment: combinedPerformance,
      adaptationNeeded: current.adaptationNeeded || meta.adaptationNeeded,
      suggestedModifications: {
        persona: current.suggestedModifications.persona || meta.suggestedModifications.persona,
        attention: current.suggestedModifications.attention || meta.suggestedModifications.attention,
        memory: current.suggestedModifications.memory || meta.suggestedModifications.memory,
        parameters: current.suggestedModifications.parameters || meta.suggestedModifications.parameters
      },
      confidenceLevel: (current.confidenceLevel + meta.confidenceLevel) / 2,
      reasoning: [...current.reasoning, '--- Meta-reflection ---', ...meta.reasoning]
    };
  }

  /**
   * Updates meta-cognitive state based on reflection results
   */
  private updateMetaState(reflection: ReflectionResult, cognitiveState: CognitiveState): void {
    if (!this.metaState) return;

    // Update self-evaluation tensor
    const selfEvalData = this.metaState.selfEval.data as Float32Array;
    const performanceValues = Object.values(reflection.performanceAssessment.bySubsystem);
    
    for (let i = 0; i < Math.min(selfEvalData.length, performanceValues.length); i++) {
      selfEvalData[i] = selfEvalData[i] * 0.8 + performanceValues[i] * 0.2; // Moving average
    }

    // Update adjustment tensor based on suggested modifications
    const adjustmentData = this.metaState.adjustment.data as Float32Array;
    const modifications = reflection.suggestedModifications;
    
    adjustmentData[0] = modifications.persona ? 1.0 : 0.0;
    adjustmentData[1] = modifications.attention ? 1.0 : 0.0;
    adjustmentData[2] = modifications.memory ? 1.0 : 0.0;
    adjustmentData[3] = modifications.parameters ? 1.0 : 0.0;

    // Store performance metrics in history
    this.performanceHistory.push({
      timestamp: Date.now(),
      metrics: reflection.performanceAssessment.bySubsystem
    });

    // Limit history size
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-500);
    }
  }

  /**
   * Generates specific self-modification recommendations
   */
  generateSelfModifications(reflection: ReflectionResult): SelfModification[] {
    const modifications: SelfModification[] = [];

    if (reflection.suggestedModifications.persona) {
      modifications.push({
        type: 'parameter_adjustment',
        target: 'persona.mutationRate',
        modification: { increase: 0.1 },
        justification: 'Low persona performance indicates need for more exploration',
        priority: 0.8,
        riskLevel: 0.3
      });
    }

    if (reflection.suggestedModifications.attention) {
      modifications.push({
        type: 'parameter_adjustment',
        target: 'attention.spreadingFactor',
        modification: { adjust: 0.05 },
        justification: 'Attention allocation inefficiency detected',
        priority: 0.9,
        riskLevel: 0.2
      });
    }

    if (reflection.suggestedModifications.memory) {
      modifications.push({
        type: 'structure_change',
        target: 'memory.consolidation',
        modification: { enhanceConsolidation: true },
        justification: 'Memory performance below threshold',
        priority: 0.7,
        riskLevel: 0.4
      });
    }

    return modifications;
  }

  /**
   * Gets meta-cognitive statistics
   */
  getMetaCognitiveStatistics(): {
    reflectionDepth: number;
    performanceHistorySize: number;
    modificationHistorySize: number;
    averageConfidence: number;
    latestPerformance: Record<string, number>;
    cognitiveStability: number;
  } {
    const recentReflections = this.performanceHistory.slice(-10);
    const averageConfidence = recentReflections.length > 0 
      ? recentReflections.reduce((sum, entry) => sum + (entry.metrics.overall || 0), 0) / recentReflections.length
      : 0;

    const latestPerformance = this.performanceHistory.length > 0
      ? this.performanceHistory[this.performanceHistory.length - 1].metrics
      : {};

    // Calculate cognitive stability as variance in recent performance
    const cognitiveStability = recentReflections.length > 1
      ? 1.0 - this.calculatePerformanceVariance(recentReflections)
      : 0.5;

    return {
      reflectionDepth: this.reflectionDepth,
      performanceHistorySize: this.performanceHistory.length,
      modificationHistorySize: this.modificationHistory.length,
      averageConfidence,
      latestPerformance,
      cognitiveStability
    };
  }

  /**
   * Calculates variance in performance metrics
   */
  private calculatePerformanceVariance(entries: Array<{ metrics: Record<string, number> }>): number {
    if (entries.length < 2) return 0;

    const overallValues = entries.map(entry => entry.metrics.overall || 0);
    const mean = overallValues.reduce((sum, val) => sum + val, 0) / overallValues.length;
    const variance = overallValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / overallValues.length;

    return Math.sqrt(variance); // Return standard deviation
  }
}