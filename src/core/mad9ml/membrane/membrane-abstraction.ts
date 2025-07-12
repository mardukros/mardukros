/**
 * Membrane Abstraction for Kernel State Encapsulation
 * 
 * Implements P-System inspired membranes that encapsulate kernel state tensors
 * with controlled boundaries for message passing and agentic autonomy.
 */

import { TensorShape } from '../types.js';

/**
 * Membrane boundary control policies
 */
export type BoundaryPolicy = 'open' | 'selective' | 'closed' | 'semi-permeable';

/**
 * Membrane state access levels
 */
export type AccessLevel = 'public' | 'protected' | 'private' | 'restricted';

/**
 * Membrane state tensor wrapper
 */
export interface MembraneState {
  /** Kernel state tensor data */
  tensorData: Float32Array;
  /** Tensor shape definition */
  shape: TensorShape;
  /** State version for change tracking */
  version: number;
  /** Timestamp of last state change */
  lastModified: number;
  /** State checksum for integrity */
  checksum: string;
  /** Access level for this state */
  accessLevel: AccessLevel;
  /** Metadata about the state */
  metadata: {
    kernelId: string;
    stateType: string;
    size: number;
    readOnly: boolean;
    persistent: boolean;
  };
}

/**
 * Membrane boundary configuration
 */
export interface MembraneBoundary {
  /** Boundary identifier */
  id: string;
  /** Boundary policy */
  policy: BoundaryPolicy;
  /** Allowed message types through this boundary */
  allowedMessageTypes: string[];
  /** Blocked message types */
  blockedMessageTypes: string[];
  /** Rate limiting configuration */
  rateLimit: {
    maxMessagesPerSecond: number;
    burstLimit: number;
    windowSizeMs: number;
  };
  /** Access control rules */
  accessRules: {
    readRules: string[];
    writeRules: string[];
    executeRules: string[];
  };
  /** Boundary permeability settings */
  permeability: {
    inbound: number; // 0.0 (closed) to 1.0 (open)
    outbound: number;
    bidirectional: number;
  };
}

/**
 * Membrane introspection capabilities
 */
export interface MembraneIntrospection {
  /** Current membrane state summary */
  getStateReport(): MembraneStateReport;
  /** Connection mapping */
  getConnectionMap(): MembraneConnectionMap;
  /** Boundary condition status */
  getBoundaryStatus(): MembraneBoundaryStatus;
  /** Performance metrics */
  getPerformanceMetrics(): MembranePerformanceMetrics;
  /** Health status */
  getHealthStatus(): MembraneHealthStatus;
}

/**
 * Core Membrane class implementing P-System membrane abstraction
 */
export class Membrane implements MembraneIntrospection {
  private id: string;
  private name: string;
  private state: MembraneState;
  private boundary: MembraneBoundary;
  private parentMembrane: Membrane | null = null;
  private childMembranes: Map<string, Membrane> = new Map();
  private messageHistory: MembraneMessage[] = [];
  private creationTime: number;
  private lastActivity: number;
  private isActive: boolean = true;

  constructor(
    id: string,
    name: string,
    kernelState: {
      tensorData: Float32Array;
      shape: TensorShape;
      kernelId: string;
      stateType: string;
    },
    boundaryConfig?: Partial<MembraneBoundary>
  ) {
    this.id = id;
    this.name = name;
    this.creationTime = Date.now();
    this.lastActivity = Date.now();

    // Initialize membrane state
    this.state = {
      tensorData: new Float32Array(kernelState.tensorData),
      shape: [...kernelState.shape],
      version: 1,
      lastModified: Date.now(),
      checksum: this.calculateChecksum(kernelState.tensorData),
      accessLevel: 'protected',
      metadata: {
        kernelId: kernelState.kernelId,
        stateType: kernelState.stateType,
        size: kernelState.tensorData.length,
        readOnly: false,
        persistent: true
      }
    };

    // Initialize boundary
    this.boundary = {
      id: `${id}_boundary`,
      policy: 'selective',
      allowedMessageTypes: ['tensor_update', 'state_query', 'meta_query'],
      blockedMessageTypes: ['malicious', 'unauthorized'],
      rateLimit: {
        maxMessagesPerSecond: 100,
        burstLimit: 200,
        windowSizeMs: 1000
      },
      accessRules: {
        readRules: ['self', 'parent', 'authorized_children'],
        writeRules: ['self', 'authorized_parent'],
        executeRules: ['self']
      },
      permeability: {
        inbound: 0.7,
        outbound: 0.8,
        bidirectional: 0.6
      },
      ...boundaryConfig
    };
  }

