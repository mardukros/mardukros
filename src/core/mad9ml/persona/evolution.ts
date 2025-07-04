/**
 * Persona Evolution - MOSES-style evolutionary mutation for personality drift
 * 
 * Implements evolutionary algorithms for Marduk persona adaptation and drift,
 * enabling the system to evolve its personality traits, cognitive parameters,
 * and behavioral patterns over time.
 */

import { PersonaTensor, EvolutionParams, Tensor } from '../types.js';
import { 
  makeTensor, 
  randomTensor, 
  addTensors, 
  scaleTensor, 
  multiplyTensors,
  cloneTensor,
  norm
} from '../tensor/operations.js';

/**
 * Core persona evolution engine
 */
export class PersonaEvolution {
  private params: EvolutionParams;
  private generation: number = 0;
  private fitnessHistory: number[] = [];

  constructor(params: EvolutionParams) {
    this.params = params;
  }

  /**
   * Creates an initial persona tensor with specified dimensions
   */
  createInitialPersona(
    traitsDim: number,
    paramsDim: number,
    mutationDim: number
  ): PersonaTensor {
    return {
      traits: randomTensor([traitsDim], 0.5),           // Moderate random traits
      parameters: randomTensor([paramsDim], 0.3),       // Conservative params
      mutationCoeffs: randomTensor([mutationDim], 0.1)  // Low initial mutation
    };
  }

  /**
   * Applies evolutionary mutation to a persona tensor
   */
  evolvPersona(persona: PersonaTensor, fitness: number): PersonaTensor {
    this.fitnessHistory.push(fitness);
    this.generation++;

    // Calculate adaptive mutation rate based on fitness trend
    const adaptiveMutationRate = this.calculateAdaptiveMutationRate(fitness);
    
    // Clone the current persona
    const evolved: PersonaTensor = {
      traits: cloneTensor(persona.traits),
      parameters: cloneTensor(persona.parameters),
      mutationCoeffs: cloneTensor(persona.mutationCoeffs)
    };

    // Apply mutations with different strategies
    evolved.traits = this.mutateTraits(evolved.traits, adaptiveMutationRate);
    evolved.parameters = this.mutateParameters(evolved.parameters, adaptiveMutationRate);
    evolved.mutationCoeffs = this.evolveMutationCoeffs(evolved.mutationCoeffs, fitness);

    // Apply constraints to keep values within bounds
    evolved.traits = this.applyConstraints(evolved.traits);
    evolved.parameters = this.applyConstraints(evolved.parameters);
    evolved.mutationCoeffs = this.applyConstraints(evolved.mutationCoeffs);

    return evolved;
  }

  /**
   * Calculates adaptive mutation rate based on fitness history
   */
  private calculateAdaptiveMutationRate(currentFitness: number): number {
    const baseMutationRate = this.params.mutationRate;
    
    if (this.fitnessHistory.length < 3) {
      return baseMutationRate;
    }

    // Calculate fitness trend over last few generations
    const recentHistory = this.fitnessHistory.slice(-5);
    const trend = recentHistory[recentHistory.length - 1] - recentHistory[0];
    
    // If fitness is improving, reduce mutation rate
    // If fitness is stagnating or declining, increase mutation rate
    if (trend > 0.01) {
      return baseMutationRate * 0.8; // Reduce exploration when improving
    } else if (trend < -0.01) {
      return baseMutationRate * 1.5; // Increase exploration when declining
    } else {
      return baseMutationRate * 1.2; // Increase exploration when stagnating
    }
  }

  /**
   * Mutates personality traits using Gaussian noise
   */
  private mutateTraits(traits: Tensor, mutationRate: number): Tensor {
    const mutationNoise = randomTensor(traits.shape, mutationRate);
    const mutated = addTensors(traits, mutationNoise);
    
    // Apply personality drift - gradual changes in core traits
    const driftFactor = this.params.driftFactor * 0.001; // Very small drift
    const drift = randomTensor(traits.shape, driftFactor);
    
    return addTensors(mutated, drift);
  }

