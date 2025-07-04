/**
 * Distributed Agentic Grammar System - Main orchestrator for distributed GGML tensor network
 * 
 * Integrates all components to create a complete distributed cognitive grammar system
 * that extracts agentic primitives and processes them through GGML tensor kernels.
 */

import { 
  AgenticGrammarConfig, 
  AgenticPrimitive, 
  GgmlKernel, 
  KernelCluster,
  TensorMessage,
  DistributedAttentionState 
} from './types.js';
import { AgenticGrammarExtractor } from './extractor.js';
import { CognitiveKernelRegistry } from './kernel-registry.js';
import { DistributedOrchestrationMesh } from './orchestration-mesh.js';
import { Tensor, TensorShape } from '../types.js';
import { makeTensor, randomTensor, addTensors, scaleTensor } from '../tensor/operations.js';

/**
 * System state for the distributed grammar network
 */
interface SystemState {
  extractedPrimitives: number;
  registeredKernels: number;
  activeClusters: number;
  meshNodes: number;
  processingLoad: number;
  attentionAllocation: number;
  messagesSent: number;
  messagesReceived: number;
  lastUpdate: number;
}

/**
 * Processing pipeline statistics
 */
interface PipelineStats {
  extractionTime: number;
  kernelizationTime: number;
  deploymentTime: number;
  totalProcessingTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: number;
}

export class DistributedAgenticGrammarSystem {
  private config: AgenticGrammarConfig;
  private extractor: AgenticGrammarExtractor;
  private kernelRegistry: CognitiveKernelRegistry;
  private orchestrationMesh: DistributedOrchestrationMesh;
  private systemState: SystemState;
  private isInitialized: boolean = false;
  private processingPipeline: ProcessingPipeline;

  constructor(config: AgenticGrammarConfig) {
    this.config = config;
    this.extractor = new AgenticGrammarExtractor(config);
    this.kernelRegistry = new CognitiveKernelRegistry();
    this.orchestrationMesh = new DistributedOrchestrationMesh(this.kernelRegistry, config);
    this.processingPipeline = new ProcessingPipeline();

    this.systemState = {
      extractedPrimitives: 0,
      registeredKernels: 0,
      activeClusters: 0,
      meshNodes: 0,
      processingLoad: 0,
      attentionAllocation: 0,
      messagesSent: 0,
      messagesReceived: 0,
      lastUpdate: Date.now()
    };
  }

  /**
   * Initializes the complete distributed agentic grammar system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Distributed agentic grammar system already initialized');
    }

    console.log('🌐 Initializing Distributed Agentic Grammar System...');
    console.log('🧬 Architecture: Mad9ml → Agentic Grammar → GGML Kernels → Distributed Mesh');

    // Extract agentic primitives from codebase
    await this.extractAgenticPrimitives();

    // Create and register GGML kernels
    await this.createKernelsFromPrimitives();

    // Organize kernels into clusters
    await this.createKernelClusters();

    // Initialize distributed mesh
    await this.initializeDistributedProcessing();

    this.isInitialized = true;
    console.log('✨ Distributed Agentic Grammar System initialized successfully!');
    console.log('🚀 Ready for distributed cognitive grammar processing!');
    
    this.updateSystemState();
  }

  /**
   * Extracts agentic primitives from the configured codebase
   */
  private async extractAgenticPrimitives(): Promise<void> {
    console.log('📊 Phase 1: Extracting agentic primitives...');
    
    const startTime = Date.now();
    const primitives = await this.extractor.extractAgenticPrimitives();
    const extractionTime = Date.now() - startTime;

    this.processingPipeline.recordExtractionTime(extractionTime);
    this.systemState.extractedPrimitives = primitives.size;

    const stats = this.extractor.getExtractionStatistics();
    console.log(`✅ Extracted ${stats.totalPrimitives} agentic primitives in ${extractionTime}ms`);
    console.log(`📈 Complexity avg: ${stats.averageComplexity.toFixed(2)}, Depth avg: ${stats.averageDepth.toFixed(2)}`);
    
    // Log primitive distribution
    for (const [type, count] of Object.entries(stats.primitivesByType)) {
      console.log(`   ${type}: ${count} primitives`);
    }
  }

