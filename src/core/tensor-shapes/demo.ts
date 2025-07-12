/**
 * Tensor Shape System Demo
 * 
 * Demonstrates the cognitive kernel tensor shape definition and documentation system.
 * This file shows how to use the tensor shape registry, auto-discovery, and schema mapping.
 */

import TensorShapeManager, { 
  cognitiveKernelRegistry,
  tensorShapeAutoDiscovery,
  messageTensorConverter
} from './index.js';

/**
 * Demo the tensor shape system
 */
export async function runTensorShapeDemo(): Promise<void> {
  console.log('🧠 Cognitive Kernel Tensor Shape System Demo\n');

  // 1. System Overview
  console.log('📊 SYSTEM OVERVIEW');
  console.log('==================');
  const report = TensorShapeManager.getSystemReport();
  console.log(`Total Kernels: ${report.totalKernels}`);
  console.log(`Total Cognitive Dimensions: ${report.systemMetrics.totalCognitiveDimensions}`);
  console.log(`Total Tensor Elements: ${report.systemMetrics.totalTensorElements.toLocaleString()}`);
  console.log(`Memory Footprint: ${report.systemMetrics.memoryFootprintMB.toFixed(2)} MB`);
  console.log(`Distribution Efficiency: ${(report.systemMetrics.distributionEfficiency * 100).toFixed(1)}%\n`);

  // 2. Kernel Categories
  console.log('🏗️ KERNEL CATEGORIES');
  console.log('====================');
  Object.entries(report.categories).forEach(([category, kernels]) => {
    console.log(`${category}: ${kernels.length} kernels`);
    kernels.forEach(kernelId => {
      const kernel = TensorShapeManager.getKernel(kernelId);
      if (kernel) {
        const elements = kernel.tensorShape.reduce((prod, dim) => prod * dim, 1);
        const memoryMB = (elements * 4) / (1024 * 1024);
        console.log(`  - ${kernel.name}: [${kernel.tensorShape.join(', ')}] (${memoryMB.toFixed(3)} MB)`);
      }
    });
    console.log();
  });

  // 3. Detailed Kernel Analysis
  console.log('🔍 DETAILED KERNEL ANALYSIS');
  console.log('============================');
  
  // Analyze declarative memory kernel
  const declarativeMemory = TensorShapeManager.getKernel('declarative-memory');
  if (declarativeMemory) {
    console.log(`Kernel: ${declarativeMemory.name}`);
    console.log(`Description: ${declarativeMemory.description}`);
    console.log(`Tensor Shape: [${declarativeMemory.tensorShape.join(', ')}]`);
    console.log(`Reasoning: ${declarativeMemory.reasoning}`);
    console.log(`Degrees of Freedom:`);
    Object.entries(declarativeMemory.degreesOfFreedom).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });
    console.log(`Functional Complexity:`);
    Object.entries(declarativeMemory.functionalComplexity).forEach(([key, value]) => {
      console.log(`  - ${key}: ${value}`);
    });
    console.log(`Prime Factorization: [${declarativeMemory.primeFactorization.join(' × ')}]`);
    console.log(`Dependencies: ${declarativeMemory.dependencies.length > 0 ? declarativeMemory.dependencies.join(', ') : 'None'}`);
    console.log();
  }

  // 4. Interface Schema Demo
  console.log('📋 INTERFACE SCHEMA DEMO');
  console.log('=========================');
  
  // Create a sample task message
  const sampleTaskMessage = {
    task_id: 'task-123',
    query: 'Analyze system performance patterns',
    priority: 2,
    type: 'analysis',
    status: 'pending',
    target: 'performance-analyzer',
    data: {
      context: 'System optimization',
      requirements: ['cpu_metrics', 'memory_usage']
    },
    metadata: {
      confidence: 0.85,
      timestamp: Date.now(),
      source: 'autonomy-monitor'
    }
  };

  console.log('Sample Task Message:');
  console.log(JSON.stringify(sampleTaskMessage, null, 2));
  console.log();

  // Convert message to tensor
  const taskTensor = TensorShapeManager.messageToTensor('task-manager', 'create', sampleTaskMessage);
  if (taskTensor) {
    console.log(`Converted to tensor: [${taskTensor.length} elements]`);
    console.log(`First 10 values: [${Array.from(taskTensor.slice(0, 10)).map(v => v.toFixed(3)).join(', ')}]`);
    console.log();

    // Convert back to message
    const reconstructedMessage = TensorShapeManager.tensorToMessage('task-manager', 'create', taskTensor);
    console.log('Reconstructed Message:');
    console.log(JSON.stringify(reconstructedMessage, null, 2));
    console.log();
  }

  // 5. Memory Analysis
  console.log('💾 MEMORY ANALYSIS');
  console.log('==================');
  
  const kernels = TensorShapeManager.getAllKernels();
  const memoryAnalysis = kernels.map(kernel => {
    const elements = kernel.tensorShape.reduce((prod, dim) => prod * dim, 1);
    const memoryMB = (elements * 4) / (1024 * 1024);
    return { kernel: kernel.name, category: kernel.category, memoryMB, elements };
  }).sort((a, b) => b.memoryMB - a.memoryMB);

  console.log('Top 5 Memory Consumers:');
  memoryAnalysis.slice(0, 5).forEach((item, index) => {
    console.log(`${index + 1}. ${item.kernel} (${item.category}): ${item.memoryMB.toFixed(2)} MB`);
  });
  console.log();

  const memoryByCategory = kernels.reduce((acc, kernel) => {
    const elements = kernel.tensorShape.reduce((prod, dim) => prod * dim, 1);
    const memoryMB = (elements * 4) / (1024 * 1024);
    acc[kernel.category] = (acc[kernel.category] || 0) + memoryMB;
    return acc;
  }, {} as Record<string, number>);

  console.log('Memory by Category:');
  Object.entries(memoryByCategory)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, memory]) => {
      console.log(`- ${category}: ${memory.toFixed(2)} MB`);
    });
  console.log();

  // 6. Complexity Analysis
  console.log('⚡ COMPLEXITY ANALYSIS');
  console.log('======================');
  
  const complexityDistribution = kernels.reduce((acc, kernel) => {
    const complexity = kernel.functionalComplexity.computational;
    acc[complexity] = (acc[complexity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('Computational Complexity Distribution:');
  Object.entries(complexityDistribution).forEach(([complexity, count]) => {
    console.log(`- ${complexity}: ${count} kernels`);
  });
  console.log();

  // 7. Distribution Analysis
  console.log('🌐 DISTRIBUTION ANALYSIS');
  console.log('=========================');
  
  // Analyze prime factorizations
  const primeUsage = new Map<number, number>();
  kernels.forEach(kernel => {
    kernel.primeFactorization.forEach(prime => {
      primeUsage.set(prime, (primeUsage.get(prime) || 0) + 1);
    });
  });

  console.log('Prime Factor Usage (for distribution optimization):');
  Array.from(primeUsage.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([prime, usage]) => {
      console.log(`- Prime ${prime}: ${usage} kernels (${(usage / kernels.length * 100).toFixed(1)}%)`);
    });
  console.log();

  // 8. Auto-Discovery Demo
  console.log('🔄 AUTO-DISCOVERY DEMO');
  console.log('=======================');
  
  console.log('Starting auto-discovery system...');
  TensorShapeManager.startAutoDiscovery();
  
  // Simulate some time passing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('Stopping auto-discovery system...');
  TensorShapeManager.stopAutoDiscovery();
  
  const evolutionHistory = TensorShapeManager.getEvolutionHistory();
  console.log(`Evolution events recorded: ${evolutionHistory.length}`);
  console.log();

  // 9. Documentation Generation
  console.log('📚 DOCUMENTATION GENERATION');
  console.log('============================');
  
  console.log('Generating tensor shape documentation...');
  const documentation = TensorShapeManager.generateDocumentation();
  console.log(`Generated documentation: ${documentation.length} characters`);
  
  console.log('Generating schema documentation...');
  const schemaDoc = TensorShapeManager.generateSchemaDocumentation();
  console.log(`Generated schema documentation: ${schemaDoc.length} characters`);
  console.log();

  // 10. Performance Recommendations
  console.log('🚀 PERFORMANCE RECOMMENDATIONS');
  console.log('===============================');
  
  const largeTensors = kernels.filter(k => {
    const elements = k.tensorShape.reduce((prod, dim) => prod * dim, 1);
    return elements > 1000000; // > 1M elements
  });

  if (largeTensors.length > 0) {
    console.log('Large tensors detected (consider optimization):');
    largeTensors.forEach(kernel => {
      const elements = kernel.tensorShape.reduce((prod, dim) => prod * dim, 1);
      console.log(`- ${kernel.name}: ${elements.toLocaleString()} elements`);
    });
  } else {
    console.log('✅ All tensor sizes are within optimal range');
  }
  console.log();

  const randomAccessKernels = kernels.filter(k => k.functionalComplexity.memoryAccess === 'random');
  if (randomAccessKernels.length > 0) {
    console.log('Random access patterns detected (consider cache optimization):');
    randomAccessKernels.forEach(kernel => {
      console.log(`- ${kernel.name}: ${kernel.functionalComplexity.computational} complexity`);
    });
  } else {
    console.log('✅ All kernels use cache-friendly access patterns');
  }
  console.log();

  console.log('🎉 Tensor Shape System Demo Complete!\n');
}

/**
 * Benchmark tensor operations
 */
export function benchmarkTensorOperations(): void {
  console.log('⏱️ TENSOR OPERATIONS BENCHMARK');
  console.log('===============================');

  const iterations = 1000;
  const sampleMessage = {
    task_id: 'benchmark-task',
    query: 'Performance test query with some content',
    priority: 1,
    type: 'benchmark',
    metadata: { confidence: 0.75, timestamp: Date.now() }
  };

  // Benchmark message to tensor conversion
  console.log(`Benchmarking message to tensor conversion (${iterations} iterations)...`);
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    const tensor = messageTensorConverter.messageToTensor('task-manager', 'create', sampleMessage);
    // Prevent optimization
    if (tensor && tensor.length === 0) console.log('Unexpected');
  }
  
  const endTime = performance.now();
  const avgTime = (endTime - startTime) / iterations;
  
  console.log(`Average conversion time: ${avgTime.toFixed(3)}ms`);
  console.log(`Throughput: ${(1000 / avgTime).toFixed(0)} conversions/second`);
  console.log();
}

/**
 * Validate tensor shape consistency
 */
export function validateTensorShapeConsistency(): boolean {
  console.log('✅ TENSOR SHAPE CONSISTENCY VALIDATION');
  console.log('======================================');

  const kernels = TensorShapeManager.getAllKernels();
  let valid = true;
  const issues: string[] = [];

  // Check for shape consistency
  kernels.forEach(kernel => {
    // Validate shape dimensions are positive
    if (kernel.tensorShape.some(dim => dim <= 0)) {
      issues.push(`${kernel.name}: Invalid tensor shape dimensions`);
      valid = false;
    }

    // Validate interface tensor components match kernel tensor shape
    kernel.interfaces.forEach(iface => {
      const ifaceDims = iface.tensorComponent.dimensions;
      if (ifaceDims.length !== kernel.tensorShape.length) {
        issues.push(`${kernel.name}.${iface.name}: Interface dimensions don't match kernel shape length`);
        valid = false;
      }
    });

    // Validate degrees of freedom are reasonable
    const dof = kernel.degreesOfFreedom;
    if (Object.values(dof).some(value => value < 0 || value > 20)) {
      issues.push(`${kernel.name}: Unreasonable degrees of freedom values`);
      valid = false;
    }

    // Validate prime factorization
    const product = kernel.primeFactorization.reduce((prod, factor) => prod * factor, 1);
    const expectedProduct = kernel.tensorShape[0]; // First dimension should match factorization
    if (product !== expectedProduct) {
      issues.push(`${kernel.name}: Prime factorization doesn't match first tensor dimension`);
      valid = false;
    }
  });

  if (valid) {
    console.log('✅ All tensor shapes are consistent');
  } else {
    console.log('❌ Tensor shape inconsistencies found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }

  console.log(`Validated ${kernels.length} kernels`);
  console.log();

  return valid;
}

// Export the demo functions
export default {
  runTensorShapeDemo,
  benchmarkTensorOperations,
  validateTensorShapeConsistency
};