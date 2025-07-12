/**
 * Visualization Demo - Complete demonstration of dynamic visualization tools
 * 
 * This demo showcases all the visualization capabilities including:
 * - System state rendering
 * - Dynamic hypergraph visualization
 * - Membrane boundary display
 * - Drill-down and time-travel
 * - Real-time updates
 * - Export functionality
 * - Meta-cognitive displays
 */

import { VisualizationDashboard } from './dashboard.js';
import { 
  VisualizationConfig,
  SystemStateSnapshot,
  VisualizationNode,
  VisualizationEdge,
  MembraneVisualization,
  ExportOptions
} from './types.js';

/**
 * Main demo class that sets up and runs the visualization demonstration
 */
export class VisualizationDemo {
  private dashboard: VisualizationDashboard | null = null;
  private demoContainer: HTMLElement | null = null;
  private isRunning: boolean = false;
  private demoInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize and start the demo
   */
  public async start(containerId: string = 'visualization-demo'): Promise<void> {
    // Create or find container
    this.demoContainer = document.getElementById(containerId);
    if (!this.demoContainer) {
      this.demoContainer = document.createElement('div');
      this.demoContainer.id = containerId;
      this.demoContainer.style.width = '100vw';
      this.demoContainer.style.height = '100vh';
      document.body.appendChild(this.demoContainer);
    }

    // Configure visualization
    const config: Partial<VisualizationConfig> = {
      theme: 'dark',
      enableDrillDown: true,
      enableTimeTravel: true,
      enableExport: true,
      enableRealTime: true,
      refreshRate: 30,
      layout: {
        algorithm: 'force-directed',
        spacing: 120,
        clustering: true,
        layering: false
      }
    };

    // Create dashboard
    this.dashboard = new VisualizationDashboard(this.demoContainer, config);

    // Set up event handlers
    this.setupEventHandlers();

    // Load initial demo data
    await this.loadDemoData();

    // Start real-time simulation
    this.startSimulation();

    this.isRunning = true;
    console.log('🎨 MAD9ML Visualization Demo started!');
    console.log('💡 Try the following:');
    console.log('   - Switch between different views (System State, Hypergraph, Membranes, Meta-Cognitive)');
    console.log('   - Click on nodes to drill down into details');
    console.log('   - Use time travel controls to navigate through history');
    console.log('   - Export visualizations in different formats');
    console.log('   - Toggle real-time updates on/off');
  }

  /**
   * Stop the demo
   */
  public stop(): void {
    this.isRunning = false;
    
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }

    if (this.dashboard) {
      this.dashboard.destroy();
      this.dashboard = null;
    }