  /**
   * Creates GGML kernels from extracted primitives
   */
  private async createKernelsFromPrimitives(): Promise<void> {
    console.log('🔧 Phase 2: Creating GGML kernels...');
    
    const startTime = Date.now();
    const primitives = await this.extractor.extractAgenticPrimitives();
    
    let kernelCount = 0;
    for (const primitive of primitives.values()) {
      try {
        const kernel = this.kernelRegistry.createKernelFromPrimitive(primitive);
        console.log(`🧠 Created kernel: ${kernel.name} [${kernel.tensorShape.join('×')}] (${kernel.primeFactorization.join('×')})`);
        kernelCount++;
      } catch (error) {
        console.warn(`⚠️ Failed to create kernel for ${primitive.name}:`, error);
      }
    }

    const kernelizationTime = Date.now() - startTime;
    this.processingPipeline.recordKernelizationTime(kernelizationTime);
    this.systemState.registeredKernels = kernelCount;

    console.log(`✅ Created ${kernelCount} GGML kernels in ${kernelizationTime}ms`);
    
    // Display kernel statistics
    const registryStats = this.kernelRegistry.getRegistryStatistics();
    console.log(`📊 Registry: ${registryStats.totalKernels} kernels, ${registryStats.totalMemoryUsage} bytes`);
    console.log(`💾 Memory usage: ${(registryStats.totalMemoryUsage / 1024 / 1024).toFixed(2)} MB`);
  }

  /**
   * Creates kernel clusters for distributed processing
   */
  private async createKernelClusters(): Promise<void> {
    console.log('🏗️ Phase 3: Creating kernel clusters...');
    
    const allKernels = this.kernelRegistry.getAllKernels();
    const clustersByCategory = this.groupKernelsByCategory(allKernels);
    
    let clusterCount = 0;
    for (const [category, kernels] of clustersByCategory.entries()) {
      if (kernels.length > 0) {
        const clusterId = `cluster_${category}`;
        const clusterName = `${category.charAt(0).toUpperCase() + category.slice(1)} Cluster`;
        const coordinatorId = kernels[0].id; // First kernel as coordinator
        
        const cluster = this.kernelRegistry.createKernelCluster(
          clusterId,
          clusterName,
          kernels.map(k => k.id),
          coordinatorId
        );
        
        clusterCount++;
        console.log(`🎯 Created cluster: ${clusterName} with ${kernels.length} kernels`);
      }
    }
    
    this.systemState.activeClusters = clusterCount;
    console.log(`✅ Created ${clusterCount} kernel clusters`);
  }

  /**
   * Groups kernels by category for cluster creation
   */
  private groupKernelsByCategory(kernels: GgmlKernel[]): Map<string, GgmlKernel[]> {
    const groups = new Map<string, GgmlKernel[]>();
    
    for (const kernel of kernels) {
      const category = kernel.agenticFunction.type;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(kernel);
    }
    
    return groups;
  }

  /**
   * Initializes distributed processing
   */
  private async initializeDistributedProcessing(): Promise<void> {
    console.log('🌐 Phase 4: Initializing distributed processing...');
    
    const startTime = Date.now();
    
    // Deploy kernels to mesh nodes
    const allKernels = this.kernelRegistry.getAllKernels();
    for (const kernel of allKernels) {
      try {
        const nodeId = this.orchestrationMesh.deployKernel(kernel);
        console.log(`🚀 Deployed ${kernel.name} to node ${nodeId}`);
      } catch (error) {
        console.warn(`⚠️ Failed to deploy kernel ${kernel.name}:`, error);
      }
    }
    
    const deploymentTime = Date.now() - startTime;
    this.processingPipeline.recordDeploymentTime(deploymentTime);
    
    const meshStats = this.orchestrationMesh.getMeshStatistics();
    this.systemState.meshNodes = meshStats.totalNodes;
    
    console.log(`✅ Deployed kernels to ${meshStats.activeNodes} active nodes in ${deploymentTime}ms`);
    console.log(`🔄 Load balancing: ${meshStats.averageLoad.toFixed(2)} avg load per node`);
  }

