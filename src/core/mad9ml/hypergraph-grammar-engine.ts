/**
 * Hypergraph Grammar Engine - Neural-symbolic integration for agentic grammar patterns
 * 
 * Implements hypergraph patterns for encoding agentic grammar rules, enabling
 * neural-symbolic integration and complex, recursive pattern-matching with
 * parallel tensor operations.
 */

import { CognitiveHypergraphImpl } from './hypergraph/cognitive-hypergraph';
import { AgenticGrammarExtractor } from './agentic-grammar/extractor';
import { makeTensor, randomTensor, addTensors, scaleTensor, dotProduct } from './tensor/operations';
import { 
  AgenticPrimitive, 
  AgenticPrimitiveType, 
  GrammarToken,
  GgmlKernel,
  AgenticGrammarConfig
} from './agentic-grammar/types';
import { 
  CognitiveNode, 
  CognitiveEdge, 
  Tensor, 
  TensorShape,
  CognitiveHypergraph 
} from './types';

/**
 * Hypergraph pattern for encoding grammar rules
 */
export interface HypergraphPattern {
  id: string;
  name: string;
  primitiveTypes: AgenticPrimitiveType[];
  nodeStructure: {
    nodeCount: number;
    edgeTypes: string[];
    constraints: Record<string, any>;
  };
  tensorShape: TensorShape;
  transformations: PatternTransformation[];
  recursingDepth: number;
}

/**
 * Tensor transformation for parallel execution
 */
export interface PatternTransformation {
  id: string;
  inputShape: TensorShape;
  outputShape: TensorShape;
  operation: 'matmul' | 'conv' | 'attention' | 'composition' | 'decomposition';
  parameters: Tensor;
  metadata: {
    parallelizable: boolean;
    computeComplexity: number;
  };
}

/**
 * Pattern matching result with tensor representations
 */
export interface PatternMatchResult {
  pattern: HypergraphPattern;
  confidence: number;
  matchedNodes: string[];
  tensorRepresentation: Tensor;
  activations: Map<string, number>;
  recursionDepth: number;
}

/**
 * Self-analysis metrics for meta-cognitive enhancement
 */
export interface AnalysisMetrics {
  patternEfficiency: number;
  evolutionRate: number;
  complexityGrowth: number;
  recursionStability: number;
  neuralSymbolicAlignment: number;
}

/**
 * Main hypergraph grammar engine
 */
export class HypergraphGrammarEngine {
  private hypergraph: CognitiveHypergraphImpl;
  private extractor: AgenticGrammarExtractor;
  private patterns: Map<string, HypergraphPattern>;
  private transformations: Map<string, PatternTransformation>;
  private config: AgenticGrammarConfig;
  
  // Meta-cognitive state
  private analysisHistory: AnalysisMetrics[];
  private evolutionParameters: Tensor;

  constructor(config: AgenticGrammarConfig) {
    this.config = config;
    this.hypergraph = new CognitiveHypergraphImpl();
    this.extractor = new AgenticGrammarExtractor(config);
    this.patterns = new Map();
    this.transformations = new Map();
    this.analysisHistory = [];
    
    // Initialize meta-cognitive parameters
    this.evolutionParameters = randomTensor([10], 0.1); // Evolution meta-parameters
  }

  /**
   * Initialize the grammar engine with base patterns
   */
  async initialize(): Promise<void> {
    console.log('🧠 Initializing Hypergraph Grammar Engine...');
    
    // Extract agentic primitives from codebase
    await this.extractor.extractAgenticPrimitives();
    
    // Create base hypergraph patterns
    this.createBasePatterns();
    
    // Initialize transformation operations
    this.initializeTransformations();
    
    console.log(`✨ Engine initialized with ${this.patterns.size} patterns and ${this.transformations.size} transformations`);
  }

