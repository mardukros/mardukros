/**
 * Membrane Registry for P-System Management
 * 
 * Provides centralized registration, discovery, and management of membranes
 * within P-System instances with lifecycle management and monitoring.
 */

import { Membrane, MembraneState, MembraneBoundary } from './membrane-abstraction.js';
import { PortChannel } from './port-channel.js';
import { PSystem } from './p-system.js';
import { MessageRouter } from './message-router.js';
import { TensorShape } from '../types.js';

/**
 * Membrane registry configuration
 */
export interface MembraneRegistryConfig {
  id: string;
  name: string;
  maxMembranes: number;
  maxPSystems: number;
  enableAutoCleanup: boolean;
  cleanupIntervalMs: number;
  enableHealthMonitoring: boolean;
  healthCheckIntervalMs: number;
  enableMetrics: boolean;
  metricsRetentionMs: number;
  enablePersistence: boolean;
  persistenceBackend: 'memory' | 'file' | 'database';
}

/**
 * Membrane registration entry
 */
export interface MembraneRegistration {
  membrane: Membrane;
  pSystemId: string | null;
  registrationTime: number;
  lastActivity: number;
  tags: string[];
  metadata: Record<string, any>;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  ports: string[];
  connections: string[];
}

/**
 * P-System registration entry
 */
export interface PSystemRegistration {
  pSystem: PSystem;
  registrationTime: number;
  lastActivity: number;
  membranes: string[];
  routers: string[];
  status: 'active' | 'inactive' | 'suspended' | 'error';
}

/**
 * Registry query parameters
 */
export interface RegistryQuery {
  pSystemId?: string;
  tags?: string[];
  healthStatus?: string[];
  depthRange?: [number, number];
  activitySince?: number;
  membraneType?: string;
  limit?: number;
  offset?: number;
}

/**
 * Registry statistics
 */
export interface RegistryStatistics {
  registryId: string;
  totalMembranes: number;
  totalPSystems: number;
  totalPorts: number;
  totalRouters: number;
  healthyMembranes: number;
  degradedMembranes: number;
  unhealthyMembranes: number;
  activePSystems: number;
  inactivePSystems: number;
  averageMembraneDepth: number;
  totalConnections: number;
  memoryUsage: number;
  uptime: number;
}

/**
 * Membrane discovery result
 */
export interface MembraneDiscoveryResult {
  membranes: MembraneRegistration[];
  totalCount: number;
  filteredCount: number;
  query: RegistryQuery;
  executionTime: number;
}

/**
 * Membrane lifecycle event
 */
export interface MembraneLifecycleEvent {
  type: 'registered' | 'unregistered' | 'activated' | 'deactivated' | 'health_changed' | 'connection_added' | 'connection_removed';
  membraneId: string;
  timestamp: number;
  details: Record<string, any>;
}

/**
 * Membrane registry implementation
 */
export class MembraneRegistry {
  private config: MembraneRegistryConfig;
  private membranes: Map<string, MembraneRegistration> = new Map();
  private pSystems: Map<string, PSystemRegistration> = new Map();
  private ports: Map<string, PortChannel> = new Map();
  private routers: Map<string, MessageRouter> = new Map();
  private lifecycleEvents: MembraneLifecycleEvent[] = [];
  private statistics: RegistryStatistics;
  private creationTime: number;
  private lastCleanup: number;
  private lastHealthCheck: number;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isActive: boolean = true;

  constructor(config: MembraneRegistryConfig) {
    this.config = { ...config };
    this.creationTime = Date.now();
    this.lastCleanup = Date.now();
    this.lastHealthCheck = Date.now();

    // Initialize statistics
    this.statistics = {
      registryId: config.id,
      totalMembranes: 0,
      totalPSystems: 0,
      totalPorts: 0,
      totalRouters: 0,
      healthyMembranes: 0,
      degradedMembranes: 0,
      unhealthyMembranes: 0,
      activePSystems: 0,
      inactivePSystems: 0,
      averageMembraneDepth: 0,
      totalConnections: 0,
      memoryUsage: 0,
      uptime: 0
    };

    // Start background tasks
    this.startBackgroundTasks();
  }

