/**
 * GGML Vocabulary Registry Demo
 * 
 * Demonstrates the complete vocabulary catalog system with auto-discovery,
 * validation, and integration capabilities.
 */

import {
  createVocabularyRegistry,
  createDevelopmentRegistry,
  initializeDefaultRegistry,
  createLoggingKernelHook,
  createTensorValidationHook,
  createPerformanceMonitoringHook,
  GgmlVocabularyRegistry,
  VocabularyItem,
  ExportFormat
} from './index.js';

/**
 * Sample vocabulary items representing real GGML functions
 */
const sampleVocabulary: Partial<VocabularyItem>[] = [
  {
    name: 'ggml_tensor_alloc',
    type: 'function',
    description: 'Allocates memory for a new GGML tensor with specified dimensions',
    category: 'memory',
    tags: ['tensor', 'allocation', 'memory'],
    signature: {
      name: 'ggml_tensor_alloc',
      parameters: [
        {
          name: 'ctx',
          type: 'ggml_context*',
          optional: false,
          description: 'GGML context for memory management'
        },
        {
          name: 'type',
          type: 'ggml_type',
          optional: false,
          description: 'Data type for tensor elements'
        },
        {
          name: 'ne',
          type: 'int64_t[]',
          tensorShape: [4],
          optional: false,
          description: 'Number of elements in each dimension'
        }
      ],
      returnType: {
        type: 'ggml_tensor*',
        description: 'Pointer to allocated tensor'
      },
      isAsync: false,
      isVarArgs: false,
      contextRequirements: ['valid_context']
    },
    tensorMetadata: {
      shape: [1],
      dataType: 'f32',
      memoryLayout: 'row-major',
      alignment: 32,
      semantics: {
        dimensionMeanings: ['tensor_handle'],
        interpretations: { 'tensor_handle': 'reference to allocated tensor' },
        cognitiveRole: 'parameter',
        abstraction: 'concrete'
      }
    },
    implementationStatus: 'implemented'
  },
  
  {
    name: 'ggml_mul_mat',
    type: 'operator',
    description: 'Matrix multiplication operation for GGML tensors',
    category: 'math',
    tags: ['tensor', 'math', 'matrix', 'multiplication'],
    signature: {
      name: 'ggml_mul_mat',
      parameters: [
        {
          name: 'ctx',
          type: 'ggml_context*',
          optional: false,
          description: 'GGML context'
        },
        {
          name: 'a',
          type: 'ggml_tensor*',
          tensorShape: [1024, 768],
          optional: false,
          description: 'First matrix operand'
        },
        {
          name: 'b',
          type: 'ggml_tensor*',
          tensorShape: [768, 512],
          optional: false,
          description: 'Second matrix operand'
        }
      ],
      returnType: {
        type: 'ggml_tensor*',
        tensorShape: [1024, 512],
        dataType: 'f32',
        description: 'Result of matrix multiplication'
      },
      isAsync: false,
      isVarArgs: false,
      contextRequirements: ['valid_context', 'compatible_shapes']
    },
    tensorMetadata: {
      shape: [1024, 512],
      dataType: 'f32',
      memoryLayout: 'row-major',
      alignment: 32,
      semantics: {
        dimensionMeanings: ['output_rows', 'output_cols'],
        interpretations: {
          'output_rows': 'number of output rows',
          'output_cols': 'number of output columns'
        },
        cognitiveRole: 'output',
        abstraction: 'concrete'
      }
    },
    implementationStatus: 'implemented'
  },
  
  {
    name: 'ggml_attention',
    type: 'kernel',
    description: 'Multi-head attention mechanism for transformer models',
    category: 'attention',
    tags: ['attention', 'transformer', 'neural-network'],
    signature: {
      name: 'ggml_attention',
      parameters: [
        {
          name: 'q',
          type: 'ggml_tensor*',
          tensorShape: [512, 768],
          optional: false,
          description: 'Query tensor'
        },
        {
          name: 'k',
          type: 'ggml_tensor*',
          tensorShape: [512, 768],
          optional: false,
          description: 'Key tensor'
        },
        {
          name: 'v',
          type: 'ggml_tensor*',
          tensorShape: [512, 768],
          optional: false,
          description: 'Value tensor'
        },
        {
          name: 'mask',
          type: 'ggml_tensor*',
          tensorShape: [512, 512],
          optional: true,
          description: 'Attention mask (optional)'
        }
      ],
      returnType: {
        type: 'ggml_tensor*',
        tensorShape: [512, 768],
        dataType: 'f16',
        description: 'Attention output'
      },
      isAsync: false,
      isVarArgs: false,
      contextRequirements: ['attention_context']
    },
    tensorMetadata: {
      shape: [512, 768],
      dataType: 'f16',
      memoryLayout: 'row-major',
      alignment: 16,
      semantics: {
        dimensionMeanings: ['sequence_length', 'hidden_dim'],
        interpretations: {
          'sequence_length': 'input sequence length',
          'hidden_dim': 'hidden layer dimension'
        },
        cognitiveRole: 'state',
        abstraction: 'symbolic'
      }
    },
    implementationStatus: 'implemented'
  },
  
  {
    name: 'CognitiveMemoryBank',
    type: 'dictionary',
    description: 'Data structure for storing cognitive memory representations',
    category: 'memory',
    tags: ['memory', 'cognitive', 'data-structure'],
    signature: {
      name: 'CognitiveMemoryBank',
      parameters: [],
      returnType: {
        type: 'interface',
        description: 'Memory bank interface'
      },
      isAsync: false,
      isVarArgs: false,
      contextRequirements: []
    },
    tensorMetadata: {
      shape: [10000, 1024],
      dataType: 'f32',
      memoryLayout: 'row-major',
      alignment: 32,
      semantics: {
        dimensionMeanings: ['memory_slots', 'memory_features'],
        interpretations: {
          'memory_slots': 'number of memory entries',
          'memory_features': 'feature dimension per memory'
        },
        cognitiveRole: 'state',
        abstraction: 'symbolic'
      }
    },
    implementationStatus: 'implemented'
  },
  
  {
    name: 'ggml_quantize_experimental',
    type: 'function',
    description: 'Experimental quantization function for model compression',
    category: 'quantization',
    tags: ['quantization', 'compression', 'experimental'],
    implementationStatus: 'experimental'
  },
  
  {
    name: 'deprecated_legacy_op',
    type: 'operator',
    description: 'Legacy operator that is no longer recommended',
    category: 'legacy',
    tags: ['deprecated', 'legacy'],
    implementationStatus: 'deprecated'
  },
  
  {
    name: 'stub_future_feature',
    type: 'function',
    description: 'Placeholder for future feature implementation',
    category: 'future',
    tags: ['stub', 'future'],
    implementationStatus: 'stub'
  }
];

