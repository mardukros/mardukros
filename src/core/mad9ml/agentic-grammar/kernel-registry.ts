/**
 * Cognitive Kernel Registry - Manages distributed GGML tensor kernels
 * 
 * Provides registration, discovery, and management of cognitive kernels
 * that represent agentic functions as distributed tensor operations.
 */

import { 
  GgmlKernel, 
  KernelRegistryEntry, 
  KernelCluster, 
  AgenticPrimitive,
  TensorMessage,
  DistributedAttentionState
} from './types.js';
import { Tensor, TensorShape } from '../types.js';
import { makeTensor, randomTensor, addTensors, scaleTensor } from '../tensor/operations.js';

export class CognitiveKernelRegistry {
  private kernels: Map<string, KernelRegistryEntry> = new Map();
  private clusters: Map<string, KernelCluster> = new Map();
  private messageQueue: TensorMessage[] = [];
  private attentionState: DistributedAttentionState;
  private primeFactorizationCache: Map<string, number[]> = new Map();

  constructor() {
    this.attentionState = {
      totalResources: 1000.0,
      allocatedResources: 0.0,
      kernelAllocations: new Map(),
      priorityQueue: [],
      decayRate: 0.01,
      adaptationRate: 0.1
    };
  }

  /**
   * Registers a new cognitive kernel
   */
  registerKernel(kernel: GgmlKernel): void {
    const entry: KernelRegistryEntry = {
      kernel,
      registrationTime: Date.now(),
      category: this.categorizeKernel(kernel),
      tags: this.generateTags(kernel),
      version: '1.0.0',
      dependencies: kernel.agenticFunction.dependencies,
      performance: {
        averageExecutionTime: 0,
        memoryUsage: this.estimateMemoryUsage(kernel),
        errorRate: 0
      }
    };

    this.kernels.set(kernel.id, entry);
    this.updateAttentionAllocation(kernel.id, 0.1); // Initial allocation
    
    console.log(`🔧 Registered kernel: ${kernel.name} (${kernel.id})`);
  }

  /**
   * Creates a GGML kernel from an agentic primitive
   */
  createKernelFromPrimitive(primitive: AgenticPrimitive): GgmlKernel {
    const tensorShape = this.calculateTensorShape(primitive);
    const primeFactorization = this.computePrimeFactorization(tensorShape);
    
    const kernel: GgmlKernel = {
      id: `kernel_${primitive.id}`,
      name: primitive.name,
      agenticFunction: primitive,
      tensorShape,
      primeFactorization,
      grammarTokens: [], // Will be populated by grammar mapper
      kernelCode: this.generateKernelCode(primitive),
      inputPorts: this.generateInputPorts(primitive),
      outputPorts: this.generateOutputPorts(primitive),
      metadata: {
        complexity: primitive.semanticComplexity,
        resourceCost: this.calculateResourceCost(primitive),
        activationLevel: 0.0,
        usageFrequency: 0,
        lastUsed: Date.now()
      }
    };

    this.registerKernel(kernel);
    return kernel;
  }

  /**
   * Calculates optimal tensor shape for an agentic primitive
   */
  private calculateTensorShape(primitive: AgenticPrimitive): TensorShape {
    const baseShape = [
      Math.ceil(primitive.semanticComplexity * 8),  // Semantic dimension
      Math.ceil(primitive.functionalDepth * 4),     // Functional dimension
      primitive.parameters.length + 1,             // Parameter dimension
      this.getTypeDimension(primitive.type)        // Type-specific dimension
    ];

    // Ensure minimum dimensions
    return baseShape.map(dim => Math.max(dim, 2));
  }

  /**
   * Gets dimension size based on agentic primitive type
   */
  private getTypeDimension(type: string): number {
    const typeDimensions = {
      'action': 6,
      'percept': 4,
      'memory': 8,
      'decision': 5,
      'planning': 7,
      'communication': 4,
      'adaptation': 9,
      'attention': 6,
      'goal': 5,
      'constraint': 3
    };

    return typeDimensions[type] || 4;
  }

