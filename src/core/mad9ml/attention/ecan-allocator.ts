/**
 * ECAN Attention Allocation - Economic attention allocation for cognitive resources
 * 
 * Implements an Economic Attention Networks (ECAN) inspired system for dynamic
 * attention allocation across cognitive tasks and processes, managing limited
 * cognitive resources efficiently.
 */

import { AttentionParams, TaskTensor, Tensor, CognitiveHypergraph } from '../types.js';
import { 
  makeTensor, 
  addTensors, 
  scaleTensor, 
  softmax, 
  multiplyTensors, 
  cloneTensor,
  norm
} from '../tensor/operations.js';

/**
 * Attention allocation state for cognitive resources
 */
export interface AttentionState {
  shortTermImportance: Tensor;  // STI - immediate importance
  longTermImportance: Tensor;   // LTI - long-term significance  
  urgency: Tensor;              // VLI (very long-term importance) - urgency measure
  currentAllocation: Tensor;    // Current attention distribution
  resourceBudget: number;       // Total available attention resources
}

/**
 * ECAN-inspired attention allocation system
 */
export class ECANAttentionAllocator {
  private params: AttentionParams;
  private attentionState: AttentionState | null = null;
  private allocationHistory: Tensor[] = [];
  private performanceMetrics: Map<number, number> = new Map(); // task_id -> performance

  constructor(params: AttentionParams) {
    this.params = params;
  }

  /**
   * Initializes attention state for a given number of tasks/processes
   */
  initializeAttentionState(numTasks: number): AttentionState {
    this.attentionState = {
      shortTermImportance: makeTensor([numTasks]),
      longTermImportance: makeTensor([numTasks]),
      urgency: makeTensor([numTasks]),
      currentAllocation: softmax(makeTensor([numTasks])), // Start with uniform distribution
      resourceBudget: this.params.totalResources
    };

    return this.attentionState;
  }

  /**
   * Updates attention allocation based on task dynamics and performance
   */
  updateAttentionAllocation(
    taskTensor: TaskTensor,
    performanceFeedback: number[],
    externalStimuli: number[] = []
  ): Tensor {
    if (!this.attentionState) {
      throw new Error('Attention state not initialized');
    }

    // Update performance metrics
    performanceFeedback.forEach((perf, idx) => {
      this.performanceMetrics.set(idx, perf);
    });

    // Update importance values based on multiple factors
    this.updateShortTermImportance(taskTensor, externalStimuli);
    this.updateLongTermImportance(performanceFeedback);
    this.updateUrgency(taskTensor);

    // Calculate new attention allocation
    const newAllocation = this.calculateAttentionAllocation();
    
    // Apply attention spreading mechanism
    const spreadAllocation = this.spreadAttention(newAllocation);
    
    // Apply decay to previous allocations
    this.applyAttentionDecay();
    
    // Update current allocation
    this.attentionState.currentAllocation = spreadAllocation;
    this.allocationHistory.push(cloneTensor(spreadAllocation));
    
    // Limit history size
    if (this.allocationHistory.length > 100) {
      this.allocationHistory.shift();
    }

    return spreadAllocation;
  }

  /**
   * Updates short-term importance based on current task states
   */
  private updateShortTermImportance(taskTensor: TaskTensor, externalStimuli: number[]): void {
    const state = this.attentionState!;
    const stiData = state.shortTermImportance.data as Float32Array;
    const activeData = taskTensor.active.data as Float32Array;
    const priorityData = taskTensor.queue.data as Float32Array;

    for (let i = 0; i < stiData.length; i++) {
      // Base STI from task activity and priority
      let newSTI = activeData[i % activeData.length] * 0.3 + priorityData[i % priorityData.length] * 0.4;
      
      // Add external stimuli influence
      if (externalStimuli.length > i) {
        newSTI += externalStimuli[i] * 0.3;
      }
      
      // Apply momentum - gradual changes
      stiData[i] = stiData[i] * 0.7 + newSTI * 0.3;
      
      // Apply threshold
      if (stiData[i] < this.params.thresholds.activation) {
        stiData[i] *= 0.9; // Gradual decay below threshold
      }
    }
  }

  /**
   * Updates long-term importance based on performance history
   */
  private updateLongTermImportance(performanceFeedback: number[]): void {
    const state = this.attentionState!;
    const ltiData = state.longTermImportance.data as Float32Array;

    for (let i = 0; i < ltiData.length; i++) {
      const currentPerformance = performanceFeedback[i] || 0;
      const historicalPerformance = this.performanceMetrics.get(i) || 0;
      
      // LTI increases with consistent good performance
      const performanceContribution = (currentPerformance + historicalPerformance) / 2;
      
      // Apply learning rate for gradual LTI changes
      const learningRate = 0.01;
      ltiData[i] = ltiData[i] * (1 - learningRate) + performanceContribution * learningRate;
      
      // Prevent LTI from decaying too much
      ltiData[i] = Math.max(ltiData[i], 0.1);
    }
  }