  /**
   * Creates base hypergraph patterns for core agentic grammar rules
   */
  private createBasePatterns(): void {
    const primitiveTypes: AgenticPrimitiveType[] = [
      'action', 'percept', 'memory', 'decision', 'planning',
      'communication', 'adaptation', 'attention', 'goal', 'constraint'
    ];

    // Sequential action pattern
    this.patterns.set('sequential_action', {
      id: 'sequential_action',
      name: 'Sequential Action Pattern',
      primitiveTypes: ['action', 'planning'],
      nodeStructure: {
        nodeCount: 3,
        edgeTypes: ['temporal', 'causal'],
        constraints: { sequenceOrder: true }
      },
      tensorShape: [3, 4, 8], // [steps, features, embedding]
      transformations: [],
      recursingDepth: 2
    });

    // Perception-action loop
    this.patterns.set('perception_action_loop', {
      id: 'perception_action_loop',
      name: 'Perception-Action Loop',
      primitiveTypes: ['percept', 'decision', 'action'],
      nodeStructure: {
        nodeCount: 4,
        edgeTypes: ['causal', 'temporal', 'semantic'],
        constraints: { cyclicStructure: true }
      },
      tensorShape: [4, 6, 12], // [loop_stages, context, features]
      transformations: [],
      recursingDepth: 3
    });

    // Memory-goal adaptation
    this.patterns.set('memory_goal_adaptation', {
      id: 'memory_goal_adaptation',
      name: 'Memory-Goal Adaptation Pattern',
      primitiveTypes: ['memory', 'goal', 'adaptation', 'attention'],
      nodeStructure: {
        nodeCount: 5,
        edgeTypes: ['semantic', 'hierarchical', 'meta'],
        constraints: { adaptiveStructure: true }
      },
      tensorShape: [5, 8, 16], // [components, goals, memory_features]
      transformations: [],
      recursingDepth: 4
    });

    // Recursive constraint satisfaction
    this.patterns.set('recursive_constraint_satisfaction', {
      id: 'recursive_constraint_satisfaction',
      name: 'Recursive Constraint Satisfaction',
      primitiveTypes: ['constraint', 'decision', 'planning'],
      nodeStructure: {
        nodeCount: 6,
        edgeTypes: ['hierarchical', 'constraint', 'temporal'],
        constraints: { recursiveStructure: true, depthLimit: 5 }
      },
      tensorShape: [6, 10, 20], // [constraints, decisions, plan_space]
      transformations: [],
      recursingDepth: 5
    });
  }

  /**
   * Initialize tensor transformation operations for parallel execution
   */
  private initializeTransformations(): void {
    // Attention transformation for pattern focus
    const attentionTransform: PatternTransformation = {
      id: 'attention_focus',
      inputShape: [10, 16],
      outputShape: [10, 8],
      operation: 'attention',
      parameters: randomTensor([16, 8], 0.1),
      metadata: {
        parallelizable: true,
        computeComplexity: 2
      }
    };

    // Composition transformation for pattern merging
    const compositionTransform: PatternTransformation = {
      id: 'pattern_composition',
      inputShape: [5, 8, 16],
      outputShape: [10, 16],
      operation: 'composition',
      parameters: randomTensor([5 * 8 * 16, 10 * 16], 0.05),
      metadata: {
        parallelizable: true,
        computeComplexity: 3
      }
    };

    // Recursive decomposition for pattern analysis
    const decompositionTransform: PatternTransformation = {
      id: 'recursive_decomposition',
      inputShape: [20, 32],
      outputShape: [4, 5, 8, 16],
      operation: 'decomposition',
      parameters: randomTensor([20 * 32, 4 * 5 * 8 * 16], 0.02),
      metadata: {
        parallelizable: false, // Sequential due to recursion dependencies
        computeComplexity: 5
      }
    };

    this.transformations.set('attention_focus', attentionTransform);
    this.transformations.set('pattern_composition', compositionTransform);
    this.transformations.set('recursive_decomposition', decompositionTransform);
  }

