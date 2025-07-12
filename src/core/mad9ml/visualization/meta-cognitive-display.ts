/**
 * Meta-Cognitive Display - Visualizes self-reflection and meta-cognitive states
 * 
 * Renders visualizations of the system's awareness of its own cognitive processes,
 * thought patterns, and self-reflective capabilities.
 */

import {
  VisualizationConfig,
  MetaCognitiveState,
  SelfReflectionVisualization,
  AwarenessNode,
  ThoughtProcess,
  MetaCognitiveLoop
} from './types.js';

export class MetaCognitiveDisplay {
  private config: VisualizationConfig;
  private animationTime: number = 0;
  
  constructor(config: VisualizationConfig) {
    this.config = config;
  }

  /**
   * Render the complete meta-cognitive visualization
   */
  public render(ctx: CanvasRenderingContext2D, metaCognitive: MetaCognitiveState): void {
    this.animationTime += 0.016; // ~60fps
    
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Create synthetic self-reflection data based on meta-cognitive state
    const reflectionViz = this.generateSelfReflectionVisualization(metaCognitive);
    
    // Render consciousness layers (background)
    this.renderConsciousnessLayers(ctx, reflectionViz, width, height);
    
    // Render awareness map (center)
    this.renderAwarenessMap(ctx, reflectionViz.awarenessMap, width / 2, height / 2, 200);
    
    // Render thought processes (flowing connections)
    this.renderThoughtProcesses(ctx, reflectionViz.thoughtProcesses, width, height);
    
    // Render meta-cognitive loops (recursive patterns)
    this.renderMetaCognitiveLoops(ctx, reflectionViz.metacognitiveLoops, width, height);
    
    // Render reflection depth indicator
    this.renderReflectionDepth(ctx, reflectionViz.reflectionDepth, 50, 50, 150);
    
    // Render consciousness level
    this.renderConsciousnessLevel(ctx, reflectionViz.consciousnessLevel, width - 200, 50, 150);
    
    // Render introspection indicators
    this.renderIntrospectionIndicators(ctx, reflectionViz, width, height);
  }

  /**
   * Generate self-reflection visualization data from meta-cognitive state
   */
  private generateSelfReflectionVisualization(metaCognitive: MetaCognitiveState): SelfReflectionVisualization {
    const awarenessMap = this.generateAwarenessNodes(metaCognitive);
    const thoughtProcesses = this.generateThoughtProcesses(metaCognitive);
    const metacognitiveLoops = this.generateMetaCognitiveLoops(metaCognitive);
    
    return {
      awarenessMap,
      thoughtProcesses,
      metacognitiveLoops,
      reflectionDepth: metaCognitive.reflectionDepth || 0,
      consciousnessLevel: metaCognitive.awarenessLevel || 0
    };
  }

  /**
   * Generate awareness nodes based on meta-cognitive state
   */
  private generateAwarenessNodes(metaCognitive: MetaCognitiveState): AwarenessNode[] {
    const concepts = [
      'self-monitoring', 'pattern-recognition', 'goal-awareness', 'resource-allocation',
      'error-detection', 'strategy-selection', 'performance-evaluation', 'adaptation'
    ];
    
    return concepts.map((concept, index) => ({
      id: `awareness_${index}`,
      concept,
      awareness: (metaCognitive.awarenessLevel || 0) * (0.7 + Math.random() * 0.3),
      lastReflection: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      connections: concepts.filter((_, i) => i !== index && Math.random() > 0.6).slice(0, 3),
      introspectionData: {
        depth: metaCognitive.reflectionDepth || 0,
        clarity: Math.random(),
        confidence: 0.5 + (metaCognitive.awarenessLevel || 0) * 0.5
      }
    }));
  }

