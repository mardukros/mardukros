/**
 * Tensor Shape Auto-Discovery and Documentation System
 * 
 * Provides automatic discovery, reporting, and documentation of tensor shapes
 * across all cognitive kernels. Creates living documentation that evolves
 * with the system.
 */

import { cognitiveKernelRegistry, TensorShapeReport, SystemMetrics } from './cognitive-kernel-registry.js';
import { TensorShape } from '../mad9ml/types.js';

/**
 * Auto-discovery configuration
 */
export interface AutoDiscoveryConfig {
  reportInterval: number; // milliseconds
  documentationPath: string;
  enableRealTimeUpdates: boolean;
  includePerformanceMetrics: boolean;
  enableEvolutionTracking: boolean;
}

/**
 * Tensor shape evolution tracking
 */
export interface TensorShapeEvolution {
  kernelId: string;
  timestamp: string;
  previousShape: TensorShape;
  currentShape: TensorShape;
  changeReason: string;
  impactAssessment: {
    memoryDelta: number;
    performanceImpact: string;
    compatibilityIssues: string[];
    migrationRequired: boolean;
  };
}

/**
 * Living documentation generator
 */
export class TensorShapeDocumentationGenerator {
  private config: AutoDiscoveryConfig;
  private evolutionHistory: TensorShapeEvolution[] = [];
  private lastReport: TensorShapeReport | null = null;

  constructor(config: AutoDiscoveryConfig) {
    this.config = config;
  }

  /**
   * Generate comprehensive tensor shape documentation
   */
  public generateDocumentation(): string {
    const report = cognitiveKernelRegistry.generateTensorShapeReport();
    const documentation = this.buildDocumentationContent(report);
    
    this.lastReport = report;
    return documentation;
  }

  /**
   * Build documentation content in markdown format
   */
  private buildDocumentationContent(report: TensorShapeReport): string {
    return `# Cognitive Kernel Tensor Shape Documentation

Generated: ${report.timestamp}
Total Kernels: ${report.totalKernels}

## System Overview

${this.generateSystemOverview(report)}

## Tensor Shape Specifications

${this.generateTensorShapeSpecs(report)}

## Memory and Performance Analysis

${this.generatePerformanceAnalysis(report)}

## Cognitive Architecture Analysis

${this.generateArchitectureAnalysis(report)}

## Distribution Optimization

${this.generateDistributionAnalysis(report)}

## Evolution History

${this.generateEvolutionHistory()}

## Auto-Discovery Metadata

${this.generateAutoDiscoveryMetadata(report)}
`;
  }

  /**
   * Generate system overview section
   */
  private generateSystemOverview(report: TensorShapeReport): string {
    const categories = Object.keys(report.categories);
    const totalElements = report.systemMetrics.totalTensorElements;
    const memoryMB = report.systemMetrics.memoryFootprintMB;

    return `### System Metrics
- **Total Cognitive Dimensions**: ${report.systemMetrics.totalCognitiveDimensions}
- **Total Tensor Elements**: ${totalElements.toLocaleString()}
- **Memory Footprint**: ${memoryMB.toFixed(2)} MB
- **Distribution Efficiency**: ${(report.systemMetrics.distributionEfficiency * 100).toFixed(1)}%
- **Average Complexity**: ${report.systemMetrics.averageComplexity.toFixed(2)}

### Kernel Categories
${categories.map(cat => `- **${cat}**: ${report.categories[cat].length} kernels`).join('\n')}

### Complexity Distribution
${Object.entries(report.complexityDistribution)
  .map(([complexity, count]) => `- **${complexity}**: ${count} kernels`)
  .join('\n')}
`;
  }

