/**
 * Basic Tests for Tensor Shape System
 * 
 * Simple tests to validate the cognitive kernel tensor shape system functionality.
 * These tests ensure the system works correctly without requiring complex test infrastructure.
 */

import TensorShapeManager, { cognitiveKernelRegistry } from './index.js';

/**
 * Run basic validation tests
 */
function runBasicTests(): boolean {
  console.log('🧪 Running Basic Tensor Shape System Tests\n');
  
  let testsPass = 0;
  let totalTests = 0;

  // Test 1: Registry Initialization
  totalTests++;
  console.log('Test 1: Registry Initialization');
  try {
    const kernels = TensorShapeManager.getAllKernels();
    if (kernels.length > 0) {
      console.log(`✅ Registry initialized with ${kernels.length} kernels`);
      testsPass++;
    } else {
      console.log('❌ Registry empty');
    }
  } catch (error) {
    console.log(`❌ Registry initialization failed: ${error}`);
  }
  console.log();

  // Test 2: Kernel Categories
  totalTests++;
  console.log('Test 2: Kernel Categories');
  try {
    const report = TensorShapeManager.getSystemReport();
    const expectedCategories = ['memory', 'task', 'ai', 'autonomy', 'meta-cognitive'];
    const actualCategories = Object.keys(report.categories);
    
    if (expectedCategories.every(cat => actualCategories.includes(cat))) {
      console.log(`✅ All expected categories present: ${actualCategories.join(', ')}`);
      testsPass++;
    } else {
      console.log(`❌ Missing categories. Expected: ${expectedCategories.join(', ')}, Got: ${actualCategories.join(', ')}`);
    }
  } catch (error) {
    console.log(`❌ Category test failed: ${error}`);
  }
  console.log();

  // Test 3: Tensor Shape Validation
  totalTests++;
  console.log('Test 3: Tensor Shape Validation');
  try {
    const kernels = TensorShapeManager.getAllKernels();
    let validShapes = true;
    
    for (const kernel of kernels) {
      // Check if tensor shape has valid dimensions
      if (!kernel.tensorShape || kernel.tensorShape.length === 0) {
        console.log(`❌ ${kernel.name}: Invalid tensor shape`);
        validShapes = false;
        break;
      }
      
      // Check if all dimensions are positive
      if (kernel.tensorShape.some(dim => dim <= 0)) {
        console.log(`❌ ${kernel.name}: Non-positive dimensions in tensor shape`);
        validShapes = false;
        break;
      }
    }
    
    if (validShapes) {
      console.log(`✅ All ${kernels.length} kernels have valid tensor shapes`);
      testsPass++;
    }
  } catch (error) {
    console.log(`❌ Tensor shape validation failed: ${error}`);
  }
  console.log();

  // Test 4: System Metrics
  totalTests++;
  console.log('Test 4: System Metrics');
  try {
    const report = TensorShapeManager.getSystemReport();
    const metrics = report.systemMetrics;
    
    if (metrics.totalTensorElements > 0 && 
        metrics.memoryFootprintMB > 0 && 
        metrics.totalCognitiveDimensions > 0) {
      console.log(`✅ Valid system metrics:`);
      console.log(`   - Total elements: ${metrics.totalTensorElements.toLocaleString()}`);
      console.log(`   - Memory: ${metrics.memoryFootprintMB.toFixed(2)} MB`);
      console.log(`   - Cognitive dimensions: ${metrics.totalCognitiveDimensions}`);
      testsPass++;
    } else {
      console.log('❌ Invalid system metrics');
    }
  } catch (error) {
    console.log(`❌ System metrics test failed: ${error}`);
  }
  console.log();

  // Test 5: Specific Kernel Lookup
  totalTests++;
  console.log('Test 5: Specific Kernel Lookup');
  try {
    const declarativeMemory = TensorShapeManager.getKernel('declarative-memory');
    
    if (declarativeMemory && 
        declarativeMemory.name === 'Declarative Memory Kernel' &&
        declarativeMemory.category === 'memory') {
      console.log(`✅ Successfully retrieved declarative memory kernel`);
      console.log(`   - Shape: [${declarativeMemory.tensorShape.join(', ')}]`);
      testsPass++;
    } else {
      console.log('❌ Failed to retrieve declarative memory kernel');
    }
  } catch (error) {
    console.log(`❌ Kernel lookup test failed: ${error}`);
  }
  console.log();

  // Test 6: Message Tensor Conversion
  totalTests++;
  console.log('Test 6: Message Tensor Conversion');
  try {
    const sampleMessage = {
      task_id: 'test-task',
      query: 'Test query',
      priority: 1,
      type: 'test',
      metadata: { confidence: 0.8 }
    };

    const tensor = TensorShapeManager.messageToTensor('task-manager', 'create', sampleMessage);
    
    if (tensor && tensor.length > 0) {
      console.log(`✅ Message converted to tensor (${tensor.length} elements)`);
      
      // Try to convert back
      const reconstructed = TensorShapeManager.tensorToMessage('task-manager', 'create', tensor);
      if (reconstructed) {
        console.log(`✅ Tensor converted back to message`);
        testsPass++;
      } else {
        console.log('❌ Failed to convert tensor back to message');
      }
    } else {
      console.log('❌ Failed to convert message to tensor');
    }
  } catch (error) {
    console.log(`❌ Message conversion test failed: ${error}`);
  }
  console.log();

  // Test 7: Documentation Generation
  totalTests++;
  console.log('Test 7: Documentation Generation');
  try {
    const documentation = TensorShapeManager.generateDocumentation();
    
    if (documentation && documentation.length > 1000) {
      console.log(`✅ Documentation generated (${documentation.length} characters)`);
      testsPass++;
    } else {
      console.log('❌ Documentation generation failed or too short');
    }
  } catch (error) {
    console.log(`❌ Documentation generation failed: ${error}`);
  }
  console.log();

  // Test 8: Prime Factorization Validation
  totalTests++;
  console.log('Test 8: Prime Factorization Validation');
  try {
    const kernels = TensorShapeManager.getAllKernels();
    let validFactorizations = true;
    
    for (const kernel of kernels) {
      const product = kernel.primeFactorization.reduce((prod, factor) => prod * factor, 1);
      const firstDimension = kernel.tensorShape[0];
      
      if (product !== firstDimension) {
        console.log(`❌ ${kernel.name}: Prime factorization mismatch (${product} ≠ ${firstDimension})`);
        validFactorizations = false;
        break;
      }
    }
    
    if (validFactorizations) {
      console.log(`✅ All prime factorizations are valid`);
      testsPass++;
    }
  } catch (error) {
    console.log(`❌ Prime factorization validation failed: ${error}`);
  }
  console.log();

  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('================');
  console.log(`Tests passed: ${testsPass}/${totalTests}`);
  console.log(`Success rate: ${(testsPass / totalTests * 100).toFixed(1)}%`);
  
  if (testsPass === totalTests) {
    console.log('🎉 All tests passed!');
    return true;
  } else {
    console.log('⚠️ Some tests failed');
    return false;
  }
}