  /**
   * Get membrane identifier
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get membrane name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get current state tensor (controlled access)
   */
  getState(accessContext?: string): MembraneState | null {
    if (!this.checkAccess('read', accessContext)) {
      console.warn(`Access denied to membrane ${this.id} state`);
      return null;
    }

    return {
      ...this.state,
      tensorData: new Float32Array(this.state.tensorData) // Return copy
    };
  }

  /**
   * Update membrane state (controlled access)
   */
  updateState(
    newTensorData: Float32Array,
    accessContext?: string
  ): boolean {
    if (!this.checkAccess('write', accessContext)) {
      console.warn(`Write access denied to membrane ${this.id}`);
      return false;
    }

    if (this.state.metadata.readOnly) {
      console.warn(`Membrane ${this.id} state is read-only`);
      return false;
    }

    // Validate tensor data shape
    if (newTensorData.length !== this.state.tensorData.length) {
      console.error(`Invalid tensor data size for membrane ${this.id}`);
      return false;
    }

    // Update state
    this.state.tensorData.set(newTensorData);
    this.state.version++;
    this.state.lastModified = Date.now();
    this.state.checksum = this.calculateChecksum(newTensorData);
    this.lastActivity = Date.now();

    // Notify child membranes of state change
    this.notifyChildrenOfStateChange();

    return true;
  }

  /**
   * Add child membrane (nested P-System structure)
   */
  addChildMembrane(childMembrane: Membrane): boolean {
    if (this.childMembranes.has(childMembrane.getId())) {
      console.warn(`Child membrane ${childMembrane.getId()} already exists`);
      return false;
    }

    childMembrane.parentMembrane = this;
    this.childMembranes.set(childMembrane.getId(), childMembrane);
    this.lastActivity = Date.now();

    console.log(`Added child membrane ${childMembrane.getId()} to ${this.id}`);
    return true;
  }

  /**
   * Remove child membrane
   */
  removeChildMembrane(childId: string): boolean {
    const child = this.childMembranes.get(childId);
    if (!child) {
      return false;
    }

    child.parentMembrane = null;
    this.childMembranes.delete(childId);
    this.lastActivity = Date.now();

    console.log(`Removed child membrane ${childId} from ${this.id}`);
    return true;
  }

  /**
   * Get parent membrane
   */
  getParent(): Membrane | null {
    return this.parentMembrane;
  }

  /**
   * Get child membranes
   */
  getChildren(): Membrane[] {
    return Array.from(this.childMembranes.values());
  }

  /**
   * Get membrane depth in hierarchy
   */
  getDepth(): number {
    let depth = 0;
    let current = this.parentMembrane;
    while (current) {
      depth++;
      current = current.parentMembrane;
    }
    return depth;
  }

  /**
   * Check if membrane is root (no parent)
   */
  isRoot(): boolean {
    return this.parentMembrane === null;
  }

  /**
   * Check if membrane is leaf (no children)
   */
  isLeaf(): boolean {
    return this.childMembranes.size === 0;
  }

  /**
   * Get boundary configuration
   */
  getBoundary(): MembraneBoundary {
    return { ...this.boundary };
  }

  /**
   * Update boundary configuration
   */
  updateBoundary(
    boundaryUpdate: Partial<MembraneBoundary>,
    accessContext?: string
  ): boolean {
    if (!this.checkAccess('execute', accessContext)) {
      console.warn(`Execute access denied for boundary update on ${this.id}`);
      return false;
    }

    this.boundary = { ...this.boundary, ...boundaryUpdate };
    this.lastActivity = Date.now();
    return true;
  }