  /**
   * Register a membrane
   */
  registerMembrane(
    membrane: Membrane,
    pSystemId?: string,
    tags: string[] = [],
    metadata: Record<string, any> = {}
  ): boolean {
    if (this.membranes.has(membrane.getId())) {
      console.warn(`Membrane ${membrane.getId()} is already registered`);
      return false;
    }

    if (this.membranes.size >= this.config.maxMembranes) {
      console.warn(`Maximum membranes limit (${this.config.maxMembranes}) reached`);
      return false;
    }

    // Validate P-System ID if provided
    if (pSystemId && !this.pSystems.has(pSystemId)) {
      console.warn(`P-System ${pSystemId} not found`);
      return false;
    }

    const registration: MembraneRegistration = {
      membrane,
      pSystemId: pSystemId || null,
      registrationTime: Date.now(),
      lastActivity: Date.now(),
      tags: [...tags],
      metadata: { ...metadata },
      healthStatus: 'unknown',
      ports: [],
      connections: []
    };

    this.membranes.set(membrane.getId(), registration);

    // Add to P-System if specified
    if (pSystemId) {
      const pSystemReg = this.pSystems.get(pSystemId);
      if (pSystemReg) {
        pSystemReg.membranes.push(membrane.getId());
        pSystemReg.lastActivity = Date.now();
      }
    }

    // Update statistics
    this.statistics.totalMembranes++;
    this.updateStatistics();

    // Log lifecycle event
    this.logLifecycleEvent({
      type: 'registered',
      membraneId: membrane.getId(),
      timestamp: Date.now(),
      details: {
        pSystemId,
        tags,
        metadata
      }
    });

    console.log(`Registered membrane ${membrane.getId()} in registry ${this.config.id}`);
    return true;
  }

  /**
   * Unregister a membrane
   */
  unregisterMembrane(membraneId: string): boolean {
    const registration = this.membranes.get(membraneId);
    if (!registration) {
      console.warn(`Membrane ${membraneId} not found in registry`);
      return false;
    }

    // Remove from P-System
    if (registration.pSystemId) {
      const pSystemReg = this.pSystems.get(registration.pSystemId);
      if (pSystemReg) {
        pSystemReg.membranes = pSystemReg.membranes.filter(id => id !== membraneId);
        pSystemReg.lastActivity = Date.now();
      }
    }

    // Deactivate membrane
    registration.membrane.deactivate();

    // Remove associated ports
    for (const portId of registration.ports) {
      this.unregisterPort(portId);
    }

    // Remove from registry
    this.membranes.delete(membraneId);

    // Update statistics
    this.statistics.totalMembranes--;
    this.updateStatistics();

    // Log lifecycle event
    this.logLifecycleEvent({
      type: 'unregistered',
      membraneId,
      timestamp: Date.now(),
      details: {
        pSystemId: registration.pSystemId
      }
    });

    console.log(`Unregistered membrane ${membraneId} from registry ${this.config.id}`);
    return true;
  }

  /**
   * Register a P-System
   */
  registerPSystem(pSystem: PSystem): boolean {
    if (this.pSystems.has(pSystem.getId())) {
      console.warn(`P-System ${pSystem.getId()} is already registered`);
      return false;
    }

    if (this.pSystems.size >= this.config.maxPSystems) {
      console.warn(`Maximum P-Systems limit (${this.config.maxPSystems}) reached`);
      return false;
    }

    const registration: PSystemRegistration = {
      pSystem,
      registrationTime: Date.now(),
      lastActivity: Date.now(),
      membranes: [],
      routers: [],
      status: 'active'
    };

    this.pSystems.set(pSystem.getId(), registration);

    // Update statistics
    this.statistics.totalPSystems++;
    this.statistics.activePSystems++;
    this.updateStatistics();

    console.log(`Registered P-System ${pSystem.getId()} in registry ${this.config.id}`);
    return true;
  }

  /**
   * Unregister a P-System
   */
  unregisterPSystem(pSystemId: string): boolean {
    const registration = this.pSystems.get(pSystemId);
    if (!registration) {
      console.warn(`P-System ${pSystemId} not found in registry`);
      return false;
    }

    // Unregister all associated membranes
    for (const membraneId of registration.membranes) {
      this.unregisterMembrane(membraneId);
    }

    // Unregister all associated routers
    for (const routerId of registration.routers) {
      this.unregisterRouter(routerId);
    }

    // Stop P-System
    registration.pSystem.stop();

    // Remove from registry
    this.pSystems.delete(pSystemId);

    // Update statistics
    this.statistics.totalPSystems--;
    if (registration.status === 'active') {
      this.statistics.activePSystems--;
    } else {
      this.statistics.inactivePSystems--;
    }
    this.updateStatistics();

    console.log(`Unregistered P-System ${pSystemId} from registry ${this.config.id}`);
    return true;
  }

