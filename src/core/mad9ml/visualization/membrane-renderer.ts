/**
 * Membrane Renderer - Visualizes membrane boundaries and port channels
 * 
 * Renders dynamic visualizations of P-System inspired membranes with
 * boundaries, ports, and nested membrane structures.
 */

import {
  VisualizationConfig,
  MembraneVisualization,
  MembraneBoundaryVisualization,
  PortVisualization,
  Point3D
} from './types.js';

interface MembraneRenderState {
  boundaryAnimations: Map<string, number>;
  portActivities: Map<string, number>;
  messageFlows: Map<string, Array<{ x: number, y: number, progress: number }>>;
  lastUpdateTime: number;
}

export class MembraneRenderer {
  private config: VisualizationConfig;
  private renderState: MembraneRenderState;
  
  constructor(config: VisualizationConfig) {
    this.config = config;
    this.renderState = {
      boundaryAnimations: new Map(),
      portActivities: new Map(),
      messageFlows: new Map(),
      lastUpdateTime: Date.now()
    };
  }

  /**
   * Render all membrane visualizations
   */
  public render(ctx: CanvasRenderingContext2D, membranes: MembraneVisualization[]): void {
    // Sort membranes by depth (render deeper membranes first)
    const sortedMembranes = this.sortMembranesByDepth(membranes);
    
    // Update animations
    this.updateAnimations();
    
    // Render each membrane
    sortedMembranes.forEach(membrane => {
      this.renderMembrane(ctx, membrane);
    });
    
    // Render global message flows
    this.renderGlobalMessageFlows(ctx, membranes);
  }

  /**
   * Sort membranes by nesting depth (deepest first)
   */
  private sortMembranesByDepth(membranes: MembraneVisualization[]): MembraneVisualization[] {
    const depthMap = new Map<string, number>();
    
    // Calculate depth for each membrane
    const calculateDepth = (membrane: MembraneVisualization, currentDepth = 0): void => {
      depthMap.set(membrane.id, currentDepth);
      membrane.nestedMembranes.forEach(nested => {
        calculateDepth(nested, currentDepth + 1);
      });
    };
    
    membranes.forEach(membrane => calculateDepth(membrane));
    
    // Sort by depth (deepest first)
    return membranes.sort((a, b) => (depthMap.get(b.id) || 0) - (depthMap.get(a.id) || 0));
  }

  /**
   * Render a single membrane
   */
  private renderMembrane(ctx: CanvasRenderingContext2D, membrane: MembraneVisualization): void {
    // Render membrane background
    this.renderMembraneBackground(ctx, membrane);
    
    // Render membrane boundary
    this.renderMembraneBoundary(ctx, membrane.boundary, membrane.position, membrane.size);
    
    // Render ports
    membrane.ports.forEach(port => {
      this.renderPort(ctx, port, membrane);
    });
    
    // Render contents (nodes inside the membrane)
    this.renderMembraneContents(ctx, membrane);
    
    // Render nested membranes
    membrane.nestedMembranes.forEach(nested => {
      this.renderMembrane(ctx, nested);
    });
    
    // Render membrane label and status
    this.renderMembraneLabel(ctx, membrane);
    
    // Render activity indicators
    this.renderActivityIndicators(ctx, membrane);
  }