  /**
   * Deactivate membrane
   */
  deactivate(): void {
    this.isActive = false;
    this.lastActivity = Date.now();
    
    // Deactivate all children
    for (const child of this.childMembranes.values()) {
      child.deactivate();
    }
  }

  /**
   * Reactivate membrane
   */
  reactivate(): void {
    this.isActive = true;
    this.lastActivity = Date.now();
  }

  /**
   * Check if membrane is active
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Calculate checksum for tensor data integrity
   */
  private calculateChecksum(data: Float32Array): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = Math.floor(data[i] * 1000) % 256;
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Check access permissions
   */
  private checkAccess(operation: 'read' | 'write' | 'execute', context?: string): boolean {
    if (!context) context = 'anonymous';
    
    const rules = this.boundary.accessRules;
    let allowedContexts: string[] = [];

    switch (operation) {
      case 'read':
        allowedContexts = rules.readRules;
        break;
      case 'write':
        allowedContexts = rules.writeRules;
        break;
      case 'execute':
        allowedContexts = rules.executeRules;
        break;
    }

    return allowedContexts.includes(context) || allowedContexts.includes('*');
  }

  /**
   * Notify child membranes of state change
   */
  private notifyChildrenOfStateChange(): void {
    for (const child of this.childMembranes.values()) {
      // Child membranes could react to parent state changes
      // Implementation depends on specific requirements
    }
  }

  // Implementation of MembraneIntrospection interface

  /**
   * Get comprehensive state report
   */
  getStateReport(): MembraneStateReport {
    return {
      membraneId: this.id,
      name: this.name,
      isActive: this.isActive,
      stateVersion: this.state.version,
      stateSize: this.state.metadata.size,
      tensorShape: [...this.state.shape],
      accessLevel: this.state.accessLevel,
      lastModified: this.state.lastModified,
      checksum: this.state.checksum,
      hierarchyInfo: {
        depth: this.getDepth(),
        isRoot: this.isRoot(),
        isLeaf: this.isLeaf(),
        parentId: this.parentMembrane?.getId() || null,
        childCount: this.childMembranes.size,
        childIds: Array.from(this.childMembranes.keys())
      },
      creationTime: this.creationTime,
      lastActivity: this.lastActivity
    };
  }

  /**
   * Get connection mapping
   */
  getConnectionMap(): MembraneConnectionMap {
    const connections: MembraneConnection[] = [];

    // Parent connection
    if (this.parentMembrane) {
      connections.push({
        type: 'parent',
        targetId: this.parentMembrane.getId(),
        targetName: this.parentMembrane.getName(),
        connectionStrength: 0.9,
        lastCommunication: this.lastActivity,
        messageCount: this.messageHistory.filter(m => 
          m.sourceId === this.parentMembrane!.getId() || 
          m.targetId === this.parentMembrane!.getId()
        ).length
      });
    }

    // Child connections
    for (const child of this.childMembranes.values()) {
      connections.push({
        type: 'child',
        targetId: child.getId(),
        targetName: child.getName(),
        connectionStrength: 0.8,
        lastCommunication: this.lastActivity,
        messageCount: this.messageHistory.filter(m => 
          m.sourceId === child.getId() || 
          m.targetId === child.getId()
        ).length
      });
    }

    return {
      membraneId: this.id,
      totalConnections: connections.length,
      connections,
      networkTopology: this.analyzeNetworkTopology()
    };
  }

