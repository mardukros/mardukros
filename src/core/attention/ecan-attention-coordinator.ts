/**
 * ECAN Attention Coordinator
 * 
 * Coordinates ECAN attention allocation with existing cognitive kernels and autonomy systems.
 * This integrates the ECAN model with the MAD9ML cognitive architecture.
 */

import { ECANAttentionKernel, AttentionField, AttentionValue, AttentionEconomics } from './ecan-attention-kernel.js';
import { CognitiveKernelRegistry } from '../tensor-shapes/cognitive-kernel-registry.js';

/**
 * Distributed task for attention allocation verification
 */
export interface DistributedTask {
  id: string;
  name: string;
  priority: number;
  requiredKernels: string[];
  estimatedResources: {
    compute: number;
    memory: number;
    bandwidth: number;
  };
  deadline?: number;
  context: any;
}

/**
 * Resource optimization metrics
 */
export interface ResourceOptimization {
  efficiency: number;
  utilization: number;
  allocation: Map<string, number>;
  bottlenecks: string[];
  recommendations: string[];
}

/**
 * Attention allocation result
 */
export interface AttentionAllocationResult {
  allocations: Map<string, AttentionValue>;
  field: AttentionField;
  optimization: ResourceOptimization;
  metaAnalysis: {
    effectiveness: number;
    patterns: any[];
    insights: string[];
  };
}

/**
 * ECAN Attention Coordinator integrating with MAD9ML cognitive architecture
 */
export class ECANAttentionCoordinator {
  private ecanKernel: ECANAttentionKernel;
  private kernelRegistry: CognitiveKernelRegistry;
  private activeKernels: Map<string, any>;
  private currentGoals: any[];
  private distributedTasks: Map<string, DistributedTask>;
  private optimizationHistory: ResourceOptimization[];

  constructor() {
    this.ecanKernel = new ECANAttentionKernel();
    this.kernelRegistry = CognitiveKernelRegistry.getInstance();
    this.activeKernels = new Map();
    this.currentGoals = [];
    this.distributedTasks = new Map();
    this.optimizationHistory = [];
    
    this.initializeIntegration();
  }

  /**
   * Initialize integration with existing cognitive systems
   */
  private initializeIntegration(): void {
    // Register ECAN kernel with the cognitive kernel registry
    const ecanDefinition = ECANAttentionKernel.createECANKernelDefinition();
    this.kernelRegistry.registerExternalKernel(ecanDefinition);

    // Initialize sample kernels for demonstration
    this.initializeSampleKernels();
  }

  /**
   * Initialize sample kernels for testing and demonstration
   */
  private initializeSampleKernels(): void {
    // Mock implementations of existing cognitive kernels
    this.activeKernels.set('semantic-memory', {
      id: 'semantic-memory',
      getPerformanceMetrics: () => ({ efficiency: 0.8, accuracy: 0.9 }),
      getCurrentState: () => ({ conceptCount: 5000, queryRate: 100 }),
      getResourceUsage: () => ({ cpu: 0.3, memory: 0.4, bandwidth: 0.2 }),
      getOutputMetrics: () => ({ quality: 0.85, throughput: 120 })
    });

    this.activeKernels.set('task-manager', {
      id: 'task-manager',
      getPerformanceMetrics: () => ({ efficiency: 0.7, accuracy: 0.8 }),
      getCurrentState: () => ({ activeTasks: 25, queueLength: 10 }),
      getResourceUsage: () => ({ cpu: 0.5, memory: 0.3, bandwidth: 0.4 }),
      getOutputMetrics: () => ({ quality: 0.75, throughput: 50 })
    });

    this.activeKernels.set('ai-coordinator', {
      id: 'ai-coordinator',
      getPerformanceMetrics: () => ({ efficiency: 0.9, accuracy: 0.85 }),
      getCurrentState: () => ({ contexts: 100, activeQueries: 5 }),
      getResourceUsage: () => ({ cpu: 0.6, memory: 0.5, bandwidth: 0.7 }),
      getOutputMetrics: () => ({ quality: 0.9, throughput: 30 })
    });

    this.activeKernels.set('autonomy-monitor', {
      id: 'autonomy-monitor',
      getPerformanceMetrics: () => ({ efficiency: 0.85, accuracy: 0.9 }),
      getCurrentState: () => ({ events: 1000, alerts: 3 }),
      getResourceUsage: () => ({ cpu: 0.2, memory: 0.3, bandwidth: 0.1 }),
      getOutputMetrics: () => ({ quality: 0.9, throughput: 200 })
    });
  }

