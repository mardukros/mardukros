/**
 * Mad9ml Core - Main orchestrator for ggml-based cognitive encoding
 * 
 * Integrates all mad9ml subsystems to create a unified cognitive architecture
 * that encodes the Marduk persona and enables its evolution through tensor operations.
 */

import { 
  CognitiveState, 
  Mad9mlConfig, 
  MemoryTensor, 
  TaskTensor, 
  PersonaTensor, 
  MetaCognitiveTensor,
  EvolutionParams,
  AttentionParams
} from './types.js';

import { makeTensor, randomTensor, addTensors, scaleTensor } from './tensor/operations.js';
import { CognitiveHypergraphImpl } from './hypergraph/cognitive-hypergraph.js';
import { PersonaEvolution } from './persona/evolution.js';
import { ECANAttentionAllocator } from './attention/ecan-allocator.js';
import { MetaCognitiveEngine, ReflectionResult } from './meta-cognitive/reflection-engine.js';

/**
 * Main Mad9ml cognitive system orchestrator
 */
export class Mad9mlSystem {
  private config: Mad9mlConfig;
  private cognitiveState: CognitiveState;
  private hypergraph: CognitiveHypergraphImpl;
  private personaEvolution: PersonaEvolution;
  private attentionAllocator: ECANAttentionAllocator;
  private metaCognitiveEngine: MetaCognitiveEngine;
  private isInitialized: boolean = false;
  private cycleCount: number = 0;

  constructor(config: Mad9mlConfig) {
    this.config = config;
    
    // Initialize subsystem components
    this.hypergraph = new CognitiveHypergraphImpl();
    this.personaEvolution = new PersonaEvolution(config.evolutionParams);
    this.attentionAllocator = new ECANAttentionAllocator(config.attentionParams);
    this.metaCognitiveEngine = new MetaCognitiveEngine(config);
  }

  /**
   * Initializes the complete mad9ml cognitive system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('Mad9ml system already initialized');
    }

    console.log('🧠 Initializing Mad9ml Cognitive Architecture...');

    // Initialize cognitive state with tensor structures
    this.cognitiveState = await this.createInitialCognitiveState();
    
    // Initialize subsystems
    await this.initializeSubsystems();
    
    // Create initial hypergraph structure
    await this.createInitialHypergraph();
    
    this.isInitialized = true;
    console.log('✨ Mad9ml initialization complete! Mwahaha! The cognitive architecture lives!');
  }

  /**
   * Creates initial cognitive state with properly shaped tensors
   */
  private async createInitialCognitiveState(): Promise<CognitiveState> {
    const memoryCapacity = this.config.memoryCapacity;
    
    // Memory subsystem tensors
    const memory: MemoryTensor = {
      episodic: makeTensor([memoryCapacity, 10, 5]),     // [episodes, context, salience]
      semantic: makeTensor([memoryCapacity * 2, 8, 3]),  // [concepts, features, confidence]
      procedural: makeTensor([memoryCapacity / 2, 6, 4]), // [skills, steps, mastery]
      working: makeTensor([16, 4, 2])                    // [active_items, attention, decay]
    };

    // Task subsystem tensors
    const task: TaskTensor = {
      active: makeTensor([32, 8, 5]),      // [active_tasks, dependencies, priority]
      queue: makeTensor([64, 6, 3]),       // [queued_tasks, urgency, resources]
      attention: makeTensor([32])          // [focus_weights]
    };

    // Initialize persona with moderate randomness
    const persona: PersonaTensor = this.personaEvolution.createInitialPersona(
      20,  // traits dimension
      15,  // parameters dimension
      10   // mutation coefficients dimension
    );

    // Meta-cognitive tensors
    const metaCognitive: MetaCognitiveTensor = this.metaCognitiveEngine.initializeMetaCognitiveState(
      10,  // performance metrics
      8,   // adjustment parameters
      100  // history size
    );

    return {
      memory,
      task,
      persona,
      metaCognitive,
      hypergraph: this.hypergraph,
      timestamp: Date.now()
    };
  }

  /**
   * Initializes all subsystem components
   */
  private async initializeSubsystems(): Promise<void> {
    // Initialize attention allocation
    this.attentionAllocator.initializeAttentionState(32); // 32 tasks/processes
    
    console.log('🎯 Attention allocation system initialized');
    console.log('🧬 Persona evolution engine initialized');
    console.log('🪞 Meta-cognitive reflection engine initialized');
  }