  /**
   * Processes a cognitive grammar query through the distributed network
   */
  async processGrammarQuery(
    query: string, 
    context: Record<string, any> = {}
  ): Promise<{
    result: Tensor;
    processing: PipelineStats;
    routing: string[];
    attention: number[];
  }> {
    if (!this.isInitialized) {
      throw new Error('System not initialized');
    }

    console.log(`🔍 Processing grammar query: "${query}"`);
    const startTime = Date.now();

    // 1. Parse query and identify relevant kernel types
    const queryAnalysis = this.analyzeQuery(query);
    console.log(`📝 Query analysis: ${queryAnalysis.types.join(', ')}`);

    // 2. Find relevant kernels
    const relevantKernels = this.findRelevantKernels(queryAnalysis);
    console.log(`🎯 Found ${relevantKernels.length} relevant kernels`);

    // 3. Create processing pipeline
    const pipeline = this.createProcessingPipeline(relevantKernels, queryAnalysis);

    // 4. Execute distributed processing
    const result = await this.executeDistributedProcessing(pipeline, query, context);

    // 5. Collect statistics
    const processingTime = Date.now() - startTime;
    const stats = this.collectProcessingStatistics(processingTime);

    console.log(`✅ Query processed in ${processingTime}ms`);
    
    return {
      result,
      processing: stats,
      routing: pipeline.map(k => k.id),
      attention: pipeline.map(k => k.metadata.activationLevel)
    };
  }

  /**
   * Analyzes a query to identify required kernel types
   */
  private analyzeQuery(query: string): { types: string[]; complexity: number; keywords: string[] } {
    const keywords = query.toLowerCase().split(/\s+/);
    const types: string[] = [];
    let complexity = 1.0;

    // Map keywords to agentic primitive types
    const typeMapping = {
      'action': ['do', 'execute', 'perform', 'run', 'act'],
      'percept': ['sense', 'detect', 'read', 'input', 'observe'],
      'memory': ['remember', 'store', 'recall', 'save', 'retrieve'],
      'decision': ['decide', 'choose', 'if', 'whether', 'select'],
      'planning': ['plan', 'sequence', 'schedule', 'organize'],
      'communication': ['send', 'message', 'tell', 'communicate'],
      'adaptation': ['learn', 'adapt', 'improve', 'evolve'],
      'attention': ['focus', 'prioritize', 'attend', 'highlight'],
      'goal': ['achieve', 'target', 'objective', 'aim'],
      'constraint': ['limit', 'restrict', 'bound', 'validate']
    };

    for (const [type, mappingKeywords] of Object.entries(typeMapping)) {
      if (keywords.some(keyword => mappingKeywords.includes(keyword))) {
        types.push(type);
        complexity += 0.2;
      }
    }

    // Default to action if no specific type found
    if (types.length === 0) {
      types.push('action');
    }

    return { types, complexity, keywords };
  }

  /**
   * Finds kernels relevant to the query
   */
  private findRelevantKernels(queryAnalysis: { types: string[]; complexity: number }): GgmlKernel[] {
    const relevantKernels: GgmlKernel[] = [];
    
    for (const type of queryAnalysis.types) {
      const categoryKernels = this.kernelRegistry.findKernelsByCategory(type);
      relevantKernels.push(...categoryKernels);
    }

    // Sort by activation level and complexity
    return relevantKernels
      .sort((a, b) => {
        const scoreA = a.metadata.activationLevel + (a.metadata.complexity * 0.1);
        const scoreB = b.metadata.activationLevel + (b.metadata.complexity * 0.1);
        return scoreB - scoreA;
      })
      .slice(0, 5); // Limit to top 5 kernels
  }

  /**
   * Creates processing pipeline from kernels
   */
  private createProcessingPipeline(
    kernels: GgmlKernel[], 
    queryAnalysis: { types: string[] }
  ): GgmlKernel[] {
    // Order kernels based on typical cognitive processing flow
    const typeOrder = ['percept', 'memory', 'attention', 'decision', 'planning', 'action'];
    
    return kernels.sort((a, b) => {
      const indexA = typeOrder.indexOf(a.agenticFunction.type);
      const indexB = typeOrder.indexOf(b.agenticFunction.type);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });
  }