  /**
   * Allocate attention across cognitive kernels for distributed tasks
   */
  public async allocateAttentionForDistributedTasks(
    tasks: DistributedTask[], 
    systemGoals: any[], 
    context: any
  ): Promise<AttentionAllocationResult> {
    // Store current goals and tasks
    this.currentGoals = systemGoals;
    tasks.forEach(task => this.distributedTasks.set(task.id, task));

    // Perform ECAN attention allocation
    const attentionField = this.ecanKernel.allocateAttention(
      this.activeKernels,
      systemGoals,
      { ...context, distributedTasks: tasks }
    );

    // Extract attention allocations
    const allocations = this.extractAttentionAllocations(attentionField);

    // Optimize resource allocation based on attention
    const optimization = await this.optimizeResourceAllocation(allocations, tasks);

    // Perform meta-cognitive analysis
    const metaAnalysis = this.performMetaAnalysis(allocations, optimization);

    // Store optimization history
    this.optimizationHistory.push(optimization);

    return {
      allocations,
      field: attentionField,
      optimization,
      metaAnalysis
    };
  }

  /**
   * Extract attention allocations from attention field
   */
  private extractAttentionAllocations(field: AttentionField): Map<string, AttentionValue> {
    const allocations = new Map<string, AttentionValue>();
    const fieldData = field.values.data as Float32Array;
    
    let index = 0;
    this.activeKernels.forEach((kernel, kernelId) => {
      if (index < 10000) {
        const baseIndex = index * 6 * 8;
        
        const attention: AttentionValue = {
          sti: fieldData[baseIndex],
          lti: fieldData[baseIndex + 8],
          vlti: fieldData[baseIndex + 16],
          activation: fieldData[baseIndex + 24],
          novelty: fieldData[baseIndex + 32],
          utility: fieldData[baseIndex + 40]
        };
        
        allocations.set(kernelId, attention);
        index++;
      }
    });

    return allocations;
  }

  /**
   * Optimize resource allocation based on attention values
   */
  private async optimizeResourceAllocation(
    allocations: Map<string, AttentionValue>,
    tasks: DistributedTask[]
  ): Promise<ResourceOptimization> {
    const economics = this.ecanKernel.getAttentionEconomics();
    const totalResources = economics.resources.total - economics.resources.reserved;
    
    // Calculate resource requirements for tasks
    const taskResourceDemand = tasks.reduce((total, task) => {
      return total + task.estimatedResources.compute + 
             task.estimatedResources.memory + 
             task.estimatedResources.bandwidth;
    }, 0);

    // Calculate efficiency based on attention allocations
    const efficiency = this.calculateAllocationEfficiency(allocations, tasks);
    
    // Calculate utilization
    const utilization = Math.min(1.0, taskResourceDemand / totalResources);
    
    // Create resource allocation map
    const allocation = new Map<string, number>();
    allocations.forEach((attention, kernelId) => {
      const resourceShare = attention.activation * totalResources;
      allocation.set(kernelId, resourceShare);
    });

    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(allocations, tasks);
    
    // Generate recommendations
    const recommendations = this.generateOptimizationRecommendations(
      efficiency, utilization, bottlenecks, allocations
    );

    return {
      efficiency,
      utilization,
      allocation,
      bottlenecks,
      recommendations
    };
  }

  /**
   * Calculate allocation efficiency
   */
  private calculateAllocationEfficiency(
    allocations: Map<string, AttentionValue>,
    tasks: DistributedTask[]
  ): number {
    let totalEfficiency = 0;
    let weightSum = 0;

    allocations.forEach((attention, kernelId) => {
      const kernel = this.activeKernels.get(kernelId);
      if (kernel) {
        const performance = kernel.getPerformanceMetrics();
        const efficiency = performance.efficiency * attention.activation;
        totalEfficiency += efficiency;
        weightSum += attention.activation;
      }
    });

    return weightSum > 0 ? totalEfficiency / weightSum : 0;
  }

