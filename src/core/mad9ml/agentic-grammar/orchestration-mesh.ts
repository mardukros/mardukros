/**
 * Distributed Orchestration Mesh - Manages distributed tensor network operations
 * 
 * Provides load balancing, fault tolerance, and coordination for distributed
 * GGML tensor kernels in the agentic cognitive grammar network.
 */

import { 
  KernelCluster, 
  GgmlKernel, 
  TensorMessage, 
  DistributedAttentionState,
  AgenticGrammarConfig 
} from './types.js';
import { CognitiveKernelRegistry } from './kernel-registry.js';
import { Tensor } from '../types.js';
import { makeTensor, randomTensor } from '../tensor/operations.js';

/**
 * Node in the distributed mesh
 */
interface MeshNode {
  id: string;
  status: 'active' | 'degraded' | 'failed';
  load: number;
  capacity: number;
  kernels: string[];
  lastHeartbeat: number;
  location: {
    cluster: string;
    region: string;
  };
  performance: {
    latency: number;
    throughput: number;
    errorRate: number;
  };
}

/**
 * Routing table entry for mesh communication
 */
interface RoutingEntry {
  destination: string;
  nextHop: string;
  cost: number;
  latency: number;
  reliability: number;
}

export class DistributedOrchestrationMesh {
  private kernelRegistry: CognitiveKernelRegistry;
  private nodes: Map<string, MeshNode> = new Map();
  private routingTable: Map<string, RoutingEntry> = new Map();
  private loadBalancers: Map<string, LoadBalancer> = new Map();
  private messageReliability: MessageReliabilityManager;
  private healthMonitor: HealthMonitor;
  private config: AgenticGrammarConfig;

  constructor(kernelRegistry: CognitiveKernelRegistry, config: AgenticGrammarConfig) {
    this.kernelRegistry = kernelRegistry;
    this.config = config;
    this.messageReliability = new MessageReliabilityManager();
    this.healthMonitor = new HealthMonitor();
    
    console.log('🌐 Initializing Distributed Orchestration Mesh...');
    this.initializeMesh();
  }

  /**
   * Initializes the distributed mesh
   */
  private initializeMesh(): void {
    // Create initial mesh nodes
    this.createInitialNodes();
    
    // Initialize routing table
    this.buildRoutingTable();
    
    // Start health monitoring
    this.healthMonitor.startMonitoring(this.nodes);
    
    console.log('✨ Distributed mesh initialized with', this.nodes.size, 'nodes');
  }

  /**
   * Creates initial mesh nodes
   */
  private createInitialNodes(): void {
    const nodeConfigs = [
      { id: 'node_core', cluster: 'core', region: 'main', capacity: 100 },
      { id: 'node_memory', cluster: 'memory', region: 'main', capacity: 80 },
      { id: 'node_reasoning', cluster: 'reasoning', region: 'main', capacity: 90 },
      { id: 'node_sensing', cluster: 'sensing', region: 'edge', capacity: 60 },
      { id: 'node_action', cluster: 'action', region: 'edge', capacity: 70 }
    ];

    for (const config of nodeConfigs) {
      const node: MeshNode = {
        id: config.id,
        status: 'active',
        load: 0,
        capacity: config.capacity,
        kernels: [],
        lastHeartbeat: Date.now(),
        location: {
          cluster: config.cluster,
          region: config.region
        },
        performance: {
          latency: 0,
          throughput: 0,
          errorRate: 0
        }
      };

      this.nodes.set(config.id, node);
      this.loadBalancers.set(config.id, new LoadBalancer(config.id, this.config.distribution.loadBalancingStrategy));
    }
  }

  /**
   * Builds initial routing table
   */
  private buildRoutingTable(): void {
    const nodes = Array.from(this.nodes.keys());
    
    // Build full mesh connectivity for simplicity
    for (const source of nodes) {
      for (const dest of nodes) {
        if (source !== dest) {
          const routingKey = `${source}_to_${dest}`;
          this.routingTable.set(routingKey, {
            destination: dest,
            nextHop: dest, // Direct connection in initial setup
            cost: 1,
            latency: 10, // Base latency in ms
            reliability: 0.99
          });
        }
      }
    }
  }