  /**
   * Generate tensor shape specifications for each kernel
   */
  private generateTensorShapeSpecs(report: TensorShapeReport): string {
    const kernels = cognitiveKernelRegistry.getAllKernels();
    
    return kernels.map(kernel => {
      const shape = kernel.tensorShape;
      const elements = shape.reduce((prod, dim) => prod * dim, 1);
      const memoryMB = (elements * 4) / (1024 * 1024);
      
      return `### ${kernel.name} (${kernel.id})

**Category**: ${kernel.category}
**Tensor Shape**: [${shape.join(', ')}]
**Total Elements**: ${elements.toLocaleString()}
**Memory Size**: ${memoryMB.toFixed(3)} MB
**Data Type**: f32

**Cognitive Degrees of Freedom**:
- Dimensions: ${kernel.degreesOfFreedom.dimensions}
- Complexity: ${kernel.degreesOfFreedom.complexity}
- Temporal: ${kernel.degreesOfFreedom.temporal}
- Interfaces: ${kernel.degreesOfFreedom.interfaces}
- Context: ${kernel.degreesOfFreedom.context}
- Adaptation: ${kernel.degreesOfFreedom.adaptation}

**Functional Complexity**:
- Computational: ${kernel.functionalComplexity.computational}
- Memory Access: ${kernel.functionalComplexity.memoryAccess}
- Branching Factor: ${kernel.functionalComplexity.branching}
- State Space: ${kernel.functionalComplexity.stateSpace.toLocaleString()}
- Bandwidth: ${kernel.functionalComplexity.bandwidth} ops/sec

**Design Reasoning**:
${kernel.reasoning}

**Prime Factorization**: [${kernel.primeFactorization.join(' × ')}]
**Dependencies**: ${kernel.dependencies.length > 0 ? kernel.dependencies.join(', ') : 'None'}

**Interface Mappings**:
${kernel.interfaces.map(iface => 
  `- **${iface.name}** (${iface.type}): [${iface.tensorComponent.dimensions.join(', ')}] - ${iface.tensorComponent.semanticMeaning}`
).join('\n')}
`;
    }).join('\n\n');
  }

