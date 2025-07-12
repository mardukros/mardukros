/**
 * Hypergraph Grammar Engine Demo
 * 
 * Demonstrates the capabilities of the hypergraph grammar engine including:
 * - Encoding agentic grammar as hypergraph patterns
 * - Recursive pattern matching with tensor operations
 * - Meta-cognitive self-analysis and pattern evolution
 * - Visualization of hypergraph patterns
 */

import { HypergraphGrammarEngine, createDefaultHypergraphGrammarConfig } from './hypergraph-grammar-engine';
import { AgenticPrimitive } from './agentic-grammar/types';

/**
 * Demo showcasing hypergraph grammar pattern encoding and neural-symbolic integration
 */
async function runHypergraphGrammarDemo(): Promise<void> {
  console.log('🧠 Starting Hypergraph Grammar Engine Demo\n');
  
  // 1. Initialize the engine
  console.log('1️⃣ Initializing Hypergraph Grammar Engine...');
  const config = createDefaultHypergraphGrammarConfig();
  const engine = new HypergraphGrammarEngine(config);
  
  await engine.initialize();
  
  const initialStats = engine.getEngineStatistics();
  console.log(`   ✨ Engine initialized with ${initialStats.patterns} patterns and ${initialStats.transformations} transformations`);
  console.log('');

  // 2. Create sample agentic primitives that represent a cognitive agent
  console.log('2️⃣ Creating sample agentic primitives for cognitive agent...');
  
  const cognitiveAgentPrimitives: AgenticPrimitive[] = [
    // Perception subsystem
    {
      id: 'percept_sensor_reading',
      type: 'percept',
      name: 'readEnvironmentSensors',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 10, endLine: 20, startColumn: 0, endColumn: 40 },
      parameters: [
        { name: 'sensorType', type: 'string' },
        { name: 'sensitivity', type: 'number', defaultValue: 0.8 }
      ],
      semanticComplexity: 0.6,
      functionalDepth: 2,
      dependencies: [],
      metadata: { subsystem: 'perception', priority: 'high' }
    },
    
    {
      id: 'percept_pattern_recognition',
      type: 'percept',
      name: 'recognizePatterns',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 25, endLine: 45, startColumn: 0, endColumn: 50 },
      parameters: [
        { name: 'inputData', type: 'any[]' },
        { name: 'threshold', type: 'number', defaultValue: 0.7 }
      ],
      semanticComplexity: 0.9,
      functionalDepth: 4,
      dependencies: ['percept_sensor_reading'],
      metadata: { subsystem: 'perception', priority: 'high', aiAssisted: true }
    },

    // Memory subsystem
    {
      id: 'memory_episodic_store',
      type: 'memory',
      name: 'storeEpisode',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 50, endLine: 65, startColumn: 0, endColumn: 35 },
      parameters: [
        { name: 'episode', type: 'EpisodicMemory' },
        { name: 'importance', type: 'number', defaultValue: 0.5 }
      ],
      semanticComplexity: 0.7,
      functionalDepth: 3,
      dependencies: ['percept_pattern_recognition'],
      metadata: { subsystem: 'memory', memoryType: 'episodic' }
    },

    {
      id: 'memory_semantic_retrieve',
      type: 'memory',
      name: 'retrieveSemanticKnowledge',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 70, endLine: 85, startColumn: 0, endColumn: 45 },
      parameters: [
        { name: 'query', type: 'string' },
        { name: 'contextWindow', type: 'number', defaultValue: 10 }
      ],
      semanticComplexity: 0.8,
      functionalDepth: 3,
      dependencies: [],
      metadata: { subsystem: 'memory', memoryType: 'semantic' }
    },

    // Decision-making subsystem
    {
      id: 'decision_goal_evaluation',
      type: 'decision',
      name: 'evaluateGoalPriorities',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 90, endLine: 110, startColumn: 0, endColumn: 55 },
      parameters: [
        { name: 'currentGoals', type: 'Goal[]' },
        { name: 'context', type: 'Context' }
      ],
      semanticComplexity: 0.95,
      functionalDepth: 5,
      dependencies: ['memory_semantic_retrieve', 'memory_episodic_store'],
      metadata: { subsystem: 'decision', decisionType: 'strategic' }
    },

    {
      id: 'decision_action_selection',
      type: 'decision',
      name: 'selectOptimalAction',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 115, endLine: 135, startColumn: 0, endColumn: 60 },
      parameters: [
        { name: 'availableActions', type: 'Action[]' },
        { name: 'expectedOutcomes', type: 'Outcome[]' }
      ],
      semanticComplexity: 0.85,
      functionalDepth: 4,
      dependencies: ['decision_goal_evaluation'],
      metadata: { subsystem: 'decision', decisionType: 'tactical' }
    },

    // Planning subsystem
    {
      id: 'planning_strategy_formation',
      type: 'planning',
      name: 'formLongTermStrategy',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 140, endLine: 170, startColumn: 0, endColumn: 65 },
      parameters: [
        { name: 'objectives', type: 'Objective[]' },
        { name: 'constraints', type: 'Constraint[]' },
        { name: 'timeHorizon', type: 'number', defaultValue: 100 }
      ],
      semanticComplexity: 1.0,
      functionalDepth: 6,
      dependencies: ['decision_goal_evaluation'],
      metadata: { subsystem: 'planning', planType: 'strategic', complexity: 'high' }
    },

    {
      id: 'planning_task_sequencing',
      type: 'planning',
      name: 'sequenceTasks',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 175, endLine: 195, startColumn: 0, endColumn: 45 },
      parameters: [
        { name: 'tasks', type: 'Task[]' },
        { name: 'dependencies', type: 'Dependency[]' }
      ],
      semanticComplexity: 0.75,
      functionalDepth: 3,
      dependencies: ['planning_strategy_formation', 'decision_action_selection'],
      metadata: { subsystem: 'planning', planType: 'operational' }
    },

    // Action execution subsystem
    {
      id: 'action_motor_control',
      type: 'action',
      name: 'executeMotorCommand',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 200, endLine: 220, startColumn: 0, endColumn: 50 },
      parameters: [
        { name: 'command', type: 'MotorCommand' },
        { name: 'precision', type: 'number', defaultValue: 0.9 }
      ],
      semanticComplexity: 0.6,
      functionalDepth: 2,
      dependencies: ['planning_task_sequencing'],
      metadata: { subsystem: 'action', actionType: 'motor' }
    },

    {
      id: 'action_communication',
      type: 'communication',
      name: 'communicateWithPeers',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 225, endLine: 245, startColumn: 0, endColumn: 55 },
      parameters: [
        { name: 'message', type: 'Message' },
        { name: 'recipients', type: 'Agent[]' }
      ],
      semanticComplexity: 0.8,
      functionalDepth: 3,
      dependencies: ['planning_task_sequencing'],
      metadata: { subsystem: 'action', actionType: 'communication' }
    },

    // Attention and goal management
    {
      id: 'attention_resource_allocation',
      type: 'attention',
      name: 'allocateAttentionResources',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 250, endLine: 275, startColumn: 0, endColumn: 60 },
      parameters: [
        { name: 'tasks', type: 'Task[]' },
        { name: 'totalResources', type: 'number', defaultValue: 1.0 }
      ],
      semanticComplexity: 0.9,
      functionalDepth: 4,
      dependencies: ['decision_goal_evaluation'],
      metadata: { subsystem: 'attention', allocationType: 'resource' }
    },

    {
      id: 'goal_adaptation',
      type: 'goal',
      name: 'adaptGoalsToContext',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 280, endLine: 300, startColumn: 0, endColumn: 50 },
      parameters: [
        { name: 'currentGoals', type: 'Goal[]' },
        { name: 'contextChanges', type: 'ContextChange[]' }
      ],
      semanticComplexity: 0.85,
      functionalDepth: 4,
      dependencies: ['attention_resource_allocation', 'memory_episodic_store'],
      metadata: { subsystem: 'goal', adaptationType: 'contextual' }
    },

    // Constraint management and adaptation
    {
      id: 'constraint_validation',
      type: 'constraint',
      name: 'validateSystemConstraints',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 305, endLine: 325, startColumn: 0, endColumn: 55 },
      parameters: [
        { name: 'proposedActions', type: 'Action[]' },
        { name: 'systemLimits', type: 'Limits' }
      ],
      semanticComplexity: 0.7,
      functionalDepth: 3,
      dependencies: ['decision_action_selection'],
      metadata: { subsystem: 'constraint', validationType: 'system' }
    },

    {
      id: 'adaptation_learning',
      type: 'adaptation',
      name: 'learnFromExperience',
      sourceLocation: { filePath: 'cognitive-agent.ts', startLine: 330, endLine: 355, startColumn: 0, endColumn: 60 },
      parameters: [
        { name: 'experiences', type: 'Experience[]' },
        { name: 'learningRate', type: 'number', defaultValue: 0.01 }
      ],
      semanticComplexity: 1.0,
      functionalDepth: 5,
      dependencies: ['memory_episodic_store', 'goal_adaptation'],
      metadata: { subsystem: 'adaptation', learningType: 'experiential' }
    }
  ];

  console.log(`   📊 Created ${cognitiveAgentPrimitives.length} agentic primitives representing a complete cognitive agent`);
  console.log('');

  // 3. Encode agentic grammar as hypergraph patterns
  console.log('3️⃣ Encoding agentic grammar as hypergraph patterns...');
  
  const hypergraph = await engine.encodeGrammarAsHypergraph(cognitiveAgentPrimitives);
  
  console.log(`   🌐 Created hypergraph with:`);
  console.log(`      - ${hypergraph.nodes.size} cognitive nodes`);
  console.log(`      - ${hypergraph.edges.size} semantic edges`);
  console.log(`      - ${hypergraph.clusters.size} pattern clusters`);
  console.log('');

  // 4. Perform recursive pattern matching with different queries
  console.log('4️⃣ Performing recursive pattern matching with tensor operations...');
  
  const queries = [
    'perception and action coordination',
    'memory-guided decision making',
    'strategic planning and execution',
    'adaptive goal management',
    'constraint-aware learning'
  ];

  for (const query of queries) {
    console.log(`   🔍 Matching pattern: "${query}"`);
    
    const matchResults = await engine.performRecursivePatternMatching(query, 4);
    
    if (matchResults.length > 0) {
      const bestMatch = matchResults[0];
      console.log(`      ✨ Best match: ${bestMatch.pattern.name}`);
      console.log(`      📊 Confidence: ${(bestMatch.confidence * 100).toFixed(1)}%`);
      console.log(`      🔄 Recursion depth: ${bestMatch.recursionDepth}`);
      console.log(`      🧮 Tensor shape: [${bestMatch.tensorRepresentation.shape.join(' × ')}]`);
      console.log(`      🎯 Matched nodes: ${bestMatch.matchedNodes.length}`);
      
      if (bestMatch.activations.size > 0) {
        const topActivations = Array.from(bestMatch.activations.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3);
        console.log(`      ⚡ Top activations: ${topActivations.map(([node, act]) => 
          `${node.slice(-10)}(${(act * 100).toFixed(1)}%)`).join(', ')}`);
      }
      console.log('');
    } else {
      console.log(`      ❌ No patterns matched for "${query}"`);
      console.log('');
    }
  }

  // 5. Demonstrate meta-cognitive self-analysis
  console.log('5️⃣ Performing meta-cognitive self-analysis...');
  
  const analysisMetrics = await engine.performSelfAnalysis();
  
  console.log(`   🧘 Analysis Results:`);
  console.log(`      📈 Pattern Efficiency: ${(analysisMetrics.patternEfficiency * 100).toFixed(1)}%`);
  console.log(`      🧬 Evolution Rate: ${(analysisMetrics.evolutionRate * 100).toFixed(1)}%`);
  console.log(`      📊 Complexity Growth: ${(analysisMetrics.complexityGrowth * 100).toFixed(1)}%`);
  console.log(`      🔄 Recursion Stability: ${(analysisMetrics.recursionStability * 100).toFixed(1)}%`);
  console.log(`      🤖 Neural-Symbolic Alignment: ${(analysisMetrics.neuralSymbolicAlignment * 100).toFixed(1)}%`);
  console.log('');

  // 6. Show pattern evolution capabilities
  console.log('6️⃣ Demonstrating pattern evolution capabilities...');
  
  // Trigger additional analysis cycles to show evolution
  for (let i = 0; i < 3; i++) {
    await engine.performSelfAnalysis();
  }
  
  const finalStats = engine.getEngineStatistics();
  console.log(`   🧬 Evolution Progress:`);
  console.log(`      📊 Analysis cycles completed: ${finalStats.analysisHistory.length}`);
  console.log(`      🎯 Current patterns: ${finalStats.patterns}`);
  console.log(`      ⚙️ Active transformations: ${finalStats.transformations}`);
  console.log(`      🧮 Evolution parameters: [${finalStats.evolutionState.slice(0, 5).map(x => x.toFixed(3)).join(', ')}...]`);
  console.log('');

  // 7. Generate and display hypergraph visualization
  console.log('7️⃣ Generating hypergraph visualization...');
  
  const visualization = engine.generateHypergraphVisualization();
  
  console.log('   📊 Hypergraph Visualization Generated:');
  console.log('   ' + '='.repeat(50));
  
  // Display a condensed version of the visualization
  const lines = visualization.split('\n');
  const statsSection = lines.slice(0, 15);
  const patternsSection = lines.slice(15, 35);
  
  console.log(statsSection.map(line => `   ${line}`).join('\n'));
  console.log(`   ... [Pattern details truncated for demo] ...`);
  console.log('   ' + '='.repeat(50));
  console.log('');

  // 8. Demonstrate parallel tensor operations capability
  console.log('8️⃣ Showcasing parallel tensor operations capability...');
  
  const parallelQueries = [
    'multi-modal perception integration',
    'hierarchical planning coordination',
    'distributed attention allocation'
  ];

  console.log(`   ⚡ Processing ${parallelQueries.length} queries in parallel...`);
  
  const startTime = Date.now();
  const parallelResults = await Promise.all(
    parallelQueries.map(query => 
      engine.performRecursivePatternMatching(query, 3)
    )
  );
  const endTime = Date.now();
  
  console.log(`   ⏱️ Parallel processing completed in ${endTime - startTime}ms`);
  console.log(`   🎯 Total pattern matches found: ${parallelResults.flat().length}`);
  
  parallelResults.forEach((results, index) => {
    if (results.length > 0) {
      console.log(`      🔍 "${parallelQueries[index]}": ${results.length} matches, best confidence: ${(results[0].confidence * 100).toFixed(1)}%`);
    }
  });
  console.log('');

  // 9. Summary and insights
  console.log('9️⃣ Demo Summary and Insights:');
  console.log('');
  console.log('   🧠 Hypergraph Grammar Engine successfully demonstrated:');
  console.log('      ✅ Encoding agentic primitives as hypergraph patterns');
  console.log('      ✅ Neural-symbolic integration with tensor operations');
  console.log('      ✅ Recursive pattern matching with configurable depth');
  console.log('      ✅ Meta-cognitive self-analysis and pattern evolution');
  console.log('      ✅ Parallel tensor transformations for scalability');
  console.log('      ✅ Comprehensive pattern visualization');
  console.log('');
  console.log('   🚀 Key Achievements:');
  console.log(`      📊 Processed ${cognitiveAgentPrimitives.length} agentic primitives`);
  console.log(`      🌐 Created ${hypergraph.nodes.size} cognitive nodes with ${hypergraph.edges.size} semantic relationships`);
  console.log(`      🎯 Performed ${queries.length + parallelQueries.length} pattern matching operations`);
  console.log(`      🧘 Completed ${finalStats.analysisHistory.length} self-analysis cycles`);
  console.log(`      🧬 Evolved patterns through ${finalStats.transformations} active transformations`);
  console.log('');
  console.log('   🔮 Neural-Symbolic Integration Benefits:');
  console.log('      🤖 Symbolic agentic patterns provide interpretable cognitive structure');
  console.log('      ⚡ Tensor operations enable parallel, scalable computation');
  console.log('      🧘 Meta-cognitive capabilities allow self-improvement and adaptation');
  console.log('      🔄 Recursive pattern matching supports complex, hierarchical reasoning');
  console.log('      🌐 Hypergraph representation captures multi-dimensional relationships');
  console.log('');

  const finalEngineStats = engine.getEngineStatistics();
  console.log('   📈 Final Engine Statistics:');
  console.log(`      🎯 Active Patterns: ${finalEngineStats.patterns}`);
  console.log(`      ⚙️ Tensor Transformations: ${finalEngineStats.transformations}`);
  console.log(`      🌐 Hypergraph Nodes: ${finalEngineStats.hypergraphStats.nodeCount}`);
  console.log(`      🔗 Hypergraph Edges: ${finalEngineStats.hypergraphStats.edgeCount}`);
  console.log(`      🎭 Pattern Clusters: ${finalEngineStats.hypergraphStats.clusterCount}`);
  console.log(`      📊 Average Node Degree: ${finalEngineStats.hypergraphStats.averageDegree.toFixed(2)}`);
  console.log('');
  
  console.log('🎉 Hypergraph Grammar Engine Demo Complete!');
  console.log('');
  console.log('The engine demonstrates true agentic synergy through:');
  console.log('- 🧬 Grammar rules encoded as hypergraph patterns');
  console.log('- ⚡ Neural-symbolic integration via tensor operations');
  console.log('- 🔄 Complex recursive pattern-matching capabilities');
  console.log('- 🧘 Meta-cognitive self-analysis and pattern evolution');
  console.log('- 📊 Comprehensive visualization and monitoring');
  console.log('');
}

/**
 * Run the demo if this file is executed directly
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  runHypergraphGrammarDemo().catch(console.error);
}

export { runHypergraphGrammarDemo };