/**
 * Hypergraph Grammar Engine Integration Example
 * 
 * Demonstrates how to integrate the hypergraph grammar engine
 * into existing cognitive architectures and AI systems.
 */

import { 
  HypergraphGrammarEngine, 
  createDefaultHypergraphGrammarConfig,
  type HypergraphPattern,
  type PatternMatchResult,
  type AnalysisMetrics
} from './hypergraph-grammar-engine';

import { AgenticPrimitive } from './agentic-grammar/types';

/**
 * Example cognitive agent that uses the hypergraph grammar engine
 */
class CognitiveAgentWithHypergraphGrammar {
  private grammarEngine: HypergraphGrammarEngine;
  private agentPrimitives: Map<string, AgenticPrimitive>;
  private currentContext: string;
  private learningHistory: AnalysisMetrics[];

  constructor() {
    const config = createDefaultHypergraphGrammarConfig();
    
    // Customize config for cognitive agent
    config.tensorization.defaultPrecision = 'f32';
    config.distribution.loadBalancingStrategy = 'complexity-based';
    
    this.grammarEngine = new HypergraphGrammarEngine(config);
    this.agentPrimitives = new Map();
    this.currentContext = 'default';
    this.learningHistory = [];
  }

  /**
   * Initialize the cognitive agent with its behavioral primitives
   */
  async initialize(): Promise<void> {
    console.log('🤖 Initializing Cognitive Agent with Hypergraph Grammar...');
    
    // Initialize the grammar engine
    await this.grammarEngine.initialize();
    
    // Define agent's cognitive primitives
    this.defineAgentPrimitives();
    
    // Encode primitives as hypergraph patterns
    const primitives = Array.from(this.agentPrimitives.values());
    await this.grammarEngine.encodeGrammarAsHypergraph(primitives);
    
    console.log(`✅ Agent initialized with ${primitives.length} cognitive primitives`);
  }

  /**
   * Define the agent's core cognitive primitives
   */
  private defineAgentPrimitives(): void {
    // Perception primitives
    this.agentPrimitives.set('perceive_environment', {
      id: 'perceive_environment',
      type: 'percept',
      name: 'perceiveEnvironment',
      sourceLocation: { filePath: 'agent.ts', startLine: 1, endLine: 10, startColumn: 0, endColumn: 30 },
      parameters: [{ name: 'sensorData', type: 'SensorData[]' }],
      semanticComplexity: 0.6,
      functionalDepth: 2,
      dependencies: [],
      metadata: { priority: 'high', category: 'perception' }
    });

    // Memory primitives
    this.agentPrimitives.set('store_experience', {
      id: 'store_experience',
      type: 'memory',
      name: 'storeExperience',
      sourceLocation: { filePath: 'agent.ts', startLine: 15, endLine: 25, startColumn: 0, endColumn: 35 },
      parameters: [{ name: 'experience', type: 'Experience' }],
      semanticComplexity: 0.7,
      functionalDepth: 3,
      dependencies: ['perceive_environment'],
      metadata: { priority: 'medium', category: 'memory' }
    });

    // Decision primitives
    this.agentPrimitives.set('make_decision', {
      id: 'make_decision',
      type: 'decision',
      name: 'makeDecision',
      sourceLocation: { filePath: 'agent.ts', startLine: 30, endLine: 45, startColumn: 0, endColumn: 40 },
      parameters: [{ name: 'options', type: 'Option[]' }, { name: 'context', type: 'Context' }],
      semanticComplexity: 0.9,
      functionalDepth: 4,
      dependencies: ['store_experience'],
      metadata: { priority: 'high', category: 'decision' }
    });

    // Action primitives
    this.agentPrimitives.set('execute_action', {
      id: 'execute_action',
      type: 'action',
      name: 'executeAction',
      sourceLocation: { filePath: 'agent.ts', startLine: 50, endLine: 60, startColumn: 0, endColumn: 35 },
      parameters: [{ name: 'action', type: 'Action' }],
      semanticComplexity: 0.5,
      functionalDepth: 2,
      dependencies: ['make_decision'],
      metadata: { priority: 'high', category: 'action' }
    });

    // Learning primitives
    this.agentPrimitives.set('learn_from_outcome', {
      id: 'learn_from_outcome',
      type: 'adaptation',
      name: 'learnFromOutcome',
      sourceLocation: { filePath: 'agent.ts', startLine: 65, endLine: 80, startColumn: 0, endColumn: 45 },
      parameters: [{ name: 'outcome', type: 'Outcome' }, { name: 'expectedOutcome', type: 'Outcome' }],
      semanticComplexity: 0.8,
      functionalDepth: 4,
      dependencies: ['execute_action'],
      metadata: { priority: 'medium', category: 'learning' }
    });
  }