  /**
   * Render membrane background
   */
  private renderMembraneBackground(ctx: CanvasRenderingContext2D, membrane: MembraneVisualization): void {
    const { position, size, opacity, color } = membrane;
    
    // Set opacity
    ctx.globalAlpha = opacity * 0.3;
    
    // Fill background
    ctx.fillStyle = color || this.config.colorScheme.membrane;
    ctx.fillRect(position.x, position.y, size.x, size.y);
    
    // Add gradient for depth perception
    const gradient = ctx.createRadialGradient(
      position.x + size.x / 2, position.y + size.y / 2, 0,
      position.x + size.x / 2, position.y + size.y / 2, Math.max(size.x, size.y) / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(position.x, position.y, size.x, size.y);
    
    ctx.globalAlpha = 1;
  }

  /**
   * Render membrane boundary
   */
  private renderMembraneBoundary(ctx: CanvasRenderingContext2D, boundary: MembraneBoundaryVisualization, position: Point3D, size: Point3D): void {
    const { permeability, thickness, pattern, color, activeRegions } = boundary;
    
    // Set boundary style
    ctx.strokeStyle = color || this.config.colorScheme.membraneBoundary;
    ctx.lineWidth = thickness;
    
    // Apply pattern
    switch (pattern) {
      case 'dashed':
        ctx.setLineDash([10, 5]);
        break;
      case 'dotted':
        ctx.setLineDash([2, 3]);
        break;
      case 'gradient':
        // Create gradient stroke
        const gradient = ctx.createLinearGradient(position.x, position.y, position.x + size.x, position.y + size.y);
        gradient.addColorStop(0, color || this.config.colorScheme.membraneBoundary);
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, color || this.config.colorScheme.membraneBoundary);
        ctx.strokeStyle = gradient;
        break;
      default:
        ctx.setLineDash([]);
        break;
    }
    
    // Draw boundary rectangle
    ctx.strokeRect(position.x, position.y, size.x, size.y);
    
    // Render active regions
    activeRegions.forEach(region => {
      this.renderBoundaryRegion(ctx, region, position, size);
    });
    
    // Add permeability visualization
    this.renderPermeabilityIndicators(ctx, boundary, position, size);
    
    // Reset line dash
    ctx.setLineDash([]);
  }

  /**
   * Render active boundary regions
   */
  private renderBoundaryRegion(ctx: CanvasRenderingContext2D, region: any, membranePos: Point3D, membraneSize: Point3D): void {
    const { position, size, activity, type } = region;
    
    // Calculate absolute position
    const absX = membranePos.x + position.x * membraneSize.x;
    const absY = membranePos.y + position.y * membraneSize.y;
    
    // Set color based on region type
    let regionColor;
    switch (type) {
      case 'input':
        regionColor = this.config.colorScheme.healthy;
        break;
      case 'output':
        regionColor = this.config.colorScheme.warning;
        break;
      case 'bidirectional':
        regionColor = this.config.colorScheme.critical;
        break;
      default:
        regionColor = this.config.colorScheme.unknown;
    }
    
    // Animate based on activity
    const pulseIntensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.01 * activity);
    ctx.globalAlpha = 0.3 + 0.4 * pulseIntensity;
    
    // Draw region
    ctx.fillStyle = regionColor;
    ctx.beginPath();
    ctx.arc(absX, absY, size * 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw activity ring
    ctx.strokeStyle = regionColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(absX, absY, size * 8, 0, 2 * Math.PI);
    ctx.stroke();
    
    ctx.globalAlpha = 1;
  }

  /**
   * Render permeability indicators along the boundary
   */
  private renderPermeabilityIndicators(ctx: CanvasRenderingContext2D, boundary: MembraneBoundaryVisualization, position: Point3D, size: Point3D): void {
    const { permeability } = boundary;
    const indicatorCount = Math.floor(permeability * 20);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    
    // Top edge
    for (let i = 0; i < indicatorCount; i++) {
      const x = position.x + (i / indicatorCount) * size.x;
      const y = position.y;
      ctx.fillRect(x, y - 2, 3, 4);
    }
    
    // Right edge
    for (let i = 0; i < indicatorCount; i++) {
      const x = position.x + size.x;
      const y = position.y + (i / indicatorCount) * size.y;
      ctx.fillRect(x - 2, y, 4, 3);
    }
    
    // Bottom edge
    for (let i = 0; i < indicatorCount; i++) {
      const x = position.x + size.x - (i / indicatorCount) * size.x;
      const y = position.y + size.y;
      ctx.fillRect(x, y - 2, 3, 4);
    }
    
    // Left edge
    for (let i = 0; i < indicatorCount; i++) {
      const x = position.x;
      const y = position.y + size.y - (i / indicatorCount) * size.y;
      ctx.fillRect(x - 2, y, 4, 3);
    }
  }

