/**
 * Hypergraph Renderer - Dynamic visualization of agentic hypergraphs
 * 
 * Renders interactive hypergraph visualizations with nodes representing
 * cognitive entities and hyperedges showing complex relationships.
 */

import {
  VisualizationConfig,
  VisualizationNode,
  VisualizationEdge,
  Point3D
} from './types.js';

interface RenderState {
  viewTransform: {
    x: number;
    y: number;
    scale: number;
  };
  nodePositions: Map<string, Point3D>;
  edgeAnimations: Map<string, number>;
  lastRenderTime: number;
  hoveredNode: string | null;
  selectedNode: string | null;
}

export class HypergraphRenderer {
  private config: VisualizationConfig;
  private renderState: RenderState;
  private animationId: number | null = null;
  
  constructor(config: VisualizationConfig) {
    this.config = config;
    this.renderState = {
      viewTransform: { x: 0, y: 0, scale: 1 },
      nodePositions: new Map(),
      edgeAnimations: new Map(),
      lastRenderTime: 0,
      hoveredNode: null,
      selectedNode: null
    };
  }

  /**
   * Render the hypergraph visualization
   */
  public render(ctx: CanvasRenderingContext2D, nodes: VisualizationNode[], edges: VisualizationEdge[]): void {
    const startTime = performance.now();
    
    // Update layout if needed
    this.updateLayout(nodes, edges, ctx.canvas);
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Apply view transform
    ctx.save();
    ctx.translate(this.renderState.viewTransform.x, this.renderState.viewTransform.y);
    ctx.scale(this.renderState.viewTransform.scale, this.renderState.viewTransform.scale);
    
    // Render background grid
    this.renderGrid(ctx);
    
    // Render edges first (so they appear behind nodes)
    this.renderEdges(ctx, edges);
    
    // Render nodes
    this.renderNodes(ctx, nodes);
    
    // Render information overlays
    this.renderOverlays(ctx, nodes, edges);
    
    ctx.restore();
    
    // Update render metrics
    this.renderState.lastRenderTime = performance.now() - startTime;
  }

  /**
   * Update node layout using force-directed algorithm
   */
  private updateLayout(nodes: VisualizationNode[], edges: VisualizationEdge[], canvas: HTMLCanvasElement): void {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Initialize positions for new nodes
    nodes.forEach(node => {
      if (!this.renderState.nodePositions.has(node.id)) {
        // Place new nodes randomly around center
        const angle = Math.random() * 2 * Math.PI;
        const radius = 100 + Math.random() * 200;
        this.renderState.nodePositions.set(node.id, {
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
          z: 0
        });
      }
    });
    
    // Apply force-directed layout algorithm
    if (this.config.layout.algorithm === 'force-directed') {
      this.applyForceDirectedLayout(nodes, edges);
    } else if (this.config.layout.algorithm === 'hierarchical') {
      this.applyHierarchicalLayout(nodes, edges);
    }
    
    // Apply clustering if enabled
    if (this.config.layout.clustering) {
      this.applyClustering(nodes, edges);
    }
  }