  /**
   * Encode agentic primitives as hypergraph patterns
   */
  async encodeGrammarAsHypergraph(primitives: AgenticPrimitive[]): Promise<CognitiveHypergraph> {
    console.log('🌐 Encoding agentic grammar as hypergraph patterns...');

    // Create nodes for each primitive
    for (const primitive of primitives) {
      const nodeId = `primitive_${primitive.id}`;
      const tensorState = this.primitiveToTensor(primitive);
      
      this.hypergraph.createNode(
        nodeId,
        this.mapPrimitiveToNodeType(primitive.type),
        tensorState.shape,
        {
          primitiveType: primitive.type,
          complexity: primitive.semanticComplexity,
          functionalDepth: primitive.functionalDepth,
          sourceLocation: primitive.sourceLocation
        }
      );
    }

    // Create pattern-based edges between related primitives
    this.createPatternEdges(primitives);
    
    // Create hierarchical clusters based on patterns
    this.createPatternClusters();

    return {
      nodes: this.hypergraph.nodes,
      edges: this.hypergraph.edges,
      clusters: this.hypergraph.clusters
    };
  }

  /**
   * Convert agentic primitive to tensor representation
   */
  private primitiveToTensor(primitive: AgenticPrimitive): Tensor {
    // Encode semantic complexity, functional depth, and parameter count
    const features = [
      primitive.semanticComplexity,
      primitive.functionalDepth,
      primitive.parameters.length,
      primitive.dependencies.length
    ];
    
    // Pad to standard feature vector size
    while (features.length < 16) {
      features.push(0);
    }
    
    return makeTensor([16], new Float32Array(features));
  }

  /**
   * Map agentic primitive type to cognitive node type
   */
  private mapPrimitiveToNodeType(primitiveType: AgenticPrimitiveType): CognitiveNode['type'] {
    const mapping: Record<AgenticPrimitiveType, CognitiveNode['type']> = {
      'action': 'action',
      'percept': 'context',
      'memory': 'memory',
      'decision': 'pattern',
      'planning': 'goal',
      'communication': 'context',
      'adaptation': 'pattern',
      'attention': 'pattern',
      'goal': 'goal',
      'constraint': 'concept'
    };
    
    return mapping[primitiveType] || 'concept';
  }

  /**
   * Create edges based on hypergraph patterns
   */
  private createPatternEdges(primitives: AgenticPrimitive[]): void {
    for (const pattern of this.patterns.values()) {
      const matchingPrimitives = primitives.filter(p => 
        pattern.primitiveTypes.includes(p.type)
      );

      // Create edges between primitives that match the same pattern
      for (let i = 0; i < matchingPrimitives.length - 1; i++) {
        for (let j = i + 1; j < matchingPrimitives.length; j++) {
          const source = `primitive_${matchingPrimitives[i].id}`;
          const target = `primitive_${matchingPrimitives[j].id}`;
          
          const similarity = this.calculatePrimitiveSimilarity(
            matchingPrimitives[i], 
            matchingPrimitives[j]
          );

          if (similarity > 0.3) {
            this.hypergraph.createEdge(
              `${pattern.id}_${source}_${target}`,
              'semantic',
              source,
              target,
              similarity,
              { pattern: pattern.id, edgeType: pattern.nodeStructure.edgeTypes[0] }
            );
          }
        }
      }
    }
  }

  /**
   * Calculate similarity between two agentic primitives
   */
  private calculatePrimitiveSimilarity(a: AgenticPrimitive, b: AgenticPrimitive): number {
    const tensorA = this.primitiveToTensor(a);
    const tensorB = this.primitiveToTensor(b);
    
    // Use dot product as similarity measure
    return Math.abs(dotProduct(tensorA, tensorB)) / (tensorA.size * tensorB.size);
  }