  /**
   * Deploys a kernel to the mesh
   */
  deployKernel(kernel: GgmlKernel, targetCluster?: string): string {
    const bestNode = this.selectOptimalNode(kernel, targetCluster);
    
    if (!bestNode) {
      throw new Error('No suitable node found for kernel deployment');
    }

    // Deploy kernel to node
    bestNode.kernels.push(kernel.id);
    bestNode.load += kernel.metadata.resourceCost;
    
    // Update load balancer
    const loadBalancer = this.loadBalancers.get(bestNode.id);
    if (loadBalancer) {
      loadBalancer.addKernel(kernel.id, kernel.metadata.resourceCost);
    }

    console.log(`🚀 Deployed kernel ${kernel.name} to node ${bestNode.id}`);
    return bestNode.id;
  }

  /**
   * Selects optimal node for kernel deployment
   */
  private selectOptimalNode(kernel: GgmlKernel, targetCluster?: string): MeshNode | null {
    const availableNodes = Array.from(this.nodes.values())
      .filter(node => node.status === 'active')
      .filter(node => !targetCluster || node.location.cluster === targetCluster)
      .filter(node => node.capacity - node.load >= kernel.metadata.resourceCost);

    if (availableNodes.length === 0) {
      return null;
    }

    // Select based on load balancing strategy
    switch (this.config.distribution.loadBalancingStrategy) {
      case 'least-loaded':
        return availableNodes.reduce((best, node) => 
          node.load < best.load ? node : best
        );
        
      case 'complexity-based':
        return availableNodes.reduce((best, node) => {
          const nodeScore = this.calculateNodeScore(node, kernel);
          const bestScore = this.calculateNodeScore(best, kernel);
          return nodeScore > bestScore ? node : best;
        });
        
      default: // round-robin
        return availableNodes[Math.floor(Math.random() * availableNodes.length)];
    }
  }

  /**
   * Calculates node suitability score for kernel
   */
  private calculateNodeScore(node: MeshNode, kernel: GgmlKernel): number {
    const loadScore = 1 - (node.load / node.capacity);
    const performanceScore = 1 - node.performance.errorRate;
    const latencyScore = 1 / (1 + node.performance.latency / 100);
    
    return (loadScore * 0.4) + (performanceScore * 0.3) + (latencyScore * 0.3);
  }

  /**
   * Routes a tensor message through the mesh
   */
  async routeMessage(message: TensorMessage): Promise<boolean> {
    const sourceNode = this.findNodeByKernel(message.sourceKernelId);
    const targetNode = this.findNodeByKernel(message.targetKernelId);
    
    if (!sourceNode || !targetNode) {
      console.warn(`⚠️ Cannot route message: source or target node not found`);
      return false;
    }

    // Find optimal path
    const path = this.findOptimalPath(sourceNode.id, targetNode.id);
    if (!path) {
      console.warn(`⚠️ No path found from ${sourceNode.id} to ${targetNode.id}`);
      return false;
    }

    // Update message routing info
    message.routingInfo.path = path;
    message.routingInfo.ttl--;

    // Route through mesh
    try {
      await this.deliverMessage(message, path);
      this.messageReliability.recordSuccess(message.id);
      return true;
    } catch (error) {
      this.messageReliability.recordFailure(message.id, error);
      return false;
    }
  }

  /**
   * Finds optimal path between nodes
   */
  private findOptimalPath(sourceId: string, targetId: string): string[] | null {
    // Simple direct path for now - can be enhanced with Dijkstra's algorithm
    const routingKey = `${sourceId}_to_${targetId}`;
    const route = this.routingTable.get(routingKey);
    
    if (route) {
      return [sourceId, route.nextHop, targetId].filter((v, i, arr) => arr.indexOf(v) === i);
    }
    
    return null;
  }

  /**
   * Delivers message along path
   */
  private async deliverMessage(message: TensorMessage, path: string[]): Promise<void> {
    for (let i = 0; i < path.length - 1; i++) {
      const currentNode = path[i];
      const nextNode = path[i + 1];
      
      // Simulate network latency
      await this.simulateNetworkLatency(currentNode, nextNode);
      
      // Update node performance metrics
      this.updateNodePerformance(currentNode, nextNode);
    }
    
    // Deliver to kernel registry
    this.kernelRegistry.routeTensorMessage(message);
  }

  /**
   * Simulates network latency between nodes
   */
  private async simulateNetworkLatency(sourceId: string, targetId: string): Promise<void> {
    const routingKey = `${sourceId}_to_${targetId}`;
    const route = this.routingTable.get(routingKey);
    const latency = route ? route.latency : 50; // Default 50ms
    
    return new Promise(resolve => setTimeout(resolve, latency));
  }

