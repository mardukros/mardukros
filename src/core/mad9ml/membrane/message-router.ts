/**
 * Message Router for Membrane Communication
 * 
 * Implements intelligent message routing between membranes with respect to
 * boundary conditions, access control, and network topology optimization.
 */

import { Membrane } from './membrane-abstraction.js';
import { PortChannel, PortMessage, MessagePriority } from './port-channel.js';
import { PSystem } from './p-system.js';

/**
 * Routing strategy types
 */
export type RoutingStrategy = 'direct' | 'shortest-path' | 'load-balanced' | 'broadcast' | 'multicast' | 'adaptive';

/**
 * Message routing configuration
 */
export interface MessageRouterConfig {
  id: string;
  name: string;
  defaultStrategy: RoutingStrategy;
  enableCache: boolean;
  cacheSize: number;
  routingTableSize: number;
  maxHops: number;
  timeoutMs: number;
  retryAttempts: number;
  enablePriorityQueuing: boolean;
  enableLoadBalancing: boolean;
  enableFailover: boolean;
  compressionThreshold: number;
}

/**
 * Routing table entry
 */
export interface RoutingTableEntry {
  destination: string;
  nextHop: string;
  hopCount: number;
  cost: number;
  timestamp: number;
  reliability: number;
  bandwidth: number;
  latency: number;
}

/**
 * Message route
 */
export interface MessageRoute {
  id: string;
  source: string;
  destination: string;
  path: string[];
  totalCost: number;
  estimatedLatency: number;
  reliability: number;
  strategy: RoutingStrategy;
  alternativePaths?: MessageRoute[];
}

/**
 * Routing statistics
 */
export interface RoutingStatistics {
  routerId: string;
  messagesRouted: number;
  messagesDelivered: number;
  messagesFailed: number;
  averageLatency: number;
  averageHopCount: number;
  cacheHitRate: number;
  routingTableUpdates: number;
  totalBandwidthUsed: number;
  networkTopologyChanges: number;
  uptime: number;
}

/**
 * Quality of Service parameters
 */
export interface QoSParameters {
  priority: MessagePriority;
  maxLatency: number;
  minReliability: number;
  maxBandwidth: number;
  encryptionRequired: boolean;
  compressionAllowed: boolean;
  multicastEnabled: boolean;
}

/**
 * Message routing context
 */
export interface RoutingContext {
  messageId: string;
  sourceMembraneId: string;
  destinationMembraneId: string;
  qos: QoSParameters;
  userContext?: string;
  routingHints?: Record<string, any>;
  deadline?: number;
}

/**
 * Message router implementation
 */
export class MessageRouter {
  private config: MessageRouterConfig;
  private routingTable: Map<string, RoutingTableEntry[]> = new Map();
  private routeCache: Map<string, MessageRoute> = new Map();
  private messageQueues: Map<MessagePriority, PortMessage[]> = new Map();
  private activeRoutes: Map<string, MessageRoute> = new Map();
  private statistics: RoutingStatistics;
  private membranes: Map<string, Membrane> = new Map();
  private ports: Map<string, PortChannel> = new Map();
  private pSystem: PSystem | null = null;
  private creationTime: number;
  private lastTableUpdate: number;
  private isActive: boolean = true;

  constructor(config: MessageRouterConfig) {
    this.config = { ...config };
    this.creationTime = Date.now();
    this.lastTableUpdate = Date.now();

    // Initialize message queues by priority
    this.messageQueues.set('critical', []);
    this.messageQueues.set('urgent', []);
    this.messageQueues.set('high', []);
    this.messageQueues.set('normal', []);
    this.messageQueues.set('low', []);

    // Initialize statistics
    this.statistics = {
      routerId: config.id,
      messagesRouted: 0,
      messagesDelivered: 0,
      messagesFailed: 0,
      averageLatency: 0,
      averageHopCount: 0,
      cacheHitRate: 0,
      routingTableUpdates: 0,
      totalBandwidthUsed: 0,
      networkTopologyChanges: 0,
      uptime: 0
    };
  }

