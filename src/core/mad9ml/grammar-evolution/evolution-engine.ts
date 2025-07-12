/**
 * Grammar Evolution Engine - Core evolutionary algorithm for grammar optimization
 * 
 * Implements MOSES-style evolutionary algorithms with meta-optimization capabilities
 * for evolving agentic grammar structures.
 */

import { 
  GrammarGenome, 
  GrammarEvolutionParams, 
  GrammarFitnessMetrics,
  EvolutionStats,
  GrammarMutation,
  GrammarCrossover
} from './types.js';
import { GrammarFitnessEvaluator } from './fitness-evaluator.js';
import { AgenticPrimitive, AgenticPrimitiveType } from '../agentic-grammar/types.js';
import { makeTensor, randomTensor, addTensors, scaleTensor, cloneTensor } from '../tensor/operations.js';

/**
 * Core evolution engine implementing MOSES algorithm for grammar evolution
 */
export class GrammarEvolutionEngine {
  private population: GrammarGenome[] = [];
  private fitnessEvaluator: GrammarFitnessEvaluator;
  private generation: number = 0;
  private evolutionHistory: EvolutionStats[] = [];
  private bestGenome?: GrammarGenome;
  private paretoFront: GrammarGenome[] = [];
  private mutationEffectiveness: Map<string, number> = new Map();

  constructor(
    private params: GrammarEvolutionParams,
    fitnessEvaluator?: GrammarFitnessEvaluator
  ) {
    this.fitnessEvaluator = fitnessEvaluator || new GrammarFitnessEvaluator();
  }

  /**
   * Initializes the evolution process with a seed population
   */
  async initialize(seedPrimitives: AgenticPrimitive[]): Promise<void> {
    this.population = [];
    this.generation = 0;
    this.evolutionHistory = [];
    this.bestGenome = undefined;
    this.paretoFront = [];

    // Generate initial population
    for (let i = 0; i < this.params.population.size; i++) {
      const genome = this.createRandomGenome(seedPrimitives, i);
      const metrics = await this.fitnessEvaluator.evaluateFitness(genome);
      genome.fitness = this.fitnessEvaluator.calculateAggregatedFitness(metrics);
      this.population.push(genome);
    }

    // Sort by fitness
    this.population.sort((a, b) => b.fitness - a.fitness);
    this.bestGenome = this.population[0];
    
    // Initialize Pareto front
    this.updateParetoFront();

    console.log(`Initialized population of ${this.population.size} genomes`);
    console.log(`Best initial fitness: ${this.bestGenome.fitness.toFixed(4)}`);
  }