  /**
   * Create pattern-based clusters in the hypergraph
   */
  private createPatternClusters(): void {
    for (const pattern of this.patterns.values()) {
      const nodesInPattern: string[] = [];
      
      for (const [nodeId, node] of this.hypergraph.nodes) {
        if (pattern.primitiveTypes.includes(node.metadata.primitiveType)) {
          nodesInPattern.push(nodeId);
        }
      }
      
      if (nodesInPattern.length >= 2) {
        this.hypergraph.createCluster(`pattern_${pattern.id}`, nodesInPattern);
      }
    }
  }

  /**
   * Perform recursive pattern matching with tensor operations
   */
  async performRecursivePatternMatching(
    query: string,
    maxRecursionDepth: number = 5
  ): Promise<PatternMatchResult[]> {
    console.log(`🔍 Performing recursive pattern matching for: "${query}"`);
    
    const results: PatternMatchResult[] = [];
    
    for (const pattern of this.patterns.values()) {
      const result = await this.matchPatternRecursively(
        pattern,
        query,
        0,
        maxRecursionDepth
      );
      
      if (result.confidence > 0.1) {
        results.push(result);
      }
    }
    
    // Sort by confidence
    results.sort((a, b) => b.confidence - a.confidence);
    
    console.log(`📊 Found ${results.length} pattern matches`);
    return results;
  }

  /**
   * Recursively match a pattern against the hypergraph
   */
  private async matchPatternRecursively(
    pattern: HypergraphPattern,
    query: string,
    currentDepth: number,
    maxDepth: number
  ): Promise<PatternMatchResult> {
    // Base case: reached max depth
    if (currentDepth >= maxDepth || currentDepth >= pattern.recursingDepth) {
      return {
        pattern,
        confidence: 0,
        matchedNodes: [],
        tensorRepresentation: makeTensor([1]),
        activations: new Map(),
        recursionDepth: currentDepth
      };
    }

    // Find nodes matching the pattern's primitive types
    const candidateNodes: string[] = [];
    for (const [nodeId, node] of this.hypergraph.nodes) {
      if (pattern.primitiveTypes.includes(node.metadata.primitiveType)) {
        candidateNodes.push(nodeId);
      }
    }

    if (candidateNodes.length === 0) {
      return {
        pattern,
        confidence: 0,
        matchedNodes: [],
        tensorRepresentation: makeTensor([1]),
        activations: new Map(),
        recursionDepth: currentDepth
      };
    }

    // Perform attention spreading from query-related nodes
    const activations = this.hypergraph.spreadActivation(
      candidateNodes[0], // Start from first candidate
      1.0,
      0.8,
      3
    );

    // Create tensor representation by combining node states
    const combinedTensor = this.combineNodeTensors(candidateNodes);
    
    // Apply pattern transformations for parallel execution
    const transformedTensor = await this.applyPatternTransformations(
      combinedTensor,
      pattern
    );

    // Calculate confidence based on activation strength and query relevance
    const totalActivation = Array.from(activations.values())
      .reduce((sum, activation) => sum + activation, 0);
    
    const confidence = Math.min(totalActivation / candidateNodes.length, 1.0);

    // Recursive call for deeper pattern exploration
    if (confidence > 0.2 && currentDepth < maxDepth - 1) {
      const subResult = await this.matchPatternRecursively(
        pattern,
        query,
        currentDepth + 1,
        maxDepth
      );
      
      // Combine results from recursive call
      return {
        pattern,
        confidence: (confidence + subResult.confidence * 0.7) / 2,
        matchedNodes: [...candidateNodes, ...subResult.matchedNodes],
        tensorRepresentation: addTensors(transformedTensor, subResult.tensorRepresentation),
        activations: new Map([...activations, ...subResult.activations]),
        recursionDepth: Math.max(currentDepth, subResult.recursionDepth)
      };
    }

    return {
      pattern,
      confidence,
      matchedNodes: candidateNodes,
      tensorRepresentation: transformedTensor,
      activations,
      recursionDepth: currentDepth
    };
  }