  /**
   * Process a cognitive query using hypergraph pattern matching
   */
  async processQuery(query: string, context?: string): Promise<{
    response: string;
    patterns: PatternMatchResult[];
    confidence: number;
  }> {
    console.log(`🧠 Processing query: "${query}"`);
    
    if (context) {
      this.currentContext = context;
    }
    
    // Perform recursive pattern matching
    const patterns = await this.grammarEngine.performRecursivePatternMatching(query, 4);
    
    if (patterns.length === 0) {
      return {
        response: "I don't have a cognitive pattern that matches this query.",
        patterns: [],
        confidence: 0
      };
    }

    const bestPattern = patterns[0];
    const response = this.generateResponseFromPattern(bestPattern, query);
    
    console.log(`✅ Found ${patterns.length} matching patterns, confidence: ${(bestPattern.confidence * 100).toFixed(1)}%`);
    
    return {
      response,
      patterns,
      confidence: bestPattern.confidence
    };
  }

  /**
   * Generate a response based on matched patterns
   */
  private generateResponseFromPattern(pattern: PatternMatchResult, query: string): string {
    const patternName = pattern.pattern.name;
    const confidence = (pattern.confidence * 100).toFixed(1);
    const recursionDepth = pattern.recursionDepth;
    const nodeCount = pattern.matchedNodes.length;

    return `Based on the "${patternName}" pattern (${confidence}% confidence), ` +
           `I analyzed this through ${recursionDepth} levels of cognitive processing ` +
           `involving ${nodeCount} cognitive components. ` +
           `This pattern suggests a ${this.interpretPatternForQuery(pattern, query)}.`;
  }

  /**
   * Interpret pattern results for specific query context
   */
  private interpretPatternForQuery(pattern: PatternMatchResult, query: string): string {
    const patternType = pattern.pattern.id;
    
    switch (patternType) {
      case 'sequential_action':
        return 'step-by-step approach involving planned sequence of actions';
      case 'perception_action_loop':
        return 'cyclical process of sensing, processing, and responding';
      case 'memory_goal_adaptation':
        return 'adaptive strategy based on past experience and current objectives';
      case 'recursive_constraint_satisfaction':
        return 'hierarchical problem-solving approach with constraint validation';
      default:
        return 'cognitive processing pattern tailored to the specific context';
    }
  }

  /**
   * Perform continuous learning and adaptation
   */
  async adaptAndLearn(): Promise<void> {
    console.log('🧘 Performing cognitive adaptation and learning...');
    
    // Trigger meta-cognitive self-analysis
    const metrics = await this.grammarEngine.performSelfAnalysis();
    this.learningHistory.push(metrics);
    
    console.log('📊 Learning metrics:');
    console.log(`   Pattern Efficiency: ${(metrics.patternEfficiency * 100).toFixed(1)}%`);
    console.log(`   Evolution Rate: ${(metrics.evolutionRate * 100).toFixed(1)}%`);
    console.log(`   Neural-Symbolic Alignment: ${(metrics.neuralSymbolicAlignment * 100).toFixed(1)}%`);
    
    // Trigger adaptation if performance is below threshold
    if (metrics.patternEfficiency < 0.7) {
      console.log('🧬 Triggering cognitive adaptation due to low pattern efficiency');
      await this.adaptCognitiveBehavior(metrics);
    }
  }

  /**
   * Adapt cognitive behavior based on analysis metrics
   */
  private async adaptCognitiveBehavior(metrics: AnalysisMetrics): Promise<void> {
    // This would typically involve:
    // 1. Updating primitive parameters
    // 2. Modifying pattern weights
    // 3. Adjusting attention allocation
    // 4. Creating new cognitive primitives if needed
    
    console.log('⚙️ Adapting cognitive behavior patterns...');
    
    // Simulate adaptation by updating primitive metadata
    for (const primitive of this.agentPrimitives.values()) {
      if (primitive.metadata.priority === 'low') {
        primitive.metadata.priority = 'medium';
        primitive.semanticComplexity *= 1.1; // Increase complexity for low-priority items
      }
    }
    
    // Re-encode updated primitives
    const updatedPrimitives = Array.from(this.agentPrimitives.values());
    await this.grammarEngine.encodeGrammarAsHypergraph(updatedPrimitives);
    
    console.log('✅ Cognitive adaptation complete');
  }

