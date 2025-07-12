/**
 * GGML Vocabulary Registry Tests
 * 
 * Comprehensive tests for the vocabulary catalog system to validate
 * auto-discovery, validation, and registry functionality.
 */

import { 
  createVocabularyRegistry,
  createDevelopmentRegistry,
  GgmlVocabularyRegistry,
  VocabularyItem,
  VocabularyType,
  GgmlVocabularyScanner,
  createLoggingKernelHook,
  createTensorValidationHook,
  getDefaultRegistry,
  initializeDefaultRegistry
} from './index.js';

/**
 * Test vocabulary item factory
 */
function createTestVocabularyItem(
  name: string,
  type: VocabularyType = 'function',
  overrides: Partial<VocabularyItem> = {}
): VocabularyItem {
  const now = Date.now();
  
  return {
    id: `test:${name}`,
    name,
    type,
    description: `Test ${type}: ${name}`,
    category: 'test',
    tags: ['test', type],
    version: '1.0.0',
    
    signature: {
      name,
      parameters: [
        {
          name: 'input',
          type: 'Tensor',
          tensorShape: [8, 8],
          optional: false,
          description: 'Input tensor'
        }
      ],
      returnType: {
        type: 'Tensor',
        tensorShape: [8, 8],
        dataType: 'f32',
        description: 'Output tensor'
      },
      isAsync: false,
      isVarArgs: false,
      contextRequirements: []
    },
    
    tensorMetadata: {
      shape: [8, 8],
      dataType: 'f32',
      memoryLayout: 'row-major',
      alignment: 32,
      semantics: {
        dimensionMeanings: ['batch', 'features'],
        interpretations: { 'batch': 'processing batch size', 'features': 'feature vector dimension' },
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
        invariantProperties: ['shape'],
        adaptationBounds: { min: 0, max: 1 }
      },
      evolutionParameters: {
        selectionPressure: 1.0,
        crossoverRate: 0.8,
        mutationProbability: 0.1,
        elitismRatio: 0.1,
        diversityPreservation: 0.2,
        fitnessFunction: 'performance'
      },
      stabilityMetrics: {
        convergenceRate: 0.9,
        oscillationAmplitude: 0.1,
        driftMagnitude: 0.05,
        robustness: 0.8,
        resilience: 0.7,
        adaptability: 0.6
      },
      feedbackMechanisms: [
        {
          type: 'performance',
          weight: 1.0,
          delay: 0,
          threshold: 0.5,
          enabled: true
        }
      ]
    },
    
    sourceLocation: {
      filePath: '/test/test-file.ts',
      lineNumber: 42,
      columnNumber: 10,
      functionName: name,
      module: 'test-module'
    },
    implementationStatus: 'implemented',
    dependencies: [],
    
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
      parallelizability: 0.8,
      cacheEfficiency: 0.7,
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
      isImplemented: true,
      isStub: false,
      hasTests: true,
      hasDocumentation: true,
      codeQuality: 0.9,
      issues: [],
      suggestions: [],
      lastValidated: now
    },
    
    registrationTime: now,
    lastModified: now,
    hash: 'test-hash-' + Math.random().toString(36),
    
    ...overrides
  };
}

/**
 * Test suite runner
 */