  /**
   * Register a port channel
   */
  registerPort(port: PortChannel): boolean {
    if (this.ports.has(port.getId())) {
      console.warn(`Port ${port.getId()} is already registered`);
      return false;
    }

    this.ports.set(port.getId(), port);

    // Associate with membrane
    const membraneReg = this.membranes.get(port.getMembraneId());
    if (membraneReg) {
      membraneReg.ports.push(port.getId());
      membraneReg.lastActivity = Date.now();
    }

    // Update statistics
    this.statistics.totalPorts++;
    this.updateStatistics();

    console.log(`Registered port ${port.getId()} in registry ${this.config.id}`);
    return true;
  }

  /**
   * Unregister a port channel
   */
  unregisterPort(portId: string): boolean {
    const port = this.ports.get(portId);
    if (!port) {
      console.warn(`Port ${portId} not found in registry`);
      return false;
    }

    // Remove from membrane
    const membraneReg = this.membranes.get(port.getMembraneId());
    if (membraneReg) {
      membraneReg.ports = membraneReg.ports.filter(id => id !== portId);
      membraneReg.lastActivity = Date.now();
    }

    // Detach port
    port.detachFromMembrane();

    // Remove from registry
    this.ports.delete(portId);

    // Update statistics
    this.statistics.totalPorts--;
    this.updateStatistics();

    console.log(`Unregistered port ${portId} from registry ${this.config.id}`);
    return true;
  }

  /**
   * Register a message router
   */
  registerRouter(router: MessageRouter): boolean {
    if (this.routers.has(router.getId())) {
      console.warn(`Router ${router.getId()} is already registered`);
      return false;
    }

    this.routers.set(router.getId(), router);

    // Update statistics
    this.statistics.totalRouters++;
    this.updateStatistics();

    console.log(`Registered router ${router.getId()} in registry ${this.config.id}`);
    return true;
  }

  /**
   * Unregister a message router
   */
  unregisterRouter(routerId: string): boolean {
    const router = this.routers.get(routerId);
    if (!router) {
      console.warn(`Router ${routerId} not found in registry`);
      return false;
    }

    // Stop router
    router.stop();

    // Remove from registry
    this.routers.delete(routerId);

    // Update statistics
    this.statistics.totalRouters--;
    this.updateStatistics();

    console.log(`Unregistered router ${routerId} from registry ${this.config.id}`);
    return true;
  }

  /**
   * Discover membranes based on query
   */
  discoverMembranes(query: RegistryQuery = {}): MembraneDiscoveryResult {
    const startTime = Date.now();
    let filteredMembranes: MembraneRegistration[] = Array.from(this.membranes.values());

    // Apply filters
    if (query.pSystemId) {
      filteredMembranes = filteredMembranes.filter(reg => reg.pSystemId === query.pSystemId);
    }

    if (query.tags && query.tags.length > 0) {
      filteredMembranes = filteredMembranes.filter(reg =>
        query.tags!.some(tag => reg.tags.includes(tag))
      );
    }

    if (query.healthStatus && query.healthStatus.length > 0) {
      filteredMembranes = filteredMembranes.filter(reg =>
        query.healthStatus!.includes(reg.healthStatus)
      );
    }

    if (query.depthRange) {
      const [minDepth, maxDepth] = query.depthRange;
      filteredMembranes = filteredMembranes.filter(reg => {
        const depth = reg.membrane.getDepth();
        return depth >= minDepth && depth <= maxDepth;
      });
    }

    if (query.activitySince) {
      filteredMembranes = filteredMembranes.filter(reg =>
        reg.lastActivity >= query.activitySince!
      );
    }

    if (query.membraneType) {
      filteredMembranes = filteredMembranes.filter(reg =>
        reg.metadata.type === query.membraneType
      );
    }

    const totalFiltered = filteredMembranes.length;

    // Apply pagination
    if (query.offset) {
      filteredMembranes = filteredMembranes.slice(query.offset);
    }

    if (query.limit) {
      filteredMembranes = filteredMembranes.slice(0, query.limit);
    }

    const executionTime = Date.now() - startTime;

    return {
      membranes: filteredMembranes,
      totalCount: this.membranes.size,
      filteredCount: totalFiltered,
      query,
      executionTime
    };
  }

  /**
   * Get membrane by ID
   */
  getMembrane(membraneId: string): Membrane | null {
    const registration = this.membranes.get(membraneId);
    return registration?.membrane || null;
  }

  /**
   * Get membrane registration
   */
  getMembraneRegistration(membraneId: string): MembraneRegistration | null {
    return this.membranes.get(membraneId) || null;
  }

  /**
   * Get P-System by ID
   */
  getPSystem(pSystemId: string): PSystem | null {
    const registration = this.pSystems.get(pSystemId);
    return registration?.pSystem || null;
  }

