/**
 * MOSES Pipeline - Meta-Optimizing Semantic Evolutionary Search for Grammar Evolution
 * 
 * Implements the complete MOSES pipeline for agentic grammar evolution,
 * providing configuration, orchestration, and results management.
 */

import { 
  GrammarGenome, 
  GrammarEvolutionParams, 
  MOSESConfig, 
  EvolutionaryResult,
  EvolutionStats
} from './types.js';
import { GrammarEvolutionEngine } from './evolution-engine.js';
import { GrammarFitnessEvaluator } from './fitness-evaluator.js';
import { EvolutionaryResultsReporter } from './results-reporter.js';
import { AgenticPrimitive } from '../agentic-grammar/types.js';

/**
 * Complete MOSES pipeline for grammar evolution
 */
export class MOSESPipeline {
  private engine?: GrammarEvolutionEngine;
  private fitnessEvaluator?: GrammarFitnessEvaluator;
  private reporter?: EvolutionaryResultsReporter;
  private isRunning: boolean = false;
  private startTime?: number;
  private config: MOSESConfig;

  constructor(
    private evolutionParams: GrammarEvolutionParams,
    mosesConfig?: Partial<MOSESConfig>
  ) {
    this.config = {
      objective: 'multi',
      metaOptimization: true,
      transparency: {
        logLevel: 'normal',
        trackLineage: true,
        saveIntermediates: true,
        reportInterval: 25
      },
      parallelization: {
        enabled: false, // Start with single-threaded
        workerCount: 1,
        chunkSize: 10
      },
      memoryManagement: {
        archiveSize: 100,
        compressionThreshold: 1000,
        garbageCollectionInterval: 50
      },
      ...mosesConfig
    };

    this.evolutionParams.transparency = {
      ...this.evolutionParams.transparency,
      ...this.config.transparency
    };
  }

  /**
   * Initializes the MOSES pipeline components
   */
  async initialize(): Promise<void> {
    console.log('🧬 Initializing MOSES Grammar Evolution Pipeline...');
    
    // Initialize fitness evaluator
    this.fitnessEvaluator = new GrammarFitnessEvaluator();
    
    // Initialize evolution engine
    this.engine = new GrammarEvolutionEngine(this.evolutionParams, this.fitnessEvaluator);
    
    // Initialize results reporter
    this.reporter = new EvolutionaryResultsReporter(this.config);
    
    console.log('✅ MOSES Pipeline initialized successfully');
    this.logConfiguration();
  }