  /**
   * Get boundary status
   */
  getBoundaryStatus(): MembraneBoundaryStatus {
    return {
      membraneId: this.id,
      boundaryId: this.boundary.id,
      policy: this.boundary.policy,
      permeability: this.boundary.permeability,
      messageStats: {
        allowedTypes: this.boundary.allowedMessageTypes.length,
        blockedTypes: this.boundary.blockedMessageTypes.length,
        totalMessages: this.messageHistory.length,
        recentMessages: this.messageHistory.filter(m => 
          Date.now() - m.timestamp < 60000
        ).length
      },
      rateLimit: {
        ...this.boundary.rateLimit,
        currentRate: this.calculateCurrentMessageRate()
      },
      accessControl: {
        ...this.boundary.accessRules,
        activeContexts: this.getActiveAccessContexts()
      }
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): MembranePerformanceMetrics {
    const now = Date.now();
    const uptime = now - this.creationTime;
    const activityRatio = this.lastActivity > 0 ? 
      (now - this.lastActivity) / uptime : 0;

    return {
      membraneId: this.id,
      uptime,
      activityRatio: 1 - activityRatio,
      messageProcessingStats: {
        totalProcessed: this.messageHistory.length,
        averageProcessingTime: this.calculateAverageProcessingTime(),
        throughput: this.messageHistory.length / (uptime / 1000), // messages per second
        errorRate: 0 // Could be tracked if error handling is implemented
      },
      memoryUsage: {
        tensorMemory: this.state.tensorData.byteLength,
        metadataMemory: this.estimateMetadataMemory(),
        totalMemory: this.state.tensorData.byteLength + this.estimateMetadataMemory()
      },
      stateChangeFrequency: this.calculateStateChangeFrequency()
    };
  }

  /**
   * Get health status
   */
  getHealthStatus(): MembraneHealthStatus {
    const integrity = this.verifyStateIntegrity();
    const connectivity = this.checkConnectivity();
    const performance = this.assessPerformance();

    return {
      membraneId: this.id,
      overallHealth: Math.min(integrity, connectivity, performance),
      checks: {
        stateIntegrity: integrity,
        boundaryIntegrity: this.verifyBoundaryIntegrity(),
        connectivity,
        performance,
        memoryHealth: this.checkMemoryHealth()
      },
      issues: this.identifyHealthIssues(),
      recommendations: this.generateHealthRecommendations()
    };
  }

  // Helper methods for introspection

  private analyzeNetworkTopology(): string {
    if (this.isRoot() && this.isLeaf()) return 'isolated';
    if (this.isRoot()) return 'root';
    if (this.isLeaf()) return 'leaf';
    return 'intermediate';
  }

  private calculateCurrentMessageRate(): number {
    const recentMessages = this.messageHistory.filter(m => 
      Date.now() - m.timestamp < this.boundary.rateLimit.windowSizeMs
    );
    return recentMessages.length / (this.boundary.rateLimit.windowSizeMs / 1000);
  }

  private getActiveAccessContexts(): string[] {
    // This would track currently active access contexts
    return ['self']; // Simplified implementation
  }

  private calculateAverageProcessingTime(): number {
    if (this.messageHistory.length === 0) return 0;
    const totalTime = this.messageHistory.reduce((sum, msg) => 
      sum + (msg.processingTime || 0), 0
    );
    return totalTime / this.messageHistory.length;
  }

  private estimateMetadataMemory(): number {
    // Rough estimation of metadata memory usage
    return 1024 + (this.messageHistory.length * 256);
  }

  private calculateStateChangeFrequency(): number {
    // Simplified implementation - would need more sophisticated tracking
    return this.state.version / ((Date.now() - this.creationTime) / 1000);
  }

  private verifyStateIntegrity(): number {
    const currentChecksum = this.calculateChecksum(this.state.tensorData);
    return currentChecksum === this.state.checksum ? 1.0 : 0.0;
  }

  private verifyBoundaryIntegrity(): number {
    // Check if boundary configuration is valid
    const hasValidPolicy = ['open', 'selective', 'closed', 'semi-permeable']
      .includes(this.boundary.policy);
    const hasValidPermeability = 
      this.boundary.permeability.inbound >= 0 && 
      this.boundary.permeability.inbound <= 1;
    
    return (hasValidPolicy && hasValidPermeability) ? 1.0 : 0.0;
  }

  private checkConnectivity(): number {
    // Simplified connectivity check
    if (this.isRoot() && this.childMembranes.size > 0) return 1.0;
    if (!this.isRoot() && this.parentMembrane) return 1.0;
    if (this.isLeaf() && this.parentMembrane) return 1.0;
    return 0.5; // Partially connected or isolated
  }

  private assessPerformance(): number {
    const metrics = this.getPerformanceMetrics();
    if (metrics.messageProcessingStats.errorRate > 0.1) return 0.3;
    if (metrics.activityRatio < 0.1) return 0.5;
    return 1.0;
  }

  private checkMemoryHealth(): number {
    const maxTensorSize = 1024 * 1024 * 100; // 100MB limit
    const usage = this.state.tensorData.byteLength / maxTensorSize;
    return Math.max(0, 1 - usage);
  }

  private identifyHealthIssues(): string[] {
    const issues: string[] = [];
    
    if (this.verifyStateIntegrity() < 1.0) {
      issues.push('State integrity compromised');
    }
    
    if (this.checkConnectivity() < 1.0) {
      issues.push('Connectivity issues detected');
    }
    
    if (this.checkMemoryHealth() < 0.5) {
      issues.push('High memory usage');
    }
    
    return issues;
  }

  private generateHealthRecommendations(): string[] {
    const recommendations: string[] = [];
    const issues = this.identifyHealthIssues();
    
    if (issues.includes('State integrity compromised')) {
      recommendations.push('Verify tensor data and recalculate checksum');
    }
    
    if (issues.includes('Connectivity issues detected')) {
      recommendations.push('Check parent-child relationships and network topology');
    }
    
    if (issues.includes('High memory usage')) {
      recommendations.push('Consider tensor compression or state cleanup');
    }
    
    return recommendations;
  }
}

// Supporting interfaces for membrane introspection

export interface MembraneMessage {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  timestamp: number;
  processingTime?: number;
  payload?: any;
}

export interface MembraneStateReport {
  membraneId: string;
  name: string;
  isActive: boolean;
  stateVersion: number;
  stateSize: number;
  tensorShape: TensorShape;
  accessLevel: AccessLevel;
  lastModified: number;
  checksum: string;
  hierarchyInfo: {
    depth: number;
    isRoot: boolean;
    isLeaf: boolean;
    parentId: string | null;
    childCount: number;
    childIds: string[];
  };
  creationTime: number;
  lastActivity: number;
}

export interface MembraneConnection {
  type: 'parent' | 'child' | 'sibling' | 'peer';
  targetId: string;
  targetName: string;
  connectionStrength: number;
  lastCommunication: number;
  messageCount: number;
}

export interface MembraneConnectionMap {
  membraneId: string;
  totalConnections: number;
  connections: MembraneConnection[];
  networkTopology: string;
}

export interface MembraneBoundaryStatus {
  membraneId: string;
  boundaryId: string;
  policy: BoundaryPolicy;
  permeability: {
    inbound: number;
    outbound: number;
    bidirectional: number;
  };
  messageStats: {
    allowedTypes: number;
    blockedTypes: number;
    totalMessages: number;
    recentMessages: number;
  };
  rateLimit: {
    maxMessagesPerSecond: number;
    burstLimit: number;
    windowSizeMs: number;
    currentRate: number;
  };
  accessControl: {
    readRules: string[];
    writeRules: string[];
    executeRules: string[];
    activeContexts: string[];
  };
}

export interface MembranePerformanceMetrics {
  membraneId: string;
  uptime: number;
  activityRatio: number;
  messageProcessingStats: {
    totalProcessed: number;
    averageProcessingTime: number;
    throughput: number;
    errorRate: number;
  };
  memoryUsage: {
    tensorMemory: number;
    metadataMemory: number;
    totalMemory: number;
  };
  stateChangeFrequency: number;
}

export interface MembraneHealthStatus {
  membraneId: string;
  overallHealth: number;
  checks: {
    stateIntegrity: number;
    boundaryIntegrity: number;
    connectivity: number;
    performance: number;
    memoryHealth: number;
  };
  issues: string[];
  recommendations: string[];
}