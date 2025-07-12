/**
 * Visualization Dashboard - Main orchestrator for dynamic system visualization
 * 
 * The central component that coordinates all visualization subsystems and provides
 * a unified interface for displaying system state, hypergraphs, and membranes.
 */

import {
  VisualizationConfig,
  SystemStateSnapshot,
  VisualizationNode,
  VisualizationEdge,
  MembraneVisualization,
  RealTimeConfig,
  TimeTravelState,
  DrillDownContext,
  ExportOptions,
  ExportResult,
  PerformanceMetrics,
  VisualizationError
} from './types.js';

import { SystemStateRenderer } from './system-state-renderer.js';
import { HypergraphRenderer } from './hypergraph-renderer.js';
import { MembraneRenderer } from './membrane-renderer.js';
import { DrillDownController } from './drill-down-controller.js';
import { TimeTravelEngine } from './time-travel-engine.js';
import { ExportManager } from './export-manager.js';
import { RealTimeUpdater } from './real-time-updater.js';
import { MetaCognitiveDisplay } from './meta-cognitive-display.js';

/**
 * Main Visualization Dashboard
 * 
 * Orchestrates all visualization components and provides a unified API
 * for dynamic system state visualization with interactive capabilities.
 */
export class VisualizationDashboard {
  private config: VisualizationConfig;
  private container: HTMLElement;
  
  // Core renderers
  private systemStateRenderer: SystemStateRenderer;
  private hypergraphRenderer: HypergraphRenderer;
  private membraneRenderer: MembraneRenderer;
  private metaCognitiveDisplay: MetaCognitiveDisplay;
  
  // Interactive controllers
  private drillDownController: DrillDownController;
  private timeTravelEngine: TimeTravelEngine;
  private exportManager: ExportManager;
  private realTimeUpdater: RealTimeUpdater;
  
  // State management
  private currentSnapshot: SystemStateSnapshot | null = null;
  private nodes: Map<string, VisualizationNode> = new Map();
  private edges: Map<string, VisualizationEdge> = new Map();
  private membranes: Map<string, MembraneVisualization> = new Map();
  
  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map();
  
  constructor(container: HTMLElement, config: Partial<VisualizationConfig> = {}) {
    this.container = container;
    this.config = this.mergeWithDefaults(config);
    
    this.initializeComponents();
    this.setupEventHandlers();
    this.createLayout();
  }

  /**
   * Initialize all visualization components
   */
  private initializeComponents(): void {
    // Create core renderers
    this.systemStateRenderer = new SystemStateRenderer(this.config);
    this.hypergraphRenderer = new HypergraphRenderer(this.config);
    this.membraneRenderer = new MembraneRenderer(this.config);
    this.metaCognitiveDisplay = new MetaCognitiveDisplay(this.config);
    
    // Create interactive controllers
    this.drillDownController = new DrillDownController();
    this.timeTravelEngine = new TimeTravelEngine();
    this.exportManager = new ExportManager();
    
    if (this.config.enableRealTime) {
      this.realTimeUpdater = new RealTimeUpdater(this.config.refreshRate);
      this.realTimeUpdater.onUpdate((data) => this.handleRealTimeUpdate(data));
    }
  }

  /**
   * Set up event handling for interactive features
   */
  private setupEventHandlers(): void {
    // Drill-down events
    this.drillDownController.onFocus((nodeId) => {
      this.focusOnNode(nodeId);
      this.emit('focus', { nodeId });
    });
    
    // Time travel events
    this.timeTravelEngine.onTimeChange((timestamp) => {
      this.loadSnapshotAtTime(timestamp);
      this.emit('timeChange', { timestamp });
    });
    
    // Real-time update events
    if (this.realTimeUpdater) {
      this.realTimeUpdater.onError((error) => {
        this.handleError(error);
      });
    }
  }