  /**
   * Apply force-directed layout using spring-mass model
   */
  private applyForceDirectedLayout(nodes: VisualizationNode[], edges: VisualizationEdge[]): void {
    const forces = new Map<string, Point3D>();
    const damping = 0.9;
    const repulsionStrength = 5000;
    const attractionStrength = 0.1;
    
    // Initialize forces
    nodes.forEach(node => {
      forces.set(node.id, { x: 0, y: 0, z: 0 });
    });
    
    // Calculate repulsion forces between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        const pos1 = this.renderState.nodePositions.get(node1.id)!;
        const pos2 = this.renderState.nodePositions.get(node2.id)!;
        
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const force = repulsionStrength / (distance * distance);
          const forceX = (dx / distance) * force;
          const forceY = (dy / distance) * force;
          
          const force1 = forces.get(node1.id)!;
          const force2 = forces.get(node2.id)!;
          
          force1.x += forceX;
          force1.y += forceY;
          force2.x -= forceX;
          force2.y -= forceY;
        }
      }
    }
    
    // Calculate attraction forces along edges
    edges.forEach(edge => {
      const pos1 = this.renderState.nodePositions.get(edge.source);
      const pos2 = this.renderState.nodePositions.get(edge.target);
      
      if (pos1 && pos2) {
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const targetDistance = this.config.layout.spacing;
        
        if (distance > 0) {
          const force = attractionStrength * (distance - targetDistance) * edge.weight;
          const forceX = (dx / distance) * force;
          const forceY = (dy / distance) * force;
          
          const force1 = forces.get(edge.source);
          const force2 = forces.get(edge.target);
          
          if (force1) {
            force1.x += forceX;
            force1.y += forceY;
          }
          
          if (force2) {
            force2.x -= forceX;
            force2.y -= forceY;
          }
        }
      }
    });
    
    // Apply forces to update positions
    nodes.forEach(node => {
      const position = this.renderState.nodePositions.get(node.id)!;
      const force = forces.get(node.id)!;
      
      position.x += force.x * damping;
      position.y += force.y * damping;
    });
  }

  /**
   * Apply hierarchical layout for structured visualization
   */
  private applyHierarchicalLayout(nodes: VisualizationNode[], edges: VisualizationEdge[]): void {
    // Group nodes by type
    const nodesByType = new Map<string, VisualizationNode[]>();
    nodes.forEach(node => {
      if (!nodesByType.has(node.type)) {
        nodesByType.set(node.type, []);
      }
      nodesByType.get(node.type)!.push(node);
    });
    
    // Assign positions based on hierarchy
    const layers = Array.from(nodesByType.keys());
    const layerHeight = 150;
    
    layers.forEach((type, layerIndex) => {
      const nodesInLayer = nodesByType.get(type)!;
      const layerY = 100 + layerIndex * layerHeight;
      
      nodesInLayer.forEach((node, nodeIndex) => {
        const layerX = 100 + (nodeIndex / (nodesInLayer.length - 1 || 1)) * 600;
        this.renderState.nodePositions.set(node.id, {
          x: layerX,
          y: layerY,
          z: 0
        });
      });
    });
  }

  /**
   * Apply clustering to group related nodes
   */
  private applyClustering(nodes: VisualizationNode[], edges: VisualizationEdge[]): void {
    // Simple clustering based on edge connectivity
    const clusters = new Map<string, Set<string>>();
    
    // Find strongly connected components
    edges.forEach(edge => {
      const sourceCluster = this.findClusterForNode(edge.source, clusters);
      const targetCluster = this.findClusterForNode(edge.target, clusters);
      
      if (sourceCluster && targetCluster && sourceCluster !== targetCluster) {
        // Merge clusters
        sourceCluster.forEach(nodeId => targetCluster.add(nodeId));
        clusters.delete(Array.from(clusters.keys()).find(key => clusters.get(key) === sourceCluster)!);
      } else if (!sourceCluster && !targetCluster) {
        // Create new cluster
        const clusterId = `cluster_${clusters.size}`;
        clusters.set(clusterId, new Set([edge.source, edge.target]));
      } else if (!sourceCluster) {
        targetCluster!.add(edge.source);
      } else if (!targetCluster) {
        sourceCluster!.add(edge.target);
      }
    });
    
    // Adjust positions to bring cluster members closer together
    clusters.forEach(cluster => {
      const clusterNodes = Array.from(cluster).map(id => this.renderState.nodePositions.get(id)!).filter(Boolean);
      if (clusterNodes.length > 1) {
        // Calculate cluster center
        const centerX = clusterNodes.reduce((sum, pos) => sum + pos.x, 0) / clusterNodes.length;
        const centerY = clusterNodes.reduce((sum, pos) => sum + pos.y, 0) / clusterNodes.length;
        
        // Move nodes towards cluster center
        clusterNodes.forEach(pos => {
          const pullStrength = 0.1;
          pos.x += (centerX - pos.x) * pullStrength;
          pos.y += (centerY - pos.y) * pullStrength;
        });
      }
    });
  }

  /**
   * Find which cluster a node belongs to
   */
  private findClusterForNode(nodeId: string, clusters: Map<string, Set<string>>): Set<string> | null {
    for (const cluster of clusters.values()) {
      if (cluster.has(nodeId)) {
        return cluster;
      }
    }
    return null;
  }

  /**
   * Render background grid
   */
  private renderGrid(ctx: CanvasRenderingContext2D): void {
    const gridSize = 50;
    const canvas = ctx.canvas;
    
    ctx.strokeStyle = this.config.theme === 'dark' ? '#333333' : '#f0f0f0';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  /**
   * Render all nodes in the hypergraph
   */
  private renderNodes(ctx: CanvasRenderingContext2D, nodes: VisualizationNode[]): void {
    nodes.forEach(node => {
      const position = this.renderState.nodePositions.get(node.id);
      if (position) {
        this.renderNode(ctx, node, position);
      }
    });
  }

  /**
   * Render a single node
   */
  private renderNode(ctx: CanvasRenderingContext2D, node: VisualizationNode, position: Point3D): void {
    const isHovered = this.renderState.hoveredNode === node.id;
    const isSelected = this.renderState.selectedNode === node.id;
    const baseRadius = node.size || 20;
    const radius = isHovered ? baseRadius * 1.2 : baseRadius;
    
    // Node shadow
    if (isSelected || isHovered) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    
    // Node background
    ctx.fillStyle = node.color || this.getNodeColorByType(node.type);
    ctx.beginPath();
    ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Node border
    ctx.strokeStyle = isSelected ? '#ffffff' : (this.config.theme === 'dark' ? '#555555' : '#cccccc');
    ctx.lineWidth = isSelected ? 3 : 1;
    ctx.stroke();
    
    if (isSelected || isHovered) {
      ctx.restore();
    }
    
    // Activation indicator (inner circle)
    if (node.activation > 0) {
      const activationRadius = radius * node.activation * 0.7;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(position.x, position.y, activationRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Node label
    if (isHovered || isSelected || this.renderState.viewTransform.scale > 0.8) {
      ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
      ctx.font = `${Math.max(10, 12 / this.renderState.viewTransform.scale)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(node.label || node.id, position.x, position.y + radius + 20);
    }
    
    // Type indicator
    this.renderNodeTypeIndicator(ctx, node, position, radius);
    
    // State visualization for selected nodes
    if (isSelected && node.state) {
      this.renderNodeState(ctx, node, position, radius);
    }
  }

  /**
   * Render node type indicator
   */
  private renderNodeTypeIndicator(ctx: CanvasRenderingContext2D, node: VisualizationNode, position: Point3D, radius: number): void {
    const indicatorSize = 6;
    const indicatorPos = {
      x: position.x + radius - indicatorSize,
      y: position.y - radius + indicatorSize
    };
    
    ctx.fillStyle = this.getTypeIndicatorColor(node.type);
    
    switch (node.type) {
      case 'memory':
        // Square indicator
        ctx.fillRect(indicatorPos.x - indicatorSize/2, indicatorPos.y - indicatorSize/2, indicatorSize, indicatorSize);
        break;
        
      case 'concept':
        // Triangle indicator
        ctx.beginPath();
        ctx.moveTo(indicatorPos.x, indicatorPos.y - indicatorSize/2);
        ctx.lineTo(indicatorPos.x - indicatorSize/2, indicatorPos.y + indicatorSize/2);
        ctx.lineTo(indicatorPos.x + indicatorSize/2, indicatorPos.y + indicatorSize/2);
        ctx.closePath();
        ctx.fill();
        break;
        
      case 'agent':
        // Diamond indicator
        ctx.beginPath();
        ctx.moveTo(indicatorPos.x, indicatorPos.y - indicatorSize/2);
        ctx.lineTo(indicatorPos.x + indicatorSize/2, indicatorPos.y);
        ctx.lineTo(indicatorPos.x, indicatorPos.y + indicatorSize/2);
        ctx.lineTo(indicatorPos.x - indicatorSize/2, indicatorPos.y);
        ctx.closePath();
        ctx.fill();
        break;
        
      default:
        // Circle indicator
        ctx.beginPath();
        ctx.arc(indicatorPos.x, indicatorPos.y, indicatorSize/2, 0, 2 * Math.PI);
        ctx.fill();
        break;
    }
  }

  /**
   * Render node state visualization
   */
  private renderNodeState(ctx: CanvasRenderingContext2D, node: VisualizationNode, position: Point3D, radius: number): void {
    if (!node.state) return;
    
    const stateRadius = radius + 40;
    const segments = 8;
    const angleStep = (2 * Math.PI) / segments;
    
    // Render state as radial segments
    for (let i = 0; i < segments && i < node.state.data.length; i++) {
      const value = Math.abs(node.state.data[i]);
      const normalizedValue = value / Math.max(...node.state.data.map(Math.abs));
      const segmentRadius = radius + 20 + normalizedValue * 20;
      
      const startAngle = i * angleStep - angleStep / 2;
      const endAngle = startAngle + angleStep;
      
      ctx.fillStyle = `hsl(${(value / Math.max(...node.state.data)) * 120}, 70%, 50%)`;
      ctx.beginPath();
      ctx.moveTo(position.x, position.y);
      ctx.arc(position.x, position.y, segmentRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * Render all edges in the hypergraph
   */
  private renderEdges(ctx: CanvasRenderingContext2D, edges: VisualizationEdge[]): void {
    edges.forEach(edge => {
      const sourcePos = this.renderState.nodePositions.get(edge.source);
      const targetPos = this.renderState.nodePositions.get(edge.target);
      
      if (sourcePos && targetPos) {
        this.renderEdge(ctx, edge, sourcePos, targetPos);
      }
    });
  }

  /**
   * Render a single edge
   */
  private renderEdge(ctx: CanvasRenderingContext2D, edge: VisualizationEdge, sourcePos: Point3D, targetPos: Point3D): void {
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    // Edge styling
    ctx.strokeStyle = edge.color || this.getEdgeColorByType(edge.type);
    ctx.lineWidth = Math.max(1, edge.weight * 3);
    ctx.globalAlpha = 0.6 + edge.weight * 0.4;
    
    // Animate flow if edge is active
    let animationOffset = 0;
    if (edge.flow > 0) {
      animationOffset = (Date.now() * 0.01) % 20;
      ctx.setLineDash([10, 10]);
      ctx.lineDashOffset = animationOffset;
    }
    
    // Draw edge
    ctx.beginPath();
    
    if (edge.type === 'hierarchical') {
      // Curved edge for hierarchical relationships
      const controlX = (sourcePos.x + targetPos.x) / 2 + (dy * 0.2);
      const controlY = (sourcePos.y + targetPos.y) / 2 - (dx * 0.2);
      
      ctx.moveTo(sourcePos.x, sourcePos.y);
      ctx.quadraticCurveTo(controlX, controlY, targetPos.x, targetPos.y);
    } else {
      // Straight edge
      ctx.moveTo(sourcePos.x, sourcePos.y);
      ctx.lineTo(targetPos.x, targetPos.y);
    }
    
    ctx.stroke();
    
    // Reset line dash
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    
    // Draw arrowhead
    this.renderArrowhead(ctx, sourcePos, targetPos, edge);
    
    // Edge label
    if (edge.label && this.renderState.viewTransform.scale > 0.6) {
      const midX = (sourcePos.x + targetPos.x) / 2;
      const midY = (sourcePos.y + targetPos.y) / 2;
      
      ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(edge.label, midX, midY);
    }
  }

  /**
   * Render arrowhead for directed edges
   */
  private renderArrowhead(ctx: CanvasRenderingContext2D, sourcePos: Point3D, targetPos: Point3D, edge: VisualizationEdge): void {
    const dx = targetPos.x - sourcePos.x;
    const dy = targetPos.y - sourcePos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;
    
    const arrowSize = 8;
    const nodeRadius = 20; // Approximate node radius
    
    // Calculate arrowhead position (at edge of target node)
    const unitX = dx / distance;
    const unitY = dy / distance;
    const arrowX = targetPos.x - unitX * nodeRadius;
    const arrowY = targetPos.y - unitY * nodeRadius;
    
    // Calculate arrowhead points
    const perpX = -unitY;
    const perpY = unitX;
    
    ctx.fillStyle = edge.color || this.getEdgeColorByType(edge.type);
    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - unitX * arrowSize + perpX * arrowSize * 0.5, arrowY - unitY * arrowSize + perpY * arrowSize * 0.5);
    ctx.lineTo(arrowX - unitX * arrowSize - perpX * arrowSize * 0.5, arrowY - unitY * arrowSize - perpY * arrowSize * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * Render information overlays
   */
  private renderOverlays(ctx: CanvasRenderingContext2D, nodes: VisualizationNode[], edges: VisualizationEdge[]): void {
    // Render cluster boundaries if clustering is enabled
    if (this.config.layout.clustering) {
      this.renderClusterBoundaries(ctx, nodes, edges);
    }
    
    // Render connection strength indicators
    this.renderConnectionStrengths(ctx, edges);
  }

  /**
   * Render cluster boundaries
   */
  private renderClusterBoundaries(ctx: CanvasRenderingContext2D, nodes: VisualizationNode[], edges: VisualizationEdge[]): void {
    // Implementation would identify clusters and draw boundaries around them
    // For now, this is a placeholder
  }

  /**
   * Render connection strength indicators
   */
  private renderConnectionStrengths(ctx: CanvasRenderingContext2D, edges: VisualizationEdge[]): void {
    if (this.renderState.viewTransform.scale < 0.5) return;
    
    edges.forEach(edge => {
      const sourcePos = this.renderState.nodePositions.get(edge.source);
      const targetPos = this.renderState.nodePositions.get(edge.target);
      
      if (sourcePos && targetPos && edge.strength > 0.7) {
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        
        // Draw strength indicator
        ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(midX, midY, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }

  // ========== Interactive Methods ==========

  /**
   * Pan the view
   */
  public pan(deltaX: number, deltaY: number): void {
    this.renderState.viewTransform.x += deltaX;
    this.renderState.viewTransform.y += deltaY;
  }

  /**
   * Zoom the view
   */
  public zoom(scaleFactor: number): void {
    const newScale = this.renderState.viewTransform.scale * scaleFactor;
    this.renderState.viewTransform.scale = Math.max(0.1, Math.min(5, newScale));
  }

  /**
   * Focus on a specific node
   */
  public focusOnNode(node: VisualizationNode): void {
    const position = this.renderState.nodePositions.get(node.id);
    if (position) {
      // Center the view on the node
      this.renderState.viewTransform.x = -position.x + 400; // Assuming canvas width of 800
      this.renderState.viewTransform.y = -position.y + 300; // Assuming canvas height of 600
      this.renderState.selectedNode = node.id;
    }
  }

  /**
   * Set hovered node
   */
  public setHoveredNode(nodeId: string | null): void {
    this.renderState.hoveredNode = nodeId;
  }

  /**
   * Get last render time for performance metrics
   */
  public getLastRenderTime(): number {
    return this.renderState.lastRenderTime;
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

  private getEdgeColorByType(type: string): string {
    switch (type) {
      case 'semantic': return this.config.colorScheme.semanticEdge;
      case 'causal': return this.config.colorScheme.causalEdge;
      case 'temporal': return this.config.colorScheme.temporalEdge;
      case 'hierarchical': return this.config.colorScheme.hierarchicalEdge;
      default: return this.config.colorScheme.semanticEdge;
    }
  }

  private getTypeIndicatorColor(type: string): string {
    // Return a brighter version of the node color for the indicator
    const baseColor = this.getNodeColorByType(type);
    return baseColor; // Could be modified to return a lighter/darker variant
  }
}