  /**
   * Attach router to P-System
   */
  attachToPSystem(pSystem: PSystem): void {
    this.pSystem = pSystem;
    this.updateTopology();
    console.log(`Message router ${this.config.id} attached to P-System`);
  }

  /**
   * Register membrane with router
   */
  registerMembrane(membrane: Membrane): void {
    this.membranes.set(membrane.getId(), membrane);
    this.updateRoutingTable();
    console.log(`Registered membrane ${membrane.getId()} with router`);
  }

  /**
   * Unregister membrane from router
   */
  unregisterMembrane(membraneId: string): void {
    this.membranes.delete(membraneId);
    this.routingTable.delete(membraneId);
    this.clearCacheForMembrane(membraneId);
    this.updateRoutingTable();
    console.log(`Unregistered membrane ${membraneId} from router`);
  }

  /**
   * Register port channel with router
   */
  registerPort(port: PortChannel): void {
    this.ports.set(port.getId(), port);
    console.log(`Registered port ${port.getId()} with router`);
  }

  /**
   * Unregister port channel from router
   */
  unregisterPort(portId: string): void {
    this.ports.delete(portId);
    console.log(`Unregistered port ${portId} from router`);
  }

  /**
   * Route message between membranes
   */
  async routeMessage(
    message: PortMessage,
    context: RoutingContext,
    strategy?: RoutingStrategy
  ): Promise<boolean> {
    if (!this.isActive) {
      console.warn('Message router is not active');
      return false;
    }

    const routingStrategy = strategy || this.config.defaultStrategy;
    const routeId = this.generateRouteId(context);

    try {
      // Find optimal route
      const route = await this.findRoute(
        context.sourceMembraneId,
        context.destinationMembraneId,
        routingStrategy,
        context.qos
      );

      if (!route) {
        console.warn(`No route found from ${context.sourceMembraneId} to ${context.destinationMembraneId}`);
        this.statistics.messagesFailed++;
        return false;
      }

      // Add message to appropriate queue
      if (this.config.enablePriorityQueuing) {
        this.addToQueue(message, context.qos.priority);
      }

      // Execute routing
      const success = await this.executeRoute(message, route, context);
      
      if (success) {
        this.statistics.messagesRouted++;
        this.statistics.messagesDelivered++;
        this.updateRouteStatistics(route, true);
      } else {
        this.statistics.messagesFailed++;
        this.updateRouteStatistics(route, false);
      }

      return success;

    } catch (error) {
      console.error(`Error routing message ${message.id}:`, error);
      this.statistics.messagesFailed++;
      return false;
    }
  }

