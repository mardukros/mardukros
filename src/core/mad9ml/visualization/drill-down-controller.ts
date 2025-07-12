/**
 * Drill-Down Controller - Enables interactive exploration of system components
 * 
 * Provides navigation capabilities to drill down into system components,
 * zoom into details, and navigate back through the exploration hierarchy.
 */

import {
  DrillDownContext,
  DetailLevel,
  NavigationAction,
  VisualizationNode,
  VisualizationEdge,
  MembraneVisualization
} from './types.js';

export class DrillDownController {
  private context: DrillDownContext;
  private history: DrillDownContext[];
  private eventListeners: Map<string, Function[]> = new Map();
  
  constructor() {
    this.context = {
      currentFocus: '',
      path: [],
      availableDetails: ['overview', 'component', 'detailed', 'internal', 'tensor', 'raw'],
      currentDetail: 'overview'
    };
    this.history = [];
  }

  /**
   * Focus on a specific element (node, edge, or membrane)
   */
  public focus(elementId: string): void {
    // Save current context to history
    this.history.push({ ...this.context });
    
    // Update context
    this.context.currentFocus = elementId;
    this.context.path.push(elementId);
    this.context.currentDetail = 'component';
    
    this.emit('focus', { elementId, context: this.context });
  }

  /**
   * Navigate to a specific detail level
   */
  public setDetailLevel(level: DetailLevel): void {
    if (this.context.availableDetails.includes(level)) {
      this.context.currentDetail = level;
      this.emit('detailChange', { level, context: this.context });
    }
  }

  /**
   * Navigate back to previous context
   */
  public back(): void {
    if (this.history.length > 0) {
      this.context = this.history.pop()!;
      this.emit('back', { context: this.context });
    }
  }

  /**
   * Reset to overview
   */
  public reset(): void {
    this.context = {
      currentFocus: '',
      path: [],
      availableDetails: ['overview', 'component', 'detailed', 'internal', 'tensor', 'raw'],
      currentDetail: 'overview'
    };
    this.history = [];
    this.emit('reset', { context: this.context });
  }

  /**
   * Zoom into a specific component
   */
  public zoom(elementId: string, level: DetailLevel = 'detailed'): void {
    this.focus(elementId);
    this.setDetailLevel(level);
  }

  /**
   * Filter visible elements based on criteria
   */
  public filter(criteria: Record<string, any>): void {
    this.emit('filter', { criteria, context: this.context });
  }

  /**
   * Get current navigation context
   */
  public getContext(): DrillDownContext {
    return { ...this.context };
  }

  /**
   * Get navigation breadcrumb
   */
  public getBreadcrumb(): string[] {
    return [...this.context.path];
  }

  /**
   * Check if can navigate back
   */
  public canGoBack(): boolean {
    return this.history.length > 0;
  }

  /**
   * Generate detail view for current focus
   */
  public generateDetailView(element: VisualizationNode | VisualizationEdge | MembraneVisualization): any {
    switch (this.context.currentDetail) {
      case 'overview':
        return this.generateOverview(element);
      case 'component':
        return this.generateComponentView(element);
      case 'detailed':
        return this.generateDetailedView(element);
      case 'internal':
        return this.generateInternalView(element);
      case 'tensor':
        return this.generateTensorView(element);
      case 'raw':
        return this.generateRawView(element);
      default:
        return this.generateOverview(element);
    }
  }

  /**
   * Generate overview information
   */
  private generateOverview(element: any): any {
    return {
      type: 'overview',
      id: element.id,
      elementType: element.type || 'unknown',
      summary: `${element.type || 'Element'} with ID: ${element.id}`,
      keyMetrics: this.extractKeyMetrics(element),
      lastUpdated: element.lastUpdated || element.lastActivity || 'Unknown'
    };
  }

  /**
   * Generate component-level view
   */
  private generateComponentView(element: any): any {
    const baseInfo = this.generateOverview(element);
    
    return {
      ...baseInfo,
      type: 'component',
      properties: this.extractProperties(element),
      relationships: this.extractRelationships(element),
      status: this.extractStatus(element)
    };
  }