  /**
   * Generate performance analysis section
   */
  private generatePerformanceAnalysis(report: TensorShapeReport): string {
    const kernels = cognitiveKernelRegistry.getAllKernels();
    
    // Analyze memory distribution
    const memoryByCategory = kernels.reduce((acc, kernel) => {
      const elements = kernel.tensorShape.reduce((prod, dim) => prod * dim, 1);
      const memoryMB = (elements * 4) / (1024 * 1024);
      acc[kernel.category] = (acc[kernel.category] || 0) + memoryMB;
      return acc;
    }, {} as Record<string, number>);

    // Analyze computational complexity distribution
    const complexityAnalysis = kernels.reduce((acc, kernel) => {
      const complexity = kernel.functionalComplexity.computational;
      acc[complexity] = (acc[complexity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return `### Memory Distribution by Category
${Object.entries(memoryByCategory)
  .sort(([,a], [,b]) => b - a)
  .map(([category, memory]) => `- **${category}**: ${memory.toFixed(2)} MB`)
  .join('\n')}

### Computational Complexity Analysis
${Object.entries(complexityAnalysis)
  .map(([complexity, count]) => `- **${complexity}**: ${count} kernels`)
  .join('\n')}

### Performance Optimization Recommendations
${this.generateOptimizationRecommendations(kernels)}
`;
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationRecommendations(kernels: any[]): string {
    const recommendations: string[] = [];

    // Check for large tensors
    const largeTensors = kernels.filter(k => {
      const elements = k.tensorShape.reduce((prod: number, dim: number) => prod * dim, 1);
      return elements > 10000000; // > 10M elements
    });

    if (largeTensors.length > 0) {
      recommendations.push(`🔍 **Large Tensor Optimization**: Consider sparse representations for: ${largeTensors.map(k => k.name).join(', ')}`);
    }

    // Check for inefficient access patterns
    const randomAccessKernels = kernels.filter(k => k.functionalComplexity.memoryAccess === 'random');
    if (randomAccessKernels.length > 3) {
      recommendations.push(`⚡ **Memory Access Optimization**: ${randomAccessKernels.length} kernels use random access - consider cache-friendly layouts`);
    }

    // Check for high complexity operations
    const highComplexityKernels = kernels.filter(k => 
      k.functionalComplexity.computational === 'O(n²)' || k.functionalComplexity.computational === 'O(2^n)'
    );
    if (highComplexityKernels.length > 0) {
      recommendations.push(`🚀 **Algorithmic Optimization**: High complexity operations in: ${highComplexityKernels.map(k => k.name).join(', ')}`);
    }

    return recommendations.length > 0 ? recommendations.join('\n') : 'No immediate optimization recommendations.';
  }

  /**
   * Generate cognitive architecture analysis
   */
  private generateArchitectureAnalysis(report: TensorShapeReport): string {
    const kernels = cognitiveKernelRegistry.getAllKernels();
    
    // Analyze cognitive dimensions distribution
    const dimensionStats = kernels.map(k => k.degreesOfFreedom.dimensions);
    const avgDimensions = dimensionStats.reduce((sum, d) => sum + d, 0) / dimensionStats.length;
    const maxDimensions = Math.max(...dimensionStats);
    const minDimensions = Math.min(...dimensionStats);

    // Analyze adaptation capabilities
    const adaptationStats = kernels.map(k => k.degreesOfFreedom.adaptation);
    const avgAdaptation = adaptationStats.reduce((sum, d) => sum + d, 0) / adaptationStats.length;

    return `### Cognitive Dimension Analysis
- **Average Dimensions**: ${avgDimensions.toFixed(2)}
- **Range**: ${minDimensions} - ${maxDimensions}
- **Average Adaptation Level**: ${avgAdaptation.toFixed(2)}

### Architecture Insights
${this.generateArchitectureInsights(kernels)}

### Emergent Properties
${this.generateEmergentProperties(kernels)}
`;
  }

  /**
   * Generate architecture insights
   */
  private generateArchitectureInsights(kernels: any[]): string {
    const insights: string[] = [];

    // Check for balanced architecture
    const categoryBalance = kernels.reduce((acc, k) => {
      acc[k.category] = (acc[k.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const balanceVariance = Object.values(categoryBalance).reduce((sum, count, _, arr) => {
      const avg = arr.reduce((s, c) => s + c, 0) / arr.length;
      return sum + Math.pow(count - avg, 2);
    }, 0) / Object.values(categoryBalance).length;

    if (balanceVariance < 2) {
      insights.push('✅ **Balanced Architecture**: Cognitive categories are well-balanced');
    } else {
      insights.push('⚠️ **Architecture Imbalance**: Consider balancing cognitive category distribution');
    }

    // Check for integration complexity
    const totalDependencies = kernels.reduce((sum, k) => sum + k.dependencies.length, 0);
    const avgDependencies = totalDependencies / kernels.length;

    if (avgDependencies > 2) {
      insights.push('🔗 **High Integration**: Strong inter-kernel dependencies detected');
    } else {
      insights.push('🔧 **Modular Design**: Low coupling between kernels');
    }

    return insights.join('\n');
  }

  /**
   * Generate emergent properties analysis
   */
  private generateEmergentProperties(kernels: any[]): string {
    const properties: string[] = [];

    // Calculate system-wide cognitive capacity
    const totalCapacity = kernels.reduce((sum, k) => {
      return sum + k.degreesOfFreedom.dimensions * k.degreesOfFreedom.complexity;
    }, 0);

    properties.push(`🧠 **Total Cognitive Capacity**: ${totalCapacity}`);

    // Check for recursive capabilities
    const recursiveKernels = kernels.filter(k => k.id.includes('recursion') || k.id.includes('reflection'));
    if (recursiveKernels.length > 0) {
      properties.push(`🔄 **Self-Modification Capability**: ${recursiveKernels.length} recursive/reflective kernels`);
    }

    // Check for meta-cognitive capabilities
    const metaCognitiveKernels = kernels.filter(k => k.category === 'meta-cognitive');
    const metaCognitiveRatio = metaCognitiveKernels.length / kernels.length;
    
    if (metaCognitiveRatio > 0.15) {
      properties.push(`🎯 **Strong Meta-Cognition**: ${(metaCognitiveRatio * 100).toFixed(1)}% meta-cognitive kernels`);
    }

    return properties.join('\n');
  }

  /**
   * Generate distribution analysis
   */
  private generateDistributionAnalysis(report: TensorShapeReport): string {
    const kernels = cognitiveKernelRegistry.getAllKernels();
    
    // Analyze prime factorizations for distribution efficiency
    const primeFactorAnalysis = this.analyzePrimeFactors(kernels);
    
    return `### Distribution Efficiency: ${(report.systemMetrics.distributionEfficiency * 100).toFixed(1)}%

### Prime Factorization Analysis
${primeFactorAnalysis}

### Distribution Recommendations
${this.generateDistributionRecommendations(kernels)}
`;
  }

  /**
   * Analyze prime factors for distribution optimization
   */
  private analyzePrimeFactors(kernels: any[]): string {
    const allPrimes = new Set<number>();
    kernels.forEach(k => k.primeFactorization.forEach((p: number) => allPrimes.add(p)));
    
    const primeUsage = Array.from(allPrimes).map(prime => {
      const usage = kernels.filter(k => k.primeFactorization.includes(prime)).length;
      return { prime, usage, percentage: (usage / kernels.length * 100).toFixed(1) };
    }).sort((a, b) => b.usage - a.usage);

    return primeUsage.map(p => `- Prime ${p.prime}: ${p.usage} kernels (${p.percentage}%)`).join('\n');
  }

  /**
   * Generate distribution recommendations
   */
  private generateDistributionRecommendations(kernels: any[]): string {
    const recommendations: string[] = [];

    // Check for common factors
    const commonPrimes = [2, 3, 5];
    const compatibility = commonPrimes.map(prime => {
      const compatible = kernels.filter(k => k.primeFactorization.includes(prime)).length;
      return { prime, compatible, percentage: compatible / kernels.length };
    });

    const bestCompatibility = compatibility.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    );

    recommendations.push(`🎯 **Optimal Distribution Base**: Prime ${bestCompatibility.prime} (${(bestCompatibility.percentage * 100).toFixed(1)}% compatibility)`);

    // Check for distribution bottlenecks
    const largeTensors = kernels.filter(k => {
      const elements = k.tensorShape.reduce((prod: number, dim: number) => prod * dim, 1);
      return elements > 1000000;
    });

    if (largeTensors.length > 0) {
      recommendations.push(`📊 **Distribution Candidates**: ${largeTensors.map(k => k.name).join(', ')}`);
    }

    return recommendations.join('\n');
  }

  /**
   * Generate evolution history section
   */
  private generateEvolutionHistory(): string {
    if (this.evolutionHistory.length === 0) {
      return 'No tensor shape evolution recorded yet.';
    }

    return this.evolutionHistory.slice(-10).map(evolution => {
      return `### ${evolution.kernelId} - ${evolution.timestamp}
**Change**: [${evolution.previousShape.join(', ')}] → [${evolution.currentShape.join(', ')}]
**Reason**: ${evolution.changeReason}
**Memory Delta**: ${evolution.impactAssessment.memoryDelta > 0 ? '+' : ''}${evolution.impactAssessment.memoryDelta} MB
**Performance Impact**: ${evolution.impactAssessment.performanceImpact}
**Migration Required**: ${evolution.impactAssessment.migrationRequired ? 'Yes' : 'No'}
`;
    }).join('\n\n');
  }

  /**
   * Generate auto-discovery metadata
   */
  private generateAutoDiscoveryMetadata(report: TensorShapeReport): string {
    return `### Discovery Configuration
- **Report Interval**: ${this.config.reportInterval}ms
- **Real-time Updates**: ${this.config.enableRealTimeUpdates ? 'Enabled' : 'Disabled'}
- **Performance Metrics**: ${this.config.includePerformanceMetrics ? 'Enabled' : 'Disabled'}
- **Evolution Tracking**: ${this.config.enableEvolutionTracking ? 'Enabled' : 'Disabled'}

### Report Generation
- **Generated At**: ${report.timestamp}
- **Total Processing Time**: ~${Date.now() - new Date(report.timestamp).getTime()}ms
- **Evolution Events**: ${this.evolutionHistory.length}

### Next Steps
- Monitor tensor shape evolution for optimization opportunities
- Track performance metrics for bottleneck identification
- Update documentation automatically as system evolves
- Analyze distribution patterns for scaling optimization
`;
  }

  /**
   * Track tensor shape evolution
   */
  public trackEvolution(kernelId: string, previousShape: TensorShape, currentShape: TensorShape, reason: string): void {
    const evolution: TensorShapeEvolution = {
      kernelId,
      timestamp: new Date().toISOString(),
      previousShape,
      currentShape,
      changeReason: reason,
      impactAssessment: this.assessShapeChangeImpact(previousShape, currentShape)
    };

    this.evolutionHistory.push(evolution);

    // Keep only last 100 evolution events
    if (this.evolutionHistory.length > 100) {
      this.evolutionHistory = this.evolutionHistory.slice(-100);
    }
  }

  /**
   * Assess impact of tensor shape changes
   */
  private assessShapeChangeImpact(previousShape: TensorShape, currentShape: TensorShape): any {
    const prevElements = previousShape.reduce((prod, dim) => prod * dim, 1);
    const currElements = currentShape.reduce((prod, dim) => prod * dim, 1);
    const memoryDelta = ((currElements - prevElements) * 4) / (1024 * 1024); // MB

    const compatibilityIssues: string[] = [];
    
    // Check dimension compatibility
    if (previousShape.length !== currentShape.length) {
      compatibilityIssues.push('Dimension count changed');
    }

    // Check for significant size changes
    const sizeChangeRatio = currElements / prevElements;
    let performanceImpact = 'Minimal';
    
    if (sizeChangeRatio > 2) {
      performanceImpact = 'Increased - tensor size doubled or more';
      compatibilityIssues.push('Significant memory increase');
    } else if (sizeChangeRatio < 0.5) {
      performanceImpact = 'Improved - tensor size reduced significantly';
    } else if (Math.abs(sizeChangeRatio - 1) > 0.1) {
      performanceImpact = 'Moderate - noticeable size change';
    }

    return {
      memoryDelta: Math.round(memoryDelta * 100) / 100,
      performanceImpact,
      compatibilityIssues,
      migrationRequired: compatibilityIssues.length > 0 || Math.abs(memoryDelta) > 10
    };
  }
}

/**
 * Auto-discovery service for continuous monitoring
 */
export class TensorShapeAutoDiscovery {
  private generator: TensorShapeDocumentationGenerator;
  private intervalId: NodeJS.Timeout | null = null;
  private lastShapeSnapshot: Map<string, TensorShape> = new Map();

  constructor(config: AutoDiscoveryConfig) {
    this.generator = new TensorShapeDocumentationGenerator(config);
    this.initializeShapeSnapshot();
  }

  /**
   * Start auto-discovery monitoring
   */
  public start(): void {
    if (this.intervalId) {
      this.stop();
    }

    this.intervalId = setInterval(() => {
      this.performDiscovery();
    }, this.generator['config'].reportInterval);
  }

  /**
   * Stop auto-discovery monitoring
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Perform discovery cycle
   */
  private performDiscovery(): void {
    const kernels = cognitiveKernelRegistry.getAllKernels();
    
    // Check for tensor shape changes
    kernels.forEach(kernel => {
      const currentShape = kernel.tensorShape;
      const previousShape = this.lastShapeSnapshot.get(kernel.id);
      
      if (previousShape && !this.shapesEqual(previousShape, currentShape)) {
        this.generator.trackEvolution(
          kernel.id,
          previousShape,
          currentShape,
          'Automatic discovery detected change'
        );
      }
      
      this.lastShapeSnapshot.set(kernel.id, [...currentShape]);
    });

    // Generate updated documentation
    const documentation = this.generator.generateDocumentation();
    
    // In a real implementation, this would write to file or update a database
    console.log('Tensor shape documentation updated:', new Date().toISOString());
  }

  /**
   * Initialize shape snapshot for change detection
   */
  private initializeShapeSnapshot(): void {
    const kernels = cognitiveKernelRegistry.getAllKernels();
    kernels.forEach(kernel => {
      this.lastShapeSnapshot.set(kernel.id, [...kernel.tensorShape]);
    });
  }

  /**
   * Check if two tensor shapes are equal
   */
  private shapesEqual(shape1: TensorShape, shape2: TensorShape): boolean {
    if (shape1.length !== shape2.length) return false;
    return shape1.every((dim, i) => dim === shape2[i]);
  }

  /**
   * Get current documentation
   */
  public getCurrentDocumentation(): string {
    return this.generator.generateDocumentation();
  }

  /**
   * Get evolution history
   */
  public getEvolutionHistory(): TensorShapeEvolution[] {
    return [...this.generator['evolutionHistory']];
  }
}

// Export default configuration
export const defaultAutoDiscoveryConfig: AutoDiscoveryConfig = {
  reportInterval: 60000, // 1 minute
  documentationPath: './docs/tensor-shapes.md',
  enableRealTimeUpdates: true,
  includePerformanceMetrics: true,
  enableEvolutionTracking: true
};

// Export singleton auto-discovery service
export const tensorShapeAutoDiscovery = new TensorShapeAutoDiscovery(defaultAutoDiscoveryConfig);