  /**
   * Broadcast message to multiple destinations
   */
  async broadcastMessage(
    message: PortMessage,
    destinations: string[],
    context: Omit<RoutingContext, 'destinationMembraneId'>
  ): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const destination of destinations) {
      const broadcastContext: RoutingContext = {
        ...context,
        destinationMembraneId: destination
      };

      const success = await this.routeMessage(message, broadcastContext, 'broadcast');
      results.set(destination, success);
    }

    return results;
  }

  /**
   * Multicast message to group
   */
  async multicastMessage(
    message: PortMessage,
    group: string[],
    context: Omit<RoutingContext, 'destinationMembraneId'>
  ): Promise<Map<string, boolean>> {
    // Optimize multicast by finding common path segments
    const optimizedRoutes = await this.optimizeMulticastRoutes(context.sourceMembraneId, group);
    const results = new Map<string, boolean>();

    for (const [destination, route] of optimizedRoutes) {
      const multicastContext: RoutingContext = {
        ...context,
        destinationMembraneId: destination
      };

      const success = await this.executeRoute(message, route, multicastContext);
      results.set(destination, success);
    }

    return results;
  }

  /**
   * Find optimal route between membranes
   */
  async findRoute(
    source: string,
    destination: string,
    strategy: RoutingStrategy,
    qos: QoSParameters
  ): Promise<MessageRoute | null> {
    // Check cache first
    const cacheKey = `${source}->${destination}-${strategy}`;
    if (this.config.enableCache && this.routeCache.has(cacheKey)) {
      const cachedRoute = this.routeCache.get(cacheKey)!;
      if (this.isRouteFresh(cachedRoute)) {
        this.statistics.cacheHitRate++;
        return cachedRoute;
      } else {
        this.routeCache.delete(cacheKey);
      }
    }

    let route: MessageRoute | null = null;

    switch (strategy) {
      case 'direct':
        route = await this.findDirectRoute(source, destination, qos);
        break;
      case 'shortest-path':
        route = await this.findShortestPath(source, destination, qos);
        break;
      case 'load-balanced':
        route = await this.findLoadBalancedRoute(source, destination, qos);
        break;
      case 'broadcast':
        route = await this.findBroadcastRoute(source, destination, qos);
        break;
      case 'multicast':
        route = await this.findMulticastRoute(source, destination, qos);
        break;
      case 'adaptive':
        route = await this.findAdaptiveRoute(source, destination, qos);
        break;
      default:
        console.warn(`Unknown routing strategy: ${strategy}`);
        return null;
    }

    // Cache the route
    if (route && this.config.enableCache) {
      this.cacheRoute(cacheKey, route);
    }

    return route;
  }

  /**
   * Update routing table based on network topology
   */
  updateRoutingTable(): void {
    this.routingTable.clear();

    for (const [membraneId, membrane] of this.membranes) {
      const entries: RoutingTableEntry[] = [];

      // Add direct connections (parent and children)
      const parent = membrane.getParent();
      if (parent && this.membranes.has(parent.getId())) {
        entries.push({
          destination: parent.getId(),
          nextHop: parent.getId(),
          hopCount: 1,
          cost: 1.0,
          timestamp: Date.now(),
          reliability: 0.95,
          bandwidth: 1000,
          latency: 10
        });
      }

      for (const child of membrane.getChildren()) {
        if (this.membranes.has(child.getId())) {
          entries.push({
            destination: child.getId(),
            nextHop: child.getId(),
            hopCount: 1,
            cost: 1.0,
            timestamp: Date.now(),
            reliability: 0.95,
            bandwidth: 1000,
            latency: 10
          });
        }
      }

      this.routingTable.set(membraneId, entries);
    }

    // Calculate multi-hop routes using Floyd-Warshall algorithm
    this.calculateMultiHopRoutes();

    this.lastTableUpdate = Date.now();
    this.statistics.routingTableUpdates++;
    console.log(`Updated routing table with ${this.routingTable.size} entries`);
  }

  /**
   * Get routing statistics
   */
  getStatistics(): RoutingStatistics {
    this.statistics.uptime = Date.now() - this.creationTime;
    this.statistics.cacheHitRate = this.statistics.messagesRouted > 0 
      ? this.statistics.cacheHitRate / this.statistics.messagesRouted 
      : 0;
    
    return { ...this.statistics };
  }

  /**
   * Get active routes
   */
  getActiveRoutes(): MessageRoute[] {
    return Array.from(this.activeRoutes.values());
  }

  /**
   * Get routing table
   */
  getRoutingTable(): Map<string, RoutingTableEntry[]> {
    return new Map(this.routingTable);
  }

  /**
   * Process message queues
   */
  async processMessageQueues(): Promise<void> {
    if (!this.config.enablePriorityQueuing) {
      return;
    }

    // Process queues in priority order
    const priorities: MessagePriority[] = ['critical', 'urgent', 'high', 'normal', 'low'];

    for (const priority of priorities) {
      const queue = this.messageQueues.get(priority) || [];
      while (queue.length > 0) {
        const message = queue.shift()!;
        // Process message (simplified - would need full routing context)
        console.log(`Processing ${priority} priority message ${message.id}`);
      }
    }
  }

  /**
   * Start router
   */
  start(): void {
    this.isActive = true;
    console.log(`Message router ${this.config.id} started`);
  }

  /**
   * Stop router
   */
  stop(): void {
    this.isActive = false;
    console.log(`Message router ${this.config.id} stopped`);
  }

  // Private methods

  private async findDirectRoute(
    source: string,
    destination: string,
    qos: QoSParameters
  ): Promise<MessageRoute | null> {
    const sourceMembrane = this.membranes.get(source);
    const destinationMembrane = this.membranes.get(destination);

    if (!sourceMembrane || !destinationMembrane) {
      return null;
    }

    // Check if direct connection exists
    const isDirectlyConnected = this.areDirectlyConnected(source, destination);
    
    if (isDirectlyConnected) {
      return {
        id: this.generateRouteId({ sourceMembraneId: source, destinationMembraneId: destination } as RoutingContext),
        source,
        destination,
        path: [source, destination],
        totalCost: 1.0,
        estimatedLatency: 10,
        reliability: 0.95,
        strategy: 'direct'
      };
    }

    return null;
  }

  private async findShortestPath(
    source: string,
    destination: string,
    qos: QoSParameters
  ): Promise<MessageRoute | null> {
    // Implement Dijkstra's algorithm for shortest path
    const distances = new Map<string, number>();
    const previous = new Map<string, string>();
    const unvisited = new Set(this.membranes.keys());

    // Initialize distances
    for (const membraneId of this.membranes.keys()) {
      distances.set(membraneId, membraneId === source ? 0 : Infinity);
    }

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let current = '';
      let minDistance = Infinity;
      for (const membraneId of unvisited) {
        const distance = distances.get(membraneId) || Infinity;
        if (distance < minDistance) {
          minDistance = distance;
          current = membraneId;
        }
      }

      if (current === '' || minDistance === Infinity) {
        break;
      }

      unvisited.delete(current);

      // Update distances to neighbors
      const entries = this.routingTable.get(current) || [];
      for (const entry of entries) {
        if (unvisited.has(entry.destination)) {
          const alt = minDistance + entry.cost;
          if (alt < (distances.get(entry.destination) || Infinity)) {
            distances.set(entry.destination, alt);
            previous.set(entry.destination, current);
          }
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let current = destination;
    while (current !== source) {
      path.unshift(current);
      const prev = previous.get(current);
      if (!prev) {
        return null; // No path found
      }
      current = prev;
    }
    path.unshift(source);

    return {
      id: this.generateRouteId({ sourceMembraneId: source, destinationMembraneId: destination } as RoutingContext),
      source,
      destination,
      path,
      totalCost: distances.get(destination) || Infinity,
      estimatedLatency: path.length * 10,
      reliability: Math.pow(0.95, path.length - 1),
      strategy: 'shortest-path'
    };
  }

  private async findLoadBalancedRoute(
    source: string,
    destination: string,
    qos: QoSParameters
  ): Promise<MessageRoute | null> {
    // Find multiple paths and select least loaded
    const shortestPath = await this.findShortestPath(source, destination, qos);
    if (!shortestPath) {
      return null;
    }

    // For simplicity, return shortest path with load balancing hint
    return {
      ...shortestPath,
      strategy: 'load-balanced'
    };
  }

  private async findBroadcastRoute(
    source: string,
    destination: string,
    qos: QoSParameters
  ): Promise<MessageRoute | null> {
    // Broadcast typically uses flooding or spanning tree
    return await this.findShortestPath(source, destination, qos);
  }

  private async findMulticastRoute(
    source: string,
    destination: string,
    qos: QoSParameters
  ): Promise<MessageRoute | null> {
    // Multicast uses optimized tree structures
    return await this.findShortestPath(source, destination, qos);
  }

  private async findAdaptiveRoute(
    source: string,
    destination: string,
    qos: QoSParameters
  ): Promise<MessageRoute | null> {
    // Adaptive routing considers current network conditions
    // For now, falls back to shortest path
    return await this.findShortestPath(source, destination, qos);
  }

  private async executeRoute(
    message: PortMessage,
    route: MessageRoute,
    context: RoutingContext
  ): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      // Simulate message transmission along the route
      for (let i = 0; i < route.path.length - 1; i++) {
        const currentNode = route.path[i];
        const nextNode = route.path[i + 1];
        
        // Update route metadata
        message.routingMetadata.hopCount++;
        message.routingMetadata.route.push(nextNode);
        
        // Simulate transmission delay
        await this.simulateTransmissionDelay(currentNode, nextNode);
      }

      const latency = Date.now() - startTime;
      message.routingMetadata.latency = latency;
      
      // Update statistics
      this.statistics.averageLatency = 
        (this.statistics.averageLatency * this.statistics.messagesDelivered + latency) / 
        (this.statistics.messagesDelivered + 1);
      
      this.statistics.averageHopCount = 
        (this.statistics.averageHopCount * this.statistics.messagesDelivered + message.routingMetadata.hopCount) / 
        (this.statistics.messagesDelivered + 1);

      return true;

    } catch (error) {
      console.error(`Error executing route ${route.id}:`, error);
      return false;
    }
  }

  private async optimizeMulticastRoutes(
    source: string,
    destinations: string[]
  ): Promise<Map<string, MessageRoute>> {
    const routes = new Map<string, MessageRoute>();
    
    // For simplicity, find individual routes
    // In a real implementation, this would build an optimal multicast tree
    for (const destination of destinations) {
      const route = await this.findShortestPath(source, destination, {
        priority: 'normal',
        maxLatency: 1000,
        minReliability: 0.8,
        maxBandwidth: 1000,
        encryptionRequired: false,
        compressionAllowed: true,
        multicastEnabled: true
      });
      
      if (route) {
        routes.set(destination, route);
      }
    }

    return routes;
  }

  private calculateMultiHopRoutes(): void {
    const membraneIds = Array.from(this.membranes.keys());
    const n = membraneIds.length;
    
    // Floyd-Warshall algorithm for all-pairs shortest paths
    const dist = new Map<string, Map<string, number>>();
    const next = new Map<string, Map<string, string>>();

    // Initialize
    for (const i of membraneIds) {
      dist.set(i, new Map());
      next.set(i, new Map());
      for (const j of membraneIds) {
        if (i === j) {
          dist.get(i)!.set(j, 0);
        } else {
          dist.get(i)!.set(j, Infinity);
        }
      }
    }

    // Set direct distances
    for (const [membraneId, entries] of this.routingTable) {
      for (const entry of entries) {
        dist.get(membraneId)!.set(entry.destination, entry.cost);
        next.get(membraneId)!.set(entry.destination, entry.destination);
      }
    }

    // Floyd-Warshall
    for (const k of membraneIds) {
      for (const i of membraneIds) {
        for (const j of membraneIds) {
          const distIK = dist.get(i)!.get(k) || Infinity;
          const distKJ = dist.get(k)!.get(j) || Infinity;
          const distIJ = dist.get(i)!.get(j) || Infinity;
          
          if (distIK + distKJ < distIJ) {
            dist.get(i)!.set(j, distIK + distKJ);
            next.get(i)!.set(j, next.get(i)!.get(k)!);
          }
        }
      }
    }

    // Update routing table with multi-hop routes
    for (const [source, sourceNext] of next) {
      const entries = this.routingTable.get(source) || [];
      
      for (const [destination, nextHop] of sourceNext) {
        if (source !== destination && nextHop) {
          const distance = dist.get(source)!.get(destination) || Infinity;
          if (distance < Infinity && !entries.some(e => e.destination === destination)) {
            entries.push({
              destination,
              nextHop,
              hopCount: Math.floor(distance),
              cost: distance,
              timestamp: Date.now(),
              reliability: Math.pow(0.95, Math.floor(distance)),
              bandwidth: 1000 / Math.floor(distance),
              latency: Math.floor(distance) * 10
            });
          }
        }
      }
      
      this.routingTable.set(source, entries);
    }
  }

  private areDirectlyConnected(source: string, destination: string): boolean {
    const sourceMembrane = this.membranes.get(source);
    const destinationMembrane = this.membranes.get(destination);

    if (!sourceMembrane || !destinationMembrane) {
      return false;
    }

    // Check parent-child relationships
    const parent = sourceMembrane.getParent();
    if (parent && parent.getId() === destination) {
      return true;
    }

    const children = sourceMembrane.getChildren();
    return children.some(child => child.getId() === destination);
  }

  private updateTopology(): void {
    if (this.pSystem) {
      const membranes = this.pSystem.getAllMembranes();
      for (const membrane of membranes) {
        this.registerMembrane(membrane);
      }
    }
  }

  private isRouteFresh(route: MessageRoute): boolean {
    const maxAge = 60000; // 1 minute
    return Date.now() - this.lastTableUpdate < maxAge;
  }

  private cacheRoute(key: string, route: MessageRoute): void {
    if (this.routeCache.size >= this.config.cacheSize) {
      // Remove oldest entry
      const oldestKey = this.routeCache.keys().next().value;
      this.routeCache.delete(oldestKey);
    }
    
    this.routeCache.set(key, route);
  }

  private clearCacheForMembrane(membraneId: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.routeCache.keys()) {
      if (key.includes(membraneId)) {
        keysToDelete.push(key);
      }
    }
    
    for (const key of keysToDelete) {
      this.routeCache.delete(key);
    }
  }

  private addToQueue(message: PortMessage, priority: MessagePriority): void {
    const queue = this.messageQueues.get(priority) || [];
    queue.push(message);
    this.messageQueues.set(priority, queue);
  }

  private updateRouteStatistics(route: MessageRoute, success: boolean): void {
    // Update route-specific statistics
    // This could include success rates, latency measurements, etc.
  }

  private async simulateTransmissionDelay(from: string, to: string): Promise<void> {
    // Simulate network delay based on membrane boundary policies
    const sourceMembrane = this.membranes.get(from);
    const targetMembrane = this.membranes.get(to);
    
    if (sourceMembrane && targetMembrane) {
      const sourceBoundary = sourceMembrane.getBoundary();
      const targetBoundary = targetMembrane.getBoundary();
      
      // Calculate delay based on boundary permeability
      const delay = Math.max(
        (1 - sourceBoundary.permeability.outbound) * 50,
        (1 - targetBoundary.permeability.inbound) * 50
      );
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  private generateRouteId(context: RoutingContext): string {
    return `route_${context.sourceMembraneId}_${context.destinationMembraneId}_${Date.now()}`;
  }
}

/**
 * Message router factory
 */
export class MessageRouterFactory {
  /**
   * Create a basic message router
   */
  static createBasicRouter(id: string, name: string): MessageRouter {
    const config: MessageRouterConfig = {
      id,
      name,
      defaultStrategy: 'shortest-path',
      enableCache: true,
      cacheSize: 1000,
      routingTableSize: 10000,
      maxHops: 10,
      timeoutMs: 5000,
      retryAttempts: 3,
      enablePriorityQueuing: true,
      enableLoadBalancing: false,
      enableFailover: false,
      compressionThreshold: 1024
    };

    return new MessageRouter(config);
  }

  /**
   * Create a high-performance router
   */
  static createHighPerformanceRouter(id: string, name: string): MessageRouter {
    const config: MessageRouterConfig = {
      id,
      name,
      defaultStrategy: 'adaptive',
      enableCache: true,
      cacheSize: 10000,
      routingTableSize: 100000,
      maxHops: 20,
      timeoutMs: 1000,
      retryAttempts: 1,
      enablePriorityQueuing: true,
      enableLoadBalancing: true,
      enableFailover: true,
      compressionThreshold: 512
    };

    return new MessageRouter(config);
  }

  /**
   * Create a fault-tolerant router
   */
  static createFaultTolerantRouter(id: string, name: string): MessageRouter {
    const config: MessageRouterConfig = {
      id,
      name,
      defaultStrategy: 'load-balanced',
      enableCache: true,
      cacheSize: 5000,
      routingTableSize: 50000,
      maxHops: 15,
      timeoutMs: 10000,
      retryAttempts: 5,
      enablePriorityQueuing: true,
      enableLoadBalancing: true,
      enableFailover: true,
      compressionThreshold: 2048
    };

    return new MessageRouter(config);
  }
}