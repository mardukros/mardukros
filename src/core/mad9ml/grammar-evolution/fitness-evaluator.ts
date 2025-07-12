/**
 * Grammar Fitness Evaluator - Multi-objective fitness evaluation for grammar evolution
 * 
 * Implements comprehensive fitness metrics for evaluating grammar quality across
 * performance, complexity, expressiveness, adaptability, and emergent properties.
 */

import { GrammarGenome, GrammarFitnessMetrics, GrammarParameters } from './types.js';
import { AgenticPrimitive } from '../agentic-grammar/types.js';
import { norm, dotProduct } from '../tensor/operations.js';

/**
 * Core fitness evaluator for grammar genomes
 */
export class GrammarFitnessEvaluator {
  private evaluationHistory: Map<string, GrammarFitnessMetrics> = new Map();
  private performanceBaseline: GrammarFitnessMetrics;
  private weights: Record<keyof GrammarFitnessMetrics, number>;

  constructor(
    baseline?: GrammarFitnessMetrics,
    customWeights?: Partial<Record<keyof GrammarFitnessMetrics, number>>
  ) {
    this.performanceBaseline = baseline || this.createDefaultBaseline();
    this.weights = {
      performance: 0.35,
      complexity: 0.15,
      expressiveness: 0.25,
      adaptability: 0.15,
      emergent: 0.10,
      ...customWeights
    };
  }

  /**
   * Evaluates comprehensive fitness of a grammar genome
   */
  async evaluateFitness(genome: GrammarGenome): Promise<GrammarFitnessMetrics> {
    const metrics: GrammarFitnessMetrics = {
      performance: await this.evaluatePerformance(genome),
      complexity: this.evaluateComplexity(genome),
      expressiveness: this.evaluateExpressiveness(genome),
      adaptability: this.evaluateAdaptability(genome),
      emergent: this.evaluateEmergentProperties(genome)
    };

    // Cache evaluation for lineage tracking
    this.evaluationHistory.set(genome.id, metrics);

    return metrics;
  }

  /**
   * Evaluates performance metrics
   */
  private async evaluatePerformance(genome: GrammarGenome): Promise<GrammarFitnessMetrics['performance']> {
    // Simulate parsing accuracy tests
    const testCases = this.generateTestCases(genome.primitives);
    let correctParses = 0;
    let totalTests = testCases.length;
    let totalLatency = 0;

    for (const testCase of testCases) {
      const result = await this.simulateGrammarParsing(genome, testCase);
      if (result.correct) correctParses++;
      totalLatency += result.latency;
    }

    const accuracy = totalTests > 0 ? correctParses / totalTests : 0;
    const efficiency = this.calculateEfficiency(genome, totalLatency);
    const completeness = this.calculateCompleteness(genome);
    const precision = this.calculatePrecision(genome, testCases);

    return {
      accuracy,
      completeness,
      precision,
      efficiency
    };
  }

  /**
   * Evaluates structural and computational complexity
   */
  private evaluateComplexity(genome: GrammarGenome): GrammarFitnessMetrics['complexity'] {
    const structuralComplexity = this.calculateStructuralComplexity(genome);
    const parametricComplexity = this.calculateParametricComplexity(genome.parameters);
    const computationalComplexity = this.calculateComputationalComplexity(genome);

    return {
      structural: structuralComplexity,
      parametric: parametricComplexity,
      computational: computationalComplexity
    };
  }

  /**
   * Evaluates expressiveness capabilities
   */
  private evaluateExpressiveness(genome: GrammarGenome): GrammarFitnessMetrics['expressiveness'] {
    const semanticRichness = this.calculateSemanticRichness(genome);
    const syntacticFlexibility = this.calculateSyntacticFlexibility(genome);
    const compositionalAbility = this.calculateCompositionalAbility(genome);

    return {
      semantic: semanticRichness,
      syntactic: syntacticFlexibility,
      compositional: compositionalAbility
    };
  }

  /**
   * Evaluates adaptability and learning capabilities
   */
  private evaluateAdaptability(genome: GrammarGenome): GrammarFitnessMetrics['adaptability'] {
    const plasticity = this.calculatePlasticity(genome);
    const robustness = this.calculateRobustness(genome);
    const generalization = this.calculateGeneralization(genome);

    return {
      plasticity,
      robustness,
      generalization
    };
  }

