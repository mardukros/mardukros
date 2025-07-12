/**
 * GGML Vocabulary Module - Comprehensive vocabulary management system
 * 
 * Exports all vocabulary management components including registry,
 * scanner, types, and integration utilities.
 */

// Core types and interfaces
export * from './vocabulary-types.js';

// Main registry implementation
export { 
  GgmlVocabularyRegistry,
  type RegistryEventType,
  type RegistryEvent,
  type KernelHook,
  type InconsistencyReport,
  type Inconsistency,
  type ExportFormat
} from './ggml-vocabulary-registry.js';

// Auto-discovery scanner
export { 
  GgmlVocabularyScanner,
  type ScannerConfig
} from './vocabulary-scanner.js';

/**
 * Factory function to create a basic vocabulary registry
 */
export function createVocabularyRegistry(
  id: string,
  name: string,
  scanPaths: string[] = ['src']
) {
  const config = {
    id,
    name,
    autoDiscovery: true,
    autoValidation: true,
    autoUpdate: true,
    scanPaths,
    excludePatterns: [
      'node_modules',
      '\\.git',
      'dist',
      'build',
      '\\.test\\.',
      '\\.spec\\.',
      '__tests__'
    ],
    validationRules: [
      {
        name: 'require_implementation',
        type: 'semantic' as const,
        severity: 'error' as const,
        condition: 'implementationStatus !== "stub" || category !== "core"',
        message: 'Core vocabulary items must be implemented',
        enabled: true
      },
      {
        name: 'require_tensor_metadata',
        type: 'semantic' as const,
        severity: 'warning' as const,
        condition: 'tensorMetadata && tensorMetadata.shape.length > 0',
        message: 'Vocabulary items should have proper tensor metadata',
        enabled: true
      },
      {
        name: 'require_documentation',
        type: 'semantic' as const,
        severity: 'warning' as const,
        condition: 'description && description.length > 0',
        message: 'Vocabulary items should have documentation',
        enabled: true
      }
    ],
    cachingEnabled: true,
    cacheSize: 10000,
    metadataRetention: 7 * 24 * 60 * 60 * 1000 // 7 days
  };

  return new GgmlVocabularyRegistry(config);
}

/**
 * Factory function to create a high-performance registry for large codebases
 */
export function createHighPerformanceRegistry(
  id: string,
  name: string,
  scanPaths: string[] = ['src']
) {
  const config = {
    id,
    name,
    autoDiscovery: false, // Manual control for performance
    autoValidation: false,
    autoUpdate: false,
    scanPaths,
    excludePatterns: [
      'node_modules',
      '\\.git',
      'dist',
      'build',
      '\\.test\\.',
      '\\.spec\\.',
      '__tests__',
      'examples',
      'docs'
    ],
    validationRules: [],
    cachingEnabled: true,
    cacheSize: 50000,
    metadataRetention: 30 * 24 * 60 * 60 * 1000 // 30 days
  };

  return new GgmlVocabularyRegistry(config);
}

/**
 * Factory function to create a development-focused registry
 */
export function createDevelopmentRegistry(
  id: string,
  name: string,
  scanPaths: string[] = ['src']
) {
  const config = {
    id,
    name,
    autoDiscovery: true,
    autoValidation: true,
    autoUpdate: true,
    scanPaths,
    excludePatterns: [
      'node_modules',
      '\\.git',
      'dist',
      'build'
    ],
    validationRules: [
      {
        name: 'detect_stubs',
        type: 'semantic' as const,
        severity: 'info' as const,
        condition: 'implementationStatus !== "stub"',
        message: 'Implementation needed',
        enabled: true
      },
      {
        name: 'check_tensor_shapes',
        type: 'semantic' as const,
        severity: 'warning' as const,
        condition: 'tensorMetadata.shape.every(dim => dim > 0)',
        message: 'Tensor shapes should have positive dimensions',
        enabled: true
      }
    ],
    cachingEnabled: true,
    cacheSize: 5000,
    metadataRetention: 24 * 60 * 60 * 1000 // 1 day
  };

  return new GgmlVocabularyRegistry(config);
}