  /**
   * Get port by ID
   */
  getPort(portId: string): PortChannel | null {
    return this.ports.get(portId) || null;
  }

  /**
   * Get router by ID
   */
  getRouter(routerId: string): MessageRouter | null {
    return this.routers.get(routerId) || null;
  }

  /**
   * Get all membranes
   */
  getAllMembranes(): Membrane[] {
    return Array.from(this.membranes.values()).map(reg => reg.membrane);
  }

  /**
   * Get all P-Systems
   */
  getAllPSystems(): PSystem[] {
    return Array.from(this.pSystems.values()).map(reg => reg.pSystem);
  }

  /**
   * Get registry statistics
   */
  getStatistics(): RegistryStatistics {
    this.updateStatistics();
    return { ...this.statistics };
  }

  /**
   * Get lifecycle events
   */
  getLifecycleEvents(limit?: number): MembraneLifecycleEvent[] {
    const events = [...this.lifecycleEvents];
    return limit ? events.slice(-limit) : events;
  }

  /**
   * Perform health check on all membranes
   */
  async performHealthCheck(): Promise<Map<string, string>> {
    const healthResults = new Map<string, string>();

    for (const [membraneId, registration] of this.membranes) {
      try {
        const healthStatus = registration.membrane.getHealthStatus();
        const newStatus = healthStatus.overallHealth > 0.8 ? 'healthy' :
                         healthStatus.overallHealth > 0.5 ? 'degraded' : 'unhealthy';

        if (registration.healthStatus !== newStatus) {
          const oldStatus = registration.healthStatus;
          registration.healthStatus = newStatus;

          // Log health change event
          this.logLifecycleEvent({
            type: 'health_changed',
            membraneId,
            timestamp: Date.now(),
            details: {
              oldStatus,
              newStatus,
              healthScore: healthStatus.overallHealth,
              issues: healthStatus.issues
            }
          });
        }

        healthResults.set(membraneId, newStatus);

      } catch (error) {
        registration.healthStatus = 'unknown';
        healthResults.set(membraneId, 'unknown');
        console.error(`Health check failed for membrane ${membraneId}:`, error);
      }
    }

    this.lastHealthCheck = Date.now();
    this.updateStatistics();

    return healthResults;
  }

  /**
   * Update membrane tags
   */
  updateMembraneTags(membraneId: string, tags: string[]): boolean {
    const registration = this.membranes.get(membraneId);
    if (!registration) {
      return false;
    }

    registration.tags = [...tags];
    registration.lastActivity = Date.now();
    return true;
  }

  /**
   * Update membrane metadata
   */
  updateMembraneMetadata(membraneId: string, metadata: Record<string, any>): boolean {
    const registration = this.membranes.get(membraneId);
    if (!registration) {
      return false;
    }

    registration.metadata = { ...registration.metadata, ...metadata };
    registration.lastActivity = Date.now();
    return true;
  }

  /**
   * Start registry
   */
  start(): void {
    this.isActive = true;
    this.startBackgroundTasks();
    console.log(`Membrane registry ${this.config.id} started`);
  }

  /**
   * Stop registry
   */
  stop(): void {
    this.isActive = false;
    this.stopBackgroundTasks();

    // Stop all P-Systems
    for (const registration of this.pSystems.values()) {
      registration.pSystem.stop();
    }

    // Stop all routers
    for (const router of this.routers.values()) {
      router.stop();
    }

    console.log(`Membrane registry ${this.config.id} stopped`);
  }

  // Private methods

  private startBackgroundTasks(): void {
    if (this.config.enableAutoCleanup) {
      this.cleanupInterval = setInterval(() => {
        this.performCleanup();
      }, this.config.cleanupIntervalMs);
    }

    if (this.config.enableHealthMonitoring) {
      this.healthCheckInterval = setInterval(() => {
        this.performHealthCheck();
      }, this.config.healthCheckIntervalMs);
    }
  }