  /**
   * Evaluates emergent properties and insights
   */
  private evaluateEmergentProperties(genome: GrammarGenome): GrammarFitnessMetrics['emergent'] {
    const novelty = this.calculateNovelty(genome);
    const creativity = this.calculateCreativity(genome);
    const insight = this.calculateInsightGeneration(genome);

    return {
      novelty,
      creativity,
      insight
    };
  }

  /**
   * Calculates structural complexity based on graph metrics
   */
  private calculateStructuralComplexity(genome: GrammarGenome): number {
    const { nodes, edges, patterns } = genome.structure;
    
    // Graph complexity metrics
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const density = nodeCount > 0 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;
    
    // Pattern complexity
    const avgPatternDepth = patterns.length > 0 
      ? patterns.reduce((sum, p) => sum + p.recursionDepth, 0) / patterns.length 
      : 0;
    
    // Cyclical complexity
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(genome);
    
    // Normalize to [0, 1] range
    const normalizedComplexity = Math.tanh(
      0.1 * nodeCount + 
      0.1 * edgeCount + 
      0.3 * density + 
      0.2 * avgPatternDepth + 
      0.3 * cyclomaticComplexity
    );

    return normalizedComplexity;
  }

  /**
   * Calculates parametric complexity based on tensor norms
   */
  private calculateParametricComplexity(parameters: GrammarParameters): number {
    const complexityNorm = norm(parameters.complexity) / parameters.complexity.size;
    const expressivenessNorm = norm(parameters.expressiveness) / parameters.expressiveness.size;
    const efficiencyNorm = norm(parameters.efficiency) / parameters.efficiency.size;
    const adaptabilityNorm = norm(parameters.adaptability) / parameters.adaptability.size;

    const avgNorm = (complexityNorm + expressivenessNorm + efficiencyNorm + adaptabilityNorm) / 4;
    
    return Math.min(1.0, avgNorm);
  }

  /**
   * Calculates computational complexity estimate
   */
  private calculateComputationalComplexity(genome: GrammarGenome): number {
    const { nodes, edges, patterns } = genome.structure;
    
    // Estimate based on structure
    const basicOps = nodes.length + edges.length;
    const patternOps = patterns.reduce((sum, p) => sum + Math.pow(2, p.recursionDepth), 0);
    const totalOps = basicOps + patternOps;
    
    // Normalize to logarithmic scale
    return Math.tanh(Math.log(totalOps + 1) / 10);
  }

  /**
   * Calculates semantic richness
   */
  private calculateSemanticRichness(genome: GrammarGenome): number {
    const primitiveTypes = new Set(genome.primitives.map(p => p.type));
    const typeRichness = primitiveTypes.size / 10; // Normalize by max expected types
    
    const semanticDepth = genome.primitives.reduce((sum, p) => sum + p.semanticComplexity, 0) / genome.primitives.length;
    
    return Math.min(1.0, (typeRichness + semanticDepth) / 2);
  }

  /**
   * Calculates syntactic flexibility
   */
  private calculateSyntacticFlexibility(genome: GrammarGenome): number {
    const { patterns } = genome.structure;
    
    // Count unique pattern combinations
    const patternVariations = patterns.length;
    const recursivePatterns = patterns.filter(p => p.recursionDepth > 1).length;
    
    const flexibility = (patternVariations + recursivePatterns * 2) / (patterns.length + 1);
    
    return Math.min(1.0, flexibility);
  }

  /**
   * Calculates compositional ability
   */
  private calculateCompositionalAbility(genome: GrammarGenome): number {
    const { patterns } = genome.structure;
    
    // Measure pattern reusability
    const reusabilityScore = patterns.reduce((sum, p) => sum + p.applicability, 0) / patterns.length;
    
    // Measure hierarchical depth
    const maxDepth = Math.max(...patterns.map(p => p.recursionDepth));
    const depthScore = Math.tanh(maxDepth / 5); // Normalize deep recursion
    
    return (reusabilityScore + depthScore) / 2;
  }