  /**
   * Runs the evolutionary algorithm for specified generations
   */
  async evolve(maxGenerations?: number): Promise<GrammarGenome> {
    const generations = maxGenerations || this.params.termination.maxGenerations;
    const startTime = Date.now();

    for (let gen = 0; gen < generations; gen++) {
      const genStart = Date.now();
      
      // Check termination conditions
      if (this.shouldTerminate()) {
        console.log(`Evolution terminated early at generation ${this.generation}`);
        break;
      }

      // Evolve one generation
      await this.evolveGeneration();
      
      // Track statistics
      const stats = this.calculateStats(Date.now() - genStart);
      this.evolutionHistory.push(stats);
      
      // Meta-optimization
      if (this.generation % 10 === 0) {
        this.performMetaOptimization();
      }
      
      // Report progress
      if (this.generation % this.params.transparency?.reportInterval || 25 === 0) {
        this.reportProgress(stats);
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`Evolution completed in ${totalTime}ms over ${this.generation} generations`);
    console.log(`Best fitness achieved: ${this.bestGenome?.fitness.toFixed(4)}`);

    return this.bestGenome!;
  }

  /**
   * Evolves a single generation
   */
  private async evolveGeneration(): Promise<void> {
    this.generation++;
    
    // Selection for reproduction
    const parents = this.selectParents();
    
    // Generate offspring through crossover and mutation
    const offspring = await this.generateOffspring(parents);
    
    // Combine population and offspring
    const combinedPop = [...this.population, ...offspring];
    
    // Evaluate fitness for new individuals
    for (const genome of offspring) {
      if (genome.fitness === 0) {
        const metrics = await this.fitnessEvaluator.evaluateFitness(genome);
        genome.fitness = this.fitnessEvaluator.calculateAggregatedFitness(metrics);
      }
    }
    
    // Environmental selection (survival)
    this.population = this.selectSurvivors(combinedPop);
    
    // Update best genome and Pareto front
    this.updateBest();
    this.updateParetoFront();
    
    // Maintain diversity
    if (this.generation % 5 === 0) {
      this.maintainDiversity();
    }
  }

  /**
   * Selects parents for reproduction
   */
  private selectParents(): GrammarGenome[] {
    const parents: GrammarGenome[] = [];
    const eliteCount = Math.floor(this.params.population.size * this.params.population.eliteRatio);
    
    // Always include elite
    parents.push(...this.population.slice(0, eliteCount));
    
    // Select remaining parents using configured method
    const remainingCount = this.params.population.size - eliteCount;
    
    switch (this.params.selection.method) {
      case 'tournament':
        parents.push(...this.tournamentSelection(remainingCount));
        break;
      case 'roulette':
        parents.push(...this.rouletteSelection(remainingCount));
        break;
      case 'rank':
        parents.push(...this.rankSelection(remainingCount));
        break;
      case 'pareto':
        parents.push(...this.paretoSelection(remainingCount));
        break;
    }
    
    return parents;
  }

  /**
   * Generates offspring through crossover and mutation
   */
  private async generateOffspring(parents: GrammarGenome[]): Promise<GrammarGenome[]> {
    const offspring: GrammarGenome[] = [];
    
    while (offspring.length < this.params.population.size) {
      if (Math.random() < this.params.crossover.rate && parents.length >= 2) {
        // Crossover
        const parentA = parents[Math.floor(Math.random() * parents.length)];
        const parentB = parents[Math.floor(Math.random() * parents.length)];
        
        if (parentA.id !== parentB.id) {
          const crossoverOffspring = this.crossover(parentA, parentB);
          offspring.push(...crossoverOffspring);
        }
      } else {
        // Mutation only
        const parent = parents[Math.floor(Math.random() * parents.length)];
        const mutated = this.mutate(parent);
        offspring.push(mutated);
      }
    }
    
    return offspring.slice(0, this.params.population.size);
  }

  /**
   * Performs crossover between two parents
   */
  private crossover(parentA: GrammarGenome, parentB: GrammarGenome): GrammarGenome[] {
    const offspring: GrammarGenome[] = [];
    
    for (let i = 0; i < 2; i++) {
      const child: GrammarGenome = {
        id: `gen${this.generation}_cross_${Date.now()}_${i}`,
        primitives: this.crossoverPrimitives(parentA.primitives, parentB.primitives),
        structure: this.crossoverStructure(parentA.structure, parentB.structure),
        parameters: this.crossoverParameters(parentA.parameters, parentB.parameters),
        fitness: 0,
        generation: this.generation,
        lineage: [parentA.id, parentB.id]
      };
      
      // Apply mutation with some probability
      if (Math.random() < this.params.mutation.structuralRate) {
        offspring.push(this.mutate(child));
      } else {
        offspring.push(child);
      }
    }
    
    return offspring;
  }

  /**
   * Applies mutations to a genome
   */
  private mutate(genome: GrammarGenome): GrammarGenome {
    const mutated: GrammarGenome = {
      id: `gen${this.generation}_mut_${Date.now()}`,
      primitives: [...genome.primitives],
      structure: JSON.parse(JSON.stringify(genome.structure)), // Deep clone
      parameters: this.cloneParameters(genome.parameters),
      fitness: 0,
      generation: this.generation,
      lineage: [genome.id]
    };

    // Apply different types of mutations
    if (Math.random() < this.params.mutation.structuralRate) {
      this.applyStructuralMutation(mutated);
    }
    
    if (Math.random() < this.params.mutation.parametricRate) {
      this.applyParametricMutation(mutated);
    }
    
    return mutated;
  }

  /**
   * Applies structural mutations (nodes, edges, patterns)
   */
  private applyStructuralMutation(genome: GrammarGenome): void {
    const mutationType = Math.random();
    
    if (mutationType < 0.3) {
      // Add/remove nodes
      if (Math.random() < 0.5 && genome.structure.nodes.length < this.params.constraints.maxNodes) {
        this.addRandomNode(genome);
      } else if (genome.structure.nodes.length > 1) {
        this.removeRandomNode(genome);
      }
    } else if (mutationType < 0.6) {
      // Modify edges
      if (Math.random() < 0.5) {
        this.addRandomEdge(genome);
      } else if (genome.structure.edges.length > 0) {
        this.modifyRandomEdge(genome);
      }
    } else {
      // Modify patterns
      if (Math.random() < 0.5) {
        this.addRandomPattern(genome);
      } else if (genome.structure.patterns.length > 0) {
        this.modifyRandomPattern(genome);
      }
    }
  }

  /**
   * Applies parametric mutations (tensor modifications)
   */
  private applyParametricMutation(genome: GrammarGenome): void {
    const mutationStrength = this.calculateAdaptiveMutationRate();
    
    // Mutate each parameter tensor
    genome.parameters.complexity = this.mutateTensor(genome.parameters.complexity, mutationStrength);
    genome.parameters.expressiveness = this.mutateTensor(genome.parameters.expressiveness, mutationStrength);
    genome.parameters.efficiency = this.mutateTensor(genome.parameters.efficiency, mutationStrength);
    genome.parameters.adaptability = this.mutateTensor(genome.parameters.adaptability, mutationStrength);
  }

  /**
   * Tournament selection
   */
  private tournamentSelection(count: number): GrammarGenome[] {
    const selected: GrammarGenome[] = [];
    const tournamentSize = Math.max(2, Math.floor(this.population.size * 0.1));
    
    for (let i = 0; i < count; i++) {
      const tournament: GrammarGenome[] = [];
      
      for (let j = 0; j < tournamentSize; j++) {
        const candidate = this.population[Math.floor(Math.random() * this.population.length)];
        tournament.push(candidate);
      }
      
      tournament.sort((a, b) => b.fitness - a.fitness);
      selected.push(tournament[0]);
    }
    
    return selected;
  }

  /**
   * Roulette wheel selection
   */
  private rouletteSelection(count: number): GrammarGenome[] {
    const selected: GrammarGenome[] = [];
    const totalFitness = this.population.reduce((sum, genome) => sum + Math.max(0, genome.fitness), 0);
    
    for (let i = 0; i < count; i++) {
      let spin = Math.random() * totalFitness;
      
      for (const genome of this.population) {
        spin -= Math.max(0, genome.fitness);
        if (spin <= 0) {
          selected.push(genome);
          break;
        }
      }
    }
    
    return selected;
  }

  /**
   * Rank-based selection
   */
  private rankSelection(count: number): GrammarGenome[] {
    const selected: GrammarGenome[] = [];
    const sortedPop = [...this.population].sort((a, b) => b.fitness - a.fitness);
    
    for (let i = 0; i < count; i++) {
      // Linear ranking: higher rank = higher probability
      const rank = Math.floor(Math.random() * sortedPop.length);
      const index = Math.floor(rank * rank / sortedPop.length); // Quadratic bias toward better ranks
      selected.push(sortedPop[index]);
    }
    
    return selected;
  }

  /**
   * Pareto-based selection for multi-objective optimization
   */
  private paretoSelection(count: number): GrammarGenome[] {
    // Use Pareto front if available, otherwise fall back to tournament
    if (this.paretoFront.length >= count) {
      return this.paretoFront.slice(0, count);
    } else {
      const fromPareto = [...this.paretoFront];
      const remaining = count - fromPareto.length;
      return [...fromPareto, ...this.tournamentSelection(remaining)];
    }
  }

  /**
   * Environmental selection (choosing survivors)
   */
  private selectSurvivors(combinedPop: GrammarGenome[]): GrammarGenome[] {
    // Sort by fitness
    combinedPop.sort((a, b) => b.fitness - a.fitness);
    
    // Elitist selection with diversity preservation
    const survivors: GrammarGenome[] = [];
    const targetSize = this.params.population.size;
    
    // Always keep the best
    survivors.push(combinedPop[0]);
    
    // Add remaining based on fitness and diversity
    for (let i = 1; i < combinedPop.length && survivors.length < targetSize; i++) {
      const candidate = combinedPop[i];
      
      // Check diversity constraint
      if (this.maintainsDiversity(candidate, survivors)) {
        survivors.push(candidate);
      }
    }
    
    // Fill remaining slots if needed
    while (survivors.length < targetSize && survivors.length < combinedPop.length) {
      for (const candidate of combinedPop) {
        if (!survivors.includes(candidate) && survivors.length < targetSize) {
          survivors.push(candidate);
        }
      }
    }
    
    return survivors;
  }

  /**
   * Helper methods for mutation operations
   */
  private addRandomNode(genome: GrammarGenome): void {
    const types: AgenticPrimitiveType[] = ['action', 'percept', 'memory', 'decision', 'planning'];
    const nodeId = `node_${Date.now()}_${Math.random()}`;
    
    genome.structure.nodes.push({
      id: nodeId,
      type: types[Math.floor(Math.random() * types.length)],
      activation: randomTensor([4], 0.5),
      complexity: Math.random(),
      connections: []
    });
  }

  private removeRandomNode(genome: GrammarGenome): void {
    const nodeIndex = Math.floor(Math.random() * genome.structure.nodes.length);
    const removedNode = genome.structure.nodes.splice(nodeIndex, 1)[0];
    
    // Remove associated edges
    genome.structure.edges = genome.structure.edges.filter(
      edge => edge.source !== removedNode.id && edge.target !== removedNode.id
    );
  }

  private addRandomEdge(genome: GrammarGenome): void {
    if (genome.structure.nodes.length < 2) return;
    
    const sourceNode = genome.structure.nodes[Math.floor(Math.random() * genome.structure.nodes.length)];
    const targetNode = genome.structure.nodes[Math.floor(Math.random() * genome.structure.nodes.length)];
    
    if (sourceNode.id !== targetNode.id) {
      const edgeTypes = ['semantic', 'syntactic', 'causal', 'temporal'];
      
      genome.structure.edges.push({
        id: `edge_${Date.now()}_${Math.random()}`,
        source: sourceNode.id,
        target: targetNode.id,
        weight: Math.random(),
        type: edgeTypes[Math.floor(Math.random() * edgeTypes.length)] as any
      });
    }
  }

  private modifyRandomEdge(genome: GrammarGenome): void {
    const edge = genome.structure.edges[Math.floor(Math.random() * genome.structure.edges.length)];
    edge.weight = Math.max(0, Math.min(1, edge.weight + (Math.random() - 0.5) * 0.2));
  }

  private addRandomPattern(genome: GrammarGenome): void {
    const patternNames = ['recursive', 'hierarchical', 'sequential', 'parallel', 'conditional'];
    
    genome.structure.patterns.push({
      id: `pattern_${Date.now()}_${Math.random()}`,
      name: patternNames[Math.floor(Math.random() * patternNames.length)],
      nodes: genome.structure.nodes.slice(0, Math.min(3, genome.structure.nodes.length)).map(n => n.id),
      recursionDepth: Math.floor(Math.random() * 4) + 1,
      applicability: Math.random()
    });
  }

  private modifyRandomPattern(genome: GrammarGenome): void {
    const pattern = genome.structure.patterns[Math.floor(Math.random() * genome.structure.patterns.length)];
    pattern.recursionDepth = Math.max(1, pattern.recursionDepth + Math.floor((Math.random() - 0.5) * 2));
    pattern.applicability = Math.max(0, Math.min(1, pattern.applicability + (Math.random() - 0.5) * 0.2));
  }

  /**
   * Helper methods for crossover operations
   */
  private crossoverPrimitives(primitivesA: AgenticPrimitive[], primitivesB: AgenticPrimitive[]): AgenticPrimitive[] {
    // Simple uniform crossover
    const result: AgenticPrimitive[] = [];
    const maxLength = Math.max(primitivesA.length, primitivesB.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (i < primitivesA.length && (i >= primitivesB.length || Math.random() < 0.5)) {
        result.push(primitivesA[i]);
      } else if (i < primitivesB.length) {
        result.push(primitivesB[i]);
      }
    }
    
    return result;
  }

  private crossoverStructure(structA: any, structB: any): any {
    return {
      nodes: Math.random() < 0.5 ? [...structA.nodes] : [...structB.nodes],
      edges: Math.random() < 0.5 ? [...structA.edges] : [...structB.edges],
      patterns: Math.random() < 0.5 ? [...structA.patterns] : [...structB.patterns]
    };
  }

  private crossoverParameters(paramsA: any, paramsB: any): any {
    return {
      complexity: this.blendTensors(paramsA.complexity, paramsB.complexity),
      expressiveness: this.blendTensors(paramsA.expressiveness, paramsB.expressiveness),
      efficiency: this.blendTensors(paramsA.efficiency, paramsB.efficiency),
      adaptability: this.blendTensors(paramsA.adaptability, paramsB.adaptability)
    };
  }

  /**
   * Utility methods
   */
  private createRandomGenome(seedPrimitives: AgenticPrimitive[], index: number): GrammarGenome {
    const nodeCount = Math.floor(Math.random() * 8) + 3; // 3-10 nodes
    const nodes = [];
    
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        id: `node_${index}_${i}`,
        type: seedPrimitives[i % seedPrimitives.length]?.type || 'action',
        activation: randomTensor([4], 0.5),
        complexity: Math.random(),
        connections: []
      });
    }
    
    return {
      id: `genome_${index}_${Date.now()}`,
      primitives: seedPrimitives.slice(0, Math.min(5, seedPrimitives.length)),
      structure: {
        nodes,
        edges: [],
        patterns: []
      },
      parameters: {
        complexity: randomTensor([8], 0.3),
        expressiveness: randomTensor([6], 0.4),
        efficiency: randomTensor([4], 0.5),
        adaptability: randomTensor([5], 0.3)
      },
      fitness: 0,
      generation: 0,
      lineage: []
    };
  }

  private cloneParameters(params: any): any {
    return {
      complexity: cloneTensor(params.complexity),
      expressiveness: cloneTensor(params.expressiveness),
      efficiency: cloneTensor(params.efficiency),
      adaptability: cloneTensor(params.adaptability)
    };
  }

  private mutateTensor(tensor: any, strength: number): any {
    const mutation = randomTensor(tensor.shape, strength);
    return addTensors(tensor, mutation);
  }

  private blendTensors(tensorA: any, tensorB: any, alpha: number = 0.5): any {
    const scaledA = scaleTensor(tensorA, alpha);
    const scaledB = scaleTensor(tensorB, 1 - alpha);
    return addTensors(scaledA, scaledB);
  }

  private calculateAdaptiveMutationRate(): number {
    if (this.evolutionHistory.length < 3) return this.params.mutation.parametricRate;
    
    const recentFitness = this.evolutionHistory.slice(-5).map(s => s.population.bestFitness);
    const trend = recentFitness[recentFitness.length - 1] - recentFitness[0];
    
    if (trend > 0.01) {
      return this.params.mutation.parametricRate * 0.8; // Reduce when improving
    } else if (trend < -0.01) {
      return this.params.mutation.parametricRate * 1.3; // Increase when declining
    } else {
      return this.params.mutation.parametricRate * 1.1; // Slight increase when stagnating
    }
  }

  private shouldTerminate(): boolean {
    if (this.generation >= this.params.termination.maxGenerations) return true;
    if (this.bestGenome && this.bestGenome.fitness >= this.params.termination.fitnessThreshold) return true;
    
    // Check for stagnation
    if (this.evolutionHistory.length >= this.params.termination.stagnationLimit) {
      const recent = this.evolutionHistory.slice(-this.params.termination.stagnationLimit);
      const fitnessRange = Math.max(...recent.map(s => s.population.bestFitness)) - 
                          Math.min(...recent.map(s => s.population.bestFitness));
      
      if (fitnessRange < 0.001) return true; // Fitness has stagnated
    }
    
    return false;
  }

  private calculateStats(generationTime: number): EvolutionStats {
    const fitnesses = this.population.map(g => g.fitness);
    const diversity = this.calculatePopulationDiversity();
    
    return {
      generation: this.generation,
      population: {
        size: this.population.length,
        diversity,
        averageFitness: fitnesses.reduce((sum, f) => sum + f, 0) / fitnesses.length,
        bestFitness: Math.max(...fitnesses),
        worstFitness: Math.min(...fitnesses)
      },
      convergence: {
        rate: this.calculateConvergenceRate(),
        stagnationCount: this.calculateStagnationCount(),
        fitnessVariance: this.calculateVariance(fitnesses)
      },
      mutation: {
        currentRate: this.calculateAdaptiveMutationRate(),
        effectiveRate: this.calculateEffectiveMutationRate(),
        adaptationHistory: this.evolutionHistory.map(s => s.mutation.currentRate)
      },
      performance: {
        generationsPerSecond: 1000 / generationTime,
        evaluationsPerSecond: this.population.length * 1000 / generationTime,
        memoryUsage: process.memoryUsage?.()?.heapUsed || 0,
        cpuUsage: 0 // Placeholder
      },
      insights: {
        emergedPatterns: this.identifyEmergedPatterns(),
        dominantStrategies: this.identifyDominantStrategies(),
        unexpectedBehaviors: this.identifyUnexpectedBehaviors()
      }
    };
  }

  private updateBest(): void {
    const currentBest = this.population[0];
    if (!this.bestGenome || currentBest.fitness > this.bestGenome.fitness) {
      this.bestGenome = currentBest;
    }
  }

  private updateParetoFront(): void {
    // Simplified Pareto front calculation
    this.paretoFront = this.population.slice(0, Math.min(10, Math.floor(this.population.length * 0.1)));
  }

  private maintainDiversity(): void {
    // Remove too-similar genomes to maintain diversity
    const threshold = this.params.population.diversityThreshold;
    
    for (let i = this.population.length - 1; i >= 0; i--) {
      for (let j = 0; j < i; j++) {
        if (this.calculateGenomeSimilarity(this.population[i], this.population[j]) > threshold) {
          this.population.splice(i, 1);
          break;
        }
      }
    }
  }

  private maintainsDiversity(candidate: GrammarGenome, existing: GrammarGenome[]): boolean {
    const threshold = this.params.population.diversityThreshold;
    
    for (const genome of existing) {
      if (this.calculateGenomeSimilarity(candidate, genome) > threshold) {
        return false;
      }
    }
    
    return true;
  }

  private calculateGenomeSimilarity(genomeA: GrammarGenome, genomeB: GrammarGenome): number {
    // Simplified similarity calculation
    const structuralSim = this.calculateStructuralSimilarity(genomeA, genomeB);
    const parametricSim = this.calculateParametricSimilarity(genomeA.parameters, genomeB.parameters);
    
    return (structuralSim + parametricSim) / 2;
  }

  private calculateStructuralSimilarity(genomeA: GrammarGenome, genomeB: GrammarGenome): number {
    const nodeCountDiff = Math.abs(genomeA.structure.nodes.length - genomeB.structure.nodes.length);
    const edgeCountDiff = Math.abs(genomeA.structure.edges.length - genomeB.structure.edges.length);
    const patternCountDiff = Math.abs(genomeA.structure.patterns.length - genomeB.structure.patterns.length);
    
    const maxNodes = Math.max(genomeA.structure.nodes.length, genomeB.structure.nodes.length, 1);
    const maxEdges = Math.max(genomeA.structure.edges.length, genomeB.structure.edges.length, 1);
    const maxPatterns = Math.max(genomeA.structure.patterns.length, genomeB.structure.patterns.length, 1);
    
    const similarity = 1 - (
      (nodeCountDiff / maxNodes + edgeCountDiff / maxEdges + patternCountDiff / maxPatterns) / 3
    );
    
    return Math.max(0, similarity);
  }

  private calculateParametricSimilarity(paramsA: any, paramsB: any): number {
    // Calculate cosine similarity between parameter tensors
    let totalSimilarity = 0;
    let count = 0;
    
    const tensorKeys = ['complexity', 'expressiveness', 'efficiency', 'adaptability'];
    
    for (const key of tensorKeys) {
      if (paramsA[key] && paramsB[key]) {
        const similarity = this.cosineSimilarity(paramsA[key], paramsB[key]);
        totalSimilarity += similarity;
        count++;
      }
    }
    
    return count > 0 ? totalSimilarity / count : 0;
  }

  private cosineSimilarity(tensorA: any, tensorB: any): number {
    // Simplified cosine similarity
    const dotProd = dotProduct(tensorA, tensorB);
    const normA = Math.sqrt(dotProduct(tensorA, tensorA));
    const normB = Math.sqrt(dotProduct(tensorB, tensorB));
    
    return normA > 0 && normB > 0 ? dotProd / (normA * normB) : 0;
  }

  private performMetaOptimization(): void {
    // Analyze recent performance and adjust parameters
    if (this.evolutionHistory.length < 10) return;
    
    const recentStats = this.evolutionHistory.slice(-10);
    const avgImprovement = this.calculateAverageImprovement(recentStats);
    
    if (avgImprovement < 0.001) {
      // Stagnation - increase exploration
      this.params.mutation.structuralRate *= 1.1;
      this.params.mutation.parametricRate *= 1.1;
      this.params.crossover.rate *= 0.9;
    } else if (avgImprovement > 0.01) {
      // Fast improvement - increase exploitation
      this.params.mutation.structuralRate *= 0.9;
      this.params.mutation.parametricRate *= 0.9;
      this.params.crossover.rate *= 1.1;
    }
    
    // Keep parameters within bounds
    this.params.mutation.structuralRate = Math.max(0.01, Math.min(0.5, this.params.mutation.structuralRate));
    this.params.mutation.parametricRate = Math.max(0.01, Math.min(0.5, this.params.mutation.parametricRate));
    this.params.crossover.rate = Math.max(0.1, Math.min(0.9, this.params.crossover.rate));
  }

  private reportProgress(stats: EvolutionStats): void {
    console.log(`\n=== Generation ${stats.generation} ===`);
    console.log(`Best Fitness: ${stats.population.bestFitness.toFixed(4)}`);
    console.log(`Avg Fitness: ${stats.population.averageFitness.toFixed(4)}`);
    console.log(`Diversity: ${stats.population.diversity.toFixed(3)}`);
    console.log(`Mutation Rate: ${stats.mutation.currentRate.toFixed(3)}`);
    console.log(`Performance: ${stats.performance.generationsPerSecond.toFixed(1)} gen/s`);
    
    if (stats.insights.emergedPatterns.length > 0) {
      console.log(`Emerged Patterns: ${stats.insights.emergedPatterns.join(', ')}`);
    }
  }

  /**
   * Utility calculation methods
   */
  private calculatePopulationDiversity(): number {
    if (this.population.length < 2) return 0;
    
    let totalDiversity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < this.population.length; i++) {
      for (let j = i + 1; j < this.population.length; j++) {
        totalDiversity += 1 - this.calculateGenomeSimilarity(this.population[i], this.population[j]);
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalDiversity / comparisons : 0;
  }

  private calculateConvergenceRate(): number {
    if (this.evolutionHistory.length < 2) return 0;
    
    const recent = this.evolutionHistory.slice(-5);
    if (recent.length < 2) return 0;
    
    const improvement = recent[recent.length - 1].population.bestFitness - recent[0].population.bestFitness;
    return improvement / recent.length;
  }

  private calculateStagnationCount(): number {
    let stagnationCount = 0;
    
    for (let i = this.evolutionHistory.length - 1; i > 0; i--) {
      const improvement = this.evolutionHistory[i].population.bestFitness - 
                         this.evolutionHistory[i - 1].population.bestFitness;
      
      if (improvement < 0.001) {
        stagnationCount++;
      } else {
        break;
      }
    }
    
    return stagnationCount;
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return variance;
  }

  private calculateEffectiveMutationRate(): number {
    // Placeholder - would track mutations that led to fitness improvements
    return this.params.mutation.parametricRate * 0.7;
  }

  private calculateAverageImprovement(stats: EvolutionStats[]): number {
    if (stats.length < 2) return 0;
    
    let totalImprovement = 0;
    for (let i = 1; i < stats.length; i++) {
      totalImprovement += stats[i].population.bestFitness - stats[i - 1].population.bestFitness;
    }
    
    return totalImprovement / (stats.length - 1);
  }

  private identifyEmergedPatterns(): string[] {
    // Analyze population for common patterns
    const patterns: string[] = [];
    
    // Example pattern detection
    const avgComplexity = this.population.reduce((sum, g) => sum + g.structure.nodes.length, 0) / this.population.length;
    if (avgComplexity > 8) patterns.push('high-complexity');
    if (avgComplexity < 4) patterns.push('minimal-structure');
    
    return patterns;
  }

  private identifyDominantStrategies(): string[] {
    // Analyze successful genome characteristics
    const strategies: string[] = [];
    
    const topGenomes = this.population.slice(0, Math.floor(this.population.length * 0.1));
    const avgPatterns = topGenomes.reduce((sum, g) => sum + g.structure.patterns.length, 0) / topGenomes.length;
    
    if (avgPatterns > 3) strategies.push('pattern-rich');
    if (avgPatterns < 1) strategies.push('simple-structure');
    
    return strategies;
  }

  private identifyUnexpectedBehaviors(): string[] {
    // Detect anomalous or surprising behaviors
    const behaviors: string[] = [];
    
    // Example: fitness jumps
    if (this.evolutionHistory.length > 1) {
      const lastImprovement = this.evolutionHistory[this.evolutionHistory.length - 1].population.bestFitness -
                             this.evolutionHistory[this.evolutionHistory.length - 2].population.bestFitness;
      
      if (lastImprovement > 0.1) behaviors.push('fitness-jump');
    }
    
    return behaviors;
  }

  /**
   * Public getters for monitoring
   */
  getCurrentPopulation(): GrammarGenome[] {
    return [...this.population];
  }

  getBestGenome(): GrammarGenome | undefined {
    return this.bestGenome;
  }

  getParetoFront(): GrammarGenome[] {
    return [...this.paretoFront];
  }

  getEvolutionHistory(): EvolutionStats[] {
    return [...this.evolutionHistory];
  }

  getCurrentGeneration(): number {
    return this.generation;
  }
}