  /**
   * Create the initial dashboard layout
   */
  private createLayout(): void {
    this.container.innerHTML = `
      <div class="visualization-dashboard" data-theme="${this.config.theme}">
        <div class="dashboard-header">
          <div class="controls">
            <div class="view-controls">
              <button id="system-view" class="view-btn active">System State</button>
              <button id="hypergraph-view" class="view-btn">Hypergraph</button>
              <button id="membrane-view" class="view-btn">Membranes</button>
              <button id="meta-view" class="view-btn">Meta-Cognitive</button>
            </div>
            
            <div class="interaction-controls">
              ${this.config.enableTimeTravel ? `
                <div class="time-travel-controls">
                  <button id="time-play">⏵</button>
                  <input type="range" id="time-slider" min="0" max="100" value="100">
                  <span id="time-display">Current</span>
                </div>
              ` : ''}
              
              ${this.config.enableExport ? `
                <button id="export-btn" class="control-btn">📥 Export</button>
              ` : ''}
              
              ${this.config.enableRealTime ? `
                <button id="realtime-toggle" class="control-btn active">🔴 Live</button>
              ` : ''}
            </div>
          </div>
          
          <div class="status-bar">
            <span id="node-count">Nodes: 0</span>
            <span id="edge-count">Edges: 0</span>
            <span id="fps-counter">FPS: 0</span>
            <span id="last-update">Updated: Never</span>
          </div>
        </div>
        
        <div class="dashboard-content">
          <div class="main-visualization">
            <canvas id="main-canvas"></canvas>
            <div id="overlay-info" class="overlay-info"></div>
          </div>
          
          ${this.config.enableDrillDown ? `
            <div class="detail-panel" id="detail-panel">
              <div class="detail-header">
                <h3>Details</h3>
                <div class="breadcrumb" id="breadcrumb"></div>
              </div>
              <div class="detail-content" id="detail-content">
                <p>Select an element to view details</p>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
    
    this.setupInteractivity();
    this.applyStyles();
  }