  /**
   * Updates urgency based on task dependencies and deadlines
   */
  private updateUrgency(taskTensor: TaskTensor): void {
    const state = this.attentionState!;
    const urgencyData = state.urgency.data as Float32Array;
    const attentionData = taskTensor.attention.data as Float32Array;

    for (let i = 0; i < urgencyData.length; i++) {
      // Urgency increases with attention demands and time pressure
      const attentionDemand = attentionData[i % attentionData.length];
      
      // Simulate time pressure (could be enhanced with actual deadlines)
      const timePressure = Math.sin(Date.now() / 10000 + i) * 0.5 + 0.5;
      
      urgencyData[i] = attentionDemand * 0.7 + timePressure * 0.3;
    }
  }

  /**
   * Calculates new attention allocation using economic principles
   */
  private calculateAttentionAllocation(): Tensor {
    const state = this.attentionState!;
    const numTasks = state.shortTermImportance.size;
    
    // Combine different importance measures
    const combinedImportance = new Float32Array(numTasks);
    const stiData = state.shortTermImportance.data as Float32Array;
    const ltiData = state.longTermImportance.data as Float32Array;
    const urgencyData = state.urgency.data as Float32Array;
    
    for (let i = 0; i < numTasks; i++) {
      // Weighted combination of importance factors
      combinedImportance[i] = 
        stiData[i] * 0.5 +           // Short-term importance
        ltiData[i] * 0.3 +           // Long-term importance  
        urgencyData[i] * 0.2;        // Urgency
      
      // Apply threshold - tasks below threshold get minimal attention
      if (combinedImportance[i] < this.params.thresholds.selection) {
        combinedImportance[i] *= 0.1;
      }
    }
    
    // Convert to probability distribution using softmax
    const rawAllocation = makeTensor([numTasks], combinedImportance);
    return softmax(rawAllocation);
  }

  /**
   * Applies attention spreading to neighboring tasks/processes
   */
  private spreadAttention(allocation: Tensor): Tensor {
    const spreadingFactor = this.params.spreadingFactor;
    const allocationData = allocation.data as Float32Array;
    const spread = new Float32Array(allocationData.length);
    
    // Copy original allocation
    for (let i = 0; i < allocationData.length; i++) {
      spread[i] = allocationData[i];
    }
    
    // Apply spreading to adjacent tasks (simple neighborhood)
    for (let i = 0; i < allocationData.length; i++) {
      const leftNeighbor = (i - 1 + allocationData.length) % allocationData.length;
      const rightNeighbor = (i + 1) % allocationData.length;
      
      // Spread a fraction of attention to neighbors
      const spreadAmount = allocationData[i] * spreadingFactor * 0.1;
      
      spread[leftNeighbor] += spreadAmount;
      spread[rightNeighbor] += spreadAmount;
      spread[i] -= spreadAmount * 2; // Remove spread amount from source
    }
    
    // Normalize to maintain total allocation
    const total = spread.reduce((sum, val) => sum + val, 0);
    for (let i = 0; i < spread.length; i++) {
      spread[i] /= total;
    }
    
    return makeTensor(allocation.shape, spread);
  }

  /**
   * Applies decay to attention values over time
   */
  private applyAttentionDecay(): void {
    const state = this.attentionState!;
    const decayRate = this.params.decayRate;
    
    // Decay STI (short-term importance decays faster)
    const stiData = state.shortTermImportance.data as Float32Array;
    for (let i = 0; i < stiData.length; i++) {
      stiData[i] *= (1 - decayRate);
    }
    
    // Decay urgency (urgency can change quickly)
    const urgencyData = state.urgency.data as Float32Array;
    for (let i = 0; i < urgencyData.length; i++) {
      urgencyData[i] *= (1 - decayRate * 0.5);
    }
    
    // LTI decays very slowly
    const ltiData = state.longTermImportance.data as Float32Array;
    for (let i = 0; i < ltiData.length; i++) {
      ltiData[i] *= (1 - decayRate * 0.1);
    }
  }

  /**
   * Simulates economic market dynamics for attention allocation
   */
  marketDynamics(supplyDemand: { supply: number[]; demand: number[] }): Tensor {
    if (!this.attentionState) {
      throw new Error('Attention state not initialized');
    }

    const numTasks = this.attentionState.shortTermImportance.size;
    const prices = new Float32Array(numTasks);
    
    // Calculate attention "prices" based on supply and demand
    for (let i = 0; i < numTasks; i++) {
      const supply = supplyDemand.supply[i] || 1.0;
      const demand = supplyDemand.demand[i] || 1.0;
      
      // Basic market price: higher demand or lower supply increases price
      prices[i] = demand / supply;
    }
    
    // Convert prices to allocation weights (inverse relationship)
    const maxPrice = Math.max(...prices);
    const weights = new Float32Array(numTasks);
    
    for (let i = 0; i < numTasks; i++) {
      // Higher price means higher importance/allocation
      weights[i] = prices[i] / maxPrice;
    }
    
    return softmax(makeTensor([numTasks], weights));
  }

