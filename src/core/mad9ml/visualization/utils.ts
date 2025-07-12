/**
 * Visualization Utilities - Helper functions and utilities for the visualization system
 * 
 * Provides common utility functions, data processing helpers, and mathematical
 * operations used throughout the visualization components.
 */

import {
  Point3D,
  VisualizationNode,
  VisualizationEdge,
  MembraneVisualization,
  SystemStateSnapshot
} from './types.js';

export class VisualizationUtils {
  
  // ========== Mathematical Utilities ==========

  /**
   * Calculate distance between two 3D points
   */
  public static distance3D(p1: Point3D, p2: Point3D): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate distance between two 2D points
   */
  public static distance2D(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Normalize a vector
   */
  public static normalize3D(point: Point3D): Point3D {
    const length = Math.sqrt(point.x * point.x + point.y * point.y + point.z * point.z);
    if (length === 0) return { x: 0, y: 0, z: 0 };
    
    return {
      x: point.x / length,
      y: point.y / length,
      z: point.z / length
    };
  }

  /**
   * Linear interpolation between two values
   */
  public static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Linear interpolation between two 3D points
   */
  public static lerp3D(p1: Point3D, p2: Point3D, t: number): Point3D {
    return {
      x: this.lerp(p1.x, p2.x, t),
      y: this.lerp(p1.y, p2.y, t),
      z: this.lerp(p1.z, p2.z, t)
    };
  }

  /**
   * Clamp a value between min and max
   */
  public static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Map a value from one range to another
   */
  public static mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
  }

