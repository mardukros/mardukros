/**
 * ECAN Attention Module Index
 * 
 * Exports all ECAN attention allocation components for integration
 * with the MAD9ML cognitive architecture.
 */

import { ECANAttentionKernel as ECANKernel } from './ecan-attention-kernel.js';
import { ECANAttentionCoordinator as ECANCoordinator } from './ecan-attention-coordinator.js';
import { ECANAttentionMonitor as ECANMonitor } from './ecan-attention-monitor.js';
import type { DistributedTask as Task, AttentionAllocationResult as AllocationResult } from './ecan-attention-coordinator.js';

// Core ECAN components
export { 
  ECANAttentionKernel, 
  type AttentionValue, 
  type AttentionField, 
  type AttentionEconomics, 
  type AttentionMetaCognition 
} from './ecan-attention-kernel.js';

export { 
  ECANAttentionCoordinator, 
  type DistributedTask, 
  type ResourceOptimization, 
  type AttentionAllocationResult 
} from './ecan-attention-coordinator.js';

export { 
  ECANAttentionMonitor, 
  type AttentionVisualizationData, 
  type MetaCognitiveReport, 
  type AttentionPolicyConfig 
} from './ecan-attention-monitor.js';

/**
 * ECAN Attention System Factory
 * 
 * Creates and configures a complete ECAN attention allocation system
 * integrated with the MAD9ML cognitive architecture.
 */
export class ECANAttentionSystem {
  public readonly kernel: ECANKernel;
  public readonly coordinator: ECANCoordinator;
  public readonly monitor: ECANMonitor;

  constructor() {
    this.kernel = new ECANKernel();
    this.coordinator = new ECANCoordinator();
    this.monitor = new ECANMonitor();
  }

  /**
   * Initialize the complete ECAN attention system
   */
  public async initialize(): Promise<void> {
    console.log('Initializing ECAN Attention System...');
    
    // Start monitoring
    this.monitor.startMonitoring();
    
    console.log('ECAN Attention System initialized successfully');
  }

  /**
   * Shutdown the ECAN attention system
   */
  public async shutdown(): Promise<void> {
    console.log('Shutting down ECAN Attention System...');
    
    // Stop monitoring
    this.monitor.stopMonitoring();
    
    console.log('ECAN Attention System shutdown complete');
  }

  /**
   * Process distributed tasks with ECAN attention allocation
   */
  public async processDistributedTasks(
    tasks: Task[],
    goals: any[],
    context: any
  ): Promise<AllocationResult> {
    // Allocate attention
    const result = await this.coordinator.allocateAttentionForDistributedTasks(tasks, goals, context);
    
    // Generate visualization
    const kernelIds = Array.from(result.allocations.keys());
    const visualization = this.monitor.generateVisualizationData(result, kernelIds);
    
    // Generate meta-cognitive report
    const metaCognition = this.kernel.getMetaCognition();
    const economics = this.kernel.getAttentionEconomics();
    const report = this.monitor.generateMetaCognitiveReport(result, metaCognition, economics);
    
    // Check for alerts
    const alerts = this.monitor.checkAlerts(result);
    if (alerts.length > 0) {
      console.warn('ECAN Attention Alerts:', alerts);
    }
    
    return result;
  }

  /**
   * Simulate attention shifting for testing
   */
  public async simulateAttentionShifting(
    initialTasks: Task[],
    newTasks: Task[],
    goals: any[]
  ): Promise<any> {
    return await this.coordinator.simulateAttentionShifting(initialTasks, newTasks, goals);
  }

  /**
   * Verify resource optimization
   */
  public verifyResourceOptimization(
    result: AllocationResult,
    tasks: Task[]
  ): any {
    return this.coordinator.verifyResourceOptimization(result, tasks);
  }

  /**
   * Get current system state for monitoring
   */
  public getCurrentState(): any {
    return {
      ecan: this.coordinator.getCurrentECANState(),
      monitoring: this.monitor.getMonitoringHistory()
    };
  }

  /**
   * Export system data for analysis
   */
  public exportSystemData(): string {
    return this.monitor.exportMonitoringData();
  }
}

/**
 * Create and configure ECAN attention system
 */
export function createECANAttentionSystem(): ECANAttentionSystem {
  return new ECANAttentionSystem();
}

/**
 * Default export
 */
export default ECANAttentionSystem;