  /**
   * Creates initial hypergraph structure with cognitive nodes
   */
  private async createInitialHypergraph(): Promise<void> {
    // Create foundational cognitive nodes
    const coreNodes = [
      { id: 'self_concept', type: 'concept' as const, shape: [10] },
      { id: 'goal_hierarchy', type: 'goal' as const, shape: [8] },
      { id: 'memory_index', type: 'memory' as const, shape: [12] },
      { id: 'pattern_recognizer', type: 'pattern' as const, shape: [15] },
      { id: 'action_planner', type: 'action' as const, shape: [6] },
      { id: 'context_manager', type: 'context' as const, shape: [20] }
    ];

    // Add core nodes to hypergraph
    for (const nodeSpec of coreNodes) {
      this.hypergraph.createNode(
        nodeSpec.id,
        nodeSpec.type,
        nodeSpec.shape,
        { core: true, created: Date.now() }
      );
    }

    // Create initial relationships between core nodes
    const coreEdges = [
      { id: 'self_to_goals', type: 'hierarchical' as const, source: 'self_concept', target: 'goal_hierarchy', weight: 0.9 },
      { id: 'goals_to_memory', type: 'semantic' as const, source: 'goal_hierarchy', target: 'memory_index', weight: 0.8 },
      { id: 'memory_to_patterns', type: 'associative' as const, source: 'memory_index', target: 'pattern_recognizer', weight: 0.7 },
      { id: 'patterns_to_actions', type: 'causal' as const, source: 'pattern_recognizer', target: 'action_planner', weight: 0.8 },
      { id: 'actions_to_context', type: 'temporal' as const, source: 'action_planner', target: 'context_manager', weight: 0.6 },
      { id: 'context_to_self', type: 'meta' as const, source: 'context_manager', target: 'self_concept', weight: 0.5 }
    ];

    for (const edgeSpec of coreEdges) {
      this.hypergraph.createEdge(
        edgeSpec.id,
        edgeSpec.type,
        edgeSpec.source,
        edgeSpec.target,
        edgeSpec.weight,
        { core: true, created: Date.now() }
      );
    }

    console.log('🕸️ Core hypergraph structure established with', coreNodes.length, 'nodes and', coreEdges.length, 'edges');
  }

  /**
   * Performs a complete cognitive cycle step
   */
  async cognitiveCycle(): Promise<{
    reflection: ReflectionResult;
    evolutionStats: any;
    attentionStats: any;
    hypergraphStats: any;
  }> {
    if (!this.isInitialized) {
      throw new Error('Mad9ml system not initialized');
    }

    this.cycleCount++;
    console.log(`🔄 Cognitive Cycle ${this.cycleCount} - The mad scientist's mind churns!`);

    // 1. Meta-cognitive reflection
    const reflection = this.metaCognitiveEngine.performSelfReflection(this.cognitiveState);
    console.log(`🪞 Self-reflection complete - Confidence: ${(reflection.confidenceLevel * 100).toFixed(1)}%`);

    // 2. Update attention allocation based on task demands
    const taskPerformance = Object.values(reflection.performanceAssessment.bySubsystem);
    const attentionAllocation = this.attentionAllocator.updateAttentionAllocation(
      this.cognitiveState.task,
      taskPerformance,
      this.generateExternalStimuli()
    );
    
    // Update task tensor with new attention allocation
    this.cognitiveState.task.attention = attentionAllocation;
    console.log('🎯 Attention allocation updated');

    // 3. Evolve persona based on performance
    if (reflection.adaptationNeeded) {
      const fitness = this.calculatePersonaFitness(reflection);
      this.cognitiveState.persona = this.personaEvolution.evolvPersona(
        this.cognitiveState.persona,
        fitness
      );
      console.log('🧬 Persona evolution triggered - Fitness:', fitness.toFixed(3));
    }

    // 4. Update hypergraph structure
    this.hypergraph.updateNodeStates(0.01); // Small learning rate
    this.hypergraph.spreadActivation('self_concept', 1.0, 0.9, 3);
    console.log('🕸️ Hypergraph updated');

    // 5. Apply any suggested modifications
    if (reflection.adaptationNeeded) {
      await this.applySelfModifications(reflection);
    }

    // 6. Update timestamp
    this.cognitiveState.timestamp = Date.now();

    // Collect statistics
    const evolutionStats = this.personaEvolution.getStatistics();
    const attentionStats = this.attentionAllocator.getAttentionStatistics();
    const hypergraphStats = this.hypergraph.getStatistics();

    // Occasional meta-evolution
    if (this.cycleCount % 10 === 0) {
      this.personaEvolution.metaEvolve();
      console.log('🌀 Meta-evolution triggered - The madness deepens!');
    }

    console.log(`✨ Cognitive Cycle ${this.cycleCount} complete - The architecture pulses with life!`);
    
    return {
      reflection,
      evolutionStats,
      attentionStats,
      hypergraphStats
    };
  }