  /**
   * Combine tensor states from multiple nodes
   */
  private combineNodeTensors(nodeIds: string[]): Tensor {
    if (nodeIds.length === 0) {
      return makeTensor([1]);
    }

    const firstNode = this.hypergraph.nodes.get(nodeIds[0]);
    if (!firstNode) {
      return makeTensor([1]);
    }

    let combined = firstNode.state;
    
    for (let i = 1; i < nodeIds.length; i++) {
      const node = this.hypergraph.nodes.get(nodeIds[i]);
      if (node && node.state.shape.every((dim, idx) => dim === combined.shape[idx])) {
        combined = addTensors(combined, node.state);
      }
    }

    return scaleTensor(combined, 1.0 / nodeIds.length);
  }

  /**
   * Apply pattern transformations for parallel tensor operations
   */
  private async applyPatternTransformations(
    inputTensor: Tensor,
    pattern: HypergraphPattern
  ): Promise<Tensor> {
    let result = inputTensor;

    // Apply transformations in sequence (some could be parallelized)
    for (const transformId of ['attention_focus', 'pattern_composition']) {
      const transform = this.transformations.get(transformId);
      if (transform) {
        result = await this.executeTransformation(result, transform);
      }
    }

    return result;
  }

  /**
   * Execute a single tensor transformation
   */
  private async executeTransformation(
    input: Tensor,
    transform: PatternTransformation
  ): Promise<Tensor> {
    // Simulate tensor operation execution
    // In a real implementation, this would dispatch to optimized tensor libraries
    
    switch (transform.operation) {
      case 'attention':
        return this.simulateAttentionOperation(input, transform);
      case 'composition':
        return this.simulateCompositionOperation(input, transform);
      case 'decomposition':
        return this.simulateDecompositionOperation(input, transform);
      default:
        return input;
    }
  }

  /**
   * Simulate attention operation for focusing on relevant patterns
   */
  private simulateAttentionOperation(input: Tensor, transform: PatternTransformation): Tensor {
    // Simplified attention: apply learned weights to focus on important features
    const outputSize = transform.outputShape.reduce((acc, dim) => acc * dim, 1);
    const weights = transform.parameters;
    
    // Create attention-weighted output
    const output = new Float32Array(outputSize);
    for (let i = 0; i < Math.min(input.size, outputSize); i++) {
      const weightIdx = i % weights.size;
      output[i] = input.data[i] * weights.data[weightIdx];
    }
    
    return makeTensor(transform.outputShape, output);
  }

  /**
   * Simulate composition operation for pattern merging
   */
  private simulateCompositionOperation(input: Tensor, transform: PatternTransformation): Tensor {
    // Simplified composition: linear combination of features
    const outputSize = transform.outputShape.reduce((acc, dim) => acc * dim, 1);
    const output = new Float32Array(outputSize);
    
    for (let i = 0; i < outputSize; i++) {
      const inputIdx = i % input.size;
      const paramIdx = i % transform.parameters.size;
      output[i] = input.data[inputIdx] * transform.parameters.data[paramIdx];
    }
    
    return makeTensor(transform.outputShape, output);
  }

  /**
   * Simulate decomposition operation for pattern analysis
   */
  private simulateDecompositionOperation(input: Tensor, transform: PatternTransformation): Tensor {
    // Simplified decomposition: distribute features across hierarchical structure
    const outputSize = transform.outputShape.reduce((acc, dim) => acc * dim, 1);
    const output = new Float32Array(outputSize);
    
    // Distribute input features across output dimensions
    for (let i = 0; i < outputSize; i++) {
      const inputIdx = Math.floor((i / outputSize) * input.size);
      output[i] = input.data[inputIdx];
    }
    
    return makeTensor(transform.outputShape, output);
  }