/**
 * Utility functions for vocabulary integration
 */

/**
 * Create a kernel integration hook that logs vocabulary usage
 */
export function createLoggingKernelHook(): KernelHook {
  return async (item) => {
    console.log(`🔗 Kernel integration for vocabulary item: ${item.name} (${item.type})`);
    
    // Update usage statistics
    item.usageStatistics.callCount++;
    item.usageStatistics.lastUsed = Date.now();
    
    if (item.usageStatistics.firstUsed === 0) {
      item.usageStatistics.firstUsed = Date.now();
    }
  };
}

/**
 * Create a kernel integration hook that validates tensor compatibility
 */
export function createTensorValidationHook(): KernelHook {
  return async (item) => {
    // Validate tensor metadata
    if (!item.tensorMetadata || !item.tensorMetadata.shape) {
      console.warn(`⚠️ Vocabulary item ${item.name} lacks tensor metadata`);
      return;
    }
    
    // Check for invalid dimensions
    if (item.tensorMetadata.shape.some(dim => dim <= 0)) {
      console.error(`❌ Invalid tensor shape for ${item.name}: ${item.tensorMetadata.shape}`);
      return;
    }
    
    // Calculate memory requirements
    const elements = item.tensorMetadata.shape.reduce((a, b) => a * b, 1);
    const bytesPerElement = item.tensorMetadata.dataType === 'f32' ? 4 : 
                           item.tensorMetadata.dataType === 'f16' ? 2 : 4;
    const memoryMB = (elements * bytesPerElement) / (1024 * 1024);
    
    if (memoryMB > 100) {
      console.warn(`⚠️ Large memory requirement for ${item.name}: ${memoryMB.toFixed(2)}MB`);
    }
  };
}

/**
 * Create a performance monitoring hook
 */
export function createPerformanceMonitoringHook(): KernelHook {
  return async (item) => {
    const startTime = Date.now();
    
    // Simulate performance analysis
    const complexity = item.performanceMetrics.computationalComplexity;
    const tensorSize = item.tensorMetadata.shape.reduce((a, b) => a * b, 1);
    
    // Estimate execution time based on complexity and tensor size
    let estimatedTime = 1; // Base 1ms
    if (complexity.includes('n²')) estimatedTime *= Math.sqrt(tensorSize);
    else if (complexity.includes('n log n')) estimatedTime *= Math.log2(tensorSize);
    else if (complexity.includes('n')) estimatedTime *= tensorSize / 1000;
    
    // Update performance metrics
    item.performanceMetrics.latency = estimatedTime;
    item.performanceMetrics.throughput = 1000 / estimatedTime;
    
    const executionTime = Date.now() - startTime;
    item.usageStatistics.totalExecutionTime += executionTime;
    item.usageStatistics.averageExecutionTime = 
      item.usageStatistics.totalExecutionTime / Math.max(1, item.usageStatistics.callCount);
  };
}

/**
 * Default registry instance for convenience
 */
let defaultRegistry: GgmlVocabularyRegistry | null = null;

/**
 * Get or create the default vocabulary registry
 */
export function getDefaultRegistry(): GgmlVocabularyRegistry {
  if (!defaultRegistry) {
    defaultRegistry = createVocabularyRegistry(
      'default-ggml-vocabulary',
      'Default GGML Vocabulary Registry'
    );
  }
  return defaultRegistry;
}

/**
 * Initialize the default registry with common hooks
 */
export async function initializeDefaultRegistry(): Promise<GgmlVocabularyRegistry> {
  const registry = getDefaultRegistry();
  
  // Add common hooks
  registry.addKernelHook(createLoggingKernelHook());
  registry.addKernelHook(createTensorValidationHook());
  registry.addKernelHook(createPerformanceMonitoringHook());
  
  // Initialize
  await registry.initialize();
  
  return registry;
}