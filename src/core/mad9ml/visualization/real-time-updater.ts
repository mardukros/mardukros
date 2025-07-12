/**
 * Real-Time Updater - Manages live data updates for visualizations
 * 
 * Handles real-time data streaming, update scheduling, and performance optimization
 * for dynamic visualization updates.
 */

import { RealTimeConfig, UpdateMessage } from './types.js';

export class RealTimeUpdater {
  private config: RealTimeConfig;
  private isRunning: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private updateCallbacks: Function[] = [];
  private errorCallbacks: Function[] = [];
  private lastUpdateTime: number = 0;
  private updateCount: number = 0;
  private fps: number = 0;
  
  constructor(refreshRate: number = 60) {
    this.config = {
      enabled: true,
      updateInterval: 1000 / refreshRate,
      maxUpdatesPerSecond: refreshRate,
      adaptiveRate: true,
      priorityFilter: []
    };
  }

  /**
   * Start real-time updates
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.scheduleNextUpdate();
  }

  /**
   * Stop real-time updates
   */
  public stop(): void {
    this.isRunning = false;
    if (this.updateInterval) {
      clearTimeout(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Check if updates are running
   */
  public isRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get current FPS
   */
  public getCurrentFPS(): number {
    return this.fps;
  }

  /**
   * Set update configuration
   */
  public setConfig(config: Partial<RealTimeConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Register update callback
   */
  public onUpdate(callback: (data: any) => void): void {
    this.updateCallbacks.push(callback);
  }

  /**
   * Register error callback
   */
  public onError(callback: (error: any) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Schedule next update cycle
   */
  private scheduleNextUpdate(): void {
    if (!this.isRunning) return;
    
    const targetInterval = this.config.adaptiveRate ? 
      this.calculateAdaptiveInterval() : 
      this.config.updateInterval;
    
    this.updateInterval = setTimeout(() => {
      this.performUpdate();
    }, targetInterval);
  }

  /**
   * Perform an update cycle
   */
  private performUpdate(): void {
    try {
      const now = performance.now();
      
      // Calculate FPS
      if (this.lastUpdateTime > 0) {
        const deltaTime = now - this.lastUpdateTime;
        this.fps = 1000 / deltaTime;
      }
      
      // Generate synthetic update data (in real implementation, this would come from system)
      const updateData = this.generateUpdateData();
      
      // Notify callbacks
      this.updateCallbacks.forEach(callback => {
        try {
          callback(updateData);
        } catch (error) {
          this.notifyError({ 
            type: 'callback_error', 
            error, 
            timestamp: new Date().toISOString() 
          });
        }
      });
      
      this.lastUpdateTime = now;
      this.updateCount++;
      
      // Schedule next update
      this.scheduleNextUpdate();
      
    } catch (error) {
      this.notifyError({
        type: 'update_error',
        error,
        timestamp: new Date().toISOString()
      });
      
      // Continue updating despite errors
      this.scheduleNextUpdate();
    }
  }

  /**
   * Calculate adaptive update interval based on system performance
   */
  private calculateAdaptiveInterval(): number {
    const baseInterval = this.config.updateInterval;
    
    // Adjust based on current FPS performance
    if (this.fps < this.config.maxUpdatesPerSecond * 0.8) {
      // Running slow, increase interval
      return baseInterval * 1.2;
    } else if (this.fps > this.config.maxUpdatesPerSecond * 1.1) {
      // Running fast, decrease interval
      return baseInterval * 0.9;
    }
    
    return baseInterval;
  }

  /**
   * Generate synthetic update data for demonstration
   */
  private generateUpdateData(): any {
    const now = new Date().toISOString();
    
    return {
      timestamp: now,
      systemState: this.generateSystemStateUpdate(),
      nodes: this.generateNodeUpdates(),
      edges: this.generateEdgeUpdates(),
      membranes: this.generateMembraneUpdates(),
      events: this.generateEventUpdates()
    };
  }

  /**
   * Generate system state updates
   */
  private generateSystemStateUpdate(): any {
    return {
      id: `snapshot_${Date.now()}`,
      timestamp: new Date().toISOString(),
      memoryUsage: {
        totalItems: 1000 + Math.floor(Math.random() * 100),
        subsystemBreakdown: {
          declarative: 250 + Math.floor(Math.random() * 50),
          episodic: 300 + Math.floor(Math.random() * 50),
          procedural: 200 + Math.floor(Math.random() * 50),
          semantic: 350 + Math.floor(Math.random() * 50)
        },
        accessPatterns: [
          { subsystem: 'semantic', frequency: 60 + Math.random() * 30, recentAccess: new Date().toISOString(), pattern: 'clustered' },
          { subsystem: 'episodic', frequency: 40 + Math.random() * 20, recentAccess: new Date().toISOString(), pattern: 'sequential' }
        ],
        efficiency: 0.7 + Math.random() * 0.3,
        remainingCapacity: `${(70 + Math.random() * 20).toFixed(1)}%`
      },
      taskExecution: {
        scheduledTasks: 15 + Math.floor(Math.random() * 10),
        completedTasks: 100 + Math.floor(Math.random() * 20),
        failedTasks: Math.floor(Math.random() * 5),
        averageExecutionTime: 150 + Math.random() * 100,
        throughput: 8 + Math.random() * 4,
        priorityDistribution: {
          1: Math.floor(Math.random() * 5),
          2: Math.floor(Math.random() * 8),
          3: Math.floor(Math.random() * 10)
        }
      },
      aiActivity: {
        availableModels: ['gpt-4', 'claude-3', 'gemini-pro'],
        tokenUsage: Math.floor(Math.random() * 10000),
        averageResponseTime: 500 + Math.random() * 1000,
        successRate: 0.85 + Math.random() * 0.15,
        activeContexts: Math.floor(Math.random() * 5)
      },
      autonomyStatus: {
        selfImprovementActive: Math.random() > 0.3,
        improvementsImplemented: Math.floor(Math.random() * 50),
        lastImprovement: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        detectedPatterns: Math.floor(Math.random() * 20),
        optimizationCycles: Math.floor(Math.random() * 100)
      },
      metaCognitive: {
        reflectionDepth: Math.random(),
        awarenessLevel: Math.random(),
        selfMonitoringActive: Math.random() > 0.4,
        cognitiveLoad: Math.random(),
        adaptationRate: Math.random()
      },
      health: {
        overall: Math.random() > 0.8 ? 'healthy' : Math.random() > 0.6 ? 'warning' : 'critical',
        components: {
          memory: { status: 'healthy', details: 'Operating normally', metrics: {} },
          tasks: { status: 'healthy', details: 'Processing efficiently', metrics: {} },
          ai: { status: 'healthy', details: 'Models responsive', metrics: {} },
          autonomy: { status: 'healthy', details: 'Self-optimization active', metrics: {} }
        }
      }
    };
  }

  /**
   * Generate node updates
   */
  private generateNodeUpdates(): any[] {
    const nodeCount = 3 + Math.floor(Math.random() * 5);
    return Array.from({ length: nodeCount }, (_, i) => ({
      id: `node_${i}`,
      type: ['memory', 'concept', 'agent', 'kernel'][Math.floor(Math.random() * 4)],
      position: {
        x: Math.random() * 800,
        y: Math.random() * 600,
        z: 0
      },
      size: 15 + Math.random() * 10,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      label: `Node ${i}`,
      metadata: { lastUpdate: new Date().toISOString() },
      state: {
        shape: [4, 4],
        data: Array.from({ length: 16 }, () => Math.random() * 2 - 1),
        visualization: 'heatmap',
        summary: {
          mean: Math.random() * 2 - 1,
          std: Math.random(),
          min: -1,
          max: 1
        }
      },
      activation: Math.random(),
      lastUpdated: new Date().toISOString()
    }));
  }

  /**
   * Generate edge updates
   */
  private generateEdgeUpdates(): any[] {
    const edgeCount = 2 + Math.floor(Math.random() * 4);
    return Array.from({ length: edgeCount }, (_, i) => ({
      id: `edge_${i}`,
      source: `node_${Math.floor(Math.random() * 5)}`,
      target: `node_${Math.floor(Math.random() * 5)}`,
      type: ['semantic', 'causal', 'temporal', 'hierarchical'][Math.floor(Math.random() * 4)],
      weight: Math.random(),
      color: `hsl(${Math.random() * 360}, 60%, 60%)`,
      metadata: { strength: Math.random() },
      flow: Math.random() * 0.5,
      strength: Math.random(),
      lastActive: new Date().toISOString()
    }));
  }

  /**
   * Generate membrane updates
   */
  private generateMembraneUpdates(): any[] {
    const membraneCount = 1 + Math.floor(Math.random() * 3);
    return Array.from({ length: membraneCount }, (_, i) => ({
      id: `membrane_${i}`,
      type: `Type${i + 1}`,
      boundary: {
        permeability: Math.random(),
        thickness: 2 + Math.random() * 3,
        pattern: 'solid',
        color: `hsl(${Math.random() * 360}, 50%, 40%)`,
        activeRegions: [
          {
            position: { x: Math.random(), y: Math.random(), z: 0 },
            size: Math.random() * 0.1,
            activity: Math.random(),
            type: 'bidirectional'
          }
        ]
      },
      ports: Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, j) => ({
        id: `port_${i}_${j}`,
        type: 'data',
        position: { x: Math.random() * 200, y: Math.random() * 200, z: 0 },
        status: Math.random() > 0.3 ? 'active' : 'inactive',
        direction: ['input', 'output', 'bidirectional'][Math.floor(Math.random() * 3)],
        connections: [],
        throughput: Math.random() * 100,
        size: 8,
        color: null,
        animation: 'pulse'
      })),
      contents: [],
      nestedMembranes: [],
      position: { x: 100 + i * 150, y: 100 + i * 100, z: 0 },
      size: { x: 120, y: 100, z: 0 },
      opacity: 0.7,
      color: `hsl(${Math.random() * 360}, 30%, 30%)`,
      activity: Math.random(),
      messageCount: Math.floor(Math.random() * 20),
      lastActivity: new Date().toISOString()
    }));
  }

  /**
   * Generate event updates
   */
  private generateEventUpdates(): any[] {
    if (Math.random() < 0.7) return []; // Don't always generate events
    
    const eventTypes = ['memory_update', 'task_execution', 'ai_interaction', 'system_event'];
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    return [{
      timestamp: new Date().toISOString(),
      type: eventType,
      description: `Random ${eventType} event`,
      affected: [`component_${Math.floor(Math.random() * 5)}`],
      data: { random: Math.random() },
      importance: Math.random()
    }];
  }

  /**
   * Notify error callbacks
   */
  private notifyError(error: any): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  /**
   * Get performance statistics
   */
  public getPerformanceStats(): any {
    return {
      isRunning: this.isRunning,
      currentFPS: this.fps,
      targetFPS: this.config.maxUpdatesPerSecond,
      updateCount: this.updateCount,
      lastUpdateTime: this.lastUpdateTime,
      adaptiveRate: this.config.adaptiveRate,
      currentInterval: this.config.adaptiveRate ? this.calculateAdaptiveInterval() : this.config.updateInterval
    };
  }

  /**
   * Reset performance counters
   */
  public resetStats(): void {
    this.updateCount = 0;
    this.lastUpdateTime = 0;
    this.fps = 0;
  }
}