  /**
   * Generate detailed technical view
   */
  private generateDetailedView(element: any): any {
    const componentInfo = this.generateComponentView(element);
    
    return {
      ...componentInfo,
      type: 'detailed',
      configuration: this.extractConfiguration(element),
      performance: this.extractPerformanceMetrics(element),
      history: this.extractHistory(element),
      dependencies: this.extractDependencies(element)
    };
  }

  /**
   * Generate internal structure view
   */
  private generateInternalView(element: any): any {
    const detailedInfo = this.generateDetailedView(element);
    
    return {
      ...detailedInfo,
      type: 'internal',
      internalStructure: this.extractInternalStructure(element),
      algorithms: this.extractAlgorithms(element),
      dataStructures: this.extractDataStructures(element),
      memoryLayout: this.extractMemoryLayout(element)
    };
  }

  /**
   * Generate tensor-specific view
   */
  private generateTensorView(element: any): any {
    if (!element.state) {
      return { type: 'tensor', error: 'No tensor data available' };
    }
    
    return {
      type: 'tensor',
      id: element.id,
      tensorData: {
        shape: element.state.shape,
        data: element.state.data,
        summary: element.state.summary,
        visualization: element.state.visualization
      },
      analysis: this.analyzeTensorData(element.state),
      recommendations: this.generateTensorRecommendations(element.state)
    };
  }

  /**
   * Generate raw data view
   */
  private generateRawView(element: any): any {
    return {
      type: 'raw',
      id: element.id,
      rawData: JSON.stringify(element, null, 2),
      dataSize: JSON.stringify(element).length,
      structure: this.analyzeDataStructure(element)
    };
  }

  // ========== Data Extraction Methods ==========

  private extractKeyMetrics(element: any): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    if (element.activation !== undefined) metrics.activation = element.activation;
    if (element.activity !== undefined) metrics.activity = element.activity;
    if (element.weight !== undefined) metrics.weight = element.weight;
    if (element.throughput !== undefined) metrics.throughput = element.throughput;
    if (element.messageCount !== undefined) metrics.messageCount = element.messageCount;
    