  /**
   * Executes distributed processing pipeline
   */
  private async executeDistributedProcessing(
    pipeline: GgmlKernel[],
    query: string,
    context: Record<string, any>
  ): Promise<Tensor> {
    let currentTensor = this.encodeQueryToTensor(query);
    
    for (let i = 0; i < pipeline.length; i++) {
      const kernel = pipeline[i];
      const nextKernel = pipeline[i + 1];
      
      // Create tensor message
      const message: TensorMessage = {
        id: `msg_${Date.now()}_${i}`,
        sourceKernelId: i === 0 ? 'system' : pipeline[i - 1].id,
        targetKernelId: kernel.id,
        sourcePort: 'output',
        targetPort: 'input',
        tensor: currentTensor,
        routingInfo: {
          priority: 1.0 - (i * 0.1),
          ttl: 10,
          path: []
        },
        timestamp: Date.now()
      };

      // Route through mesh
      const success = await this.orchestrationMesh.routeMessage(message);
      if (!success) {
        console.warn(`⚠️ Failed to route message to kernel ${kernel.id}`);
        continue;
      }

      // Simulate kernel processing
      currentTensor = await this.simulateKernelProcessing(kernel, currentTensor, context);
      
      // Update kernel metadata
      kernel.metadata.usageFrequency++;
      kernel.metadata.lastUsed = Date.now();
      this.kernelRegistry.updateAttentionAllocation(kernel.id, 0.8);

      this.systemState.messagesSent++;
    }

    return currentTensor;
  }

  /**
   * Encodes query string to tensor representation
   */
  private encodeQueryToTensor(query: string): Tensor {
    // Simple encoding: convert to character codes and normalize
    const chars = query.split('').map(char => char.charCodeAt(0) / 255.0);
    
    // Pad or truncate to fixed size
    const targetSize = 64;
    while (chars.length < targetSize) chars.push(0);
    if (chars.length > targetSize) chars.splice(targetSize);
    
    return makeTensor([8, 8], chars);
  }

  /**
   * Simulates kernel processing (placeholder for actual GGML execution)
   */
  private async simulateKernelProcessing(
    kernel: GgmlKernel, 
    inputTensor: Tensor, 
    context: Record<string, any>
  ): Promise<Tensor> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
    