  /**
   * Mutates cognitive parameters with adaptive sensitivity
   */
  private mutateParameters(parameters: Tensor, mutationRate: number): Tensor {
    const data = parameters.data as Float32Array;
    const mutated = new Float32Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      // Use different mutation strategies for different parameter types
      const paramType = i % 3; // Cycle through mutation types
      
      switch (paramType) {
        case 0: // Gaussian mutation
          const gaussian = this.generateGaussianNoise() * mutationRate;
          mutated[i] = data[i] + gaussian;
          break;
          
        case 1: // Uniform mutation
          const uniform = (Math.random() - 0.5) * 2 * mutationRate;
          mutated[i] = data[i] + uniform;
          break;
          
        case 2: // Cauchy mutation (heavy-tailed for occasional large jumps)
          const cauchy = this.generateCauchyNoise() * mutationRate * 0.1;
          mutated[i] = data[i] + cauchy;
          break;
      }
    }
    
    return makeTensor(parameters.shape, mutated);
  }

  /**
   * Evolves mutation coefficients based on their effectiveness
   */
  private evolveMutationCoeffs(coeffs: Tensor, fitness: number): Tensor {
    const data = coeffs.data as Float32Array;
    const evolved = new Float32Array(data.length);
    
    // Self-adaptive mutation: coefficients that lead to better fitness are reinforced
    const fitnessRatio = this.fitnessHistory.length > 1 
      ? fitness / Math.max(this.fitnessHistory[this.fitnessHistory.length - 2], 0.001)
      : 1.0;
    
    for (let i = 0; i < data.length; i++) {
      // Mutate the mutation coefficients themselves
      const selfMutation = this.generateGaussianNoise() * 0.01;
      let newCoeff = data[i] + selfMutation;
      
      // Adapt based on fitness improvement
      if (fitnessRatio > 1.05) {
        // Good fitness improvement - slightly increase mutation in this direction
        newCoeff *= 1.05;
      } else if (fitnessRatio < 0.95) {
        // Poor fitness - reduce mutation coefficient
        newCoeff *= 0.95;
      }
      
      evolved[i] = newCoeff;
    }
    
    return makeTensor(coeffs.shape, evolved);
  }

  /**
   * Applies constraints to keep tensor values within reasonable bounds
   */
  private applyConstraints(tensor: Tensor): Tensor {
    const { minValue, maxValue } = this.params.constraints;
    const data = tensor.data as Float32Array;
    const constrained = new Float32Array(data.length);
    
    for (let i = 0; i < data.length; i++) {
      constrained[i] = Math.max(minValue, Math.min(maxValue, data[i]));
    }
    
    return makeTensor(tensor.shape, constrained);
  }

  /**
   * Generates Gaussian noise using Box-Muller transform
   */
  private generateGaussianNoise(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }

  /**
   * Generates Cauchy noise for heavy-tailed mutations
   */
  private generateCauchyNoise(): number {
    const u = Math.random();
    return Math.tan(Math.PI * (u - 0.5));
  }

  /**
   * Performs crossover between two personas (sexual reproduction)
   */
  crossover(parentA: PersonaTensor, parentB: PersonaTensor): PersonaTensor {
    return {
      traits: this.tensorCrossover(parentA.traits, parentB.traits),
      parameters: this.tensorCrossover(parentA.parameters, parentB.parameters),
      mutationCoeffs: this.tensorCrossover(parentA.mutationCoeffs, parentB.mutationCoeffs)
    };
  }

  /**
   * Performs tensor crossover using blend crossover (BLX-α)
   */
  private tensorCrossover(tensorA: Tensor, tensorB: Tensor, alpha: number = 0.5): Tensor {
    if (tensorA.shape.length !== tensorB.shape.length) {
      throw new Error('Tensors must have same shape for crossover');
    }
    
    const dataA = tensorA.data as Float32Array;
    const dataB = tensorB.data as Float32Array;
    const result = new Float32Array(dataA.length);
    
    for (let i = 0; i < dataA.length; i++) {
      const min = Math.min(dataA[i], dataB[i]);
      const max = Math.max(dataA[i], dataB[i]);
      const range = max - min;
      
      // BLX-α crossover: sample from extended range
      const lower = min - alpha * range;
      const upper = max + alpha * range;
      
      result[i] = lower + Math.random() * (upper - lower);
    }
    
    return makeTensor(tensorA.shape, result);
  }

  /**
   * Evaluates persona fitness based on multiple criteria
   */
  evaluateFitness(
    persona: PersonaTensor,
    performanceMetrics: {
      taskSuccess: number;
      learningRate: number;
      adaptability: number;
      creativity: number;
      stability: number;
    }
  ): number {
    // Multi-objective fitness function
    const weights = {
      performance: 0.3,
      learning: 0.2,
      adaptability: 0.2,
      creativity: 0.15,
      stability: 0.15
    };
    
    // Normalize metrics to [0, 1] range
    const normalizedMetrics = {
      performance: Math.max(0, Math.min(1, performanceMetrics.taskSuccess)),
      learning: Math.max(0, Math.min(1, performanceMetrics.learningRate)),
      adaptability: Math.max(0, Math.min(1, performanceMetrics.adaptability)),
      creativity: Math.max(0, Math.min(1, performanceMetrics.creativity)),
      stability: Math.max(0, Math.min(1, performanceMetrics.stability))
    };
    
    // Calculate weighted fitness
    let fitness = 0;
    fitness += weights.performance * normalizedMetrics.performance;
    fitness += weights.learning * normalizedMetrics.learning;
    fitness += weights.adaptability * normalizedMetrics.adaptability;
    fitness += weights.creativity * normalizedMetrics.creativity;
    fitness += weights.stability * normalizedMetrics.stability;
    
    // Add complexity penalty to prevent overfitting
    const complexityPenalty = this.calculateComplexityPenalty(persona);
    fitness -= complexityPenalty;
    
    return Math.max(0, fitness);
  }

  /**
   * Calculates complexity penalty to prevent overfitting
   */
  private calculateComplexityPenalty(persona: PersonaTensor): number {
    const traitComplexity = norm(persona.traits) / persona.traits.size;
    const paramComplexity = norm(persona.parameters) / persona.parameters.size;
    const mutationComplexity = norm(persona.mutationCoeffs) / persona.mutationCoeffs.size;
    
    const avgComplexity = (traitComplexity + paramComplexity + mutationComplexity) / 3;
    
    // Penalty increases quadratically with complexity
    return Math.pow(Math.max(0, avgComplexity - 0.5), 2) * 0.1;
  }

  /**
   * Implements meta-evolution: evolution of evolution parameters
   */
  metaEvolve(): void {
    const fitnessWindow = this.fitnessHistory.slice(-10);
    
    if (fitnessWindow.length < 5) return;
    
    const avgFitness = fitnessWindow.reduce((sum, f) => sum + f, 0) / fitnessWindow.length;
    const fitnessVariance = fitnessWindow.reduce((sum, f) => sum + Math.pow(f - avgFitness, 2), 0) / fitnessWindow.length;
    
    // Adapt evolution parameters based on fitness statistics
    if (avgFitness < this.params.fitnessThreshold) {
      // Poor performance - increase exploration
      this.params.mutationRate *= 1.1;
      this.params.driftFactor *= 1.05;
    } else {
      // Good performance - focus exploitation
      this.params.mutationRate *= 0.95;
      this.params.driftFactor *= 0.98;
    }
    
    // Adapt based on fitness variance
    if (fitnessVariance > 0.1) {
      // High variance - reduce mutation for stability
      this.params.mutationRate *= 0.9;
    } else if (fitnessVariance < 0.01) {
      // Low variance (stagnation) - increase mutation for diversity
      this.params.mutationRate *= 1.15;
    }
    
    // Keep parameters within reasonable bounds
    this.params.mutationRate = Math.max(0.001, Math.min(0.5, this.params.mutationRate));
    this.params.driftFactor = Math.max(0.001, Math.min(0.1, this.params.driftFactor));
  }

  /**
   * Gets evolution statistics
   */
  getStatistics(): {
    generation: number;
    currentMutationRate: number;
    currentDriftFactor: number;
    avgFitness: number;
    fitnessStdDev: number;
    fitnessHistory: number[];
  } {
    const avgFitness = this.fitnessHistory.length > 0
      ? this.fitnessHistory.reduce((sum, f) => sum + f, 0) / this.fitnessHistory.length
      : 0;
    
    const fitnessVariance = this.fitnessHistory.length > 0
      ? this.fitnessHistory.reduce((sum, f) => sum + Math.pow(f - avgFitness, 2), 0) / this.fitnessHistory.length
      : 0;
    
    return {
      generation: this.generation,
      currentMutationRate: this.params.mutationRate,
      currentDriftFactor: this.params.driftFactor,
      avgFitness,
      fitnessStdDev: Math.sqrt(fitnessVariance),
      fitnessHistory: [...this.fitnessHistory]
    };
  }
}