  /**
   * Updates node performance metrics
   */
  private updateNodePerformance(sourceId: string, targetId: string): void {
    const sourceNode = this.nodes.get(sourceId);
    const targetNode = this.nodes.get(targetId);
    
    if (sourceNode && targetNode) {
      sourceNode.performance.throughput++;
      targetNode.performance.throughput++;
      
      // Update latency (exponential moving average)
      const alpha = 0.1;
      const measuredLatency = 10 + Math.random() * 20; // Simulated
      sourceNode.performance.latency = 
        alpha * measuredLatency + (1 - alpha) * sourceNode.performance.latency;
    }
  }

  /**
   * Finds node containing a specific kernel
   */
  private findNodeByKernel(kernelId: string): MeshNode | null {
    for (const node of this.nodes.values()) {
      if (node.kernels.includes(kernelId)) {
        return node;
      }
    }
    return null;
  }

  /**
   * Handles node failure
   */
  handleNodeFailure(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    console.log(`🚨 Node failure detected: ${nodeId}`);
    node.status = 'failed';

    // Redistribute kernels
    this.redistributeKernels(node);

    // Update routing table
    this.updateRoutingForFailedNode(nodeId);
  }

  /**
   * Redistributes kernels from failed node
   */
  private redistributeKernels(failedNode: MeshNode): void {
    const kernelsToRedistribute = [...failedNode.kernels];
    failedNode.kernels = [];
    failedNode.load = 0;

    for (const kernelId of kernelsToRedistribute) {
      const kernel = this.kernelRegistry.getKernel(kernelId);
      if (kernel) {
        try {
          this.deployKernel(kernel);
          console.log(`♻️ Redistributed kernel ${kernelId}`);
        } catch (error) {
          console.error(`❌ Failed to redistribute kernel ${kernelId}:`, error);
        }
      }
    }
  }

  /**
   * Updates routing table for failed node
   */
  private updateRoutingForFailedNode(nodeId: string): void {
    // Remove routes through failed node
    const routesToRemove: string[] = [];
    
    for (const [key, route] of this.routingTable.entries()) {
      if (route.nextHop === nodeId) {
        routesToRemove.push(key);
      }
    }
    
    for (const key of routesToRemove) {
      this.routingTable.delete(key);
    }
    
    // Rebuild routing table
    this.buildRoutingTable();
  }

  /**
   * Performs load balancing across nodes
   */
  balanceLoad(): void {
    console.log('⚖️ Performing load balancing...');
    
    const activeNodes = Array.from(this.nodes.values())
      .filter(node => node.status === 'active');
    
    if (activeNodes.length < 2) return;

    // Find overloaded and underloaded nodes
    const avgLoad = activeNodes.reduce((sum, node) => sum + node.load, 0) / activeNodes.length;
    const overloadedNodes = activeNodes.filter(node => node.load > avgLoad * 1.5);
    const underloadedNodes = activeNodes.filter(node => node.load < avgLoad * 0.5);

    // Migrate kernels from overloaded to underloaded nodes
    for (const overloadedNode of overloadedNodes) {
      const underloadedNode = underloadedNodes.find(node => 
        node.capacity - node.load > overloadedNode.load * 0.1
      );
      
      if (underloadedNode) {
        this.migrateKernels(overloadedNode, underloadedNode, Math.floor(overloadedNode.kernels.length * 0.2));
      }
    }
  }

  /**
   * Migrates kernels between nodes
   */
  private migrateKernels(sourceNode: MeshNode, targetNode: MeshNode, count: number): void {
    const kernelsToMigrate = sourceNode.kernels.slice(0, count);
    
    for (const kernelId of kernelsToMigrate) {
      const kernel = this.kernelRegistry.getKernel(kernelId);
      if (kernel && targetNode.capacity - targetNode.load >= kernel.metadata.resourceCost) {
        // Remove from source
        sourceNode.kernels = sourceNode.kernels.filter(id => id !== kernelId);
        sourceNode.load -= kernel.metadata.resourceCost;
        
        // Add to target
        targetNode.kernels.push(kernelId);
        targetNode.load += kernel.metadata.resourceCost;
        
        console.log(`🔄 Migrated kernel ${kernelId} from ${sourceNode.id} to ${targetNode.id}`);
      }
    }
  }