async function runTests(): Promise<void> {
  console.log('🧪 Starting GGML Vocabulary Registry Tests\n');
  
  let passed = 0;
  let failed = 0;
  
  const test = (name: string, fn: () => Promise<void> | void) => {
    return async () => {
      try {
        console.log(`🔍 Testing: ${name}`);
        await fn();
        console.log(`✅ ${name} - PASSED\n`);
        passed++;
      } catch (error) {
        console.error(`❌ ${name} - FAILED:`, error.message);
        console.error(error.stack);
        console.log('');
        failed++;
      }
    };
  };
  
  // Test 1: Registry Creation
  await test('Registry Creation', async () => {
    const registry = createVocabularyRegistry('test-registry', 'Test Registry');
    
    if (!registry) {
      throw new Error('Failed to create registry');
    }
    
    const stats = registry.getStatistics();
    if (stats.totalItems !== 0) {
      throw new Error('New registry should have no items');
    }
  })();
  
  // Test 2: Item Registration
  await test('Item Registration', async () => {
    const registry = createVocabularyRegistry('test-registry-2', 'Test Registry 2');
    const testItem = createTestVocabularyItem('testFunction');
    
    const success = await registry.registerItem(testItem);
    if (!success) {
      throw new Error('Failed to register test item');
    }
    
    const retrieved = registry.getItem(testItem.id);
    if (!retrieved) {
      throw new Error('Failed to retrieve registered item');
    }
    
    if (retrieved.name !== testItem.name) {
      throw new Error('Retrieved item has wrong name');
    }
  })();
  
  // Test 3: Item Validation
  await test('Item Validation', async () => {
    const registry = createVocabularyRegistry('test-registry-3', 'Test Registry 3');
    
    // Valid item
    const validItem = createTestVocabularyItem('validFunction');
    const validResult = await registry.validateItem(validItem);
    
    if (!validResult.isValid) {
      throw new Error('Valid item failed validation');
    }
    
    // Invalid item (missing name)
    const invalidItem = createTestVocabularyItem('', 'function');
    const invalidResult = await registry.validateItem(invalidItem);
    
    if (invalidResult.isValid) {
      throw new Error('Invalid item passed validation');
    }
  })();
  
  // Test 4: Item Search
  await test('Item Search', async () => {
    const registry = createVocabularyRegistry('test-registry-4', 'Test Registry 4');
    
    // Register test items
    await registry.registerItem(createTestVocabularyItem('func1', 'function'));
    await registry.registerItem(createTestVocabularyItem('lib1', 'library'));
    await registry.registerItem(createTestVocabularyItem('dict1', 'dictionary'));
    
    // Search by type
    const functions = registry.findItems({ type: 'function' });
    if (functions.length !== 1) {
      throw new Error(`Expected 1 function, found ${functions.length}`);
    }
    
    const libraries = registry.findItems({ type: 'library' });
    if (libraries.length !== 1) {
      throw new Error(`Expected 1 library, found ${libraries.length}`);
    }
    
    // Search by category
    const testItems = registry.findItems({ category: 'test' });
    if (testItems.length !== 3) {
      throw new Error(`Expected 3 test items, found ${testItems.length}`);
    }
  })();
  
  // Test 5: Statistics
  await test('Statistics Calculation', async () => {
    const registry = createVocabularyRegistry('test-registry-5', 'Test Registry 5');
    
    // Register different types of items
    await registry.registerItem(createTestVocabularyItem('impl1', 'function'));
    await registry.registerItem(createTestVocabularyItem('stub1', 'function', { 
      implementationStatus: 'stub' 
    }));
    await registry.registerItem(createTestVocabularyItem('deprecated1', 'function', { 
      implementationStatus: 'deprecated' 
    }));
    
    const stats = registry.getStatistics();
    
    if (stats.totalItems !== 3) {
      throw new Error(`Expected 3 total items, found ${stats.totalItems}`);
    }
    
    if (stats.implementedItems !== 1) {
      throw new Error(`Expected 1 implemented item, found ${stats.implementedItems}`);
    }
    
    if (stats.stubItems !== 1) {
      throw new Error(`Expected 1 stub item, found ${stats.stubItems}`);
    }
    
    if (stats.deprecatedItems !== 1) {
      throw new Error(`Expected 1 deprecated item, found ${stats.deprecatedItems}`);
    }
  })();
  
  // Test 6: Inconsistency Detection
  await test('Inconsistency Detection', async () => {
    const registry = createVocabularyRegistry('test-registry-6', 'Test Registry 6');
    
    // Register problematic items
    await registry.registerItem(createTestVocabularyItem('coreStub', 'function', {
      category: 'core',
      implementationStatus: 'stub'
    }));
    
    await registry.registerItem(createTestVocabularyItem('badTensor', 'function', {
      tensorMetadata: {
        shape: [0, 8], // Invalid: zero dimension
        dataType: 'f32',
        memoryLayout: 'row-major',
        alignment: 32,
        semantics: {
          dimensionMeanings: ['invalid', 'features'],
          interpretations: {},
          cognitiveRole: 'intermediate',
          abstraction: 'concrete'
        }
      }
    }));
    
    const reports = await registry.detectInconsistencies();
    
    if (reports.length < 2) {
      throw new Error(`Expected at least 2 inconsistency reports, found ${reports.length}`);
    }
    
    const coreStubReport = reports.find(r => r.itemId === 'test:coreStub');
    const badTensorReport = reports.find(r => r.itemId === 'test:badTensor');
    
    if (!coreStubReport) {
      throw new Error('Missing inconsistency report for core stub');
    }
    
    if (!badTensorReport) {
      throw new Error('Missing inconsistency report for bad tensor');
    }
  })();
  
  // Test 7: Export Functionality
  await test('Export Functionality', async () => {
    const registry = createVocabularyRegistry('test-registry-7', 'Test Registry 7');
    
    await registry.registerItem(createTestVocabularyItem('exportTest', 'function'));
    
    // Test JSON export
    const jsonExport = await registry.exportCatalog('json');
    const parsed = JSON.parse(jsonExport);
    
    if (!parsed.items || parsed.items.length !== 1) {
      throw new Error('JSON export does not contain expected items');
    }
    
    // Test TypeScript export
    const tsExport = await registry.exportCatalog('typescript');
    if (!tsExport.includes('export declare function exportTest')) {
      throw new Error('TypeScript export does not contain expected function declaration');
    }
    
    // Test Markdown export
    const mdExport = await registry.exportCatalog('markdown');
    if (!mdExport.includes('# GGML Vocabulary Catalog')) {
      throw new Error('Markdown export does not contain expected header');
    }
  })();
  
  // Test 8: Kernel Hooks
  await test('Kernel Hooks', async () => {
    const registry = createVocabularyRegistry('test-registry-8', 'Test Registry 8');
    
    let hookCalled = false;
    const testHook = async (item: VocabularyItem) => {
      hookCalled = true;
      if (item.name !== 'hookTest') {
        throw new Error('Hook received wrong item');
      }
    };
    
    registry.addKernelHook(testHook);
    
    await registry.registerItem(createTestVocabularyItem('hookTest', 'function'));
    
    if (!hookCalled) {
      throw new Error('Kernel hook was not called');
    }
  })();
  
  // Test 9: Event System
  await test('Event System', async () => {
    const registry = createVocabularyRegistry('test-registry-9', 'Test Registry 9');
    
    let eventReceived = false;
    registry.addEventListener('item_registered', (event) => {
      eventReceived = true;
      if (event.itemId !== 'test:eventTest') {
        throw new Error('Event received wrong item ID');
      }
    });
    
    await registry.registerItem(createTestVocabularyItem('eventTest', 'function'));
    
    if (!eventReceived) {
      throw new Error('Event was not received');
    }
    
    const events = registry.getEvents(1);
    if (events.length !== 1) {
      throw new Error('Event was not stored');
    }
  })();
  
  // Test 10: Default Registry
  await test('Default Registry', async () => {
    const registry1 = getDefaultRegistry();
    const registry2 = getDefaultRegistry();
    
    if (registry1 !== registry2) {
      throw new Error('Default registry should be singleton');
    }
    
    const initialized = await initializeDefaultRegistry();
    if (initialized !== registry1) {
      throw new Error('Initialized registry should be same as default');
    }
  })();
  
  // Test 11: Factory Functions
  await test('Factory Functions', async () => {
    const devRegistry = createDevelopmentRegistry('dev-test', 'Dev Test');
    const devConfig = devRegistry['config']; // Access private property for testing
    
    if (!devConfig) {
      throw new Error('Development registry missing configuration');
    }
    
    // Development registry should have auto-discovery enabled
    if (!devConfig.autoDiscovery) {
      throw new Error('Development registry should have auto-discovery enabled');
    }
  })();
  
  // Test 12: Tensor Validation Hook
  await test('Tensor Validation Hook', async () => {
    const hook = createTensorValidationHook();
    
    // Test with valid tensor
    const validItem = createTestVocabularyItem('validTensor');
    await hook(validItem); // Should not throw
    
    // Test with invalid tensor (this would log warnings but not throw)
    const invalidItem = createTestVocabularyItem('invalidTensor', 'function', {
      tensorMetadata: {
        shape: [-1, 8], // Invalid: negative dimension
        dataType: 'f32',
        memoryLayout: 'row-major',
        alignment: 32,
        semantics: {
          dimensionMeanings: ['invalid', 'features'],
          interpretations: {},
          cognitiveRole: 'intermediate',
          abstraction: 'concrete'
        }
      }
    });
    
    await hook(invalidItem); // Should log error but not throw
  })();
  
  // Summary
  console.log('🏁 Test Results Summary');
  console.log('======================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${passed + failed}`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! GGML Vocabulary Registry is working correctly.');
  } else {
    console.log(`\n💥 ${failed} test(s) failed. Please review the errors above.`);
    process.exit(1);
  }
}