  /**
   * Identify resource bottlenecks
   */
  private identifyBottlenecks(
    allocations: Map<string, AttentionValue>,
    tasks: DistributedTask[]
  ): string[] {
    const bottlenecks: string[] = [];
    
    // Check for high-demand, low-allocation scenarios
    allocations.forEach((attention, kernelId) => {
      if (attention.activation > 0.8 && attention.utility < 0.6) {
        bottlenecks.push(`${kernelId}: High activation but low utility`);
      }
      
      if (attention.novelty > 0.7 && attention.sti < 0.5) {
        bottlenecks.push(`${kernelId}: High novelty but low short-term importance`);
      }
    });

    // Check for task-kernel misalignment
    tasks.forEach(task => {
      const requiredKernels = task.requiredKernels;
      const availableAttention = requiredKernels.reduce((total, kernelId) => {
        const attention = allocations.get(kernelId);
        return total + (attention?.activation || 0);
      }, 0);
      
      if (availableAttention < task.priority * 0.5) {
        bottlenecks.push(`Task ${task.id}: Insufficient attention allocation`);
      }
    });

    return bottlenecks;
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(
    efficiency: number,
    utilization: number,
    bottlenecks: string[],
    allocations: Map<string, AttentionValue>
  ): string[] {
    const recommendations: string[] = [];

    // Efficiency recommendations
    if (efficiency < 0.7) {
      recommendations.push('Consider redistributing attention to higher-performing kernels');
      recommendations.push('Investigate low-utility kernel configurations');
    }

    // Utilization recommendations
    if (utilization > 0.9) {
      recommendations.push('System approaching resource saturation - consider load balancing');
    } else if (utilization < 0.5) {
      recommendations.push('System underutilized - opportunity for increased throughput');
    }

    // Bottleneck-specific recommendations
    if (bottlenecks.length > 0) {
      recommendations.push('Address identified bottlenecks to improve overall performance');
      bottlenecks.forEach(bottleneck => {
        if (bottleneck.includes('High activation but low utility')) {
          recommendations.push('Optimize kernel efficiency or reduce activation threshold');
        }
        if (bottleneck.includes('High novelty but low short-term importance')) {
          recommendations.push('Adjust novelty weighting in attention calculation');
        }
      });
    }

    // Attention distribution recommendations
    const attentionValues = Array.from(allocations.values());
    const avgActivation = attentionValues.reduce((sum, a) => sum + a.activation, 0) / attentionValues.length;
    
    if (avgActivation < 0.3) {
      recommendations.push('Overall attention activation low - consider increasing system engagement');
    }

    return recommendations;
  }

  /**
   * Perform meta-cognitive analysis of attention allocation
   */
  private performMetaAnalysis(
    allocations: Map<string, AttentionValue>,
    optimization: ResourceOptimization
  ): { effectiveness: number; patterns: any[]; insights: string[] } {
    // Calculate overall effectiveness
    const effectiveness = (optimization.efficiency + optimization.utilization) / 2;
    
    // Identify patterns in attention allocation
    const patterns = this.identifyAttentionPatterns(allocations);
    
    // Generate insights
    const insights = this.generateMetaCognitiveInsights(allocations, optimization, patterns);

    return {
      effectiveness,
      patterns,
      insights
    };
  }

  /**
   * Identify patterns in attention allocation
   */
  private identifyAttentionPatterns(allocations: Map<string, AttentionValue>): any[] {
    const patterns: any[] = [];
    
    // High activation pattern
    const highActivationKernels = Array.from(allocations.entries())
      .filter(([_, attention]) => attention.activation > 0.7)
      .map(([kernelId, _]) => kernelId);
    
    if (highActivationKernels.length > 0) {
      patterns.push({
        type: 'high_activation',
        kernels: highActivationKernels,
        description: 'Kernels with high attention activation'
      });
    }

    // Novelty-driven pattern
    const noveltyDrivenKernels = Array.from(allocations.entries())
      .filter(([_, attention]) => attention.novelty > 0.6 && attention.sti > 0.5)
      .map(([kernelId, _]) => kernelId);
    
    if (noveltyDrivenKernels.length > 0) {
      patterns.push({
        type: 'novelty_driven',
        kernels: noveltyDrivenKernels,
        description: 'Kernels receiving attention due to novelty'
      });
    }

    // Utility-based pattern
    const utilityBasedKernels = Array.from(allocations.entries())
      .filter(([_, attention]) => attention.utility > 0.7 && attention.lti > 0.6)
      .map(([kernelId, _]) => kernelId);
    
    if (utilityBasedKernels.length > 0) {
      patterns.push({
        type: 'utility_based',
        kernels: utilityBasedKernels,
        description: 'Kernels receiving attention due to high utility'
      });
    }

    return patterns;
  }

  /**
   * Generate meta-cognitive insights
   */
  private generateMetaCognitiveInsights(
    allocations: Map<string, AttentionValue>,
    optimization: ResourceOptimization,
    patterns: any[]
  ): string[] {
    const insights: string[] = [];
    
    // Performance insights
    if (optimization.efficiency > 0.8) {
      insights.push('High efficiency achieved - attention allocation is well-optimized');
    } else if (optimization.efficiency < 0.5) {
      insights.push('Low efficiency detected - attention allocation needs improvement');
    }

    // Pattern insights
    patterns.forEach(pattern => {
      switch (pattern.type) {
        case 'high_activation':
          insights.push(`High activation pattern detected in kernels: ${pattern.kernels.join(', ')}`);
          break;
        case 'novelty_driven':
          insights.push(`Novelty-driven attention allocation active for: ${pattern.kernels.join(', ')}`);
          break;
        case 'utility_based':
          insights.push(`Utility-based allocation optimizing: ${pattern.kernels.join(', ')}`);
          break;
      }
    });

    // Resource insights
    if (optimization.utilization > 0.8) {
      insights.push('High resource utilization - system operating near capacity');
    }

    // Historical comparison
    if (this.optimizationHistory.length > 1) {
      const previousOptimization = this.optimizationHistory[this.optimizationHistory.length - 2];
      const efficiencyTrend = optimization.efficiency - previousOptimization.efficiency;
      
      if (efficiencyTrend > 0.05) {
        insights.push('Attention allocation efficiency improving over time');
      } else if (efficiencyTrend < -0.05) {
        insights.push('Attention allocation efficiency declining - consider policy adjustments');
      }
    }

    return insights;
  }

  /**
   * Simulate shifting attention in distributed tasks
   */
  public async simulateAttentionShifting(
    initialTasks: DistributedTask[],
    newTasks: DistributedTask[],
    systemGoals: any[]
  ): Promise<{
    initial: AttentionAllocationResult;
    shifted: AttentionAllocationResult;
    shiftAnalysis: any;
  }> {
    // Initial allocation
    const initial = await this.allocateAttentionForDistributedTasks(
      initialTasks, 
      systemGoals, 
      { phase: 'initial' }
    );

    // Simulate time passage and introduce new tasks
    await this.simulateTimePassage(100); // 100ms simulation

    // Shifted allocation with new tasks
    const allTasks = [...initialTasks, ...newTasks];
    const shifted = await this.allocateAttentionForDistributedTasks(
      allTasks,
      systemGoals,
      { phase: 'shifted', newTasks }
    );

    // Analyze the shift
    const shiftAnalysis = this.analyzeAttentionShift(initial, shifted);

    return {
      initial,
      shifted,
      shiftAnalysis
    };
  }

  /**
   * Simulate time passage and field dynamics
   */
  private async simulateTimePassage(milliseconds: number): Promise<void> {
    // Apply field dynamics over time
    const field = this.ecanKernel.getAttentionField();
    const fieldData = field.values.data as Float32Array;
    
    // Apply decay and diffusion
    for (let i = 0; i < fieldData.length; i += 8) {
      fieldData[i] *= (1 - field.dynamics.decay); // Apply decay
    }
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  /**
   * Analyze attention shift between two allocations
   */
  private analyzeAttentionShift(
    initial: AttentionAllocationResult,
    shifted: AttentionAllocationResult
  ): any {
    const analysis: any = {
      kernelShifts: new Map<string, any>(),
      totalShift: 0,
      maxShift: 0,
      adaptability: 0
    };

    // Analyze shifts for each kernel
    initial.allocations.forEach((initialAttention, kernelId) => {
      const shiftedAttention = shifted.allocations.get(kernelId);
      if (shiftedAttention) {
        const activationShift = Math.abs(shiftedAttention.activation - initialAttention.activation);
        const stiShift = Math.abs(shiftedAttention.sti - initialAttention.sti);
        const utilityShift = Math.abs(shiftedAttention.utility - initialAttention.utility);
        
        const totalKernelShift = activationShift + stiShift + utilityShift;
        
        analysis.kernelShifts.set(kernelId, {
          activationShift,
          stiShift,
          utilityShift,
          totalShift: totalKernelShift
        });
        
        analysis.totalShift += totalKernelShift;
        analysis.maxShift = Math.max(analysis.maxShift, totalKernelShift);
      }
    });

    // Calculate adaptability score
    analysis.adaptability = Math.min(1.0, analysis.totalShift / (analysis.kernelShifts.size * 3));

    return analysis;
  }

  /**
   * Verify resource optimization in distributed tasks
   */
  public verifyResourceOptimization(
    allocationResult: AttentionAllocationResult,
    tasks: DistributedTask[]
  ): {
    verified: boolean;
    optimizationScore: number;
    details: any;
  } {
    const optimization = allocationResult.optimization;
    
    // Define optimization criteria
    const criteria = {
      minEfficiency: 0.6,
      maxUtilization: 0.95,
      maxBottlenecks: 5,
      minTaskCoverage: 0.8
    };

    // Check efficiency
    const efficiencyMet = optimization.efficiency >= criteria.minEfficiency;
    
    // Check utilization
    const utilizationMet = optimization.utilization <= criteria.maxUtilization;
    
    // Check bottlenecks
    const bottlenecksMet = optimization.bottlenecks.length <= criteria.maxBottlenecks;
    
    // Check task coverage
    const taskCoverage = this.calculateTaskCoverage(allocationResult.allocations, tasks);
    const coverageMet = taskCoverage >= criteria.minTaskCoverage;
    
    // Overall verification
    const verified = efficiencyMet && utilizationMet && bottlenecksMet && coverageMet;
    
    // Calculate optimization score
    const optimizationScore = (
      (efficiencyMet ? 1 : optimization.efficiency / criteria.minEfficiency) +
      (utilizationMet ? 1 : (1 - optimization.utilization) / (1 - criteria.maxUtilization)) +
      (bottlenecksMet ? 1 : criteria.maxBottlenecks / Math.max(1, optimization.bottlenecks.length)) +
      (coverageMet ? 1 : taskCoverage / criteria.minTaskCoverage)
    ) / 4;

    return {
      verified,
      optimizationScore,
      details: {
        efficiency: { met: efficiencyMet, value: optimization.efficiency, threshold: criteria.minEfficiency },
        utilization: { met: utilizationMet, value: optimization.utilization, threshold: criteria.maxUtilization },
        bottlenecks: { met: bottlenecksMet, count: optimization.bottlenecks.length, threshold: criteria.maxBottlenecks },
        taskCoverage: { met: coverageMet, value: taskCoverage, threshold: criteria.minTaskCoverage }
      }
    };
  }

  /**
   * Calculate task coverage based on attention allocation
   */
  private calculateTaskCoverage(
    allocations: Map<string, AttentionValue>,
    tasks: DistributedTask[]
  ): number {
    let totalCoverage = 0;
    
    tasks.forEach(task => {
      let taskCoverage = 0;
      let kernelCount = 0;
      
      task.requiredKernels.forEach(kernelId => {
        const attention = allocations.get(kernelId);
        if (attention) {
          taskCoverage += attention.activation * task.priority;
          kernelCount++;
        }
      });
      
      if (kernelCount > 0) {
        totalCoverage += taskCoverage / kernelCount;
      }
    });
    
    return tasks.length > 0 ? totalCoverage / tasks.length : 0;
  }

  /**
   * Get current ECAN state for monitoring and visualization
   */
  public getCurrentECANState(): {
    field: AttentionField;
    economics: AttentionEconomics;
    metaCognition: any;
    allocations: Map<string, AttentionValue>;
  } {
    const field = this.ecanKernel.getAttentionField();
    const economics = this.ecanKernel.getAttentionEconomics();
    const metaCognition = this.ecanKernel.getMetaCognition();
    const allocations = this.extractAttentionAllocations(field);

    return {
      field,
      economics,
      metaCognition,
      allocations
    };
  }
}