  /**
   * Computes prime factorization of tensor shape
   */
  private computePrimeFactorization(shape: TensorShape): number[] {
    const product = shape.reduce((acc, dim) => acc * dim, 1);
    const cacheKey = product.toString();
    
    if (this.primeFactorizationCache.has(cacheKey)) {
      return this.primeFactorizationCache.get(cacheKey)!;
    }

    const factors: number[] = [];
    let num = product;
    let divisor = 2;

    while (num > 1) {
      while (num % divisor === 0) {
        factors.push(divisor);
        num /= divisor;
      }
      divisor++;
      if (divisor * divisor > num && num > 1) {
        factors.push(num);
        break;
      }
    }

    this.primeFactorizationCache.set(cacheKey, factors);
    return factors;
  }

  /**
   * Generates kernel code for primitive execution
   */
  private generateKernelCode(primitive: AgenticPrimitive): string {
    const template = `
// Generated GGML kernel for ${primitive.name}
// Type: ${primitive.type}
// Complexity: ${primitive.semanticComplexity}

function execute_${primitive.name}(inputs, outputs, params) {
  // Tensor operations for ${primitive.type} processing
  const inputTensor = inputs[0];
  const outputTensor = outputs[0];
  
  // Type-specific processing
  ${this.generateTypeSpecificCode(primitive)}
  
  // Update activation metadata
  updateActivationLevel(${primitive.semanticComplexity});
  
  return outputTensor;
}
`;

    return template.trim();
  }

  /**
   * Generates type-specific kernel code
   */
  private generateTypeSpecificCode(primitive: AgenticPrimitive): string {
    switch (primitive.type) {
      case 'action':
        return `
  // Action kernel: apply transformation
  const actionTensor = matmul(inputTensor, actionMatrix);
  const result = relu(actionTensor);
  copyTensor(result, outputTensor);`;
        
      case 'percept':
        return `
  // Percept kernel: encode sensory input
  const encoded = softmax(inputTensor);
  const filtered = attention_filter(encoded, attentionWeights);
  copyTensor(filtered, outputTensor);`;
        
      case 'memory':
        return `
  // Memory kernel: storage and retrieval
  const memoryState = addTensors(inputTensor, memoryBuffer);
  const recalled = associativeRecall(memoryState, queryTensor);
  copyTensor(recalled, outputTensor);`;
        
      case 'decision':
        return `
  // Decision kernel: branching logic
  const decision = sigmoid(inputTensor);
  const branch = thresholdSelect(decision, threshold);
  copyTensor(branch, outputTensor);`;
        
      case 'planning':
        return `
  // Planning kernel: sequence generation
  const sequence = sequenceGeneration(inputTensor, planningMatrix);
  const optimized = pathOptimization(sequence);
  copyTensor(optimized, outputTensor);`;
        
      default:
        return `
  // Generic kernel: identity transformation
  copyTensor(inputTensor, outputTensor);`;
    }
  }

  /**
   * Generates input ports for a kernel
   */
  private generateInputPorts(primitive: AgenticPrimitive): any[] {
    const ports = [{
      id: `${primitive.id}_input_main`,
      name: 'main_input',
      type: 'input' as const,
      tensorShape: [8, 8], // Default input shape
      dataType: 'f32' as const,
      semanticTag: primitive.type
    }];

    // Add parameter ports
    primitive.parameters.forEach((param, index) => {
      ports.push({
        id: `${primitive.id}_input_param_${index}`,
        name: `param_${param.name}`,
        type: 'input' as const,
        tensorShape: [4],
        dataType: 'f32' as const,
        semanticTag: `parameter_${param.type}`
      });
    });

    return ports;
  }

  /**
   * Generates output ports for a kernel
   */
  private generateOutputPorts(primitive: AgenticPrimitive): any[] {
    return [{
      id: `${primitive.id}_output_main`,
      name: 'main_output',
      type: 'output' as const,
      tensorShape: [8, 8], // Default output shape
      dataType: 'f32' as const,
      semanticTag: primitive.type
    }];
  }