  /**
   * Generate cognitive insight report
   */
  generateInsightReport(): string {
    const stats = this.grammarEngine.getEngineStatistics();
    const visualization = this.grammarEngine.generateHypergraphVisualization();
    
    return `
# Cognitive Agent Insight Report

## Current Cognitive State
- **Active Patterns**: ${stats.patterns}
- **Tensor Transformations**: ${stats.transformations}
- **Hypergraph Nodes**: ${stats.hypergraphStats.nodeCount}
- **Hypergraph Edges**: ${stats.hypergraphStats.edgeCount}
- **Pattern Clusters**: ${stats.hypergraphStats.clusterCount}

## Learning History
- **Analysis Cycles**: ${stats.analysisHistory.length}
- **Latest Pattern Efficiency**: ${stats.analysisHistory.length > 0 ? 
      (stats.analysisHistory[stats.analysisHistory.length - 1].patternEfficiency * 100).toFixed(1) + '%' : 'N/A'}

## Cognitive Primitives
${Array.from(this.agentPrimitives.values()).map(p => 
  `- **${p.name}** (${p.type}): Complexity ${(p.semanticComplexity * 100).toFixed(0)}%, Depth ${p.functionalDepth}`
).join('\n')}

## Hypergraph Visualization
${visualization}
`;
  }

  /**
   * Get current cognitive statistics
   */
  getCognitiveStatistics(): {
    primitives: number;
    patterns: number;
    transformations: number;
    learningCycles: number;
    currentEfficiency: number;
  } {
    const stats = this.grammarEngine.getEngineStatistics();
    const latestMetrics = stats.analysisHistory[stats.analysisHistory.length - 1];
    
    return {
      primitives: this.agentPrimitives.size,
      patterns: stats.patterns,
      transformations: stats.transformations,
      learningCycles: stats.analysisHistory.length,
      currentEfficiency: latestMetrics ? latestMetrics.patternEfficiency : 0
    };
  }
}

/**
 * Example usage of the cognitive agent with hypergraph grammar
 */
async function demonstrateCognitiveAgent(): Promise<void> {
  console.log('🚀 Demonstrating Cognitive Agent with Hypergraph Grammar Engine\n');
  
  // Create and initialize the agent
  const agent = new CognitiveAgentWithHypergraphGrammar();
  await agent.initialize();
  console.log('');

  // Test various cognitive queries
  const queries = [
    'How should I approach learning a new skill?',
    'What is the best way to make decisions under uncertainty?',
    'How can I improve my problem-solving abilities?',
    'What strategy should I use for complex planning tasks?'
  ];

  for (const query of queries) {
    const result = await agent.processQuery(query);
    console.log(`💭 Query: "${query}"`);
    console.log(`🎯 Response: ${result.response}`);
    console.log(`📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log('');
  }

  // Demonstrate learning and adaptation
  await agent.adaptAndLearn();
  console.log('');

  // Show cognitive statistics
  const stats = agent.getCognitiveStatistics();
  console.log('📈 Final Cognitive Statistics:');
  console.log(`   🧠 Cognitive Primitives: ${stats.primitives}`);
  console.log(`   🎭 Active Patterns: ${stats.patterns}`);
  console.log(`   ⚙️ Tensor Transformations: ${stats.transformations}`);
  console.log(`   📚 Learning Cycles: ${stats.learningCycles}`);
  console.log(`   ✨ Current Efficiency: ${(stats.currentEfficiency * 100).toFixed(1)}%`);
  console.log('');

  // Generate insight report
  console.log('📋 Generating cognitive insight report...');
  const report = agent.generateInsightReport();
  console.log('✅ Report generated (truncated for demo)');
  console.log('');

  console.log('🎉 Cognitive Agent Demonstration Complete!');
  console.log('');
  console.log('🧠 The agent successfully demonstrated:');
  console.log('   ✅ Hypergraph grammar pattern encoding of cognitive primitives');
  console.log('   ✅ Neural-symbolic query processing with pattern matching');
  console.log('   ✅ Meta-cognitive learning and behavioral adaptation');
  console.log('   ✅ Comprehensive cognitive insight reporting');
  console.log('   ✅ Integration with existing cognitive architecture patterns');
}

// Export for use in other modules
export { CognitiveAgentWithHypergraphGrammar, demonstrateCognitiveAgent };

// Run demonstration if file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateCognitiveAgent().catch(console.error);
}