/**
 * Demo function to showcase vocabulary registry capabilities
 */
async function runDemo(): Promise<void> {
  console.log('🎪 GGML Vocabulary Registry Demo\n');
  
  // Create a development registry
  const registry = createDevelopmentRegistry('demo-registry', 'Demo Registry', ['src']);
  
  // Add monitoring hooks
  registry.addKernelHook(createLoggingKernelHook());
  registry.addKernelHook(createTensorValidationHook());
  
  // Register sample vocabulary items
  console.log('📝 Registering sample vocabulary items...');
  
  const tensorOp = createTestVocabularyItem('matmul', 'operator', {
    description: 'Matrix multiplication operator for GGML tensors',
    category: 'tensor-op',
    tags: ['tensor', 'math', 'linear-algebra'],
    tensorMetadata: {
      shape: [1024, 1024],
      dataType: 'f32',
      memoryLayout: 'row-major',
      alignment: 32,
      semantics: {
        dimensionMeanings: ['rows', 'columns'],
        interpretations: { 'rows': 'matrix rows', 'columns': 'matrix columns' },
        cognitiveRole: 'operator',
        abstraction: 'concrete'
      }
    }
  });
  
  const attentionKernel = createTestVocabularyItem('attention_kernel', 'kernel', {
    description: 'Attention mechanism kernel for cognitive processing',
    category: 'attention',
    tags: ['attention', 'cognitive', 'kernel'],
    tensorMetadata: {
      shape: [512, 768, 64],
      dataType: 'f16',
      memoryLayout: 'row-major',
      alignment: 16,
      semantics: {
        dimensionMeanings: ['sequence_length', 'hidden_dim', 'attention_heads'],
        interpretations: {
          'sequence_length': 'input sequence length',
          'hidden_dim': 'hidden layer dimension',
          'attention_heads': 'number of attention heads'
        },
        cognitiveRole: 'state',
        abstraction: 'symbolic'
      }
    }
  });
  
  const memoryDict = createTestVocabularyItem('MemoryState', 'dictionary', {
    description: 'Memory state data structure for cognitive systems',
    category: 'memory',
    tags: ['memory', 'state', 'cognitive']
  });
  
  await registry.registerItem(tensorOp);
  await registry.registerItem(attentionKernel);
  await registry.registerItem(memoryDict);
  
  // Show statistics
  console.log('📊 Registry Statistics:');
  const stats = registry.getStatistics();
  console.log(`   Total Items: ${stats.totalItems}`);
  console.log(`   Health Score: ${(stats.healthScore * 100).toFixed(1)}%`);
  console.log(`   Categories: ${Object.keys(stats.categoryDistribution).join(', ')}`);
  console.log();
  
  // Demonstrate search
  console.log('🔍 Searching vocabulary...');
  const tensorItems = registry.findItems({ category: 'tensor-op' });
  console.log(`   Tensor operators: ${tensorItems.map(i => i.name).join(', ')}`);
  
  const attentionItems = registry.findItems({ tags: ['attention'] });
  console.log(`   Attention items: ${attentionItems.map(i => i.name).join(', ')}`);
  console.log();
  
  // Export catalog
  console.log('📤 Exporting catalog...');
  const jsonCatalog = await registry.exportCatalog('json');
  console.log(`   JSON export size: ${jsonCatalog.length} characters`);
  
  const mdCatalog = await registry.exportCatalog('markdown');
  console.log(`   Markdown export size: ${mdCatalog.length} characters`);
  console.log();
  
  // Validate items
  console.log('✅ Validating vocabulary items...');
  await registry.validateAllItems();
  console.log('   Validation completed');
  console.log();
  
  // Check for inconsistencies
  console.log('🔍 Checking for inconsistencies...');
  const inconsistencies = await registry.detectInconsistencies();
  console.log(`   Found ${inconsistencies.length} inconsistencies`);
  console.log();
  
  console.log('🎉 Demo completed successfully!');
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.includes('--demo')) {
    await runDemo();
  } else {
    await runTests();
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

export { runTests, runDemo };