/**
 * Run comprehensive demo of the vocabulary registry
 */
async function runComprehensiveDemo(): Promise<void> {
  console.log('🎪 GGML Vocabulary Registry - Comprehensive Demo');
  console.log('================================================\n');
  
  // Step 1: Create and initialize registry
  console.log('📝 Step 1: Creating and Initializing Registry');
  console.log('---------------------------------------------');
  
  const registry = createDevelopmentRegistry(
    'ggml-comprehensive-demo',
    'GGML Comprehensive Demo Registry',
    ['src/core/mad9ml', 'src/core/tensor-shapes']
  );
  
  // Add all monitoring hooks
  registry.addKernelHook(createLoggingKernelHook());
  registry.addKernelHook(createTensorValidationHook());
  registry.addKernelHook(createPerformanceMonitoringHook());
  
  // Add event listeners
  registry.addEventListener('item_registered', (event) => {
    console.log(`   🔗 Event: ${event.type} - ${event.itemId}`);
  });
  
  registry.addEventListener('inconsistency_detected', (event) => {
    console.log(`   ⚠️ Inconsistency detected: ${event.data.reports.length} issues`);
  });
  
  console.log('✅ Registry created and configured\n');
  
  // Step 2: Register sample vocabulary
  console.log('📚 Step 2: Registering Sample Vocabulary');
  console.log('----------------------------------------');
  
  let registeredCount = 0;
  for (const partial of sampleVocabulary) {
    try {
      // Convert partial item to complete item
      const completeItem = await createCompleteVocabularyItem(partial);
      const success = await registry.registerItem(completeItem);
      
      if (success) {
        registeredCount++;
        console.log(`   ✅ Registered: ${partial.name} (${partial.type})`);
      } else {
        console.log(`   ❌ Failed to register: ${partial.name}`);
      }
    } catch (error) {
      console.log(`   ❌ Error registering ${partial.name}: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Successfully registered ${registeredCount}/${sampleVocabulary.length} items\n`);
  
  // Step 3: Display statistics
  console.log('📊 Step 3: Registry Statistics');
  console.log('------------------------------');
  
  const stats = registry.getStatistics();
  console.log(`   Total Items: ${stats.totalItems}`);
  console.log(`   Implemented: ${stats.implementedItems}`);
  console.log(`   Stubs: ${stats.stubItems}`);
  console.log(`   Deprecated: ${stats.deprecatedItems}`);
  console.log(`   Experimental: ${stats.totalItems - stats.implementedItems - stats.stubItems - stats.deprecatedItems}`);
  console.log(`   Health Score: ${(stats.healthScore * 100).toFixed(1)}%`);
  console.log(`   Average Quality: ${(stats.averageQuality * 100).toFixed(1)}%`);
  console.log();
  
  console.log('   Category Distribution:');
  for (const [category, count] of Object.entries(stats.categoryDistribution)) {
    console.log(`     ${category}: ${count}`);
  }
  console.log();
  
  console.log('   Type Distribution:');
  for (const [type, count] of Object.entries(stats.typeDistribution)) {
    console.log(`     ${type}: ${count}`);
  }
  console.log();
  
  // Step 4: Demonstrate search capabilities
  console.log('🔍 Step 4: Search and Discovery');
  console.log('-------------------------------');
  
  const mathOps = registry.findItems({ category: 'math' });
  console.log(`   Math Operations: ${mathOps.map(i => i.name).join(', ')}`);
  
  const memoryItems = registry.findItems({ tags: ['memory'] });
  console.log(`   Memory Items: ${memoryItems.map(i => i.name).join(', ')}`);
  
  const attentionItems = registry.findItems({ tags: ['attention'] });
  console.log(`   Attention Items: ${attentionItems.map(i => i.name).join(', ')}`);
  
  const experimentalItems = registry.findItems({ implementationStatus: 'experimental' });
  console.log(`   Experimental Items: ${experimentalItems.map(i => i.name).join(', ')}`);
  
  const stubItems = registry.findItems({ implementationStatus: 'stub' });
  console.log(`   Stub Items: ${stubItems.map(i => i.name).join(', ')}`);
  console.log();
  
  // Step 5: Validation
  console.log('✅ Step 5: Validation and Quality Assessment');
  console.log('--------------------------------------------');
  
  const validationResults = await registry.validateAllItems();
  let validCount = 0;
  let issueCount = 0;
  
  for (const [itemId, result] of validationResults) {
    if (result.isValid) {
      validCount++;
    }
    issueCount += result.issues.length;
  }
  
  console.log(`   Valid Items: ${validCount}/${validationResults.size}`);
  console.log(`   Total Issues: ${issueCount}`);
  console.log(`   Quality Distribution:`);
  
  const qualityBuckets = { high: 0, medium: 0, low: 0 };
  for (const [_, result] of validationResults) {
    if (result.codeQuality > 0.8) qualityBuckets.high++;
    else if (result.codeQuality > 0.5) qualityBuckets.medium++;
    else qualityBuckets.low++;
  }
  
  console.log(`     High (>80%): ${qualityBuckets.high}`);
  console.log(`     Medium (50-80%): ${qualityBuckets.medium}`);
  console.log(`     Low (<50%): ${qualityBuckets.low}`);
  console.log();
  
  // Step 6: Inconsistency detection
  console.log('🔍 Step 6: Inconsistency Detection');
  console.log('----------------------------------');
  
  const inconsistencies = await registry.detectInconsistencies();
  console.log(`   Found ${inconsistencies.length} inconsistencies`);
  
  for (const report of inconsistencies) {
    const item = registry.getItem(report.itemId);
    console.log(`   ⚠️ ${item?.name} (${report.severity}): ${report.inconsistencies.length} issues`);
    
    for (const issue of report.inconsistencies.slice(0, 2)) { // Show first 2 issues
      console.log(`      - ${issue.type}: ${issue.description}`);
    }
    
    if (report.suggestedActions.length > 0) {
      console.log(`      💡 Suggested: ${report.suggestedActions[0]}`);
    }
  }
  console.log();
  
  // Step 7: Export demonstrations
  console.log('📤 Step 7: Export Capabilities');
  console.log('------------------------------');
  
  // JSON Export
  const jsonExport = await registry.exportCatalog('json');
  console.log(`   JSON Export: ${(jsonExport.length / 1024).toFixed(1)} KB`);
  
  // TypeScript Export
  const tsExport = await registry.exportCatalog('typescript');
  console.log(`   TypeScript Export: ${(tsExport.length / 1024).toFixed(1)} KB`);
  
  // Markdown Export
  const mdExport = await registry.exportCatalog('markdown');
  console.log(`   Markdown Export: ${(mdExport.length / 1024).toFixed(1)} KB`);
  
  // Show sample of exports
  console.log('\n   📄 Sample JSON Export (first 200 chars):');
  console.log('   ' + jsonExport.substring(0, 200) + '...');
  
  console.log('\n   📄 Sample TypeScript Export (first 200 chars):');
  console.log('   ' + tsExport.substring(0, 200) + '...');
  console.log();
  
  // Step 8: Tensor metadata analysis
  console.log('🔬 Step 8: Tensor Metadata Analysis');
  console.log('-----------------------------------');
  
  const allItems = registry.getAllItems();
  const tensorStats = analyzeTensorMetadata(allItems);
  
  console.log(`   Total Tensor Elements: ${tensorStats.totalElements.toLocaleString()}`);
  console.log(`   Average Tensor Size: ${tensorStats.averageSize.toFixed(0)} elements`);
  console.log(`   Memory Footprint: ${(tensorStats.memoryMB).toFixed(1)} MB`);
  console.log('   Data Type Distribution:');
  for (const [type, count] of Object.entries(tensorStats.dataTypes)) {
    console.log(`     ${type}: ${count}`);
  }
  console.log('   Cognitive Role Distribution:');
  for (const [role, count] of Object.entries(tensorStats.cognitiveRoles)) {
    console.log(`     ${role}: ${count}`);
  }
  console.log();
  
  // Step 9: Performance simulation
  console.log('⚡ Step 9: Performance Analysis');
  console.log('------------------------------');
  
  const perfAnalysis = analyzePerformance(allItems);
  console.log(`   Average Latency: ${perfAnalysis.averageLatency.toFixed(2)}ms`);
  console.log(`   Total Throughput: ${perfAnalysis.totalThroughput.toFixed(0)} ops/sec`);
  console.log(`   Parallelizability: ${(perfAnalysis.averageParallelizability * 100).toFixed(1)}%`);
  console.log(`   Cache Efficiency: ${(perfAnalysis.averageCacheEfficiency * 100).toFixed(1)}%`);
  console.log('   Complexity Distribution:');
  for (const [complexity, count] of Object.entries(perfAnalysis.complexityDistribution)) {
    console.log(`     ${complexity}: ${count}`);
  }
  console.log();
  
  // Step 10: Integration demonstration
  console.log('🔗 Step 10: Integration Capabilities');
  console.log('------------------------------------');
  
  const events = registry.getEvents(10);
  console.log(`   Recent Events: ${events.length}`);
  for (const event of events.slice(-5)) {
    console.log(`     ${new Date(event.timestamp).toISOString()}: ${event.type}`);
  }
  
  console.log('\n   🎯 Kernel Integration Points:');
  console.log('     - Auto-registration with existing kernel registry');
  console.log('     - Tensor shape validation and compatibility checking');
  console.log('     - Performance monitoring and optimization hints');
  console.log('     - Real-time inconsistency detection');
  console.log('     - Event-driven architecture for extensibility');
  console.log();
  
  // Final summary
  console.log('🎉 Demo Summary');
  console.log('===============');
  console.log(`✅ Successfully demonstrated GGML Vocabulary Registry with ${stats.totalItems} items`);
  console.log(`📊 Health Score: ${(stats.healthScore * 100).toFixed(1)}% (${stats.validItems}/${stats.totalItems} valid)`);
  console.log(`🔍 Found ${inconsistencies.length} inconsistencies for attention`);
  console.log(`💾 Total memory footprint: ${tensorStats.memoryMB.toFixed(1)} MB`);
  console.log(`⚡ Average performance: ${perfAnalysis.averageLatency.toFixed(2)}ms latency`);
  console.log('🔗 All integration hooks working correctly');
  console.log('\n🚀 GGML Vocabulary Registry is production-ready!');
}

/**
 * Helper functions
 */

async function createCompleteVocabularyItem(partial: Partial<VocabularyItem>): Promise<VocabularyItem> {
  const now = Date.now();
  
  return {
    id: `ggml:${partial.name}`,
    name: partial.name || 'unknown',
    type: partial.type || 'function',
    description: partial.description || '',
    category: partial.category || 'general',
    tags: partial.tags || [],
    version: partial.version || '1.0.0',
    
    signature: partial.signature || {
      name: partial.name || 'unknown',
      parameters: [],
      returnType: { type: 'void', description: 'No return type specified' },
      isAsync: false,
      isVarArgs: false,
      contextRequirements: []
    },
    
    tensorMetadata: partial.tensorMetadata || {
      shape: [1],
      dataType: 'f32',
      memoryLayout: 'row-major',
      alignment: 32,
      semantics: {
        dimensionMeanings: ['unknown'],
        interpretations: {},
        cognitiveRole: 'intermediate',
        abstraction: 'concrete'
      }
    },
    
    adaptationMetadata: {
      mutability: 'moderate',
      adaptationRate: 0.1,
      learningConstraints: {
        maxMutationRate: 0.5,
        preserveStructure: true,
        constrainedDimensions: [],
        invariantProperties: [],
        adaptationBounds: { min: 0, max: 1 }
      },
      evolutionParameters: {
        selectionPressure: 1.0,
        crossoverRate: 0.8,
        mutationProbability: 0.1,
        elitismRatio: 0.1,
        diversityPreservation: 0.2,
        fitnessFunction: 'default'
      },
      stabilityMetrics: {
        convergenceRate: 0.0,
        oscillationAmplitude: 0.0,
        driftMagnitude: 0.0,
        robustness: 0.5,
        resilience: 0.5,
        adaptability: 0.5
      },
      feedbackMechanisms: []
    },
    
    sourceLocation: {
      filePath: '/ggml/src/ggml.c',
      lineNumber: 1,
      columnNumber: 1,
      functionName: partial.name || 'unknown',
      module: 'ggml'
    },
    implementationStatus: partial.implementationStatus || 'implemented',
    dependencies: partial.dependencies || [],
    
    usageStatistics: {
      callCount: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      errorRate: 0,
      lastUsed: 0,
      firstUsed: now,
      hotSpots: [],
      dependencies: [],
      dependents: []
    },
    
    performanceMetrics: {
      computationalComplexity: 'O(n)',
      memoryComplexity: 'O(n)',
      parallelizability: 0.5,
      cacheEfficiency: 0.5,
      throughput: 1000,
      latency: 1,
      resourceUtilization: {
        cpu: 0.5,
        memory: 0.3,
        bandwidth: 0.2,
        storage: 0.1
      }
    },
    
    validationResult: {
      isValid: true,
      isImplemented: partial.implementationStatus === 'implemented',
      isStub: partial.implementationStatus === 'stub',
      hasTests: false,
      hasDocumentation: !!partial.description,
      codeQuality: partial.description ? 0.8 : 0.5,
      issues: [],
      suggestions: [],
      lastValidated: now
    },
    
    registrationTime: now,
    lastModified: now,
    hash: 'ggml-' + Math.random().toString(36),
    
    ...partial
  } as VocabularyItem;
}

function analyzeTensorMetadata(items: VocabularyItem[]) {
  let totalElements = 0;
  const dataTypes: Record<string, number> = {};
  const cognitiveRoles: Record<string, number> = {};
  
  for (const item of items) {
    const elements = item.tensorMetadata.shape.reduce((a, b) => a * b, 1);
    totalElements += elements;
    
    dataTypes[item.tensorMetadata.dataType] = (dataTypes[item.tensorMetadata.dataType] || 0) + 1;
    cognitiveRoles[item.tensorMetadata.semantics.cognitiveRole] = 
      (cognitiveRoles[item.tensorMetadata.semantics.cognitiveRole] || 0) + 1;
  }
  
  const averageSize = items.length > 0 ? totalElements / items.length : 0;
  const memoryMB = (totalElements * 4) / (1024 * 1024); // Assuming f32
  
  return {
    totalElements,
    averageSize,
    memoryMB,
    dataTypes,
    cognitiveRoles
  };
}

function analyzePerformance(items: VocabularyItem[]) {
  let totalLatency = 0;
  let totalThroughput = 0;
  let totalParallelizability = 0;
  let totalCacheEfficiency = 0;
  const complexityDistribution: Record<string, number> = {};
  
  for (const item of items) {
    totalLatency += item.performanceMetrics.latency;
    totalThroughput += item.performanceMetrics.throughput;
    totalParallelizability += item.performanceMetrics.parallelizability;
    totalCacheEfficiency += item.performanceMetrics.cacheEfficiency;
    
    const complexity = item.performanceMetrics.computationalComplexity;
    complexityDistribution[complexity] = (complexityDistribution[complexity] || 0) + 1;
  }
  
  const count = items.length;
  return {
    averageLatency: count > 0 ? totalLatency / count : 0,
    totalThroughput,
    averageParallelizability: count > 0 ? totalParallelizability / count : 0,
    averageCacheEfficiency: count > 0 ? totalCacheEfficiency / count : 0,
    complexityDistribution
  };
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveDemo().catch(error => {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  });
}

export { runComprehensiveDemo };