  /**
   * Calculates plasticity (learning ability)
   */
  private calculatePlasticity(genome: GrammarGenome): number {
    const adaptabilityTensor = genome.parameters.adaptability;
    const learningRates = adaptabilityTensor.data as Float32Array;
    
    // Higher learning rates indicate more plasticity
    const avgLearningRate = learningRates.reduce((sum, rate) => sum + rate, 0) / learningRates.length;
    
    return Math.min(1.0, avgLearningRate);
  }

  /**
   * Calculates robustness (resistance to perturbations)
   */
  private calculateRobustness(genome: GrammarGenome): number {
    const { nodes, edges } = genome.structure;
    
    // Graph connectivity indicates robustness
    const avgConnectivity = nodes.length > 0 
      ? nodes.reduce((sum, node) => sum + node.connections.length, 0) / nodes.length 
      : 0;
    
    // Edge weight distribution
    const edgeWeights = edges.map(e => e.weight);
    const weightVariance = this.calculateVariance(edgeWeights);
    
    // Lower variance and higher connectivity = more robust
    const connectivityScore = Math.tanh(avgConnectivity / 5);
    const stabilityScore = 1 - Math.min(1.0, weightVariance);
    
    return (connectivityScore + stabilityScore) / 2;
  }

  /**
   * Calculates generalization ability
   */
  private calculateGeneralization(genome: GrammarGenome): number {
    // Based on pattern abstraction level
    const { patterns } = genome.structure;
    
    const abstractionScore = patterns.reduce((sum, p) => {
      // Higher recursion depth indicates more abstraction
      return sum + Math.tanh(p.recursionDepth / 3);
    }, 0) / (patterns.length || 1);
    
    return abstractionScore;
  }

  /**
   * Calculates novelty compared to previous genomes
   */
  private calculateNovelty(genome: GrammarGenome): number {
    if (this.evaluationHistory.size === 0) return 1.0;
    
    let totalSimilarity = 0;
    let comparisonCount = 0;
    
    // Compare with recent genomes
    const recentEvaluations = Array.from(this.evaluationHistory.entries()).slice(-20);
    
    for (const [id, metrics] of recentEvaluations) {
      if (id !== genome.id) {
        const similarity = this.calculateStructuralSimilarity(genome, id);
        totalSimilarity += similarity;
        comparisonCount++;
      }
    }
    
    const avgSimilarity = comparisonCount > 0 ? totalSimilarity / comparisonCount : 0;
    return 1 - avgSimilarity; // Novelty is inverse of similarity
  }

  /**
   * Calculates creativity in pattern combination
   */
  private calculateCreativity(genome: GrammarGenome): number {
    const { patterns } = genome.structure;
    
    // Measure unexpected pattern combinations
    const uniqueCombinations = new Set();
    
    for (let i = 0; i < patterns.length; i++) {
      for (let j = i + 1; j < patterns.length; j++) {
        const combo = [patterns[i].name, patterns[j].name].sort().join('-');
        uniqueCombinations.add(combo);
      }
    }
    
    // More unique combinations = more creativity
    const expectedCombinations = (patterns.length * (patterns.length - 1)) / 2;
    const creativityRatio = expectedCombinations > 0 
      ? uniqueCombinations.size / expectedCombinations 
      : 0;
    
    return creativityRatio;
  }

  /**
   * Calculates insight generation potential
   */
  private calculateInsightGeneration(genome: GrammarGenome): number {
    // Based on meta-cognitive patterns and self-referential structures
    const metaPatterns = genome.structure.patterns.filter(p => 
      p.name.includes('meta') || p.name.includes('self') || p.recursionDepth > 2
    );
    
    const insightPotential = metaPatterns.length / (genome.structure.patterns.length || 1);
    
    return Math.min(1.0, insightPotential * 2); // Scale up meta-patterns
  }

  /**
   * Helper methods
   */
  private generateTestCases(primitives: AgenticPrimitive[]): any[] {
    // Generate test cases based on available primitives
    return primitives.map(p => ({
      type: p.type,
      complexity: p.semanticComplexity,
      dependencies: p.dependencies
    }));
  }

  private async simulateGrammarParsing(genome: GrammarGenome, testCase: any): Promise<{correct: boolean, latency: number}> {
    // Simulate parsing operation
    const startTime = Date.now();
    
    // Simple simulation based on structure complexity
    const complexity = genome.structure.nodes.length + genome.structure.edges.length;
    const success = Math.random() > (complexity / 100); // Higher complexity = higher chance of failure
    
    const latency = Date.now() - startTime + Math.random() * 10; // Add some realistic latency
    
    return { correct: success, latency };
  }