  /**
   * Set up interactive elements
   */
  private setupInteractivity(): void {
    // View switching
    const viewButtons = this.container.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const viewType = target.id.replace('-view', '');
        this.switchView(viewType);
        
        // Update active state
        viewButtons.forEach(b => b.classList.remove('active'));
        target.classList.add('active');
      });
    });
    
    // Time travel controls
    if (this.config.enableTimeTravel) {
      const timeSlider = this.container.querySelector('#time-slider') as HTMLInputElement;
      const playButton = this.container.querySelector('#time-play') as HTMLButtonElement;
      
      timeSlider?.addEventListener('input', (e) => {
        const value = parseInt((e.target as HTMLInputElement).value);
        this.timeTravelEngine.seekToPercent(value / 100);
      });
      
      playButton?.addEventListener('click', () => {
        this.timeTravelEngine.togglePlayback();
        playButton.textContent = this.timeTravelEngine.isPlaying() ? '⏸' : '⏵';
      });
    }
    
    // Export functionality
    const exportBtn = this.container.querySelector('#export-btn');
    exportBtn?.addEventListener('click', () => {
      this.showExportDialog();
    });
    
    // Real-time toggle
    const realtimeToggle = this.container.querySelector('#realtime-toggle');
    realtimeToggle?.addEventListener('click', () => {
      this.toggleRealTime();
    });
    
    // Canvas interaction
    const canvas = this.container.querySelector('#main-canvas') as HTMLCanvasElement;
    this.setupCanvasInteraction(canvas);
  }

  /**
   * Apply CSS styles for the dashboard
   */
  private applyStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .visualization-dashboard {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: var(--bg-primary);
        color: var(--text-primary);
      }
      
      .visualization-dashboard[data-theme="dark"] {
        --bg-primary: #1a1a1a;
        --bg-secondary: #2d2d2d;
        --text-primary: #ffffff;
        --text-secondary: #cccccc;
        --accent: #007acc;
        --border: #444444;
      }
      
      .visualization-dashboard[data-theme="light"] {
        --bg-primary: #ffffff;
        --bg-secondary: #f5f5f5;
        --text-primary: #333333;
        --text-secondary: #666666;
        --accent: #007acc;
        --border: #dddddd;
      }
      
      .dashboard-header {
        background: var(--bg-secondary);
        border-bottom: 1px solid var(--border);
        padding: 12px 16px;
      }
      
      .controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .view-controls {
        display: flex;
        gap: 8px;
      }
      
      .view-btn {
        padding: 8px 16px;
        border: 1px solid var(--border);
        background: var(--bg-primary);
        color: var(--text-primary);
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      
      .view-btn:hover {
        background: var(--accent);
        color: white;
      }
      
      .view-btn.active {
        background: var(--accent);
        color: white;
      }
      
      .interaction-controls {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      
      .time-travel-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .control-btn {
        padding: 6px 12px;
        border: 1px solid var(--border);
        background: var(--bg-primary);
        color: var(--text-primary);
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .control-btn.active {
        background: var(--accent);
        color: white;
      }
      
      .status-bar {
        display: flex;
        gap: 24px;
        font-size: 12px;
        color: var(--text-secondary);
      }
      
      .dashboard-content {
        flex: 1;
        display: flex;
        overflow: hidden;
      }
      
      .main-visualization {
        flex: 1;
        position: relative;
        background: var(--bg-primary);
      }
      
      #main-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
      
      .overlay-info {
        position: absolute;
        top: 16px;
        left: 16px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
      }
      
      .overlay-info.visible {
        opacity: 1;
      }
      
      .detail-panel {
        width: 300px;
        background: var(--bg-secondary);
        border-left: 1px solid var(--border);
        display: flex;
        flex-direction: column;
      }
      
      .detail-header {
        padding: 16px;
        border-bottom: 1px solid var(--border);
      }
      
      .detail-header h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
      }
      
      .breadcrumb {
        font-size: 12px;
        color: var(--text-secondary);
      }
      
      .detail-content {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
      }
    `;
    
    if (!document.querySelector('#visualization-dashboard-styles')) {
      style.id = 'visualization-dashboard-styles';
      document.head.appendChild(style);
    }
  }

  /**
   * Set up canvas interaction handling
   */
  private setupCanvasInteraction(canvas: HTMLCanvasElement): void {
    let isDragging = false;
    let lastMousePos = { x: 0, y: 0 };
    
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastMousePos = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        
        this.hypergraphRenderer.pan(deltaX, deltaY);
        lastMousePos = { x: e.clientX, y: e.clientY };
      } else {
        // Handle hover
        const element = this.getElementAtPosition(e.offsetX, e.offsetY);
        this.showHoverInfo(element, e.offsetX, e.offsetY);
      }
    });
    
    canvas.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    canvas.addEventListener('click', (e) => {
      const element = this.getElementAtPosition(e.offsetX, e.offsetY);
      if (element && this.config.enableDrillDown) {
        this.drillDownController.focus(element.id);
      }
    });
    
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      this.hypergraphRenderer.zoom(scaleFactor);
    });
  }

  // ========== Public API Methods ==========

  /**
   * Update the visualization with new system state
   */
  public updateSystemState(snapshot: SystemStateSnapshot): void {
    this.currentSnapshot = snapshot;
    
    if (this.timeTravelEngine) {
      this.timeTravelEngine.addSnapshot(snapshot);
    }
    
    this.render();
    this.updateStatusBar();
    this.emit('stateUpdate', snapshot);
  }

  /**
   * Add or update nodes in the visualization
   */
  public updateNodes(nodes: VisualizationNode[]): void {
    nodes.forEach(node => {
      this.nodes.set(node.id, node);
    });
    
    this.render();
    this.emit('nodesUpdate', nodes);
  }

  /**
   * Add or update edges in the visualization
   */
  public updateEdges(edges: VisualizationEdge[]): void {
    edges.forEach(edge => {
      this.edges.set(edge.id, edge);
    });
    
    this.render();
    this.emit('edgesUpdate', edges);
  }

  /**
   * Add or update membrane visualizations
   */
  public updateMembranes(membranes: MembraneVisualization[]): void {
    membranes.forEach(membrane => {
      this.membranes.set(membrane.id, membrane);
    });
    
    this.render();
    this.emit('membranesUpdate', membranes);
  }

  /**
   * Switch between different visualization views
   */
  public switchView(viewType: string): void {
    const canvas = this.container.querySelector('#main-canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    switch (viewType) {
      case 'system':
        if (this.currentSnapshot) {
          this.systemStateRenderer.render(ctx, this.currentSnapshot);
        }
        break;
        
      case 'hypergraph':
        this.hypergraphRenderer.render(ctx, Array.from(this.nodes.values()), Array.from(this.edges.values()));
        break;
        
      case 'membrane':
        this.membraneRenderer.render(ctx, Array.from(this.membranes.values()));
        break;
        
      case 'meta':
        if (this.currentSnapshot) {
          this.metaCognitiveDisplay.render(ctx, this.currentSnapshot.metaCognitive);
        }
        break;
    }
    
    this.emit('viewChange', { viewType });
  }

  /**
   * Export current visualization
   */
  public async exportVisualization(options: ExportOptions): Promise<ExportResult> {
    const canvas = this.container.querySelector('#main-canvas') as HTMLCanvasElement;
    return await this.exportManager.export(canvas, options);
  }

  /**
   * Enable or disable real-time updates
   */
  public setRealTimeEnabled(enabled: boolean): void {
    if (enabled && !this.realTimeUpdater) {
      this.realTimeUpdater = new RealTimeUpdater(this.config.refreshRate);
      this.realTimeUpdater.onUpdate((data) => this.handleRealTimeUpdate(data));
    }
    
    if (this.realTimeUpdater) {
      if (enabled) {
        this.realTimeUpdater.start();
      } else {
        this.realTimeUpdater.stop();
      }
    }
    
    // Update UI
    const toggle = this.container.querySelector('#realtime-toggle');
    if (toggle) {
      toggle.classList.toggle('active', enabled);
    }
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): PerformanceMetrics {
    return {
      renderTime: this.hypergraphRenderer.getLastRenderTime(),
      frameRate: this.realTimeUpdater?.getCurrentFPS() || 0,
      memoryUsage: this.getMemoryUsage(),
      nodeCount: this.nodes.size,
      edgeCount: this.edges.size,
      lastUpdate: this.currentSnapshot?.timestamp || 'Never'
    };
  }

  // ========== Private Helper Methods ==========

  private mergeWithDefaults(config: Partial<VisualizationConfig>): VisualizationConfig {
    return {
      theme: 'dark',
      colorScheme: {
        memoryNode: '#4CAF50',
        conceptNode: '#2196F3',
        agentNode: '#FF9800',
        kernelNode: '#9C27B0',
        semanticEdge: '#81C784',
        causalEdge: '#64B5F6',
        temporalEdge: '#FFB74D',
        hierarchicalEdge: '#BA68C8',
        membrane: '#37474F',
        membraneBoundary: '#546E7A',
        activePort: '#4CAF50',
        inactivePort: '#757575',
        healthy: '#4CAF50',
        warning: '#FF9800',
        critical: '#F44336',
        unknown: '#9E9E9E'
      },
      layout: {
        algorithm: 'force-directed',
        spacing: 100,
        clustering: true,
        layering: false
      },
      maxNodes: 1000,
      maxEdges: 2000,
      refreshRate: 60,
      enableDrillDown: true,
      enableTimeTravel: true,
      enableExport: true,
      enableRealTime: true,
      ...config
    };
  }

  private render(): void {
    // Main rendering will be delegated to specific renderers
    const activeView = this.container.querySelector('.view-btn.active')?.id.replace('-view', '') || 'system';
    this.switchView(activeView);
  }

  private updateStatusBar(): void {
    const nodeCountEl = this.container.querySelector('#node-count');
    const edgeCountEl = this.container.querySelector('#edge-count');
    const lastUpdateEl = this.container.querySelector('#last-update');
    
    if (nodeCountEl) nodeCountEl.textContent = `Nodes: ${this.nodes.size}`;
    if (edgeCountEl) edgeCountEl.textContent = `Edges: ${this.edges.size}`;
    if (lastUpdateEl) lastUpdateEl.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
  }

  private handleRealTimeUpdate(data: any): void {
    // Process real-time updates based on data type
    if (data.nodes) this.updateNodes(data.nodes);
    if (data.edges) this.updateEdges(data.edges);
    if (data.membranes) this.updateMembranes(data.membranes);
    if (data.systemState) this.updateSystemState(data.systemState);
  }

  private focusOnNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      this.hypergraphRenderer.focusOnNode(node);
      this.showNodeDetails(node);
    }
  }

  private showNodeDetails(node: VisualizationNode): void {
    const detailContent = this.container.querySelector('#detail-content');
    if (detailContent) {
      detailContent.innerHTML = `
        <h4>${node.label}</h4>
        <p><strong>Type:</strong> ${node.type}</p>
        <p><strong>ID:</strong> ${node.id}</p>
        <p><strong>Activation:</strong> ${(node.activation * 100).toFixed(1)}%</p>
        <p><strong>Last Updated:</strong> ${new Date(node.lastUpdated).toLocaleString()}</p>
        
        ${node.state ? `
          <h5>State Information</h5>
          <p><strong>Shape:</strong> [${node.state.shape.join(', ')}]</p>
          <p><strong>Mean:</strong> ${node.state.summary.mean.toFixed(4)}</p>
          <p><strong>Std:</strong> ${node.state.summary.std.toFixed(4)}</p>
          <p><strong>Range:</strong> ${node.state.summary.min.toFixed(4)} - ${node.state.summary.max.toFixed(4)}</p>
        ` : ''}
        
        ${Object.keys(node.metadata).length > 0 ? `
          <h5>Metadata</h5>
          <pre>${JSON.stringify(node.metadata, null, 2)}</pre>
        ` : ''}
      `;
    }
  }

  private getElementAtPosition(x: number, y: number): VisualizationNode | VisualizationEdge | null {
    // This would involve hit-testing logic
    // For now, return null
    return null;
  }

  private showHoverInfo(element: any, x: number, y: number): void {
    const overlay = this.container.querySelector('#overlay-info') as HTMLElement;
    if (element && overlay) {
      overlay.innerHTML = `
        <strong>${element.label || element.id}</strong><br>
        Type: ${element.type}<br>
        ${element.activation !== undefined ? `Activation: ${(element.activation * 100).toFixed(1)}%` : ''}
      `;
      overlay.style.left = `${x + 10}px`;
      overlay.style.top = `${y - 10}px`;
      overlay.classList.add('visible');
    } else if (overlay) {
      overlay.classList.remove('visible');
    }
  }

  private loadSnapshotAtTime(timestamp: string): void {
    const snapshot = this.timeTravelEngine.getSnapshotAtTime(timestamp);
    if (snapshot) {
      this.updateSystemState(snapshot);
    }
  }

  private toggleRealTime(): void {
    const isEnabled = this.realTimeUpdater?.isRunning() || false;
    this.setRealTimeEnabled(!isEnabled);
  }

  private showExportDialog(): void {
    // This would show a modal dialog for export options
    // For now, just export as PNG
    this.exportVisualization({
      format: 'png',
      quality: 1,
      includeData: false,
      includeMetadata: true,
      compression: false
    }).then(result => {
      if (result.success) {
        // Trigger download
        const link = document.createElement('a');
        link.download = result.filename;
        link.href = result.data as string;
        link.click();
      }
    });
  }

  private getMemoryUsage(): number {
    // Estimate memory usage of visualization data
    return (this.nodes.size + this.edges.size + this.membranes.size) * 1024; // Rough estimate
  }

  private handleError(error: VisualizationError): void {
    console.error('Visualization Error:', error);
    this.emit('error', error);
  }

  // ========== Event System ==========

  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // ========== Cleanup ==========

  public destroy(): void {
    this.realTimeUpdater?.stop();
    this.eventListeners.clear();
    this.container.innerHTML = '';
  }
}