  /**
   * Meta-cognitive self-analysis for pattern evolution
   */
  async performSelfAnalysis(): Promise<AnalysisMetrics> {
    console.log('🧘 Performing meta-cognitive self-analysis...');
    
    const stats = this.hypergraph.getStatistics();
    
    // Calculate pattern efficiency
    const patternEfficiency = this.calculatePatternEfficiency();
    
    // Calculate evolution rate based on recent changes
    const evolutionRate = this.calculateEvolutionRate();
    
    // Measure complexity growth
    const complexityGrowth = this.calculateComplexityGrowth();
    
    // Assess recursion stability
    const recursionStability = this.calculateRecursionStability();
    
    // Measure neural-symbolic alignment
    const neuralSymbolicAlignment = this.calculateNeuralSymbolicAlignment();
    
    const metrics: AnalysisMetrics = {
      patternEfficiency,
      evolutionRate,
      complexityGrowth,
      recursionStability,
      neuralSymbolicAlignment
    };
    
    this.analysisHistory.push(metrics);
    
    // Trigger pattern evolution if needed
    if (patternEfficiency < 0.5 || neuralSymbolicAlignment < 0.6) {
      await this.evolvePatterns(metrics);
    }
    
    console.log('📊 Self-analysis complete:', metrics);
    return metrics;
  }

  /**
   * Calculate pattern efficiency based on successful matches
   */
  private calculatePatternEfficiency(): number {
    // Simulate pattern efficiency calculation
    const totalPatterns = this.patterns.size;
    const activePatterns = Array.from(this.patterns.values())
      .filter(p => p.transformations.length > 0).length;
    
    return totalPatterns > 0 ? activePatterns / totalPatterns : 0;
  }

  /**
   * Calculate evolution rate based on recent pattern changes
   */
  private calculateEvolutionRate(): number {
    // Simulate evolution rate calculation
    const recentAnalyses = this.analysisHistory.slice(-5);
    if (recentAnalyses.length < 2) return 0;
    
    let totalChange = 0;
    for (let i = 1; i < recentAnalyses.length; i++) {
      totalChange += Math.abs(
        recentAnalyses[i].patternEfficiency - recentAnalyses[i-1].patternEfficiency
      );
    }
    
    return totalChange / (recentAnalyses.length - 1);
  }

  /**
   * Calculate complexity growth rate
   */
  private calculateComplexityGrowth(): number {
    const stats = this.hypergraph.getStatistics();
    const totalComplexity = stats.nodeCount * stats.averageDegree;
    
    // Normalize by expected complexity
    return Math.min(totalComplexity / 100, 1.0);
  }

  /**
   * Calculate recursion stability
   */
  private calculateRecursionStability(): number {
    // Measure how stable recursive patterns are
    const maxDepth = Math.max(...Array.from(this.patterns.values()).map(p => p.recursingDepth));
    const avgDepth = Array.from(this.patterns.values())
      .reduce((sum, p) => sum + p.recursingDepth, 0) / this.patterns.size;
    
    return maxDepth > 0 ? 1.0 - (maxDepth - avgDepth) / maxDepth : 1.0;
  }

  /**
   * Calculate neural-symbolic alignment
   */
  private calculateNeuralSymbolicAlignment(): number {
    // Measure how well symbolic patterns align with neural representations
    const symbolicPatterns = this.patterns.size;
    const neuralTransformations = this.transformations.size;
    
    return symbolicPatterns > 0 ? 
      Math.min(neuralTransformations / symbolicPatterns, 1.0) : 0;
  }