  /**
   * Calculate angle between two points
   */
  public static angleBetween(p1: Point3D, p2: Point3D): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  }

  // ========== Color Utilities ==========

  /**
   * Convert HSL to RGB
   */
  public static hslToRgb(h: number, s: number, l: number): { r: number, g: number, b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  /**
   * Convert RGB to hex
   */
  public static rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }

  /**
   * Generate color with alpha
   */
  public static colorWithAlpha(color: string, alpha: number): string {
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  }

  /**
   * Blend two colors
   */
  public static blendColors(color1: string, color2: string, ratio: number): string {
    const parseColor = (color: string) => {
      if (color.startsWith('#')) {
        return {
          r: parseInt(color.slice(1, 3), 16),
          g: parseInt(color.slice(3, 5), 16),
          b: parseInt(color.slice(5, 7), 16)
        };
      }
      return { r: 0, g: 0, b: 0 };
    };

    const c1 = parseColor(color1);
    const c2 = parseColor(color2);

    const r = Math.round(this.lerp(c1.r, c2.r, ratio));
    const g = Math.round(this.lerp(c1.g, c2.g, ratio));
    const b = Math.round(this.lerp(c1.b, c2.b, ratio));

    return this.rgbToHex(r, g, b);
  }

  // ========== Data Processing Utilities ==========

  /**
   * Calculate bounding box for a set of nodes
   */
  public static calculateBoundingBox(nodes: VisualizationNode[]): { min: Point3D, max: Point3D } {
    if (nodes.length === 0) {
      return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }

    const min = { x: Infinity, y: Infinity, z: Infinity };
    const max = { x: -Infinity, y: -Infinity, z: -Infinity };

    nodes.forEach(node => {
      const pos = node.position;
      const size = node.size || 0;

      min.x = Math.min(min.x, pos.x - size);
      min.y = Math.min(min.y, pos.y - size);
      min.z = Math.min(min.z, pos.z - size);

      max.x = Math.max(max.x, pos.x + size);
      max.y = Math.max(max.y, pos.y + size);
      max.z = Math.max(max.z, pos.z + size);
    });

    return { min, max };
  }

  /**
   * Find nodes within a radius of a point
   */
  public static findNodesInRadius(nodes: VisualizationNode[], center: Point3D, radius: number): VisualizationNode[] {
    return nodes.filter(node => {
      const distance = this.distance3D(node.position, center);
      return distance <= radius;
    });
  }

  /**
   * Group nodes by type
   */
  public static groupNodesByType(nodes: VisualizationNode[]): Map<string, VisualizationNode[]> {
    const groups = new Map<string, VisualizationNode[]>();
    
    nodes.forEach(node => {
      if (!groups.has(node.type)) {
        groups.set(node.type, []);
      }
      groups.get(node.type)!.push(node);
    });

    return groups;
  }

  /**
   * Calculate network metrics
   */
  public static calculateNetworkMetrics(nodes: VisualizationNode[], edges: VisualizationEdge[]): any {
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    
    // Calculate degree distribution
    const degrees = new Map<string, number>();
    nodes.forEach(node => degrees.set(node.id, 0));
    
    edges.forEach(edge => {
      degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1);
      degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1);
    });
    
    const degreeValues = Array.from(degrees.values());
    const avgDegree = degreeValues.reduce((sum, d) => sum + d, 0) / nodeCount;
    const maxDegree = Math.max(...degreeValues);
    const minDegree = Math.min(...degreeValues);
    
    // Calculate clustering coefficient (simplified)
    const clusteringCoeff = this.calculateClusteringCoefficient(nodes, edges);
    
    // Calculate density
    const maxPossibleEdges = nodeCount * (nodeCount - 1) / 2;
    const density = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0;
    
    return {
      nodeCount,
      edgeCount,
      density,
      avgDegree,
      maxDegree,
      minDegree,
      clusteringCoeff,
      degreeDistribution: degreeValues
    };
  }

  /**
   * Calculate clustering coefficient
   */
  private static calculateClusteringCoefficient(nodes: VisualizationNode[], edges: VisualizationEdge[]): number {
    // Build adjacency list
    const adjacency = new Map<string, Set<string>>();
    nodes.forEach(node => adjacency.set(node.id, new Set()));
    
    edges.forEach(edge => {
      adjacency.get(edge.source)?.add(edge.target);
      adjacency.get(edge.target)?.add(edge.source);
    });
    
    let totalCoeff = 0;
    let nodeCount = 0;
    
    adjacency.forEach((neighbors, nodeId) => {
      if (neighbors.size < 2) return;
      
      const neighborArray = Array.from(neighbors);
      let triangles = 0;
      let possibleTriangles = 0;
      
      for (let i = 0; i < neighborArray.length; i++) {
        for (let j = i + 1; j < neighborArray.length; j++) {
          possibleTriangles++;
          if (adjacency.get(neighborArray[i])?.has(neighborArray[j])) {
            triangles++;
          }
        }
      }
      
      if (possibleTriangles > 0) {
        totalCoeff += triangles / possibleTriangles;
        nodeCount++;
      }
    });
    
    return nodeCount > 0 ? totalCoeff / nodeCount : 0;
  }

  // ========== Layout Utilities ==========

  /**
   * Apply force-directed layout step
   */
  public static applyForceDirectedStep(
    nodes: VisualizationNode[], 
    edges: VisualizationEdge[], 
    options: {
      repulsionStrength?: number,
      attractionStrength?: number,
      damping?: number,
      targetDistance?: number
    } = {}
  ): Map<string, Point3D> {
    const {
      repulsionStrength = 1000,
      attractionStrength = 0.1,
      damping = 0.9,
      targetDistance = 100
    } = options;

    const forces = new Map<string, Point3D>();
    const positions = new Map<string, Point3D>();
    
    // Initialize forces and positions
    nodes.forEach(node => {
      forces.set(node.id, { x: 0, y: 0, z: 0 });
      positions.set(node.id, { ...node.position });
    });

    // Calculate repulsion forces
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        const pos1 = positions.get(node1.id)!;
        const pos2 = positions.get(node2.id)!;
        
        const distance = this.distance3D(pos1, pos2);
        if (distance > 0) {
          const force = repulsionStrength / (distance * distance);
          const direction = this.normalize3D({
            x: pos1.x - pos2.x,
            y: pos1.y - pos2.y,
            z: pos1.z - pos2.z
          });
          
          const force1 = forces.get(node1.id)!;
          const force2 = forces.get(node2.id)!;
          
          force1.x += direction.x * force;
          force1.y += direction.y * force;
          force1.z += direction.z * force;
          
          force2.x -= direction.x * force;
          force2.y -= direction.y * force;
          force2.z -= direction.z * force;
        }
      }
    }

    // Calculate attraction forces
    edges.forEach(edge => {
      const pos1 = positions.get(edge.source);
      const pos2 = positions.get(edge.target);
      
      if (pos1 && pos2) {
        const distance = this.distance3D(pos1, pos2);
        if (distance > 0) {
          const force = attractionStrength * (distance - targetDistance) * edge.weight;
          const direction = this.normalize3D({
            x: pos2.x - pos1.x,
            y: pos2.y - pos1.y,
            z: pos2.z - pos1.z
          });
          
          const force1 = forces.get(edge.source);
          const force2 = forces.get(edge.target);
          
          if (force1) {
            force1.x += direction.x * force;
            force1.y += direction.y * force;
            force1.z += direction.z * force;
          }
          
          if (force2) {
            force2.x -= direction.x * force;
            force2.y -= direction.y * force;
            force2.z -= direction.z * force;
          }
        }
      }
    });

    // Apply forces to update positions
    const newPositions = new Map<string, Point3D>();
    nodes.forEach(node => {
      const position = positions.get(node.id)!;
      const force = forces.get(node.id)!;
      
      newPositions.set(node.id, {
        x: position.x + force.x * damping,
        y: position.y + force.y * damping,
        z: position.z + force.z * damping
      });
    });

    return newPositions;
  }

  // ========== Performance Utilities ==========

  /**
   * Debounce function calls
   */
  public static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Throttle function calls
   */
  public static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Measure execution time
   */
  public static measureTime<T>(func: () => T): { result: T, time: number } {
    const start = performance.now();
    const result = func();
    const time = performance.now() - start;
    return { result, time };
  }

  // ========== Data Validation Utilities ==========

  /**
   * Validate node data
   */
  public static validateNode(node: any): node is VisualizationNode {
    return (
      typeof node === 'object' &&
      typeof node.id === 'string' &&
      typeof node.type === 'string' &&
      typeof node.position === 'object' &&
      typeof node.position.x === 'number' &&
      typeof node.position.y === 'number' &&
      typeof node.position.z === 'number'
    );
  }

  /**
   * Validate edge data
   */
  public static validateEdge(edge: any): edge is VisualizationEdge {
    return (
      typeof edge === 'object' &&
      typeof edge.id === 'string' &&
      typeof edge.source === 'string' &&
      typeof edge.target === 'string' &&
      typeof edge.type === 'string' &&
      typeof edge.weight === 'number'
    );
  }

  /**
   * Validate system state snapshot
   */
  public static validateSystemStateSnapshot(snapshot: any): snapshot is SystemStateSnapshot {
    return (
      typeof snapshot === 'object' &&
      typeof snapshot.id === 'string' &&
      typeof snapshot.timestamp === 'string' &&
      typeof snapshot.memoryUsage === 'object' &&
      typeof snapshot.taskExecution === 'object' &&
      typeof snapshot.aiActivity === 'object' &&
      typeof snapshot.autonomyStatus === 'object'
    );
  }

  // ========== Text and Formatting Utilities ==========

  /**
   * Format large numbers with appropriate units
   */
  public static formatLargeNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
  }

  /**
   * Format percentage
   */
  public static formatPercentage(value: number, decimals: number = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  /**
   * Format duration in milliseconds
   */
  public static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }

  /**
   * Truncate text with ellipsis
   */
  public static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  // ========== Canvas Utilities ==========

  /**
   * Set high DPI canvas
   */
  public static setHighDPICanvas(canvas: HTMLCanvasElement, width: number, height: number): CanvasRenderingContext2D {
    const ctx = canvas.getContext('2d')!;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    return ctx;
  }

  /**
   * Clear canvas with background
   */
  public static clearCanvas(ctx: CanvasRenderingContext2D, backgroundColor?: string): void {
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    } else {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }

  /**
   * Draw rounded rectangle
   */
  public static drawRoundedRect(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // ========== Random Utilities ==========

  /**
   * Generate random color
   */
  public static randomColor(): string {
    const hue = Math.random() * 360;
    const saturation = 60 + Math.random() * 30;
    const lightness = 45 + Math.random() * 20;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  /**
   * Generate random point within bounds
   */
  public static randomPoint(bounds: { min: Point3D, max: Point3D }): Point3D {
    return {
      x: bounds.min.x + Math.random() * (bounds.max.x - bounds.min.x),
      y: bounds.min.y + Math.random() * (bounds.max.y - bounds.min.y),
      z: bounds.min.z + Math.random() * (bounds.max.z - bounds.min.z)
    };
  }

  /**
   * Seed-based random number generator
   */
  public static createSeededRandom(seed: number): () => number {
    let x = Math.sin(seed++) * 10000;
    return () => {
      x = Math.sin(x) * 10000;
      return x - Math.floor(x);
    };
  }
}