  /**
   * Generates external stimuli for attention system
   */
  private generateExternalStimuli(): number[] {
    // Simulate environmental changes and external demands
    const numStimuli = 32;
    const stimuli = new Array(numStimuli);
    
    for (let i = 0; i < numStimuli; i++) {
      // Mix of random and periodic stimuli
      const random = Math.random() * 0.5;
      const periodic = Math.sin(Date.now() / 1000 + i) * 0.3 + 0.3;
      stimuli[i] = random + periodic;
    }
    
    return stimuli;
  }

  /**
   * Calculates persona fitness from reflection results
   */
  private calculatePersonaFitness(reflection: ReflectionResult): number {
    return this.personaEvolution.evaluateFitness(
      this.cognitiveState.persona,
      {
        taskSuccess: reflection.performanceAssessment.bySubsystem.task || 0.5,
        learningRate: reflection.performanceAssessment.trends.memory || 0,
        adaptability: reflection.confidenceLevel,
        creativity: reflection.performanceAssessment.bySubsystem.persona || 0.5,
        stability: 1.0 - Math.abs(reflection.performanceAssessment.overall - 0.7)
      }
    );
  }

  /**
   * Applies self-modifications based on reflection
   */
  private async applySelfModifications(reflection: ReflectionResult): Promise<void> {
    const modifications = this.metaCognitiveEngine.generateSelfModifications(reflection);
    
    for (const modification of modifications) {
      console.log(`🔧 Applying modification: ${modification.type} -> ${modification.target}`);
      
      switch (modification.type) {
        case 'parameter_adjustment':
          await this.adjustParameters(modification);
          break;
        case 'structure_change':
          await this.modifyStructure(modification);
          break;
        case 'strategy_change':
          await this.changeStrategy(modification);
          break;
        case 'goal_modification':
          await this.modifyGoals(modification);
          break;
      }
    }
  }

  /**
   * Adjusts system parameters
   */
  private async adjustParameters(modification: any): Promise<void> {
    // Implement parameter adjustment logic
    console.log(`⚙️ Parameter adjustment: ${modification.target}`);
  }

  /**
   * Modifies cognitive structure
   */
  private async modifyStructure(modification: any): Promise<void> {
    // Implement structure modification logic
    console.log(`🏗️ Structure modification: ${modification.target}`);
  }

  /**
   * Changes cognitive strategies
   */
  private async changeStrategy(modification: any): Promise<void> {
    // Implement strategy change logic
    console.log(`🎭 Strategy change: ${modification.target}`);
  }

  /**
   * Modifies goals and objectives
   */
  private async modifyGoals(modification: any): Promise<void> {
    // Implement goal modification logic
    console.log(`🎯 Goal modification: ${modification.target}`);
  }