  /**
   * Evolve patterns based on analysis metrics
   */
  private async evolvePatterns(metrics: AnalysisMetrics): Promise<void> {
    console.log('🧬 Evolving patterns based on analysis...');
    
    // Add new transformation if neural-symbolic alignment is low
    if (metrics.neuralSymbolicAlignment < 0.6) {
      const newTransform: PatternTransformation = {
        id: `evolved_transform_${Date.now()}`,
        inputShape: [8, 16],
        outputShape: [16, 8],
        operation: 'matmul',
        parameters: randomTensor([8 * 16, 16 * 8], 0.05),
        metadata: {
          parallelizable: true,
          computeComplexity: 2
        }
      };
      
      this.transformations.set(newTransform.id, newTransform);
    }
    
    // Increase recursion depth if patterns are stable
    if (metrics.recursionStability > 0.8) {
      for (const pattern of this.patterns.values()) {
        if (pattern.recursingDepth < 8) {
          pattern.recursingDepth += 1;
        }
      }
    }
    
    // Update evolution parameters
    this.evolutionParameters = addTensors(
      this.evolutionParameters,
      scaleTensor(randomTensor([10], 0.01), 0.1)
    );
  }

  /**
   * Generate visualization of hypergraph patterns
   */
  generateHypergraphVisualization(): string {
    const stats = this.hypergraph.getStatistics();
    
    let visualization = `# Hypergraph Grammar Patterns Visualization\n\n`;
    visualization += `## Network Statistics\n`;
    visualization += `- Nodes: ${stats.nodeCount}\n`;
    visualization += `- Edges: ${stats.edgeCount}\n`;
    visualization += `- Clusters: ${stats.clusterCount}\n`;
    visualization += `- Average Degree: ${stats.averageDegree.toFixed(2)}\n\n`;
    
    visualization += `## Patterns\n`;
    for (const pattern of this.patterns.values()) {
      visualization += `### ${pattern.name}\n`;
      visualization += `- Primitive Types: ${pattern.primitiveTypes.join(', ')}\n`;
      visualization += `- Tensor Shape: [${pattern.tensorShape.join(' × ')}]\n`;
      visualization += `- Recursion Depth: ${pattern.recursingDepth}\n`;
      visualization += `- Node Structure: ${pattern.nodeStructure.nodeCount} nodes\n\n`;
    }
    
    visualization += `## Mermaid Graph\n\`\`\`mermaid\n`;
    visualization += `graph TD\n`;
    
    // Add nodes
    for (const [nodeId, node] of this.hypergraph.nodes) {
      const label = `${node.type}[${node.metadata.primitiveType || 'unknown'}]`;
      visualization += `    ${nodeId}["${label}"]\n`;
    }
    
    // Add edges
    for (const edge of this.hypergraph.edges.values()) {
      visualization += `    ${edge.source} -->|${edge.type}| ${edge.target}\n`;
    }
    
    visualization += `\`\`\`\n`;
    
    return visualization;
  }

  /**
   * Get engine statistics and state
   */
  getEngineStatistics(): {
    patterns: number;
    transformations: number;
    hypergraphStats: any;
    analysisHistory: AnalysisMetrics[];
    evolutionState: number[];
  } {
    return {
      patterns: this.patterns.size,
      transformations: this.transformations.size,
      hypergraphStats: this.hypergraph.getStatistics(),
      analysisHistory: this.analysisHistory,
      evolutionState: Array.from(this.evolutionParameters.data)
    };
  }
}

/**
 * Create default configuration for hypergraph grammar engine
 */
export function createDefaultHypergraphGrammarConfig(): AgenticGrammarConfig {
  return {
    extraction: {
      sourceDirectories: ['./src'],
      fileExtensions: ['.ts', '.js'],
      excludePatterns: ['node_modules', 'dist', '__tests__'],
      maxFileSize: 1024 * 1024 // 1MB
    },
    tensorization: {
      defaultPrecision: 'f32',
      maxTensorDimensions: 8,
      sparsityThreshold: 0.1,
      compressionEnabled: true
    },
    distribution: {
      maxKernelsPerCluster: 20,
      replicationFactor: 2,
      loadBalancingStrategy: 'complexity-based',
      messagingProtocol: 'websocket'
    },
    primeFactorization: {
      maxFactors: 10,
      preferredBases: [2, 3, 5, 7],
      factorizationStrategy: 'heuristic'
    }
  };
}