  /**
   * Generate thought processes
   */
  private generateThoughtProcesses(metaCognitive: MetaCognitiveState): ThoughtProcess[] {
    const processTypes: Array<ThoughtProcess['type']> = ['reasoning', 'planning', 'evaluation', 'learning', 'reflection'];
    const activeProcesses = Math.floor((metaCognitive.cognitiveLoad || 0) * 5);
    
    return Array.from({ length: activeProcesses }, (_, index) => ({
      id: `process_${index}`,
      type: processTypes[index % processTypes.length],
      startTime: new Date(Date.now() - Math.random() * 60000).toISOString(),
      duration: 1000 + Math.random() * 5000,
      participants: [`awareness_${Math.floor(Math.random() * 8)}`],
      outcome: Math.random() > 0.3 ? 'success' : 'pending',
      confidence: 0.3 + Math.random() * 0.7
    }));
  }

  /**
   * Generate meta-cognitive loops
   */
  private generateMetaCognitiveLoops(metaCognitive: MetaCognitiveState): MetaCognitiveLoop[] {
    const loopTypes: Array<MetaCognitiveLoop['type']> = ['monitoring', 'evaluation', 'planning', 'regulation'];
    const activeLoops = metaCognitive.selfMonitoringActive ? 4 : 2;
    
    return Array.from({ length: activeLoops }, (_, index) => ({
      id: `loop_${index}`,
      type: loopTypes[index % loopTypes.length],
      participants: [`awareness_${index}`, `awareness_${(index + 1) % 8}`],
      cycleTime: 2000 + Math.random() * 3000,
      effectiveness: 0.4 + (metaCognitive.adaptationRate || 0) * 0.6,
      lastActive: new Date(Date.now() - Math.random() * 30000).toISOString()
    }));
  }