    return metrics;
  }

  private extractProperties(element: any): Record<string, any> {
    const properties: Record<string, any> = {};
    
    // Common properties
    if (element.size !== undefined) properties.size = element.size;
    if (element.color !== undefined) properties.color = element.color;
    if (element.position !== undefined) properties.position = element.position;
    
    // Node-specific properties
    if (element.label !== undefined) properties.label = element.label;
    if (element.metadata !== undefined) properties.metadata = element.metadata;
    
    // Edge-specific properties
    if (element.source !== undefined) properties.source = element.source;
    if (element.target !== undefined) properties.target = element.target;
    if (element.strength !== undefined) properties.strength = element.strength;
    
    // Membrane-specific properties
    if (element.boundary !== undefined) properties.boundary = element.boundary;
    if (element.ports !== undefined) properties.portCount = element.ports.length;
    if (element.nestedMembranes !== undefined) properties.nestedCount = element.nestedMembranes.length;
    
    return properties;
  }

  private extractRelationships(element: any): any[] {
    const relationships = [];
    
    // For nodes, find connected edges
    if (element.type && ['memory', 'concept', 'agent', 'kernel'].includes(element.type)) {
      // This would require access to the full graph context
      relationships.push({
        type: 'connected_to',
        description: 'Connected to other nodes via edges',
        count: 'Unknown' // Would need graph context to calculate
      });
    }
    
    // For edges, show source and target
    if (element.source && element.target) {
      relationships.push({
        type: 'connects',
        description: `Connects ${element.source} to ${element.target}`,
        strength: element.strength || 'Unknown'
      });
    }
    
    // For membranes, show containment relationships
    if (element.contents) {
      relationships.push({
        type: 'contains',
        description: `Contains ${element.contents.length} nodes`,
        count: element.contents.length
      });
    }
    
    if (element.nestedMembranes) {
      relationships.push({
        type: 'nests',
        description: `Contains ${element.nestedMembranes.length} nested membranes`,
        count: element.nestedMembranes.length
      });
    }
    
    return relationships;
  }

  private extractStatus(element: any): any {
    const status: any = {
      overall: 'unknown'
    };
    
    // Determine status based on element type and properties
    if (element.activation !== undefined) {
      status.activation = element.activation > 0.7 ? 'high' : 
                         element.activation > 0.3 ? 'medium' : 'low';
    }
    
    if (element.activity !== undefined) {
      status.activity = element.activity > 0.5 ? 'active' : 'inactive';
    }
    
    if (element.status !== undefined) {
      status.overall = element.status;
    }
    
    return status;
  }

  private extractConfiguration(element: any): Record<string, any> {
    // Extract configuration parameters
    const config: Record<string, any> = {};
    
    if (element.metadata) {
      Object.keys(element.metadata).forEach(key => {
        if (typeof element.metadata[key] !== 'object') {
          config[key] = element.metadata[key];
        }
      });
    }
    
    return config;
  }

  private extractPerformanceMetrics(element: any): Record<string, any> {
    const metrics: Record<string, any> = {};
    
    // Extract performance-related data
    if (element.averageResponseTime !== undefined) metrics.responseTime = element.averageResponseTime;
    if (element.throughput !== undefined) metrics.throughput = element.throughput;
    if (element.efficiency !== undefined) metrics.efficiency = element.efficiency;
    if (element.lastActive !== undefined) metrics.lastActive = element.lastActive;
    
    return metrics;
  }

  private extractHistory(element: any): any[] {
    // Extract historical data if available
    const history = [];
    
    if (element.lastUpdated) {
      history.push({
        timestamp: element.lastUpdated,
        event: 'last_updated',
        description: 'Element was last updated'
      });
    }
    
    if (element.lastActivity) {
      history.push({
        timestamp: element.lastActivity,
        event: 'last_activity',
        description: 'Last recorded activity'
      });
    }
    
    return history;
  }

  private extractDependencies(element: any): any[] {
    const dependencies = [];
    
    // Extract dependency information
    if (element.source) {
      dependencies.push({
        type: 'source',
        id: element.source,
        relationship: 'depends_on'
      });
    }
    
    if (element.target) {
      dependencies.push({
        type: 'target',
        id: element.target,
        relationship: 'affects'
      });
    }
    
    return dependencies;
  }

  private extractInternalStructure(element: any): any {
    const structure: any = {};
    
    // Analyze internal structure
    if (element.state) {
      structure.stateStructure = {
        shape: element.state.shape,
        dataType: typeof element.state.data[0],
        dimensions: element.state.shape.length
      };
    }
    
    if (element.ports) {
      structure.portStructure = {
        totalPorts: element.ports.length,
        portTypes: [...new Set(element.ports.map((p: any) => p.direction))]
      };
    }
    
    return structure;
  }

  private extractAlgorithms(element: any): string[] {
    // Identify algorithms based on element type
    const algorithms = [];
    
    switch (element.type) {
      case 'memory':
        algorithms.push('Memory Storage', 'Retrieval Algorithm', 'Compression');
        break;
      case 'concept':
        algorithms.push('Concept Activation', 'Semantic Similarity');
        break;
      case 'agent':
        algorithms.push('Decision Making', 'Action Selection');
        break;
      default:
        algorithms.push('Generic Processing');
    }
    
    return algorithms;
  }

  private extractDataStructures(element: any): string[] {
    const structures = [];
    
    if (element.state && element.state.shape) {
      structures.push(`Tensor[${element.state.shape.join('x')}]`);
    }
    
    if (element.metadata) {
      structures.push('Metadata Map');
    }
    
    if (element.connections) {
      structures.push('Connection List');
    }
    
    return structures;
  }

  private extractMemoryLayout(element: any): any {
    const layout: any = {};
    
    if (element.state) {
      layout.tensorMemory = {
        size: element.state.data.length * 8, // Assuming 64-bit floats
        shape: element.state.shape,
        utilization: 'Full'
      };
    }
    
    if (element.metadata) {
      layout.metadataMemory = {
        size: JSON.stringify(element.metadata).length,
        type: 'JSON Object'
      };
    }
    
    return layout;
  }

  private analyzeTensorData(tensorData: any): any {
    const analysis: any = {};
    
    if (tensorData.data && tensorData.data.length > 0) {
      analysis.statistics = {
        mean: tensorData.summary?.mean || this.calculateMean(tensorData.data),
        std: tensorData.summary?.std || this.calculateStd(tensorData.data),
        min: tensorData.summary?.min || Math.min(...tensorData.data),
        max: tensorData.summary?.max || Math.max(...tensorData.data)
      };
      
      analysis.distribution = this.analyzeDistribution(tensorData.data);
      analysis.patterns = this.detectPatterns(tensorData.data, tensorData.shape);
    }
    
    return analysis;
  }

  private generateTensorRecommendations(tensorData: any): string[] {
    const recommendations = [];
    
    if (tensorData.summary) {
      const { mean, std, min, max } = tensorData.summary;
      
      if (std < 0.1) {
        recommendations.push('Low variance detected - consider adding noise for robustness');
      }
      
      if (Math.abs(mean) > 1) {
        recommendations.push('Consider normalizing tensor values');
      }
      
      if (max - min > 10) {
        recommendations.push('Large value range - consider scaling');
      }
    }
    
    return recommendations;
  }

  private analyzeDataStructure(element: any): any {
    const structure: any = {
      type: typeof element,
      properties: Object.keys(element).length,
      nested: false,
      complexity: 'simple'
    };
    
    // Check for nested structures
    Object.values(element).forEach(value => {
      if (typeof value === 'object' && value !== null) {
        structure.nested = true;
        structure.complexity = 'complex';
      }
    });
    
    return structure;
  }

  // ========== Utility Methods ==========

  private calculateMean(data: number[]): number {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  private calculateStd(data: number[]): number {
    const mean = this.calculateMean(data);
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  private analyzeDistribution(data: number[]): any {
    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    
    return {
      median: n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)],
      q1: sorted[Math.floor(n * 0.25)],
      q3: sorted[Math.floor(n * 0.75)],
      skewness: this.calculateSkewness(data),
      kurtosis: this.calculateKurtosis(data)
    };
  }

  private calculateSkewness(data: number[]): number {
    const mean = this.calculateMean(data);
    const std = this.calculateStd(data);
    const n = data.length;
    
    const skewness = data.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / n;
    return skewness;
  }

  private calculateKurtosis(data: number[]): number {
    const mean = this.calculateMean(data);
    const std = this.calculateStd(data);
    const n = data.length;
    
    const kurtosis = data.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / n;
    return kurtosis - 3; // Excess kurtosis
  }

  private detectPatterns(data: number[], shape: number[]): string[] {
    const patterns = [];
    
    // Simple pattern detection
    if (data.every(val => val >= 0)) {
      patterns.push('All positive values');
    }
    
    if (data.every(val => val === data[0])) {
      patterns.push('Constant values');
    }
    
    // Check for trends in 1D data
    if (shape.length === 1) {
      let increasing = true;
      let decreasing = true;
      
      for (let i = 1; i < data.length; i++) {
        if (data[i] <= data[i-1]) increasing = false;
        if (data[i] >= data[i-1]) decreasing = false;
      }
      
      if (increasing) patterns.push('Monotonically increasing');
      if (decreasing) patterns.push('Monotonically decreasing');
    }
    
    return patterns;
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

  // ========== Public Event Handlers ==========

  public onFocus(callback: (elementId: string) => void): void {
    this.on('focus', callback);
  }

  public onDetailChange(callback: (data: { level: DetailLevel, context: DrillDownContext }) => void): void {
    this.on('detailChange', callback);
  }

  public onBack(callback: (data: { context: DrillDownContext }) => void): void {
    this.on('back', callback);
  }

  public onReset(callback: (data: { context: DrillDownContext }) => void): void {
    this.on('reset', callback);
  }

  public onFilter(callback: (data: { criteria: Record<string, any>, context: DrillDownContext }) => void): void {
    this.on('filter', callback);
  }
}