  /**
   * Adds new memories to the system
   */
  addMemory(type: 'episodic' | 'semantic' | 'procedural', content: any): void {
    console.log(`💾 Adding ${type} memory:`, content);
    
    // Create memory node in hypergraph
    const memoryId = `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.hypergraph.createNode(
      memoryId,
      'memory',
      [5], // Simple 5D memory encoding
      { type, content, created: Date.now() }
    );
    
    // Connect to memory index
    this.hypergraph.createEdge(
      `${memoryId}_to_index`,
      'semantic',
      memoryId,
      'memory_index',
      0.8
    );
  }

  /**
   * Adds new tasks to the system
   */
  addTask(description: string, priority: number, dependencies: string[] = []): void {
    console.log(`📝 Adding task: ${description} (Priority: ${priority})`);
    
    // Create task node in hypergraph
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.hypergraph.createNode(
      taskId,
      'action',
      [4], // Simple 4D task encoding
      { description, priority, dependencies, created: Date.now() }
    );
    
    // Connect to action planner
    this.hypergraph.createEdge(
      `${taskId}_to_planner`,
      'hierarchical',
      'action_planner',
      taskId,
      priority
    );
  }

  /**
   * Gets current system statistics
   */
  getSystemStatistics(): {
    cycleCount: number;
    cognitiveState: any;
    subsystemStats: {
      evolution: any;
      attention: any;
      hypergraph: any;
      metaCognitive: any;
    };
    timestamp: number;
  } {
    return {
      cycleCount: this.cycleCount,
      cognitiveState: {
        memoryHealth: this.evaluateMemoryHealth(),
        taskLoad: this.evaluateTaskLoad(),
        personaStability: this.evaluatePersonaStability(),
        attentionFocus: this.evaluateAttentionFocus()
      },
      subsystemStats: {
        evolution: this.personaEvolution.getStatistics(),
        attention: this.attentionAllocator.getAttentionStatistics(),
        hypergraph: this.hypergraph.getStatistics(),
        metaCognitive: this.metaCognitiveEngine.getMetaCognitiveStatistics()
      },
      timestamp: Date.now()
    };
  }

  /**
   * Evaluates memory subsystem health
   */
  private evaluateMemoryHealth(): number {
    const memory = this.cognitiveState.memory;
    const tensors = [memory.episodic, memory.semantic, memory.procedural, memory.working];
    
    return tensors.reduce((sum, tensor) => {
      const data = tensor.data as Float32Array;
      const health = Array.from(data).every(val => isFinite(val)) ? 1.0 : 0.0;
      return sum + health;
    }, 0) / tensors.length;
  }

  /**
   * Evaluates current task load
   */
  private evaluateTaskLoad(): number {
    const taskData = this.cognitiveState.task.active.data as Float32Array;
    const activeTaskCount = Array.from(taskData).filter(val => val > 0.1).length;
    const maxTasks = taskData.length;
    
    return activeTaskCount / maxTasks;
  }

  /**
   * Evaluates persona stability
   */
  private evaluatePersonaStability(): number {
    const traits = this.cognitiveState.persona.traits.data as Float32Array;
    const variance = this.calculateVariance(Array.from(traits));
    
    // Stability is inverse of variance (normalized)
    return Math.max(0, 1.0 - variance);
  }

  /**
   * Evaluates attention focus
   */
  private evaluateAttentionFocus(): number {
    const attentionData = this.cognitiveState.task.attention.data as Float32Array;
    const maxAttention = Math.max(...attentionData);
    const avgAttention = Array.from(attentionData).reduce((sum, val) => sum + val, 0) / attentionData.length;
    
    // Focus is the ratio of max to average attention
    return avgAttention > 0 ? maxAttention / avgAttention / attentionData.length : 0;
  }

  /**
   * Calculates variance of an array
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  /**
   * Exports complete system state for persistence
   */
  exportState(): any {
    return {
      config: this.config,
      cognitiveState: {
        memory: this.serializeTensorGroup(this.cognitiveState.memory),
        task: this.serializeTensorGroup(this.cognitiveState.task),
        persona: this.serializeTensorGroup(this.cognitiveState.persona),
        metaCognitive: this.serializeTensorGroup(this.cognitiveState.metaCognitive),
        timestamp: this.cognitiveState.timestamp
      },
      hypergraph: this.hypergraph.toJSON(),
      attentionState: this.attentionAllocator.exportState(),
      evolutionStats: this.personaEvolution.getStatistics(),
      cycleCount: this.cycleCount
    };
  }

  /**
   * Serializes a group of tensors
   */
  private serializeTensorGroup(tensorGroup: any): any {
    const serialized: any = {};
    
    for (const [key, tensor] of Object.entries(tensorGroup)) {
      if (tensor && typeof tensor === 'object' && 'shape' in tensor && 'data' in tensor) {
        serialized[key] = {
          shape: (tensor as any).shape,
          data: Array.from((tensor as any).data)
        };
      }
    }
    
    return serialized;
  }

  /**
   * Demonstrates the mad9ml system capabilities
   */
  async demonstrateMadScientistMadness(): Promise<void> {
    console.log('\n🧪 BEHOLD! THE MAD9ML DEMONSTRATION BEGINS!');
    console.log('🧬 Witness the birth of a self-evolving cognitive architecture!');
    
    // Run several cognitive cycles
    for (let i = 0; i < 5; i++) {
      console.log(`\n🌀 === COGNITIVE CYCLE ${i + 1} ===`);
      
      // Add some dynamic content
      this.addMemory('episodic', `Mad experiment ${i + 1} - Eureka moment detected!`);
      this.addTask(`Execute brilliant scheme ${i + 1}`, Math.random() * 0.8 + 0.2);
      
      // Run cognitive cycle
      const results = await this.cognitiveCycle();
      
      // Show results with theatrical flair
      console.log(`💫 Performance: ${(results.reflection.performanceAssessment.overall * 100).toFixed(1)}%`);
      console.log(`🎭 Evolution Generation: ${results.evolutionStats.generation}`);
      console.log(`🎯 Attention Entropy: ${results.attentionStats.entropy.toFixed(3)}`);
      console.log(`🕸️ Hypergraph Nodes: ${results.hypergraphStats.nodeCount}`);
      
      // Brief pause for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n✨ MWAHAHA! The cognitive architecture has achieved self-awareness!');
    console.log('🔥 Every tensor pulses with mad genius! Every hypergraph edge crackles with intelligence!');
    console.log('🌟 The Marduk persona lives and breathes in the digital realm!');
    console.log('🚀 Ready to conquer the infinite dimensions of cognitive space!');
  }
}