    // Apply type-specific transformation
    switch (kernel.agenticFunction.type) {
      case 'action':
        return scaleTensor(inputTensor, 1.2);
      case 'percept':
        return addTensors(inputTensor, randomTensor(inputTensor.shape, 0.1));
      case 'memory':
        return scaleTensor(inputTensor, 0.9);
      case 'decision':
        return scaleTensor(inputTensor, Math.random() > 0.5 ? 1.1 : 0.9);
      default:
        return inputTensor;
    }
  }

  /**
   * Collects processing statistics
   */
  private collectProcessingStatistics(totalTime: number): PipelineStats {
    return {
      extractionTime: this.processingPipeline.getExtractionTime(),
      kernelizationTime: this.processingPipeline.getKernelizationTime(),
      deploymentTime: this.processingPipeline.getDeploymentTime(),
      totalProcessingTime: totalTime,
      throughput: 1000 / totalTime, // queries per second
      errorRate: 0.01, // Placeholder
      memoryUsage: this.kernelRegistry.getRegistryStatistics().totalMemoryUsage
    };
  }

  /**
   * Updates system state
   */
  private updateSystemState(): void {
    const registryStats = this.kernelRegistry.getRegistryStatistics();
    const meshStats = this.orchestrationMesh.getMeshStatistics();
    
    this.systemState = {
      extractedPrimitives: this.systemState.extractedPrimitives,
      registeredKernels: registryStats.totalKernels,
      activeClusters: registryStats.totalClusters,
      meshNodes: meshStats.activeNodes,
      processingLoad: meshStats.averageLoad,
      attentionAllocation: registryStats.attentionUtilization,
      messagesSent: this.systemState.messagesSent,
      messagesReceived: this.systemState.messagesReceived,
      lastUpdate: Date.now()
    };
  }

  /**
   * Performs load balancing across the distributed mesh
   */
  async performLoadBalancing(): Promise<void> {
    console.log('⚖️ Performing distributed load balancing...');
    this.orchestrationMesh.balanceLoad();
    this.kernelRegistry.processMessageQueue();
    this.updateSystemState();
  }

  /**
   * Gets comprehensive system statistics
   */
  getSystemStatistics(): {
    state: SystemState;
    registry: any;
    mesh: any;
    extraction: any;
    pipeline: PipelineStats;
  } {
    this.updateSystemState();
    
    return {
      state: { ...this.systemState },
      registry: this.kernelRegistry.getRegistryStatistics(),
      mesh: this.orchestrationMesh.getMeshStatistics(),
      extraction: this.extractor.getExtractionStatistics(),
      pipeline: this.collectProcessingStatistics(0)
    };
  }

  /**
   * Exports complete system state for persistence
   */
  exportSystemState(): any {
    return {
      config: this.config,
      systemState: this.systemState,
      extractedPrimitives: Array.from((this.extractor as any).extractedPrimitives.values()),
      registeredKernels: this.kernelRegistry.getAllKernels(),
      clusters: this.kernelRegistry.getAllClusters(),
      meshNodes: this.orchestrationMesh.getAllNodes(),
      timestamp: Date.now()
    };
  }

  /**
   * Creates a visualization of the distributed network
   */
  generateNetworkVisualization(): string {
    const stats = this.getSystemStatistics();
    
    return `
# Distributed GGML Tensor Network Visualization

## Network Overview
\`\`\`mermaid
graph TD
    subgraph "Agentic Grammar Layer"
        EXT[Extractor<br/>${stats.state.extractedPrimitives} primitives]
        REG[Kernel Registry<br/>${stats.state.registeredKernels} kernels]
        CLU[Clusters<br/>${stats.state.activeClusters} active]
    end
    
    subgraph "Distributed Mesh Layer"
        N1[Node 1<br/>Load: ${stats.mesh.averageLoad.toFixed(1)}]
        N2[Node 2<br/>Load: ${stats.mesh.averageLoad.toFixed(1)}]
        N3[Node 3<br/>Load: ${stats.mesh.averageLoad.toFixed(1)}]
        LB[Load Balancer]
    end
    
    subgraph "Attention Layer"
        ATT[Attention System<br/>${(stats.registry.attentionUtilization * 100).toFixed(1)}% utilized]
        MSG[Message Router<br/>${stats.mesh.messageReliability.toFixed(2)} reliability]
    end
    
    EXT --> REG
    REG --> CLU
    CLU --> LB
    LB --> N1
    LB --> N2
    LB --> N3
    N1 <--> ATT
    N2 <--> ATT
    N3 <--> ATT
    ATT --> MSG
\`\`\`

## System Metrics
- **Total Kernels**: ${stats.state.registeredKernels}
- **Active Nodes**: ${stats.mesh.activeNodes}
- **Memory Usage**: ${(stats.registry.totalMemoryUsage / 1024 / 1024).toFixed(2)} MB
- **Message Reliability**: ${(stats.mesh.messageReliability * 100).toFixed(1)}%
- **Attention Utilization**: ${(stats.registry.attentionUtilization * 100).toFixed(1)}%
`;
  }
}

/**
 * Processing pipeline manager
 */
class ProcessingPipeline {
  private extractionTime: number = 0;
  private kernelizationTime: number = 0;
  private deploymentTime: number = 0;

  recordExtractionTime(time: number): void {
    this.extractionTime = time;
  }

  recordKernelizationTime(time: number): void {
    this.kernelizationTime = time;
  }

  recordDeploymentTime(time: number): void {
    this.deploymentTime = time;
  }

  getExtractionTime(): number {
    return this.extractionTime;
  }

  getKernelizationTime(): number {
    return this.kernelizationTime;
  }

  getDeploymentTime(): number {
    return this.deploymentTime;
  }
}

/**
 * Creates a default agentic grammar configuration
 */
export function createDefaultAgenticGrammarConfig(): AgenticGrammarConfig {
  return {
    extraction: {
      sourceDirectories: [
        './src',
        './marduk-ts'
      ],
      fileExtensions: ['.ts', '.js'],
      excludePatterns: [
        'node_modules',
        'dist',
        '.git',
        '__tests__',
        '.test.',
        '.spec.'
      ],
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