/**
 * Performance test for tensor operations
 */
function runPerformanceTest(): void {
  console.log('\n⚡ PERFORMANCE TEST');
  console.log('===================');

  const iterations = 100;
  const sampleMessage = {
    task_id: 'perf-test',
    query: 'Performance test query with moderate length content',
    priority: 2,
    type: 'performance',
    metadata: { confidence: 0.75, timestamp: Date.now() }
  };

  console.log(`Running ${iterations} message conversions...`);
  
  const startTime = performance.now();
  let successCount = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const tensor = TensorShapeManager.messageToTensor('task-manager', 'create', sampleMessage);
      if (tensor) {
        const reconstructed = TensorShapeManager.tensorToMessage('task-manager', 'create', tensor);
        if (reconstructed) {
          successCount++;
        }
      }
    } catch (error) {
      // Ignore individual failures for performance test
    }
  }

  const endTime = performance.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / iterations;
  const throughput = 1000 / avgTime;

  console.log(`Total time: ${totalTime.toFixed(2)}ms`);
  console.log(`Average time: ${avgTime.toFixed(3)}ms per conversion`);
  console.log(`Throughput: ${throughput.toFixed(0)} conversions/second`);
  console.log(`Success rate: ${(successCount / iterations * 100).toFixed(1)}%`);
}

/**
 * Memory usage analysis
 */
function analyzeMemoryUsage(): void {
  console.log('\n💾 MEMORY USAGE ANALYSIS');
  console.log('=========================');

  const kernels = TensorShapeManager.getAllKernels();
  const memoryAnalysis = kernels.map(kernel => {
    const elements = kernel.tensorShape.reduce((prod, dim) => prod * dim, 1);
    const memoryMB = (elements * 4) / (1024 * 1024); // f32 = 4 bytes
    return { name: kernel.name, category: kernel.category, elements, memoryMB };
  }).sort((a, b) => b.memoryMB - a.memoryMB);

  console.log('Top 5 memory consumers:');
  memoryAnalysis.slice(0, 5).forEach((item, index) => {
    console.log(`${index + 1}. ${item.name}: ${item.memoryMB.toFixed(2)} MB (${item.elements.toLocaleString()} elements)`);
  });

  const totalMemory = memoryAnalysis.reduce((sum, item) => sum + item.memoryMB, 0);
  console.log(`\nTotal system memory: ${totalMemory.toFixed(2)} MB`);

  // Memory by category
  const categoryMemory = memoryAnalysis.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.memoryMB;
    return acc;
  }, {} as Record<string, number>);

  console.log('\nMemory by category:');
  Object.entries(categoryMemory)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, memory]) => {
      const percentage = (memory / totalMemory * 100).toFixed(1);
      console.log(`- ${category}: ${memory.toFixed(2)} MB (${percentage}%)`);
    });
}

/**
 * Main test runner
 */
export function runTests(): boolean {
  console.log('🚀 Cognitive Kernel Tensor Shape System Tests\n');
  
  const basicTestsPass = runBasicTests();
  runPerformanceTest();
  analyzeMemoryUsage();
  
  console.log('\n🏁 Test execution complete');
  return basicTestsPass;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export default { runTests, runBasicTests, runPerformanceTest, analyzeMemoryUsage };