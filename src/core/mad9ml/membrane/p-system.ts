/**
 * P-System Implementation for Nested Membrane Structures
 * 
 * Implements hierarchical P-System structures enabling recursive membrane
 * nesting with multi-level encapsulation and distributed computation.
 */

import { Membrane, MembraneState, MembraneBoundary } from './membrane-abstraction.js';
import { PortChannel, PortChannelFactory, PortMessage } from './port-channel.js';
import { TensorShape } from '../types.js';

/**
 * P-System configuration
 */
export interface PSystemConfig {
  id: string;
  name: string;
  maxDepth: number;
  maxMembranes: number;
  distributionStrategy: 'breadth-first' | 'depth-first' | 'balanced' | 'load-aware';
  replicationFactor: number;
  enableFailover: boolean;
  enableLoadBalancing: boolean;
  membraneCreationPolicy: 'eager' | 'lazy' | 'on-demand';
}

/**
 * P-System evolution rule
 */
export interface PSystemRule {
  id: string;
  name: string;
  type: 'creation' | 'dissolution' | 'transformation' | 'communication' | 'replication';
  conditions: PSystemCondition[];
  actions: PSystemAction[];
  priority: number;
  enabled: boolean;
  executionCount: number;
  maxExecutions?: number;
}

/**
 * P-System condition
 */
export interface PSystemCondition {
  type: 'membrane_count' | 'depth' | 'load' | 'connectivity' | 'time' | 'resource';
  operator: 'eq' | 'ne' | 'lt' | 'le' | 'gt' | 'ge' | 'in' | 'contains';
  value: any;
  membraneSelector?: string;
}

/**
 * P-System action
 */
export interface PSystemAction {
  type: 'create_membrane' | 'dissolve_membrane' | 'replicate_membrane' | 'migrate_state' | 'establish_connection';
  parameters: Record<string, any>;
  targetSelector?: string;
}

/**
 * P-System statistics
 */
export interface PSystemStatistics {
  systemId: string;
  totalMembranes: number;
  maxDepthReached: number;
  averageDepth: number;
  totalConnections: number;
  rulesExecuted: number;
  evolutionCycles: number;
  membraneCreations: number;
  membraneDissolutions: number;
  loadBalanceOperations: number;
  uptime: number;
  computationalComplexity: string;
}

/**
 * P-System topology analysis
 */
export interface PSystemTopology {
  systemId: string;
  rootMembranes: string[];
  leafMembranes: string[];
  maxDepth: number;
  averageBranchingFactor: number;
  clusteringCoefficient: number;
  networkDiameter: number;
  centralityMeasures: Map<string, number>;
  communityStructure: MembraneCluster[];
}

/**
 * Membrane cluster in P-System
 */
export interface MembraneCluster {
  id: string;
  membranes: string[];
  centralMembrane: string;
  cohesion: number;
  isolation: number;
  communicationDensity: number;
}

/**
 * P-System implementation with recursive membrane nesting
 */
export class PSystem {
  private config: PSystemConfig;
  private membranes: Map<string, Membrane> = new Map();
  private ports: Map<string, PortChannel> = new Map();
  private rules: Map<string, PSystemRule> = new Map();
  private connections: Map<string, string[]> = new Map(); // membrane -> connected membranes
  private statistics: PSystemStatistics;
  private evolutionHistory: PSystemEvolutionEvent[] = [];
  private creationTime: number;
  private lastEvolution: number;
  private isActive: boolean = true;

  constructor(config: PSystemConfig) {
    this.config = { ...config };
    this.creationTime = Date.now();
    this.lastEvolution = Date.now();

    // Initialize statistics
    this.statistics = {
      systemId: config.id,
      totalMembranes: 0,
      maxDepthReached: 0,
      averageDepth: 0,
      totalConnections: 0,
      rulesExecuted: 0,
      evolutionCycles: 0,
      membraneCreations: 0,
      membraneDissolutions: 0,
      loadBalanceOperations: 0,
      uptime: 0,
      computationalComplexity: 'O(1)'
    };

    // Initialize default rules
    this.initializeDefaultRules();
  }

  /**
   * Add root membrane to P-System
   */
  addRootMembrane(membrane: Membrane): boolean {
    if (!membrane.isRoot()) {
      console.warn('Only root membranes can be added as root membranes');
      return false;
    }

    if (this.membranes.has(membrane.getId())) {
      console.warn(`Membrane ${membrane.getId()} already exists in P-System`);
      return false;
    }

    this.membranes.set(membrane.getId(), membrane);
    this.connections.set(membrane.getId(), []);
    this.statistics.totalMembranes++;
    this.statistics.membraneCreations++;

    // Create default ports for the membrane
    this.createDefaultPorts(membrane);

    console.log(`Added root membrane ${membrane.getId()} to P-System ${this.config.id}`);
    return true;
  }