  /**
   * Render consciousness layers as background
   */
  private renderConsciousnessLayers(ctx: CanvasRenderingContext2D, reflectionViz: SelfReflectionVisualization, width: number, height: number): void {
    const layers = 5;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.4;
    
    for (let i = layers; i >= 1; i--) {
      const radius = (i / layers) * maxRadius;
      const opacity = 0.1 + (reflectionViz.consciousnessLevel * 0.3) * (1 - i / layers);
      
      // Create gradient for each layer
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      gradient.addColorStop(0, `rgba(100, 150, 255, ${opacity})`);
      gradient.addColorStop(0.7, `rgba(150, 100, 255, ${opacity * 0.5})`);
      gradient.addColorStop(1, `rgba(255, 100, 150, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add pulsing effect
      const pulseIntensity = Math.sin(this.animationTime * 2 + i) * 0.1 + 0.9;
      ctx.globalAlpha = pulseIntensity;
      
      // Draw layer boundary
      ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 2})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
      
      ctx.globalAlpha = 1;
    }
  }

  /**
   * Render awareness map in the center
   */
  private renderAwarenessMap(ctx: CanvasRenderingContext2D, awarenessNodes: AwarenessNode[], centerX: number, centerY: number, radius: number): void {
    const nodeCount = awarenessNodes.length;
    
    awarenessNodes.forEach((node, index) => {
      const angle = (index / nodeCount) * 2 * Math.PI;
      const nodeRadius = radius * (0.6 + node.awareness * 0.4);
      const x = centerX + Math.cos(angle) * nodeRadius;
      const y = centerY + Math.sin(angle) * nodeRadius;
      
      // Node pulsing based on awareness level
      const pulseSize = 8 + node.awareness * 12 + Math.sin(this.animationTime * 3 + index) * 3;
      
      // Node glow
      ctx.save();
      ctx.shadowColor = this.getAwarenessColor(node.awareness);
      ctx.shadowBlur = node.awareness * 20;
      
      // Node circle
      ctx.fillStyle = this.getAwarenessColor(node.awareness);
      ctx.beginPath();
      ctx.arc(x, y, pulseSize, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.restore();
      
      // Node label
      ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.concept.split('-')[0], x, y + pulseSize + 15);
      
      // Awareness level indicator
      this.renderAwarenessIndicator(ctx, x, y - pulseSize - 10, node.awareness);
      
      // Draw connections
      node.connections.forEach(connectionId => {
        const targetIndex = awarenessNodes.findIndex(n => n.concept === connectionId);
        if (targetIndex >= 0) {
          const targetAngle = (targetIndex / nodeCount) * 2 * Math.PI;
          const targetRadius = radius * (0.6 + awarenessNodes[targetIndex].awareness * 0.4);
          const targetX = centerX + Math.cos(targetAngle) * targetRadius;
          const targetY = centerY + Math.sin(targetAngle) * targetRadius;
          
          this.renderAwarenessConnection(ctx, x, y, targetX, targetY, node.awareness);
        }
      });
    });
  }

  /**
   * Render thought processes as flowing connections
   */
  private renderThoughtProcesses(ctx: CanvasRenderingContext2D, processes: ThoughtProcess[], width: number, height: number): void {
    processes.forEach((process, index) => {
      const progress = (this.animationTime * 0.5 + index) % 1;
      const startAngle = index * (2 * Math.PI / processes.length);
      const endAngle = startAngle + Math.PI;
      
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.3;
      
      const startX = centerX + Math.cos(startAngle) * radius;
      const startY = centerY + Math.sin(startAngle) * radius;
      const endX = centerX + Math.cos(endAngle) * radius;
      const endY = centerY + Math.sin(endAngle) * radius;
      
      // Flowing particle along the path
      const particleX = startX + (endX - startX) * progress;
      const particleY = startY + (endY - startY) * progress;
      
      // Process path
      ctx.strokeStyle = this.getProcessColor(process.type);
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.globalAlpha = 1;
      
      // Flowing particle
      ctx.fillStyle = this.getProcessColor(process.type);
      ctx.beginPath();
      ctx.arc(particleX, particleY, 4 + process.confidence * 3, 0, 2 * Math.PI);
      ctx.fill();
      
      // Process label
      const midX = (startX + endX) / 2;
      const midY = (startY + endY) / 2;
      ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(process.type.toUpperCase(), midX, midY - 10);
    });
  }

  /**
   * Render meta-cognitive loops
   */
  private renderMetaCognitiveLoops(ctx: CanvasRenderingContext2D, loops: MetaCognitiveLoop[], width: number, height: number): void {
    const centerX = width / 2;
    const centerY = height / 2;
    
    loops.forEach((loop, index) => {
      const loopRadius = 80 + index * 40;
      const rotationSpeed = 0.5 + loop.effectiveness * 0.5;
      const rotation = this.animationTime * rotationSpeed + index * Math.PI / 2;
      
      // Loop circle
      ctx.strokeStyle = this.getLoopColor(loop.type);
      ctx.lineWidth = 2 + loop.effectiveness * 3;
      ctx.globalAlpha = 0.4 + loop.effectiveness * 0.4;
      
      // Dashed circle for meta-cognitive nature
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, loopRadius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Moving indicators around the loop
      const indicatorCount = 4;
      for (let i = 0; i < indicatorCount; i++) {
        const angle = rotation + (i / indicatorCount) * 2 * Math.PI;
        const x = centerX + Math.cos(angle) * loopRadius;
        const y = centerY + Math.sin(angle) * loopRadius;
        
        ctx.fillStyle = this.getLoopColor(loop.type);
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
      
      // Loop label
      ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(loop.type.toUpperCase(), centerX, centerY - loopRadius - 15);
    });
  }

  /**
   * Render reflection depth indicator
   */
  private renderReflectionDepth(ctx: CanvasRenderingContext2D, depth: number, x: number, y: number, size: number): void {
    // Background
    ctx.fillStyle = this.config.theme === 'dark' ? '#2d2d2d' : '#f5f5f5';
    ctx.fillRect(x, y, size, size);
    
    // Border
    ctx.strokeStyle = this.config.colorScheme.membraneBoundary;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);
    
    // Title
    ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Reflection Depth', x + 10, y + 20);
    
    // Depth visualization as nested squares
    const maxDepth = 5;
    const actualDepth = Math.min(depth * maxDepth, maxDepth);
    
    for (let i = 0; i < maxDepth; i++) {
      const squareSize = size - 40 - i * 15;
      const squareX = x + 20 + i * 7.5;
      const squareY = y + 40 + i * 7.5;
      
      if (i < actualDepth) {
        const opacity = (actualDepth - i) / maxDepth;
        ctx.fillStyle = `rgba(100, 150, 255, ${opacity})`;
        ctx.fillRect(squareX, squareY, squareSize, squareSize);
      } else {
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(squareX, squareY, squareSize, squareSize);
      }
    }
    
    // Depth value
    ctx.fillStyle = this.config.theme === 'dark' ? '#cccccc' : '#666666';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${(depth * 100).toFixed(0)}%`, x + 10, y + size - 10);
  }

  /**
   * Render consciousness level indicator
   */
  private renderConsciousnessLevel(ctx: CanvasRenderingContext2D, level: number, x: number, y: number, size: number): void {
    // Background
    ctx.fillStyle = this.config.theme === 'dark' ? '#2d2d2d' : '#f5f5f5';
    ctx.fillRect(x, y, size, size);
    
    // Border
    ctx.strokeStyle = this.config.colorScheme.membraneBoundary;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, size, size);
    
    // Title
    ctx.fillStyle = this.config.theme === 'dark' ? '#ffffff' : '#000000';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Consciousness', x + 10, y + 20);
    
    // Consciousness as radiating circles
    const centerX = x + size / 2;
    const centerY = y + size / 2 + 10;
    const maxRadius = size / 3;
    
    for (let i = 0; i < 5; i++) {
      const radius = (i + 1) * (maxRadius / 5);
      const opacity = level * (1 - i * 0.15);
      
      if (opacity > 0) {
        ctx.strokeStyle = `rgba(255, 200, 100, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Add pulsing effect
        const pulseRadius = radius + Math.sin(this.animationTime * 2 + i) * 2;
        ctx.strokeStyle = `rgba(255, 200, 100, ${opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
    
    // Level value
    ctx.fillStyle = this.config.theme === 'dark' ? '#cccccc' : '#666666';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${(level * 100).toFixed(0)}%`, x + 10, y + size - 10);
  }

  /**
   * Render introspection indicators
   */
  private renderIntrospectionIndicators(ctx: CanvasRenderingContext2D, reflectionViz: SelfReflectionVisualization, width: number, height: number): void {
    // Render thought bubbles for active introspection
    const bubbleCount = Math.floor(reflectionViz.consciousnessLevel * 8);
    
    for (let i = 0; i < bubbleCount; i++) {
      const angle = (i / bubbleCount) * 2 * Math.PI + this.animationTime * 0.1;
      const radius = 250 + Math.sin(this.animationTime + i) * 50;
      const x = width / 2 + Math.cos(angle) * radius;
      const y = height / 2 + Math.sin(angle) * radius;
      const size = 15 + Math.sin(this.animationTime * 2 + i) * 5;
      
      // Bubble
      ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + reflectionViz.consciousnessLevel * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fill();
      
      // Bubble outline
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + reflectionViz.consciousnessLevel * 0.4})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // ========== Helper Methods ==========

  private renderAwarenessIndicator(ctx: CanvasRenderingContext2D, x: number, y: number, awareness: number): void {
    const barWidth = 20;
    const barHeight = 4;
    
    // Background bar
    ctx.fillStyle = 'rgba(128, 128, 128, 0.3)';
    ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);
    
    // Awareness bar
    ctx.fillStyle = this.getAwarenessColor(awareness);
    ctx.fillRect(x - barWidth / 2, y, barWidth * awareness, barHeight);
  }

  private renderAwarenessConnection(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, strength: number): void {
    ctx.strokeStyle = `rgba(255, 255, 255, ${strength * 0.3})`;
    ctx.lineWidth = 1 + strength * 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  private getAwarenessColor(awareness: number): string {
    const hue = 240 + awareness * 60; // Blue to cyan
    return `hsl(${hue}, 70%, ${50 + awareness * 30}%)`;
  }

  private getProcessColor(type: ThoughtProcess['type']): string {
    const colors = {
      reasoning: '#4CAF50',
      planning: '#2196F3',
      evaluation: '#FF9800',
      learning: '#9C27B0',
      reflection: '#F44336'
    };
    return colors[type] || '#757575';
  }

  private getLoopColor(type: MetaCognitiveLoop['type']): string {
    const colors = {
      monitoring: '#00BCD4',
      evaluation: '#FFC107',
      planning: '#3F51B5',
      regulation: '#E91E63'
    };
    return colors[type] || '#607D8B';
  }
}