  private calculateEfficiency(genome: GrammarGenome, totalLatency: number): number {
    // Efficiency is inverse of latency and complexity
    const complexity = this.calculateStructuralComplexity(genome);
    const latencyScore = Math.max(0, 1 - totalLatency / 1000); // Normalize latency
    const complexityScore = 1 - complexity;
    
    return (latencyScore + complexityScore) / 2;
  }

  private calculateCompleteness(genome: GrammarGenome): number {
    // Based on coverage of primitive types
    const availableTypes = new Set(['action', 'percept', 'memory', 'decision', 'planning', 'communication', 'adaptation', 'attention', 'goal', 'constraint']);
    const coveredTypes = new Set(genome.primitives.map(p => p.type));
    
    return coveredTypes.size / availableTypes.size;
  }

  private calculatePrecision(genome: GrammarGenome, testCases: any[]): number {
    // Simulate precision based on pattern matching accuracy
    return Math.random() * 0.3 + 0.7; // Placeholder: 70-100% precision
  }

  private calculateCyclomaticComplexity(genome: GrammarGenome): number {
    // Simplified cyclomatic complexity calculation
    const { edges, nodes } = genome.structure;
    return Math.max(1, edges.length - nodes.length + 2);
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return variance;
  }

  private calculateStructuralSimilarity(genome: GrammarGenome, compareId: string): number {
    // Placeholder for structural similarity calculation
    // In practice, would compare graph structures, patterns, etc.
    return Math.random() * 0.5 + 0.25; // 25-75% similarity
  }

  private createDefaultBaseline(): GrammarFitnessMetrics {
    return {
      performance: { accuracy: 0.5, completeness: 0.5, precision: 0.5, efficiency: 0.5 },
      complexity: { structural: 0.3, parametric: 0.3, computational: 0.3 },
      expressiveness: { semantic: 0.4, syntactic: 0.4, compositional: 0.4 },
      adaptability: { plasticity: 0.3, robustness: 0.4, generalization: 0.3 },
      emergent: { novelty: 0.2, creativity: 0.2, insight: 0.1 }
    };
  }

  /**
   * Calculates aggregated fitness score
   */
  calculateAggregatedFitness(metrics: GrammarFitnessMetrics): number {
    const performanceScore = (
      metrics.performance.accuracy + 
      metrics.performance.completeness + 
      metrics.performance.precision + 
      metrics.performance.efficiency
    ) / 4;
    
    const complexityScore = 1 - (
      metrics.complexity.structural + 
      metrics.complexity.parametric + 
      metrics.complexity.computational
    ) / 3; // Invert complexity (lower is better)
    
    const expressivenessScore = (
      metrics.expressiveness.semantic + 
      metrics.expressiveness.syntactic + 
      metrics.expressiveness.compositional
    ) / 3;
    
    const adaptabilityScore = (
      metrics.adaptability.plasticity + 
      metrics.adaptability.robustness + 
      metrics.adaptability.generalization
    ) / 3;
    
    const emergentScore = (
      metrics.emergent.novelty + 
      metrics.emergent.creativity + 
      metrics.emergent.insight
    ) / 3;
    
    return (
      this.weights.performance * performanceScore +
      this.weights.complexity * complexityScore +
      this.weights.expressiveness * expressivenessScore +
      this.weights.adaptability * adaptabilityScore +
      this.weights.emergent * emergentScore
    );
  }

  /**
   * Gets evaluation statistics
   */
  getEvaluationStats(): {
    totalEvaluations: number;
    averageFitness: number;
    bestFitness: number;
    fitnessHistory: number[];
  } {
    const fitnessScores = Array.from(this.evaluationHistory.values())
      .map(metrics => this.calculateAggregatedFitness(metrics));
    
    return {
      totalEvaluations: this.evaluationHistory.size,
      averageFitness: fitnessScores.reduce((sum, f) => sum + f, 0) / fitnessScores.length,
      bestFitness: Math.max(...fitnessScores, 0),
      fitnessHistory: fitnessScores
    };
  }
}