  private stopBackgroundTasks(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private performCleanup(): void {
    const now = Date.now();
    const inactiveThreshold = 60 * 60 * 1000; // 1 hour

    // Clean up inactive membranes
    const inactiveMembranes: string[] = [];
    for (const [membraneId, registration] of this.membranes) {
      if (now - registration.lastActivity > inactiveThreshold && !registration.membrane.getIsActive()) {
        inactiveMembranes.push(membraneId);
      }
    }

    for (const membraneId of inactiveMembranes) {
      console.log(`Cleaning up inactive membrane: ${membraneId}`);
      this.unregisterMembrane(membraneId);
    }

    // Clean up old lifecycle events
    if (this.config.metricsRetentionMs > 0) {
      const cutoffTime = now - this.config.metricsRetentionMs;
      this.lifecycleEvents = this.lifecycleEvents.filter(event => event.timestamp > cutoffTime);
    }

    this.lastCleanup = now;
    console.log(`Registry cleanup completed: removed ${inactiveMembranes.length} inactive membranes`);
  }

  private updateStatistics(): void {
    // Count healthy/degraded/unhealthy membranes
    let healthy = 0, degraded = 0, unhealthy = 0;
    let totalDepth = 0;
    let totalConnections = 0;
    let totalMemory = 0;

    for (const registration of this.membranes.values()) {
      switch (registration.healthStatus) {
        case 'healthy': healthy++; break;
        case 'degraded': degraded++; break;
        case 'unhealthy': unhealthy++; break;
      }

      totalDepth += registration.membrane.getDepth();
      totalConnections += registration.connections.length;

      try {
        const metrics = registration.membrane.getPerformanceMetrics();
        totalMemory += metrics.memoryUsage.totalMemory;
      } catch (error) {
        // Ignore errors in metrics collection
      }
    }

    // Count active/inactive P-Systems
    let activePSystems = 0, inactivePSystems = 0;
    for (const registration of this.pSystems.values()) {
      if (registration.status === 'active') {
        activePSystems++;
      } else {
        inactivePSystems++;
      }
    }

    // Update statistics
    this.statistics = {
      ...this.statistics,
      totalMembranes: this.membranes.size,
      totalPSystems: this.pSystems.size,
      totalPorts: this.ports.size,
      totalRouters: this.routers.size,
      healthyMembranes: healthy,
      degradedMembranes: degraded,
      unhealthyMembranes: unhealthy,
      activePSystems,
      inactivePSystems,
      averageMembraneDepth: this.membranes.size > 0 ? totalDepth / this.membranes.size : 0,
      totalConnections,
      memoryUsage: totalMemory,
      uptime: Date.now() - this.creationTime
    };
  }

  private logLifecycleEvent(event: MembraneLifecycleEvent): void {
    this.lifecycleEvents.push(event);

    // Keep only recent events to prevent memory growth
    const maxEvents = 10000;
    if (this.lifecycleEvents.length > maxEvents) {
      this.lifecycleEvents.splice(0, this.lifecycleEvents.length - maxEvents);
    }
  }

  private getId(): string {
    return this.config.id;
  }
}

/**
 * Membrane registry factory
 */
export class MembraneRegistryFactory {
  /**
   * Create a basic membrane registry
   */
  static createBasicRegistry(id: string, name: string): MembraneRegistry {
    const config: MembraneRegistryConfig = {
      id,
      name,
      maxMembranes: 10000,
      maxPSystems: 100,
      enableAutoCleanup: true,
      cleanupIntervalMs: 5 * 60 * 1000, // 5 minutes
      enableHealthMonitoring: true,
      healthCheckIntervalMs: 60 * 1000, // 1 minute
      enableMetrics: true,
      metricsRetentionMs: 24 * 60 * 60 * 1000, // 24 hours
      enablePersistence: false,
      persistenceBackend: 'memory'
    };

    return new MembraneRegistry(config);
  }

  /**
   * Create a high-capacity registry
   */
  static createHighCapacityRegistry(id: string, name: string): MembraneRegistry {
    const config: MembraneRegistryConfig = {
      id,
      name,
      maxMembranes: 100000,
      maxPSystems: 1000,
      enableAutoCleanup: true,
      cleanupIntervalMs: 10 * 60 * 1000, // 10 minutes
      enableHealthMonitoring: true,
      healthCheckIntervalMs: 5 * 60 * 1000, // 5 minutes
      enableMetrics: true,
      metricsRetentionMs: 7 * 24 * 60 * 60 * 1000, // 7 days
      enablePersistence: true,
      persistenceBackend: 'database'
    };

    return new MembraneRegistry(config);
  }

  /**
   * Create a minimal registry for testing
   */
  static createTestRegistry(id: string, name: string): MembraneRegistry {
    const config: MembraneRegistryConfig = {
      id,
      name,
      maxMembranes: 100,
      maxPSystems: 10,
      enableAutoCleanup: false,
      cleanupIntervalMs: 0,
      enableHealthMonitoring: false,
      healthCheckIntervalMs: 0,
      enableMetrics: true,
      metricsRetentionMs: 60 * 60 * 1000, // 1 hour
      enablePersistence: false,
      persistenceBackend: 'memory'
    };

    return new MembraneRegistry(config);
  }
}