  /**
   * Gets mesh statistics
   */
  getMeshStatistics(): {
    totalNodes: number;
    activeNodes: number;
    failedNodes: number;
    totalLoad: number;
    averageLoad: number;
    totalKernels: number;
    routingTableSize: number;
    messageReliability: number;
  } {
    const nodes = Array.from(this.nodes.values());
    const activeNodes = nodes.filter(node => node.status === 'active');
    const failedNodes = nodes.filter(node => node.status === 'failed');
    const totalLoad = nodes.reduce((sum, node) => sum + node.load, 0);
    const totalKernels = nodes.reduce((sum, node) => sum + node.kernels.length, 0);

    return {
      totalNodes: nodes.length,
      activeNodes: activeNodes.length,
      failedNodes: failedNodes.length,
      totalLoad,
      averageLoad: nodes.length > 0 ? totalLoad / nodes.length : 0,
      totalKernels,
      routingTableSize: this.routingTable.size,
      messageReliability: this.messageReliability.getSuccessRate()
    };
  }

  /**
   * Gets node by ID
   */
  getNode(nodeId: string): MeshNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Gets all nodes
   */
  getAllNodes(): MeshNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Gets routing table
   */
  getRoutingTable(): Map<string, RoutingEntry> {
    return new Map(this.routingTable);
  }
}

/**
 * Load balancer for individual nodes
 */
class LoadBalancer {
  private nodeId: string;
  private strategy: string;
  private kernelLoads: Map<string, number> = new Map();
  private currentIndex: number = 0;

  constructor(nodeId: string, strategy: string) {
    this.nodeId = nodeId;
    this.strategy = strategy;
  }

  addKernel(kernelId: string, load: number): void {
    this.kernelLoads.set(kernelId, load);
  }

  removeKernel(kernelId: string): void {
    this.kernelLoads.delete(kernelId);
  }

  selectKernel(): string | null {
    const kernels = Array.from(this.kernelLoads.keys());
    if (kernels.length === 0) return null;

    switch (this.strategy) {
      case 'least-loaded':
        return kernels.reduce((best, kernel) => {
          const bestLoad = this.kernelLoads.get(best) || 0;
          const kernelLoad = this.kernelLoads.get(kernel) || 0;
          return kernelLoad < bestLoad ? kernel : best;
        });
        
      case 'round-robin':
        const selected = kernels[this.currentIndex % kernels.length];
        this.currentIndex++;
        return selected;
        
      default:
        return kernels[Math.floor(Math.random() * kernels.length)];
    }
  }
}

/**
 * Message reliability manager
 */
class MessageReliabilityManager {
  private successCount: number = 0;
  private failureCount: number = 0;
  private messageStatus: Map<string, { success: boolean; timestamp: number }> = new Map();

  recordSuccess(messageId: string): void {
    this.successCount++;
    this.messageStatus.set(messageId, { success: true, timestamp: Date.now() });
  }

  recordFailure(messageId: string, error: any): void {
    this.failureCount++;
    this.messageStatus.set(messageId, { success: false, timestamp: Date.now() });
    console.error(`Message ${messageId} failed:`, error);
  }

  getSuccessRate(): number {
    const total = this.successCount + this.failureCount;
    return total > 0 ? this.successCount / total : 1.0;
  }

  getMessageStatus(messageId: string): { success: boolean; timestamp: number } | undefined {
    return this.messageStatus.get(messageId);
  }
}

/**
 * Health monitor for mesh nodes
 */
class HealthMonitor {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private healthThreshold: number = 0.8;

  startMonitoring(nodes: Map<string, MeshNode>): void {
    this.monitoringInterval = setInterval(() => {
      this.checkNodeHealth(nodes);
    }, 5000); // Check every 5 seconds
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private checkNodeHealth(nodes: Map<string, MeshNode>): void {
    const now = Date.now();
    
    for (const [nodeId, node] of nodes.entries()) {
      if (node.status === 'active') {
        // Check heartbeat
        const timeSinceHeartbeat = now - node.lastHeartbeat;
        if (timeSinceHeartbeat > 30000) { // 30 seconds
          node.status = 'failed';
          console.log(`💔 Node ${nodeId} failed heartbeat check`);
          continue;
        }

        // Check performance
        const healthScore = this.calculateHealthScore(node);
        if (healthScore < this.healthThreshold) {
          node.status = 'degraded';
          console.log(`⚠️ Node ${nodeId} performance degraded (score: ${healthScore.toFixed(2)})`);
        }
      }
    }
  }

  private calculateHealthScore(node: MeshNode): number {
    const loadScore = 1 - (node.load / node.capacity);
    const errorScore = 1 - node.performance.errorRate;
    const latencyScore = 1 / (1 + node.performance.latency / 100);
    
    return (loadScore * 0.4) + (errorScore * 0.3) + (latencyScore * 0.3);
  }
}