  /**
   * Implements forgetting mechanism for low-attention items
   */
  implementForgetting(): void {
    if (!this.attentionState) return;
    
    const state = this.attentionState;
    const allocationData = state.currentAllocation.data as Float32Array;
    const forgettingThreshold = this.params.thresholds.forgetting;
    
    // Identify items with consistently low attention
    for (let i = 0; i < allocationData.length; i++) {
      if (allocationData[i] < forgettingThreshold) {
        // Apply forgetting by reducing all importance measures
        const stiData = state.shortTermImportance.data as Float32Array;
        const ltiData = state.longTermImportance.data as Float32Array;
        const urgencyData = state.urgency.data as Float32Array;
        
        stiData[i] *= 0.8;
        ltiData[i] *= 0.95;  // LTI decays slower
        urgencyData[i] *= 0.7;
      }
    }
  }

  /**
   * Gets attention allocation statistics
   */
  getAttentionStatistics(): {
    totalAllocation: number;
    entropy: number;
    concentration: number;
    topTasks: Array<{ index: number; allocation: number }>;
    allocationHistory: number;
    averageSTI: number;
    averageLTI: number;
    averageUrgency: number;
  } {
    if (!this.attentionState) {
      throw new Error('Attention state not initialized');
    }

    const state = this.attentionState;
    const allocationData = state.currentAllocation.data as Float32Array;
    
    // Calculate entropy (measure of attention distribution)
    let entropy = 0;
    for (let i = 0; i < allocationData.length; i++) {
      if (allocationData[i] > 0) {
        entropy -= allocationData[i] * Math.log2(allocationData[i]);
      }
    }
    
    // Calculate concentration (opposite of entropy, normalized)
    const maxEntropy = Math.log2(allocationData.length);
    const concentration = 1 - (entropy / maxEntropy);
    
    // Get top allocated tasks
    const topTasks = Array.from(allocationData)
      .map((allocation, index) => ({ index, allocation }))
      .sort((a, b) => b.allocation - a.allocation)
      .slice(0, 5);
    
    // Calculate averages
    const stiData = state.shortTermImportance.data as Float32Array;
    const ltiData = state.longTermImportance.data as Float32Array;
    const urgencyData = state.urgency.data as Float32Array;
    
    const averageSTI = Array.from(stiData).reduce((sum, val) => sum + val, 0) / stiData.length;
    const averageLTI = Array.from(ltiData).reduce((sum, val) => sum + val, 0) / ltiData.length;
    const averageUrgency = Array.from(urgencyData).reduce((sum, val) => sum + val, 0) / urgencyData.length;
    
    return {
      totalAllocation: Array.from(allocationData).reduce((sum, val) => sum + val, 0),
      entropy,
      concentration,
      topTasks,
      allocationHistory: this.allocationHistory.length,
      averageSTI,
      averageLTI,
      averageUrgency
    };
  }

  /**
   * Exports attention state for persistence
   */
  exportState(): any {
    if (!this.attentionState) return null;
    
    const state = this.attentionState;
    
    return {
      shortTermImportance: {
        shape: state.shortTermImportance.shape,
        data: Array.from(state.shortTermImportance.data)
      },
      longTermImportance: {
        shape: state.longTermImportance.shape,
        data: Array.from(state.longTermImportance.data)
      },
      urgency: {
        shape: state.urgency.shape,
        data: Array.from(state.urgency.data)
      },
      currentAllocation: {
        shape: state.currentAllocation.shape,
        data: Array.from(state.currentAllocation.data)
      },
      resourceBudget: state.resourceBudget,
      performanceMetrics: Array.from(this.performanceMetrics.entries()),
      allocationHistory: this.allocationHistory.map(tensor => ({
        shape: tensor.shape,
        data: Array.from(tensor.data)
      }))
    };
  }

  /**
   * Imports attention state from persistence
   */
  importState(data: any): void {
    this.attentionState = {
      shortTermImportance: makeTensor(data.shortTermImportance.shape, new Float32Array(data.shortTermImportance.data)),
      longTermImportance: makeTensor(data.longTermImportance.shape, new Float32Array(data.longTermImportance.data)),
      urgency: makeTensor(data.urgency.shape, new Float32Array(data.urgency.data)),
      currentAllocation: makeTensor(data.currentAllocation.shape, new Float32Array(data.currentAllocation.data)),
      resourceBudget: data.resourceBudget
    };
    
    this.performanceMetrics = new Map(data.performanceMetrics);
    
    this.allocationHistory = data.allocationHistory.map((tensorData: any) =>
      makeTensor(tensorData.shape, new Float32Array(tensorData.data))
    );
  }
}