  /**
   * Calculates resource cost for a kernel
   */
  private calculateResourceCost(primitive: AgenticPrimitive): number {
    const baseComplexity = primitive.semanticComplexity;
    const depthMultiplier = 1 + (primitive.functionalDepth * 0.1);
    const parameterCost = primitive.parameters.length * 0.05;
    
    return baseComplexity * depthMultiplier + parameterCost;
  }

  /**
   * Estimates memory usage for a kernel
   */
  private estimateMemoryUsage(kernel: GgmlKernel): number {
    const tensorSize = kernel.tensorShape.reduce((acc, dim) => acc * dim, 1);
    const baseMem = tensorSize * 4; // 4 bytes per f32
    const codeMem = kernel.kernelCode.length;
    const metadataMem = 1024; // Approximate metadata size
    
    return baseMem + codeMem + metadataMem;
  }

  /**
   * Categorizes a kernel based on its agentic function
   */
  private categorizeKernel(kernel: GgmlKernel): string {
    const typeCategories = {
      'action': 'execution',
      'percept': 'sensing',
      'memory': 'storage',
      'decision': 'reasoning',
      'planning': 'control',
      'communication': 'interaction',
      'adaptation': 'learning',
      'attention': 'allocation',
      'goal': 'motivation',
      'constraint': 'validation'
    };

    return typeCategories[kernel.agenticFunction.type] || 'general';
  }

  /**
   * Generates tags for kernel discovery
   */
  private generateTags(kernel: GgmlKernel): string[] {
    const tags = [
      kernel.agenticFunction.type,
      this.categorizeKernel(kernel),
      `complexity_${Math.floor(kernel.metadata.complexity)}`
    ];

    // Add source-based tags
    const sourcePath = kernel.agenticFunction.sourceLocation.filePath;
    if (sourcePath.includes('core')) tags.push('core');
    if (sourcePath.includes('util')) tags.push('utility');
    if (sourcePath.includes('test')) tags.push('test');

    return tags;
  }

  /**
   * Creates a kernel cluster for load balancing
   */
  createKernelCluster(
    id: string,
    name: string,
    kernelIds: string[],
    coordinatorId: string
  ): KernelCluster {
    const cluster: KernelCluster = {
      id,
      name,
      kernels: [...kernelIds],
      coordinator: coordinatorId,
      loadBalancer: {
        strategy: 'complexity-based',
        currentLoad: 0,
        maxCapacity: 100
      },
      resilience: {
        replicationFactor: 2,
        failoverStrategy: 'hot-standby',
        healthChecks: true
      }
    };

    this.clusters.set(id, cluster);
    console.log(`🏗️ Created kernel cluster: ${name} with ${kernelIds.length} kernels`);
    return cluster;
  }

  /**
   * Updates attention allocation for a kernel
   */
  updateAttentionAllocation(kernelId: string, allocation: number): void {
    const currentAllocation = this.attentionState.kernelAllocations.get(kernelId) || 0;
    const newAllocation = Math.max(0, Math.min(1, allocation));
    
    this.attentionState.kernelAllocations.set(kernelId, newAllocation);
    this.attentionState.allocatedResources += (newAllocation - currentAllocation);
    
    // Update kernel metadata
    const entry = this.kernels.get(kernelId);
    if (entry) {
      entry.kernel.metadata.activationLevel = newAllocation;
      entry.kernel.metadata.lastUsed = Date.now();
    }
  }

  /**
   * Routes a tensor message between kernels
   */
  routeTensorMessage(message: TensorMessage): void {
    // Add to message queue
    this.messageQueue.push(message);
    
    // Update routing statistics
    const sourceEntry = this.kernels.get(message.sourceKernelId);
    const targetEntry = this.kernels.get(message.targetKernelId);
    
    if (sourceEntry && targetEntry) {
      sourceEntry.kernel.metadata.usageFrequency++;
      targetEntry.kernel.metadata.usageFrequency++;
    }
    
    console.log(`📡 Routed message from ${message.sourceKernelId} to ${message.targetKernelId}`);
  }