  /**
   * Create child membrane within parent
   */
  createChildMembrane(
    parentId: string,
    kernelState: {
      tensorData: Float32Array;
      shape: TensorShape;
      kernelId: string;
      stateType: string;
    },
    name?: string,
    boundaryConfig?: Partial<MembraneBoundary>
  ): string | null {
    const parent = this.membranes.get(parentId);
    if (!parent) {
      console.error(`Parent membrane ${parentId} not found`);
      return null;
    }

    // Check depth limit
    if (parent.getDepth() + 1 >= this.config.maxDepth) {
      console.warn(`Maximum depth ${this.config.maxDepth} reached`);
      return null;
    }

    // Check membrane count limit
    if (this.membranes.size >= this.config.maxMembranes) {
      console.warn(`Maximum membranes ${this.config.maxMembranes} reached`);
      return null;
    }

    // Generate child membrane ID
    const childId = `${parentId}_child_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const childName = name || `Child of ${parent.getName()}`;

    // Create child membrane
    const childMembrane = new Membrane(childId, childName, kernelState, boundaryConfig);

    // Add child to parent
    if (!parent.addChildMembrane(childMembrane)) {
      console.error(`Failed to add child membrane to parent ${parentId}`);
      return null;
    }

    // Add to P-System
    this.membranes.set(childId, childMembrane);
    this.connections.set(childId, [parentId]);
    
    // Update parent connections
    const parentConnections = this.connections.get(parentId) || [];
    parentConnections.push(childId);
    this.connections.set(parentId, parentConnections);

    // Update statistics
    this.statistics.totalMembranes++;
    this.statistics.membraneCreations++;
    this.statistics.maxDepthReached = Math.max(
      this.statistics.maxDepthReached,
      childMembrane.getDepth()
    );
    this.statistics.totalConnections++;

    // Create default ports
    this.createDefaultPorts(childMembrane);

    // Log evolution event
    this.logEvolutionEvent({
      type: 'membrane_creation',
      timestamp: Date.now(),
      details: {
        parentId,
        childId,
        depth: childMembrane.getDepth()
      }
    });

    console.log(`Created child membrane ${childId} under parent ${parentId}`);
    return childId;
  }

  /**
   * Dissolve membrane and handle children
   */
  dissolveMembrane(membraneId: string, redistributeChildren: boolean = true): boolean {
    const membrane = this.membranes.get(membraneId);
    if (!membrane) {
      console.error(`Membrane ${membraneId} not found`);
      return false;
    }

    // Don't dissolve if it has children and redistribution is disabled
    if (!redistributeChildren && membrane.getChildren().length > 0) {
      console.warn(`Membrane ${membraneId} has children and redistribution is disabled`);
      return false;
    }

    // Handle children
    if (redistributeChildren) {
      this.redistributeChildren(membrane);
    } else {
      // Recursively dissolve children
      for (const child of membrane.getChildren()) {
        this.dissolveMembrane(child.getId(), false);
      }
    }

    // Remove from parent
    const parent = membrane.getParent();
    if (parent) {
      parent.removeChildMembrane(membraneId);
      
      // Update parent connections
      const parentConnections = this.connections.get(parent.getId()) || [];
      const filteredConnections = parentConnections.filter(id => id !== membraneId);
      this.connections.set(parent.getId(), filteredConnections);
    }

    // Deactivate membrane
    membrane.deactivate();

    // Remove from P-System
    this.membranes.delete(membraneId);
    this.connections.delete(membraneId);

    // Remove associated ports
    this.removeMembranesPorts(membraneId);

    // Update statistics
    this.statistics.totalMembranes--;
    this.statistics.membraneDissolutions++;
    if (parent) {
      this.statistics.totalConnections--;
    }

    // Log evolution event
    this.logEvolutionEvent({
      type: 'membrane_dissolution',
      timestamp: Date.now(),
      details: {
        membraneId,
        parentId: parent?.getId() || null,
        childrenRedistributed: redistributeChildren
      }
    });

    console.log(`Dissolved membrane ${membraneId}`);
    return true;
  }

  /**
   * Replicate membrane structure
   */
  replicateMembrane(
    sourceId: string,
    targetParentId: string,
    replicateChildren: boolean = true
  ): string | null {
    const sourceMembrane = this.membranes.get(sourceId);
    if (!sourceMembrane) {
      console.error(`Source membrane ${sourceId} not found`);
      return null;
    }

    const targetParent = this.membranes.get(targetParentId);
    if (!targetParent) {
      console.error(`Target parent membrane ${targetParentId} not found`);
      return null;
    }

    // Get source state
    const sourceState = sourceMembrane.getState('self');
    if (!sourceState) {
      console.error(`Cannot access source membrane ${sourceId} state`);
      return null;
    }

    // Create replica
    const replicaId = this.createChildMembrane(
      targetParentId,
      {
        tensorData: sourceState.tensorData,
        shape: sourceState.shape,
        kernelId: `replica_${sourceState.metadata.kernelId}`,
        stateType: sourceState.metadata.stateType
      },
      `Replica of ${sourceMembrane.getName()}`,
      sourceMembrane.getBoundary()
    );

    if (!replicaId) {
      console.error(`Failed to create replica of membrane ${sourceId}`);
      return null;
    }

    // Replicate children if requested
    if (replicateChildren) {
      for (const child of sourceMembrane.getChildren()) {
        this.replicateMembrane(child.getId(), replicaId, true);
      }
    }

    // Log evolution event
    this.logEvolutionEvent({
      type: 'membrane_replication',
      timestamp: Date.now(),
      details: {
        sourceId,
        replicaId,
        targetParentId,
        childrenReplicated: replicateChildren
      }
    });

    console.log(`Replicated membrane ${sourceId} as ${replicaId} under ${targetParentId}`);
    return replicaId;
  }

  /**
   * Execute P-System evolution cycle
   */
  async executeEvolutionCycle(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    const startTime = Date.now();

    // Sort rules by priority
    const sortedRules = Array.from(this.rules.values())
      .filter(rule => rule.enabled)
      .sort((a, b) => a.priority - b.priority);

    let rulesExecuted = 0;

    for (const rule of sortedRules) {
      // Check if rule has reached max executions
      if (rule.maxExecutions && rule.executionCount >= rule.maxExecutions) {
        continue;
      }

      // Evaluate conditions
      if (await this.evaluateRuleConditions(rule)) {
        // Execute actions
        const success = await this.executeRuleActions(rule);
        if (success) {
          rule.executionCount++;
          rulesExecuted++;
        }
      }
    }

    // Update statistics
    this.statistics.rulesExecuted += rulesExecuted;
    this.statistics.evolutionCycles++;
    this.lastEvolution = Date.now();

    // Calculate computational complexity
    this.updateComputationalComplexity();

    console.log(`Evolution cycle completed: ${rulesExecuted} rules executed in ${Date.now() - startTime}ms`);
  }

  /**
   * Get P-System topology analysis
   */
  analyzeTopology(): PSystemTopology {
    const rootMembranes: string[] = [];
    const leafMembranes: string[] = [];
    const depths: number[] = [];
    let maxDepth = 0;
    let totalBranches = 0;
    let branchingNodes = 0;

    for (const membrane of this.membranes.values()) {
      const depth = membrane.getDepth();
      depths.push(depth);
      maxDepth = Math.max(maxDepth, depth);

      if (membrane.isRoot()) {
        rootMembranes.push(membrane.getId());
      }

      if (membrane.isLeaf()) {
        leafMembranes.push(membrane.getId());
      }

      const childCount = membrane.getChildren().length;
      if (childCount > 0) {
        totalBranches += childCount;
        branchingNodes++;
      }
    }

    const averageBranchingFactor = branchingNodes > 0 ? totalBranches / branchingNodes : 0;
    const centralityMeasures = this.calculateCentralityMeasures();
    const communityStructure = this.detectCommunityStructure();

    return {
      systemId: this.config.id,
      rootMembranes,
      leafMembranes,
      maxDepth,
      averageBranchingFactor,
      clusteringCoefficient: this.calculateClusteringCoefficient(),
      networkDiameter: this.calculateNetworkDiameter(),
      centralityMeasures,
      communityStructure
    };
  }

  /**
   * Get membrane by ID
   */
  getMembrane(id: string): Membrane | undefined {
    return this.membranes.get(id);
  }

  /**
   * Get all membranes
   */
  getAllMembranes(): Membrane[] {
    return Array.from(this.membranes.values());
  }

  /**
   * Get membranes at specific depth
   */
  getMembranesAtDepth(depth: number): Membrane[] {
    return Array.from(this.membranes.values()).filter(m => m.getDepth() === depth);
  }

  /**
   * Get P-System statistics
   */
  getStatistics(): PSystemStatistics {
    // Update dynamic statistics
    this.statistics.uptime = Date.now() - this.creationTime;
    this.statistics.averageDepth = this.calculateAverageDepth();
    this.statistics.totalConnections = this.countTotalConnections();

    return { ...this.statistics };
  }

  /**
   * Get evolution history
   */
  getEvolutionHistory(): PSystemEvolutionEvent[] {
    return [...this.evolutionHistory];
  }

  /**
   * Add custom rule
   */
  addRule(rule: PSystemRule): void {
    this.rules.set(rule.id, { ...rule });
    console.log(`Added P-System rule: ${rule.name}`);
  }

  /**
   * Remove rule
   */
  removeRule(ruleId: string): boolean {
    const removed = this.rules.delete(ruleId);
    if (removed) {
      console.log(`Removed P-System rule: ${ruleId}`);
    }
    return removed;
  }

  /**
   * Start P-System
   */
  start(): void {
    this.isActive = true;
    console.log(`P-System ${this.config.id} started`);
  }

  /**
   * Stop P-System
   */
  stop(): void {
    this.isActive = false;
    
    // Deactivate all membranes
    for (const membrane of this.membranes.values()) {
      membrane.deactivate();
    }

    console.log(`P-System ${this.config.id} stopped`);
  }

  // Private methods

  private initializeDefaultRules(): void {
    // Load balancing rule
    const loadBalanceRule: PSystemRule = {
      id: 'load_balance',
      name: 'Load Balance Rule',
      type: 'transformation',
      conditions: [
        {
          type: 'load',
          operator: 'gt',
          value: 0.8,
          membraneSelector: 'any'
        }
      ],
      actions: [
        {
          type: 'create_membrane',
          parameters: { balanceLoad: true }
        }
      ],
      priority: 1,
      enabled: this.config.enableLoadBalancing,
      executionCount: 0
    };

    // Failover rule
    const failoverRule: PSystemRule = {
      id: 'failover',
      name: 'Failover Rule',
      type: 'replication',
      conditions: [
        {
          type: 'connectivity',
          operator: 'lt',
          value: 0.5
        }
      ],
      actions: [
        {
          type: 'replicate_membrane',
          parameters: { maintainRedundancy: true }
        }
      ],
      priority: 2,
      enabled: this.config.enableFailover,
      executionCount: 0
    };

    this.rules.set(loadBalanceRule.id, loadBalanceRule);
    this.rules.set(failoverRule.id, failoverRule);
  }

  private createDefaultPorts(membrane: Membrane): void {
    const membraneId = membrane.getId();

    // Create tensor input port
    const tensorInput = PortChannelFactory.createTensorInputPort(
      membraneId,
      'Tensor Input',
      [8, 8] // Default tensor shape
    );
    tensorInput.attachToMembrane(membrane);
    this.ports.set(tensorInput.getId(), tensorInput);

    // Create tensor output port
    const tensorOutput = PortChannelFactory.createTensorOutputPort(
      membraneId,
      'Tensor Output',
      [8, 8] // Default tensor shape
    );
    tensorOutput.attachToMembrane(membrane);
    this.ports.set(tensorOutput.getId(), tensorOutput);

    // Create control port
    const controlPort = PortChannelFactory.createControlPort(
      membraneId,
      'Control Port'
    );
    controlPort.attachToMembrane(membrane);
    this.ports.set(controlPort.getId(), controlPort);
  }

  private removeMembranesPorts(membraneId: string): void {
    const portsToRemove: string[] = [];
    
    for (const [portId, port] of this.ports) {
      if (port.getMembraneId() === membraneId) {
        port.detachFromMembrane();
        portsToRemove.push(portId);
      }
    }

    for (const portId of portsToRemove) {
      this.ports.delete(portId);
    }
  }

  private redistributeChildren(membrane: Membrane): void {
    const children = membrane.getChildren();
    const parent = membrane.getParent();

    if (!parent || children.length === 0) {
      return;
    }

    // Reassign children to parent
    for (const child of children) {
      membrane.removeChildMembrane(child.getId());
      parent.addChildMembrane(child);

      // Update connections
      const childConnections = this.connections.get(child.getId()) || [];
      const updatedConnections = childConnections.map(id => 
        id === membrane.getId() ? parent.getId() : id
      );
      this.connections.set(child.getId(), updatedConnections);

      // Update parent connections
      const parentConnections = this.connections.get(parent.getId()) || [];
      if (!parentConnections.includes(child.getId())) {
        parentConnections.push(child.getId());
        this.connections.set(parent.getId(), parentConnections);
      }
    }

    console.log(`Redistributed ${children.length} children of membrane ${membrane.getId()}`);
  }

  private async evaluateRuleConditions(rule: PSystemRule): Promise<boolean> {
    for (const condition of rule.conditions) {
      if (!await this.evaluateCondition(condition)) {
        return false;
      }
    }
    return true;
  }

  private async evaluateCondition(condition: PSystemCondition): Promise<boolean> {
    let value: any;

    switch (condition.type) {
      case 'membrane_count':
        value = this.membranes.size;
        break;
      case 'depth':
        value = this.statistics.maxDepthReached;
        break;
      case 'load':
        value = await this.calculateSystemLoad();
        break;
      case 'connectivity':
        value = await this.calculateConnectivity();
        break;
      case 'time':
        value = Date.now() - this.creationTime;
        break;
      case 'resource':
        value = await this.calculateResourceUsage();
        break;
      default:
        return false;
    }

    return this.compareValues(value, condition.operator, condition.value);
  }

  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'eq': return actual === expected;
      case 'ne': return actual !== expected;
      case 'lt': return actual < expected;
      case 'le': return actual <= expected;
      case 'gt': return actual > expected;
      case 'ge': return actual >= expected;
      case 'in': return Array.isArray(expected) && expected.includes(actual);
      case 'contains': return Array.isArray(actual) && actual.includes(expected);
      default: return false;
    }
  }

  private async executeRuleActions(rule: PSystemRule): Promise<boolean> {
    let success = true;

    for (const action of rule.actions) {
      const actionSuccess = await this.executeAction(action);
      if (!actionSuccess) {
        success = false;
      }
    }

    return success;
  }

  private async executeAction(action: PSystemAction): Promise<boolean> {
    try {
      switch (action.type) {
        case 'create_membrane':
          return await this.executeCreateMembraneAction(action);
        case 'dissolve_membrane':
          return await this.executeDissolveMembraneAction(action);
        case 'replicate_membrane':
          return await this.executeReplicateMembraneAction(action);
        case 'migrate_state':
          return await this.executeMigrateStateAction(action);
        case 'establish_connection':
          return await this.executeEstablishConnectionAction(action);
        default:
          console.warn(`Unknown action type: ${action.type}`);
          return false;
      }
    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error);
      return false;
    }
  }

  private async executeCreateMembraneAction(action: PSystemAction): Promise<boolean> {
    // Implementation for creating membranes based on action parameters
    return true;
  }

  private async executeDissolveMembraneAction(action: PSystemAction): Promise<boolean> {
    // Implementation for dissolving membranes based on action parameters
    return true;
  }

  private async executeReplicateMembraneAction(action: PSystemAction): Promise<boolean> {
    // Implementation for replicating membranes based on action parameters
    return true;
  }

  private async executeMigrateStateAction(action: PSystemAction): Promise<boolean> {
    // Implementation for migrating state between membranes
    return true;
  }

  private async executeEstablishConnectionAction(action: PSystemAction): Promise<boolean> {
    // Implementation for establishing connections between membranes
    return true;
  }

  private calculateAverageDepth(): number {
    if (this.membranes.size === 0) return 0;
    
    const totalDepth = Array.from(this.membranes.values())
      .reduce((sum, membrane) => sum + membrane.getDepth(), 0);
    
    return totalDepth / this.membranes.size;
  }

  private countTotalConnections(): number {
    return Array.from(this.connections.values())
      .reduce((sum, connections) => sum + connections.length, 0);
  }

  private async calculateSystemLoad(): Promise<number> {
    // Simplified load calculation
    return Math.min(this.membranes.size / this.config.maxMembranes, 1.0);
  }

  private async calculateConnectivity(): Promise<number> {
    const totalPossibleConnections = this.membranes.size * (this.membranes.size - 1) / 2;
    const actualConnections = this.countTotalConnections();
    return totalPossibleConnections > 0 ? actualConnections / totalPossibleConnections : 0;
  }

  private async calculateResourceUsage(): Promise<number> {
    // Simplified resource usage calculation
    let totalMemory = 0;
    for (const membrane of this.membranes.values()) {
      const metrics = membrane.getPerformanceMetrics();
      totalMemory += metrics.memoryUsage.totalMemory;
    }
    return Math.min(totalMemory / (1024 * 1024 * 1024), 1.0); // Normalize to GB
  }

  private updateComputationalComplexity(): void {
    const n = this.membranes.size;
    const depth = this.statistics.maxDepthReached;
    const connections = this.statistics.totalConnections;

    // Estimate complexity based on structure
    if (depth === 0) {
      this.statistics.computationalComplexity = 'O(1)';
    } else if (connections < n) {
      this.statistics.computationalComplexity = 'O(n)';
    } else if (connections < n * Math.log(n)) {
      this.statistics.computationalComplexity = 'O(n log n)';
    } else {
      this.statistics.computationalComplexity = 'O(n²)';
    }
  }

  private calculateCentralityMeasures(): Map<string, number> {
    const centrality = new Map<string, number>();
    
    for (const [membraneId, connections] of this.connections) {
      // Simple degree centrality
      centrality.set(membraneId, connections.length);
    }
    
    return centrality;
  }

  private calculateClusteringCoefficient(): number {
    // Simplified clustering coefficient calculation
    return 0.5; // Placeholder
  }

  private calculateNetworkDiameter(): number {
    // Simplified network diameter calculation
    return this.statistics.maxDepthReached * 2; // Approximate
  }

  private detectCommunityStructure(): MembraneCluster[] {
    // Simplified community detection
    const clusters: MembraneCluster[] = [];
    
    // Group by depth as a simple clustering method
    const depthGroups = new Map<number, string[]>();
    
    for (const membrane of this.membranes.values()) {
      const depth = membrane.getDepth();
      if (!depthGroups.has(depth)) {
        depthGroups.set(depth, []);
      }
      depthGroups.get(depth)!.push(membrane.getId());
    }

    for (const [depth, membraneIds] of depthGroups) {
      if (membraneIds.length > 1) {
        clusters.push({
          id: `cluster_depth_${depth}`,
          membranes: membraneIds,
          centralMembrane: membraneIds[0], // Simplified
          cohesion: 0.7,
          isolation: 0.3,
          communicationDensity: 0.5
        });
      }
    }

    return clusters;
  }

  private logEvolutionEvent(event: PSystemEvolutionEvent): void {
    this.evolutionHistory.push(event);
    
    // Keep only recent events to prevent memory growth
    const maxHistorySize = 1000;
    if (this.evolutionHistory.length > maxHistorySize) {
      this.evolutionHistory.splice(0, this.evolutionHistory.length - maxHistorySize);
    }
  }
}

/**
 * P-System evolution event
 */
export interface PSystemEvolutionEvent {
  type: 'membrane_creation' | 'membrane_dissolution' | 'membrane_replication' | 'rule_execution' | 'load_balance' | 'failover';
  timestamp: number;
  details: Record<string, any>;
}

/**
 * P-System factory for creating standard configurations
 */
export class PSystemFactory {
  /**
   * Create a simple hierarchical P-System
   */
  static createHierarchicalPSystem(
    id: string,
    name: string,
    maxDepth: number = 10,
    maxMembranes: number = 1000
  ): PSystem {
    const config: PSystemConfig = {
      id,
      name,
      maxDepth,
      maxMembranes,
      distributionStrategy: 'balanced',
      replicationFactor: 2,
      enableFailover: true,
      enableLoadBalancing: true,
      membraneCreationPolicy: 'on-demand'
    };

    return new PSystem(config);
  }

  /**
   * Create a flat distributed P-System
   */
  static createDistributedPSystem(
    id: string,
    name: string,
    maxMembranes: number = 500
  ): PSystem {
    const config: PSystemConfig = {
      id,
      name,
      maxDepth: 3, // Keep it flat
      maxMembranes,
      distributionStrategy: 'breadth-first',
      replicationFactor: 3,
      enableFailover: true,
      enableLoadBalancing: true,
      membraneCreationPolicy: 'eager'
    };

    return new PSystem(config);
  }

  /**
   * Create a high-performance P-System
   */
  static createHighPerformancePSystem(
    id: string,
    name: string
  ): PSystem {
    const config: PSystemConfig = {
      id,
      name,
      maxDepth: 20,
      maxMembranes: 10000,
      distributionStrategy: 'load-aware',
      replicationFactor: 1, // Minimize replication for performance
      enableFailover: false,
      enableLoadBalancing: true,
      membraneCreationPolicy: 'lazy'
    };

    return new PSystem(config);
  }
}