    console.log('Visualization Demo stopped');
  }

  /**
   * Set up event handlers for dashboard interactions
   */
  private setupEventHandlers(): void {
    if (!this.dashboard) return;

    // Listen for view changes
    this.dashboard.on('viewChange', (data) => {
      console.log(`🔄 Switched to ${data.viewType} view`);
    });

    // Listen for focus events
    this.dashboard.on('focus', (data) => {
      console.log(`🎯 Focused on element: ${data.nodeId}`);
    });

    // Listen for time travel events
    this.dashboard.on('timeChange', (data) => {
      console.log(`⏰ Time traveled to: ${new Date(data.timestamp).toLocaleTimeString()}`);
    });

    // Listen for state updates
    this.dashboard.on('stateUpdate', (data) => {
      console.log(`📊 System state updated: ${data.id}`);
    });

    // Listen for errors
    this.dashboard.on('error', (error) => {
      console.error('❌ Visualization error:', error);
    });
  }

  /**
   * Load initial demonstration data
   */
  private async loadDemoData(): Promise<void> {
    if (!this.dashboard) return;

    // Generate initial system state
    const systemState = this.generateSystemState();
    this.dashboard.updateSystemState(systemState);

    // Generate initial nodes
    const nodes = this.generateNodes();
    this.dashboard.updateNodes(nodes);

    // Generate initial edges
    const edges = this.generateEdges(nodes);
    this.dashboard.updateEdges(edges);

    // Generate initial membranes
    const membranes = this.generateMembranes();
    this.dashboard.updateMembranes(membranes);

    console.log('📦 Demo data loaded successfully');
  }

  /**
   * Start real-time simulation
   */
  private startSimulation(): void {
    this.demoInterval = setInterval(() => {
      if (!this.isRunning || !this.dashboard) return;

      // Randomly update different aspects
      const updateType = Math.random();

      if (updateType < 0.3) {
        // Update system state
        const systemState = this.generateSystemState();
        this.dashboard.updateSystemState(systemState);
      } else if (updateType < 0.6) {
        // Update some nodes
        const nodeUpdates = this.generateNodeUpdates();
        this.dashboard.updateNodes(nodeUpdates);
      } else if (updateType < 0.8) {
        // Update some edges
        const edgeUpdates = this.generateEdgeUpdates();
        this.dashboard.updateEdges(edgeUpdates);
      } else {
        // Update membranes
        const membraneUpdates = this.generateMembraneUpdates();
        this.dashboard.updateMembranes(membraneUpdates);
      }
    }, 2000); // Update every 2 seconds
  }

  /**
   * Generate sample system state
   */
  private generateSystemState(): SystemStateSnapshot {
    const now = new Date().toISOString();
    const randomVariation = () => 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier

    return {
      timestamp: now,
      id: `snapshot_${Date.now()}`,
      memoryUsage: {
        totalItems: Math.floor(1000 * randomVariation()),
        subsystemBreakdown: {
          declarative: Math.floor(250 * randomVariation()),
          episodic: Math.floor(300 * randomVariation()),
          procedural: Math.floor(200 * randomVariation()),
          semantic: Math.floor(350 * randomVariation())
        },
        accessPatterns: [
          {
            subsystem: 'semantic',
            frequency: 60 + Math.random() * 30,
            recentAccess: now,
            pattern: 'clustered'
          },
          {
            subsystem: 'episodic', 
            frequency: 40 + Math.random() * 20,
            recentAccess: now,
            pattern: 'sequential'
          }
        ],
        efficiency: 0.7 + Math.random() * 0.3,
        remainingCapacity: `${(70 + Math.random() * 20).toFixed(1)}%`
      },
      taskExecution: {
        scheduledTasks: Math.floor(15 * randomVariation()),
        completedTasks: Math.floor(100 * randomVariation()),
        failedTasks: Math.floor(5 * Math.random()),
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
        overall: Math.random() > 0.8 ? 'healthy' as const : 
                Math.random() > 0.6 ? 'warning' as const : 'critical' as const,
        components: {
          memory: { status: 'healthy' as const, details: 'Operating normally', metrics: {} },
          tasks: { status: 'healthy' as const, details: 'Processing efficiently', metrics: {} },
          ai: { status: 'healthy' as const, details: 'Models responsive', metrics: {} },
          autonomy: { status: 'healthy' as const, details: 'Self-optimization active', metrics: {} }
        }
      }
    };
  }

  /**
   * Generate sample nodes
   */
  private generateNodes(): VisualizationNode[] {
    const nodeTypes = ['memory', 'concept', 'agent', 'kernel'] as const;
    const nodeCount = 12;
    
    return Array.from({ length: nodeCount }, (_, i) => ({
      id: `node_${i}`,
      type: nodeTypes[i % nodeTypes.length],
      position: {
        x: 200 + (i % 4) * 150 + Math.random() * 50,
        y: 200 + Math.floor(i / 4) * 150 + Math.random() * 50,
        z: 0
      },
      size: 20 + Math.random() * 15,
      color: this.getNodeColor(nodeTypes[i % nodeTypes.length]),
      label: `${nodeTypes[i % nodeTypes.length].charAt(0).toUpperCase()}${nodeTypes[i % nodeTypes.length].slice(1)} ${i + 1}`,
      metadata: {
        created: new Date().toISOString(),
        category: nodeTypes[i % nodeTypes.length],
        importance: Math.random()
      },
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
   * Generate sample edges
   */
  private generateEdges(nodes: VisualizationNode[]): VisualizationEdge[] {
    const edgeTypes = ['semantic', 'causal', 'temporal', 'hierarchical'] as const;
    const edges: VisualizationEdge[] = [];
    
    // Create some connections between nodes
    for (let i = 0; i < nodes.length; i++) {
      const connectionsCount = 1 + Math.floor(Math.random() * 3);
      
      for (let j = 0; j < connectionsCount; j++) {
        const targetIndex = (i + 1 + j) % nodes.length;
        if (targetIndex !== i) {
          edges.push({
            id: `edge_${i}_${targetIndex}`,
            source: nodes[i].id,
            target: nodes[targetIndex].id,
            type: edgeTypes[Math.floor(Math.random() * edgeTypes.length)],
            weight: 0.3 + Math.random() * 0.7,
            color: this.getEdgeColor(edgeTypes[Math.floor(Math.random() * edgeTypes.length)]),
            metadata: {
              strength: Math.random(),
              lastActive: new Date().toISOString()
            },
            flow: Math.random() * 0.5,
            strength: Math.random(),
            lastActive: new Date().toISOString()
          });
        }
      }
    }
    
    return edges;
  }

  /**
   * Generate sample membranes
   */
  private generateMembranes(): MembraneVisualization[] {
    return [
      {
        id: 'membrane_cognitive',
        type: 'Cognitive Boundary',
        boundary: {
          permeability: 0.7,
          thickness: 3,
          pattern: 'gradient',
          color: '#4CAF50',
          activeRegions: [
            {
              position: { x: 0.2, y: 0.3, z: 0 },
              size: 0.05,
              activity: 0.8,
              type: 'input'
            },
            {
              position: { x: 0.8, y: 0.7, z: 0 },
              size: 0.07,
              activity: 0.6,
              type: 'output'
            }
          ]
        },
        ports: [
          {
            id: 'port_input_1',
            type: 'sensory',
            position: { x: 50, y: 150, z: 0 },
            status: 'active',
            direction: 'input',
            connections: [],
            throughput: 75,
            size: 12,
            color: null,
            animation: 'pulse'
          },
          {
            id: 'port_output_1', 
            type: 'motor',
            position: { x: 450, y: 250, z: 0 },
            status: 'active',
            direction: 'output',
            connections: [],
            throughput: 60,
            size: 10,
            color: null,
            animation: 'flow'
          }
        ],
        contents: [],
        nestedMembranes: [],
        position: { x: 100, y: 100, z: 0 },
        size: { x: 400, y: 300, z: 0 },
        opacity: 0.4,
        color: '#2E7D32',
        activity: 0.7,
        messageCount: 15,
        lastActivity: new Date().toISOString()
      },
      {
        id: 'membrane_executive',
        type: 'Executive Control',
        boundary: {
          permeability: 0.5,
          thickness: 4,
          pattern: 'dashed',
          color: '#FF9800',
          activeRegions: [
            {
              position: { x: 0.5, y: 0.1, z: 0 },
              size: 0.08,
              activity: 0.9,
              type: 'bidirectional'
            }
          ]
        },
        ports: [
          {
            id: 'port_control_1',
            type: 'control',
            position: { x: 300, y: 50, z: 0 },
            status: 'active',
            direction: 'bidirectional',
            connections: [],
            throughput: 85,
            size: 14,
            color: null,
            animation: 'pulse'
          }
        ],
        contents: [],
        nestedMembranes: [],
        position: { x: 250, y: 50, z: 0 },
        size: { x: 300, y: 200, z: 0 },
        opacity: 0.3,
        color: '#F57C00',
        activity: 0.85,
        messageCount: 23,
        lastActivity: new Date().toISOString()
      }
    ];
  }

  /**
   * Generate node updates for simulation
   */
  private generateNodeUpdates(): VisualizationNode[] {
    const updateCount = 2 + Math.floor(Math.random() * 3);
    const updates: VisualizationNode[] = [];
    
    for (let i = 0; i < updateCount; i++) {
      const nodeId = Math.floor(Math.random() * 12);
      const nodeTypes = ['memory', 'concept', 'agent', 'kernel'] as const;
      const type = nodeTypes[nodeId % nodeTypes.length];
      
      updates.push({
        id: `node_${nodeId}`,
        type,
        position: {
          x: 200 + (nodeId % 4) * 150 + Math.random() * 30 - 15,
          y: 200 + Math.floor(nodeId / 4) * 150 + Math.random() * 30 - 15,
          z: 0
        },
        size: 20 + Math.random() * 15,
        color: this.getNodeColor(type),
        label: `${type.charAt(0).toUpperCase()}${type.slice(1)} ${nodeId + 1}`,
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
      });
    }
    
    return updates;
  }

  /**
   * Generate edge updates for simulation
   */
  private generateEdgeUpdates(): VisualizationEdge[] {
    const updateCount = 1 + Math.floor(Math.random() * 2);
    const updates: VisualizationEdge[] = [];
    const edgeTypes = ['semantic', 'causal', 'temporal', 'hierarchical'] as const;
    
    for (let i = 0; i < updateCount; i++) {
      const sourceId = Math.floor(Math.random() * 12);
      const targetId = (sourceId + 1 + Math.floor(Math.random() * 3)) % 12;
      const type = edgeTypes[Math.floor(Math.random() * edgeTypes.length)];
      
      updates.push({
        id: `edge_${sourceId}_${targetId}`,
        source: `node_${sourceId}`,
        target: `node_${targetId}`,
        type,
        weight: 0.3 + Math.random() * 0.7,
        color: this.getEdgeColor(type),
        metadata: { lastUpdate: new Date().toISOString() },
        flow: Math.random() * 0.8,
        strength: Math.random(),
        lastActive: new Date().toISOString()
      });
    }
    
    return updates;
  }

  /**
   * Generate membrane updates for simulation
   */
  private generateMembraneUpdates(): MembraneVisualization[] {
    return [
      {
        id: 'membrane_cognitive',
        type: 'Cognitive Boundary',
        boundary: {
          permeability: 0.5 + Math.random() * 0.4,
          thickness: 3,
          pattern: 'gradient',
          color: '#4CAF50',
          activeRegions: [
            {
              position: { x: 0.2, y: 0.3, z: 0 },
              size: 0.05,
              activity: Math.random(),
              type: 'input'
            }
          ]
        },
        ports: [
          {
            id: 'port_input_1',
            type: 'sensory',
            position: { x: 50, y: 150, z: 0 },
            status: Math.random() > 0.3 ? 'active' : 'inactive',
            direction: 'input',
            connections: [],
            throughput: 50 + Math.random() * 50,
            size: 12,
            color: null,
            animation: 'pulse'
          }
        ],
        contents: [],
        nestedMembranes: [],
        position: { x: 100, y: 100, z: 0 },
        size: { x: 400, y: 300, z: 0 },
        opacity: 0.4,
        color: '#2E7D32',
        activity: Math.random(),
        messageCount: Math.floor(Math.random() * 30),
        lastActivity: new Date().toISOString()
      }
    ];
  }

  // ========== Utility Methods ==========

  private getNodeColor(type: string): string {
    const colors = {
      memory: '#4CAF50',
      concept: '#2196F3', 
      agent: '#FF9800',
      kernel: '#9C27B0'
    };
    return colors[type as keyof typeof colors] || '#757575';
  }

  private getEdgeColor(type: string): string {
    const colors = {
      semantic: '#81C784',
      causal: '#64B5F6',
      temporal: '#FFB74D', 
      hierarchical: '#BA68C8'
    };
    return colors[type as keyof typeof colors] || '#BDBDBD';
  }

  // ========== Public Demo Controls ==========

  /**
   * Export current visualization
   */
  public async exportVisualization(format: 'png' | 'svg' | 'json' = 'png'): Promise<void> {
    if (!this.dashboard) {
      console.error('Dashboard not initialized');
      return;
    }

    const options: ExportOptions = {
      format,
      quality: 1,
      includeData: true,
      includeMetadata: true,
      compression: false
    };

    try {
      const result = await this.dashboard.exportVisualization(options);
      if (result.success) {
        console.log(`✅ Exported visualization as ${format.toUpperCase()}: ${result.filename}`);
        
        // Trigger download in browser
        if (typeof window !== 'undefined') {
          const link = document.createElement('a');
          link.download = result.filename;
          link.href = result.data as string;
          link.click();
        }
      } else {
        console.error('❌ Export failed:', result.metadata.error);
      }
    } catch (error) {
      console.error('❌ Export error:', error);
    }
  }

  /**
   * Switch to specific view
   */
  public switchView(view: 'system' | 'hypergraph' | 'membrane' | 'meta'): void {
    if (this.dashboard) {
      this.dashboard.switchView(view);
      console.log(`🔄 Switched to ${view} view`);
    }
  }

  /**
   * Toggle real-time updates
   */
  public toggleRealTime(): void {
    if (this.dashboard) {
      const isEnabled = this.dashboard.getPerformanceMetrics().frameRate > 0;
      this.dashboard.setRealTimeEnabled(!isEnabled);
      console.log(`🔴 Real-time updates ${isEnabled ? 'disabled' : 'enabled'}`);
    }
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): any {
    if (this.dashboard) {
      return this.dashboard.getPerformanceMetrics();
    }
    return null;
  }

  /**
   * Add demo controls to page
   */
  public addDemoControls(): void {
    if (typeof window === 'undefined') return;

    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'demo-controls';
    controlsContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 8px;
      font-family: monospace;
      z-index: 1000;
      max-width: 300px;
    `;
    
    controlsContainer.innerHTML = `
      <h3 style="margin: 0 0 15px 0;">🎮 Demo Controls</h3>
      <button onclick="demo.switchView('system')" style="margin: 5px; padding: 8px 12px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;">System State</button>
      <button onclick="demo.switchView('hypergraph')" style="margin: 5px; padding: 8px 12px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;">Hypergraph</button>
      <button onclick="demo.switchView('membrane')" style="margin: 5px; padding: 8px 12px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;">Membranes</button>
      <button onclick="demo.switchView('meta')" style="margin: 5px; padding: 8px 12px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;">Meta-Cognitive</button>
      <br><br>
      <button onclick="demo.toggleRealTime()" style="margin: 5px; padding: 8px 12px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Toggle Real-time</button>
      <button onclick="demo.exportVisualization('png')" style="margin: 5px; padding: 8px 12px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;">Export PNG</button>
      <button onclick="demo.exportVisualization('json')" style="margin: 5px; padding: 8px 12px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer;">Export JSON</button>
      <br><br>
      <small>Click nodes for details<br>Use mouse wheel to zoom<br>Drag to pan around</small>
    `;
    
    document.body.appendChild(controlsContainer);
    
    // Make demo instance globally available
    (window as any).demo = this;
  }
}

// ========== Auto-start Demo (if in browser) ==========

/**
 * Automatically start the demo when loaded in a browser environment
 */
export function startDemo(): void {
  if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initializeDemo();
      });
    } else {
      initializeDemo();
    }
  }
}

function initializeDemo(): void {
  console.log('🚀 Starting MAD9ML Visualization Demo...');
  
  const demo = new VisualizationDemo();
  demo.start('visualization-demo').then(() => {
    demo.addDemoControls();
    console.log('✨ Demo ready! Use the controls in the top-right corner.');
  }).catch(error => {
    console.error('❌ Failed to start demo:', error);
  });
  
  // Make demo globally available for debugging
  (window as any).visualizationDemo = demo;
}

// Auto-start the demo
startDemo();