  /**
   * Processes queued tensor messages
   */
  processMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      
      if (this.isMessageValid(message)) {
        this.deliverMessage(message);
      } else {
        console.warn(`⚠️ Invalid message dropped: ${message.id}`);
      }
    }
  }

  /**
   * Validates a tensor message
   */
  private isMessageValid(message: TensorMessage): boolean {
    // Check TTL
    if (message.routingInfo.ttl <= 0) return false;
    
    // Check if kernels exist
    if (!this.kernels.has(message.sourceKernelId)) return false;
    if (!this.kernels.has(message.targetKernelId)) return false;
    
    // Check timestamp
    const age = Date.now() - message.timestamp;
    if (age > 60000) return false; // 1 minute max age
    
    return true;
  }

  /**
   * Delivers a message to target kernel
   */
  private deliverMessage(message: TensorMessage): void {
    const targetEntry = this.kernels.get(message.targetKernelId);
    if (targetEntry) {
      // Update attention based on message priority
      const attentionBoost = message.routingInfo.priority * 0.1;
      this.updateAttentionAllocation(message.targetKernelId, attentionBoost);
      
      console.log(`✅ Delivered message ${message.id} to ${message.targetKernelId}`);
    }
  }

  /**
   * Gets registry statistics
   */
  getRegistryStatistics(): {
    totalKernels: number;
    kernelsByCategory: Record<string, number>;
    totalClusters: number;
    totalMemoryUsage: number;
    averageComplexity: number;
    attentionUtilization: number;
    messageQueueSize: number;
  } {
    const kernelsByCategory: Record<string, number> = {};
    let totalMemoryUsage = 0;
    let totalComplexity = 0;

    for (const entry of this.kernels.values()) {
      const category = entry.category;
      kernelsByCategory[category] = (kernelsByCategory[category] || 0) + 1;
      totalMemoryUsage += entry.performance.memoryUsage;
      totalComplexity += entry.kernel.metadata.complexity;
    }

    const kernelCount = this.kernels.size;
    const attentionUtilization = this.attentionState.allocatedResources / this.attentionState.totalResources;

    return {
      totalKernels: kernelCount,
      kernelsByCategory,
      totalClusters: this.clusters.size,
      totalMemoryUsage,
      averageComplexity: kernelCount > 0 ? totalComplexity / kernelCount : 0,
      attentionUtilization,
      messageQueueSize: this.messageQueue.length
    };
  }

  /**
   * Finds kernels by category
   */
  findKernelsByCategory(category: string): GgmlKernel[] {
    const kernels: GgmlKernel[] = [];
    
    for (const entry of this.kernels.values()) {
      if (entry.category === category) {
        kernels.push(entry.kernel);
      }
    }
    
    return kernels;
  }

  /**
   * Finds kernels by tags
   */
  findKernelsByTags(tags: string[]): GgmlKernel[] {
    const kernels: GgmlKernel[] = [];
    
    for (const entry of this.kernels.values()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        kernels.push(entry.kernel);
      }
    }
    
    return kernels;
  }

  /**
   * Gets kernel by ID
   */
  getKernel(id: string): GgmlKernel | undefined {
    const entry = this.kernels.get(id);
    return entry?.kernel;
  }

  /**
   * Gets all registered kernels
   */
  getAllKernels(): GgmlKernel[] {
    return Array.from(this.kernels.values()).map(entry => entry.kernel);
  }

  /**
   * Gets cluster by ID
   */
  getCluster(id: string): KernelCluster | undefined {
    return this.clusters.get(id);
  }

  /**
   * Gets all clusters
   */
  getAllClusters(): KernelCluster[] {
    return Array.from(this.clusters.values());
  }
}