  /**
   * Render membrane contents (nodes)
   */
  private renderMembraneContents(ctx: CanvasRenderingContext2D, membrane: MembraneVisualization): void {
    if (membrane.contents.length === 0) return;
    
    // Render contained nodes with a subtle overlay to show they're inside
    ctx.globalAlpha = 0.8;
    
    membrane.contents.forEach(node => {
      // Simple node representation
      ctx.fillStyle = this.getNodeColorByType(node.type);
      ctx.beginPath();
      ctx.arc(node.position.x, node.position.y, node.size || 8, 0, 2 * Math.PI);
      ctx.fill();
      
      // Node label
      if (node.label) {
        ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.position.x, node.position.y + 15);
      }
    });
    
    ctx.globalAlpha = 1;
  }

  /**
   * Render a port
   */
  private renderPort(ctx: CanvasRenderingContext2D, port: PortVisualization, membrane: MembraneVisualization): void {
    const { position, status, direction, throughput, size, color, animation } = port;
    
    // Calculate absolute position
    const absX = membrane.position.x + position.x;
    const absY = membrane.position.y + position.y;
    
    // Set port color based on status
    let portColor = color;
    if (!portColor) {
      switch (status) {
        case 'active':
          portColor = this.config.colorScheme.activePort;
          break;
        case 'blocked':
          portColor = this.config.colorScheme.critical;
          break;
        default:
          portColor = this.config.colorScheme.inactivePort;
      }
    }
    
    // Apply animation
    let animationScale = 1;
    if (animation === 'pulse' && status === 'active') {
      animationScale = 1 + 0.3 * Math.sin(Date.now() * 0.01);
    }
    
    const renderSize = (size || 8) * animationScale;
    
    // Render port shape based on direction
    ctx.fillStyle = portColor;
    ctx.strokeStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
    ctx.lineWidth = 1;
    
    switch (direction) {
      case 'input':
        // Triangle pointing inward
        ctx.beginPath();
        ctx.moveTo(absX - renderSize, absY - renderSize / 2);
        ctx.lineTo(absX - renderSize, absY + renderSize / 2);
        ctx.lineTo(absX, absY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'output':
        // Triangle pointing outward
        ctx.beginPath();
        ctx.moveTo(absX, absY - renderSize / 2);
        ctx.lineTo(absX, absY + renderSize / 2);
        ctx.lineTo(absX + renderSize, absY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'bidirectional':
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(absX, absY - renderSize);
        ctx.lineTo(absX + renderSize, absY);
        ctx.lineTo(absX, absY + renderSize);
        ctx.lineTo(absX - renderSize, absY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
    }
    
    // Render throughput indicator
    if (throughput > 0) {
      this.renderThroughputIndicator(ctx, absX, absY, throughput, renderSize);
    }
    
    // Render connections
    port.connections.forEach(connection => {
      this.renderPortConnection(ctx, port, connection, membrane);
    });
  }

  /**
   * Render throughput indicator for active ports
   */
  private renderThroughputIndicator(ctx: CanvasRenderingContext2D, x: number, y: number, throughput: number, portSize: number): void {
    const maxThroughput = 100; // Assumed max throughput
    const normalizedThroughput = Math.min(throughput / maxThroughput, 1);
    
    // Render throughput as animated particles
    const particleCount = Math.floor(normalizedThroughput * 5);
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Date.now() * 0.01 + i * 60) % 360;
      const radius = portSize + 5 + i * 3;
      const particleX = x + Math.cos(angle) * radius;
      const particleY = y + Math.sin(angle) * radius;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(particleX, particleY, 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  /**
   * Render connection between ports
   */
  private renderPortConnection(ctx: CanvasRenderingContext2D, sourcePort: PortVisualization, connection: any, sourceMembrane: MembraneVisualization): void {
    // This would render lines connecting to other ports
    // Implementation depends on having access to target port positions
    
    const { messageFlow, latency, reliability } = connection;
    
    if (messageFlow > 0) {
      // Render message flow animation
      const flowKey = `${sourcePort.id}-${connection.targetPortId}`;
      if (!this.renderState.messageFlows.has(flowKey)) {
        this.renderState.messageFlows.set(flowKey, []);
      }
      
      // Add new message particles periodically
      const now = Date.now();
      const messages = this.renderState.messageFlows.get(flowKey)!;
      
      if (messages.length === 0 || now - this.renderState.lastUpdateTime > 100) {
        messages.push({
          x: sourceMembrane.position.x + sourcePort.position.x,
          y: sourceMembrane.position.y + sourcePort.position.y,
          progress: 0
        });
      }
    }
  }

  /**
   * Render membrane label and status information
   */
  private renderMembraneLabel(ctx: CanvasRenderingContext2D, membrane: MembraneVisualization): void {
    const { position, size, type, activity, messageCount } = membrane;
    
    // Label position (top-left corner)
    const labelX = position.x + 8;
    const labelY = position.y + 20;
    
    // Background for label
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(labelX - 4, labelY - 16, type.length * 8 + 8, 20);
    
    // Label text
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.fillText(type.toUpperCase(), labelX, labelY);
    
    // Status information
    const statusY = labelY + 25;
    ctx.font = '10px sans-serif';
    ctx.fillStyle = this.config.theme === 'dark' ? '#cccccc' : '#666666';
    ctx.fillText(`Activity: ${(activity * 100).toFixed(0)}%`, labelX, statusY);
    ctx.fillText(`Messages: ${messageCount}`, labelX, statusY + 15);
  }

  /**
   * Render activity indicators
   */
  private renderActivityIndicators(ctx: CanvasRenderingContext2D, membrane: MembraneVisualization): void {
    const { position, size, activity, lastActivity } = membrane;
    
    if (activity > 0.5) {
      // Render activity pulse around the membrane
      const pulseRadius = Math.max(size.x, size.y) * 0.6;
      const centerX = position.x + size.x / 2;
      const centerY = position.y + size.y / 2;
      
      const pulseIntensity = activity * (0.5 + 0.5 * Math.sin(Date.now() * 0.02));
      
      ctx.strokeStyle = `rgba(255, 255, 0, ${pulseIntensity * 0.5})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  /**
   * Render global message flows between membranes
   */
  private renderGlobalMessageFlows(ctx: CanvasRenderingContext2D, membranes: MembraneVisualization[]): void {
    // Update and render message particles
    this.renderState.messageFlows.forEach((messages, flowKey) => {
      messages.forEach((message, index) => {
        // Update message progress
        message.progress += 0.02;
        
        // Remove completed messages
        if (message.progress >= 1) {
          messages.splice(index, 1);
          return;
        }
        
        // Render message particle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(message.x, message.y, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add trail effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(message.x - 5, message.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
    
    this.renderState.lastUpdateTime = Date.now();
  }

  /**
   * Update animations and time-based effects
   */
  private updateAnimations(): void {
    const now = Date.now();
    
    // Update boundary animations
    this.renderState.boundaryAnimations.forEach((phase, membraneId) => {
      this.renderState.boundaryAnimations.set(membraneId, (phase + 0.1) % (2 * Math.PI));
    });
    
    // Update port activities
    this.renderState.portActivities.forEach((activity, portId) => {
      // Decay activity over time
      const decayedActivity = activity * 0.98;
      this.renderState.portActivities.set(portId, decayedActivity);
    });
  }

  // ========== Helper Methods ==========

  private getNodeColorByType(type: string): string {
    switch (type) {
      case 'memory': return this.config.colorScheme.memoryNode;
      case 'concept': return this.config.colorScheme.conceptNode;
      case 'agent': return this.config.colorScheme.agentNode;
      case 'kernel': return this.config.colorScheme.kernelNode;
      default: return this.config.colorScheme.memoryNode;
    }
  }

  /**
   * Add activity to a port (for external triggering)
   */
  public triggerPortActivity(portId: string): void {
    this.renderState.portActivities.set(portId, 1.0);
  }

  /**
   * Add message flow between ports
   */
  public addMessageFlow(sourcePortId: string, targetPortId: string): void {
    const flowKey = `${sourcePortId}-${targetPortId}`;
    if (!this.renderState.messageFlows.has(flowKey)) {
      this.renderState.messageFlows.set(flowKey, []);
    }
  }
}