  /**
   * Runs the complete MOSES evolution pipeline
   */
  async run(seedPrimitives: AgenticPrimitive[]): Promise<EvolutionaryResult> {
    if (!this.engine || !this.fitnessEvaluator || !this.reporter) {
      await this.initialize();
    }

    console.log('\n🚀 Starting MOSES Grammar Evolution...');
    console.log(`📊 Population Size: ${this.evolutionParams.population.size}`);
    console.log(`🎯 Max Generations: ${this.evolutionParams.termination.maxGenerations}`);
    console.log(`🧬 Seed Primitives: ${seedPrimitives.length}`);

    this.isRunning = true;
    this.startTime = Date.now();

    try {
      // Initialize evolution
      await this.engine!.initialize(seedPrimitives);
      
      // Start monitoring if configured
      if (this.config.transparency.logLevel !== 'minimal') {
        this.startMonitoring();
      }

      // Run evolution
      const bestGenome = await this.engine!.evolve();
      
      // Generate comprehensive results
      const result = await this.generateEvolutionaryResult(bestGenome);
      
      // Generate reports
      await this.reporter!.generateReport(result);
      
      console.log('\n🎉 MOSES Evolution completed successfully!');
      this.logFinalResults(result);
      
      return result;

    } catch (error) {
      console.error('❌ MOSES Evolution failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Runs multiple independent evolution runs for statistical analysis
   */
  async runMultiple(
    seedPrimitives: AgenticPrimitive[], 
    runs: number = 5
  ): Promise<EvolutionaryResult[]> {
    console.log(`\n🔄 Running ${runs} independent MOSES evolution runs...`);
    
    const results: EvolutionaryResult[] = [];
    
    for (let i = 0; i < runs; i++) {
      console.log(`\n--- Run ${i + 1}/${runs} ---`);
      
      // Reinitialize for each run to ensure independence
      await this.initialize();
      
      const result = await this.run(seedPrimitives);
      results.push(result);
      
      // Optional: Brief cooldown between runs
      if (i < runs - 1) {
        await this.sleep(1000);
      }
    }
    
    // Generate comparative analysis
    await this.generateComparativeAnalysis(results);
    
    return results;
  }

  /**
   * Configures evolution parameters for specific objectives
   */
  configureForObjective(objective: 'performance' | 'novelty' | 'complexity' | 'balanced'): void {
    console.log(`🎯 Configuring MOSES for ${objective} optimization...`);
    
    switch (objective) {
      case 'performance':
        this.evolutionParams.selection.method = 'tournament';
        this.evolutionParams.selection.pressure = 0.8;
        this.evolutionParams.mutation.structuralRate = 0.1;
        this.evolutionParams.mutation.parametricRate = 0.2;
        this.evolutionParams.crossover.rate = 0.7;
        break;
        
      case 'novelty':
        this.evolutionParams.selection.method = 'rank';
        this.evolutionParams.population.diversityThreshold = 0.3;
        this.evolutionParams.mutation.structuralRate = 0.3;
        this.evolutionParams.mutation.parametricRate = 0.4;
        this.evolutionParams.crossover.rate = 0.5;
        break;
        
      case 'complexity':
        this.evolutionParams.constraints.maxComplexity = 0.8;
        this.evolutionParams.constraints.maxNodes = 15;
        this.evolutionParams.mutation.structuralRate = 0.4;
        this.evolutionParams.crossover.method = 'semantic';
        break;
        
      case 'balanced':
        this.evolutionParams.selection.method = 'pareto';
        this.evolutionParams.selection.paretoFronts = true;
        this.config.objective = 'multi';
        break;
    }
  }

  /**
   * Adaptive parameter tuning during evolution
   */
  async adaptiveParameterTuning(): Promise<void> {
    if (!this.engine) return;
    
    const stats = this.engine.getEvolutionHistory();
    if (stats.length < 10) return;
    
    const recentStats = stats.slice(-10);
    const convergenceRate = this.calculateConvergenceRate(recentStats);
    const diversityTrend = this.calculateDiversityTrend(recentStats);
    
    // Adapt based on convergence and diversity
    if (convergenceRate < 0.001 && diversityTrend < -0.01) {
      // Stagnation with decreasing diversity - increase exploration
      this.evolutionParams.mutation.structuralRate *= 1.2;
      this.evolutionParams.population.diversityThreshold *= 0.8;
      console.log('📈 Increased exploration due to stagnation');
      
    } else if (convergenceRate > 0.01 && diversityTrend > 0.01) {
      // Fast convergence with increasing diversity - balance exploration/exploitation
      this.evolutionParams.mutation.structuralRate *= 0.9;
      this.evolutionParams.crossover.rate *= 1.1;
      console.log('⚖️ Balanced exploration/exploitation');
    }
  }

  /**
   * Meta-optimization of evolution parameters
   */
  async metaOptimize(
    seedPrimitives: AgenticPrimitive[], 
    metaGenerations: number = 5
  ): Promise<GrammarEvolutionParams> {
    console.log('\n🔬 Starting meta-optimization of evolution parameters...');
    
    let bestParams = { ...this.evolutionParams };
    let bestMetaFitness = 0;
    
    for (let metaGen = 0; metaGen < metaGenerations; metaGen++) {
      console.log(`Meta-generation ${metaGen + 1}/${metaGenerations}`);
      
      // Generate parameter variants
      const paramVariants = this.generateParameterVariants(bestParams, 3);
      
      for (let i = 0; i < paramVariants.length; i++) {
        console.log(`  Testing parameter variant ${i + 1}/${paramVariants.length}`);
        
        // Test this parameter set
        const testPipeline = new MOSESPipeline(paramVariants[i], this.config);
        await testPipeline.initialize();
        
        const result = await testPipeline.run(seedPrimitives);
        const metaFitness = this.calculateMetaFitness(result);
        
        if (metaFitness > bestMetaFitness) {
          bestMetaFitness = metaFitness;
          bestParams = paramVariants[i];
          console.log(`  ✨ New best meta-fitness: ${metaFitness.toFixed(4)}`);
        }
      }
    }
    
    this.evolutionParams = bestParams;
    console.log('🎯 Meta-optimization completed');
    
    return bestParams;
  }

  /**
   * Real-time monitoring and intervention
   */
  private startMonitoring(): void {
    if (!this.engine) return;
    
    const monitoringInterval = setInterval(() => {
      if (!this.isRunning || !this.engine) {
        clearInterval(monitoringInterval);
        return;
      }
      
      const currentStats = this.engine.getEvolutionHistory();
      if (currentStats.length === 0) return;
      
      const latest = currentStats[currentStats.length - 1];
      
      // Check for intervention conditions
      if (this.shouldIntervene(latest)) {
        this.performIntervention(latest);
      }
      
      // Adaptive parameter tuning
      if (latest.generation % 25 === 0) {
        this.adaptiveParameterTuning();
      }
      
    }, 5000); // Check every 5 seconds
  }

  /**
   * Determines if intervention is needed
   */
  private shouldIntervene(stats: EvolutionStats): boolean {
    // Intervene if diversity is too low
    if (stats.population.diversity < 0.1) return true;
    
    // Intervene if convergence has stalled
    if (stats.convergence.stagnationCount > 20) return true;
    
    // Intervene if fitness variance is too high (instability)
    if (stats.convergence.fitnessVariance > 0.5) return true;
    
    return false;
  }

  /**
   * Performs evolutionary intervention
   */
  private performIntervention(stats: EvolutionStats): void {
    console.log(`🔧 Performing intervention at generation ${stats.generation}`);
    
    if (stats.population.diversity < 0.1) {
      // Inject diversity
      this.evolutionParams.mutation.structuralRate *= 1.5;
      this.evolutionParams.population.diversityThreshold *= 0.7;
      console.log('  💉 Injected diversity');
    }
    
    if (stats.convergence.stagnationCount > 20) {
      // Restart with elite preservation
      console.log('  🔄 Triggering restart with elite preservation');
      // Implementation would restart evolution keeping best individuals
    }
    
    if (stats.convergence.fitnessVariance > 0.5) {
      // Stabilize population
      this.evolutionParams.mutation.parametricRate *= 0.7;
      this.evolutionParams.selection.pressure *= 1.2;
      console.log('  🛠️ Stabilized population parameters');
    }
  }

  /**
   * Generates the comprehensive evolutionary result
   */
  private async generateEvolutionaryResult(bestGenome: GrammarGenome): Promise<EvolutionaryResult> {
    if (!this.engine || !this.fitnessEvaluator) {
      throw new Error('Engine not initialized');
    }

    const finalStats = this.engine.getEvolutionHistory();
    const paretoFront = this.engine.getParetoFront();
    const currentPop = this.engine.getCurrentPopulation();

    // Generate insights
    const insights = await this.generateInsights(bestGenome, finalStats);
    
    // Calculate lineage tree
    const lineageTree = this.buildLineageTree(currentPop);
    
    // Fitness landscape analysis
    const fitnessLandscape = this.analyzeFitnessLandscape(finalStats);

    return {
      bestGenome,
      paretoFront: paretoFront.length > 0 ? paretoFront : undefined,
      finalStats: finalStats[finalStats.length - 1],
      convergenceHistory: finalStats,
      insights,
      artifacts: {
        finalPopulation: currentPop,
        lineageTree,
        mutationEffectiveness: Object.fromEntries(this.engine['mutationEffectiveness'] || []),
        fitnessLandscape
      }
    };
  }

  /**
   * Generates evolutionary insights
   */
  private async generateInsights(
    bestGenome: GrammarGenome, 
    history: EvolutionStats[]
  ): Promise<EvolutionaryResult['insights']> {
    const discoveries: string[] = [];
    const recommendations: string[] = [];
    const futureDirections: string[] = [];

    // Analyze fitness progression
    if (history.length > 1) {
      const initialFitness = history[0].population.bestFitness;
      const finalFitness = history[history.length - 1].population.bestFitness;
      const improvement = ((finalFitness - initialFitness) / initialFitness * 100).toFixed(1);
      
      discoveries.push(`Achieved ${improvement}% fitness improvement over ${history.length} generations`);
    }

    // Analyze structural evolution
    const nodeCount = bestGenome.structure.nodes.length;
    const edgeCount = bestGenome.structure.edges.length;
    const patternCount = bestGenome.structure.patterns.length;
    
    if (nodeCount > 10) discoveries.push('Evolved complex multi-node structures');
    if (patternCount > 5) discoveries.push('Developed rich pattern libraries');
    if (edgeCount > nodeCount * 1.5) discoveries.push('High connectivity networks emerged');

    // Performance analysis
    const avgConvergence = history.reduce((sum, s) => sum + s.convergence.rate, 0) / history.length;
    if (avgConvergence > 0.01) {
      recommendations.push('Fast convergence observed - consider reducing mutation rates');
    } else if (avgConvergence < 0.001) {
      recommendations.push('Slow convergence - consider increasing exploration parameters');
    }

    // Diversity analysis
    const avgDiversity = history.reduce((sum, s) => sum + s.population.diversity, 0) / history.length;
    if (avgDiversity < 0.2) {
      recommendations.push('Low diversity detected - implement diversity preservation mechanisms');
    }

    // Future directions
    if (bestGenome.fitness < 0.8) {
      futureDirections.push('Explore hybrid optimization approaches');
      futureDirections.push('Implement domain-specific mutation operators');
    }
    
    if (history.length > 100) {
      futureDirections.push('Investigate early stopping criteria');
    }

    futureDirections.push('Experiment with multi-objective optimization');
    futureDirections.push('Implement adaptive population sizing');

    const summary = this.generateSummary(bestGenome, history);

    return {
      summary,
      discoveries,
      recommendations,
      futureDirections
    };
  }

  /**
   * Helper methods
   */
  private generateSummary(bestGenome: GrammarGenome, history: EvolutionStats[]): string {
    const generations = history.length;
    const finalFitness = bestGenome.fitness.toFixed(4);
    const avgDiversity = (history.reduce((sum, s) => sum + s.population.diversity, 0) / history.length).toFixed(3);
    
    return `Evolution completed in ${generations} generations, achieving fitness ${finalFitness} ` +
           `with average population diversity of ${avgDiversity}. The evolved grammar contains ` +
           `${bestGenome.structure.nodes.length} nodes, ${bestGenome.structure.edges.length} edges, ` +
           `and ${bestGenome.structure.patterns.length} patterns.`;
  }

  private generateParameterVariants(baseParams: GrammarEvolutionParams, count: number): GrammarEvolutionParams[] {
    const variants: GrammarEvolutionParams[] = [];
    
    for (let i = 0; i < count; i++) {
      const variant = JSON.parse(JSON.stringify(baseParams)); // Deep clone
      
      // Mutate parameters
      variant.mutation.structuralRate *= (0.8 + Math.random() * 0.4); // ±20% variation
      variant.mutation.parametricRate *= (0.8 + Math.random() * 0.4);
      variant.crossover.rate *= (0.8 + Math.random() * 0.4);
      variant.population.diversityThreshold *= (0.8 + Math.random() * 0.4);
      
      // Ensure bounds
      variant.mutation.structuralRate = Math.max(0.01, Math.min(0.5, variant.mutation.structuralRate));
      variant.mutation.parametricRate = Math.max(0.01, Math.min(0.5, variant.mutation.parametricRate));
      variant.crossover.rate = Math.max(0.1, Math.min(0.9, variant.crossover.rate));
      variant.population.diversityThreshold = Math.max(0.1, Math.min(0.8, variant.population.diversityThreshold));
      
      variants.push(variant);
    }
    
    return variants;
  }

  private calculateMetaFitness(result: EvolutionaryResult): number {
    // Meta-fitness considers convergence speed, final fitness, and diversity
    const finalFitness = result.bestGenome.fitness;
    const convergenceSpeed = result.convergenceHistory.length > 0 
      ? 1 / result.convergenceHistory.length 
      : 0;
    const finalDiversity = result.finalStats.population.diversity;
    
    return 0.6 * finalFitness + 0.2 * convergenceSpeed + 0.2 * finalDiversity;
  }

  private calculateConvergenceRate(stats: EvolutionStats[]): number {
    if (stats.length < 2) return 0;
    
    const recent = stats.slice(-5);
    let totalImprovement = 0;
    
    for (let i = 1; i < recent.length; i++) {
      totalImprovement += recent[i].population.bestFitness - recent[i - 1].population.bestFitness;
    }
    
    return totalImprovement / (recent.length - 1);
  }

  private calculateDiversityTrend(stats: EvolutionStats[]): number {
    if (stats.length < 2) return 0;
    
    const recent = stats.slice(-5);
    const firstDiversity = recent[0].population.diversity;
    const lastDiversity = recent[recent.length - 1].population.diversity;
    
    return (lastDiversity - firstDiversity) / recent.length;
  }

  private buildLineageTree(population: GrammarGenome[]): Record<string, string[]> {
    const lineageTree: Record<string, string[]> = {};
    
    for (const genome of population) {
      lineageTree[genome.id] = genome.lineage;
    }
    
    return lineageTree;
  }

  private analyzeFitnessLandscape(history: EvolutionStats[]): number[][] {
    // Simplified fitness landscape representation
    const landscape: number[][] = [];
    
    for (const stats of history) {
      landscape.push([
        stats.population.bestFitness,
        stats.population.averageFitness,
        stats.population.worstFitness,
        stats.population.diversity
      ]);
    }
    
    return landscape;
  }

  private async generateComparativeAnalysis(results: EvolutionaryResult[]): Promise<void> {
    console.log('\n📊 Comparative Analysis of Multiple Runs:');
    
    const fitnesses = results.map(r => r.bestGenome.fitness);
    const generations = results.map(r => r.convergenceHistory.length);
    
    console.log(`Best Fitness - Mean: ${this.mean(fitnesses).toFixed(4)}, Std: ${this.std(fitnesses).toFixed(4)}`);
    console.log(`Generations - Mean: ${this.mean(generations).toFixed(1)}, Std: ${this.std(generations).toFixed(1)}`);
    console.log(`Success Rate: ${fitnesses.filter(f => f > 0.7).length}/${results.length} (${(fitnesses.filter(f => f > 0.7).length / results.length * 100).toFixed(1)}%)`);
  }

  private mean(values: number[]): number {
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private std(values: number[]): number {
    const avg = this.mean(values);
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private logConfiguration(): void {
    if (this.config.transparency.logLevel === 'minimal') return;
    
    console.log('\n⚙️ MOSES Configuration:');
    console.log(`  Objective: ${this.config.objective}`);
    console.log(`  Meta-optimization: ${this.config.metaOptimization}`);
    console.log(`  Population size: ${this.evolutionParams.population.size}`);
    console.log(`  Selection method: ${this.evolutionParams.selection.method}`);
    console.log(`  Mutation rates: structural=${this.evolutionParams.mutation.structuralRate}, parametric=${this.evolutionParams.mutation.parametricRate}`);
    console.log(`  Crossover rate: ${this.evolutionParams.crossover.rate}`);
  }

  private logFinalResults(result: EvolutionaryResult): void {
    const runtime = this.startTime ? Date.now() - this.startTime : 0;
    
    console.log('\n📈 Final Results:');
    console.log(`  Runtime: ${(runtime / 1000).toFixed(1)}s`);
    console.log(`  Best Fitness: ${result.bestGenome.fitness.toFixed(4)}`);
    console.log(`  Final Generation: ${result.finalStats.generation}`);
    console.log(`  Structure: ${result.bestGenome.structure.nodes.length} nodes, ${result.bestGenome.structure.edges.length} edges`);
    console.log(`  Discoveries: ${result.insights.discoveries.length}`);
    console.log(`  Recommendations: ${result.insights.recommendations.length}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Public getters for monitoring
   */
  isEvolutionRunning(): boolean {
    return this.isRunning;
  }

  getCurrentEngine(): GrammarEvolutionEngine | undefined {
    return this.engine;
  }

  getConfiguration(): MOSESConfig {
    return { ...this.config };
  }

  getEvolutionParams(): GrammarEvolutionParams {
    return { ...this.evolutionParams };
  }
}