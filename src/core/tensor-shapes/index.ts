/**
 * Tensor Shapes Module - Complete tensor shape definition and documentation system
 * 
 * This module provides comprehensive tensor shape definitions for all cognitive kernels,
 * auto-discovery capabilities, and schema mapping for kernel interfaces.
 */

// Core registry and definitions
export {
  CognitiveKernelRegistry,
  CognitiveKernelDefinition,
  CognitiveDegreesOfFreedom,
  FunctionalComplexity,
  KernelInterface,
  TensorShapeReport,
  SystemMetrics,
  cognitiveKernelRegistry
} from './cognitive-kernel-registry.js';

// Extended kernel definitions
export { CognitiveKernelDefinitions } from './kernel-definitions.js';
export { AutonomyMetaCognitiveKernels } from './autonomy-metacognitive-kernels.js';

// Auto-discovery system
export {
  TensorShapeDocumentationGenerator,
  TensorShapeAutoDiscovery,
  AutoDiscoveryConfig,
  TensorShapeEvolution,
  defaultAutoDiscoveryConfig,
  tensorShapeAutoDiscovery
} from './auto-discovery.js';

// Schema mapping system
export {
  KernelInterfaceSchemaGenerator,
  MessageTensorConverter,
  MessageTensorSchema,
  FieldTensorMapping,
  TensorEncodingUtils,
  kernelInterfaceSchemaGenerator,
  messageTensorConverter
} from './schema-mapping.js';

/**
 * Unified tensor shape management interface
 */
export class TensorShapeManager {
  
  /**
   * Get comprehensive system report
   */
  static getSystemReport(): TensorShapeReport {
    return cognitiveKernelRegistry.generateTensorShapeReport();
  }

  /**
   * Get documentation for all tensor shapes
   */
  static generateDocumentation(): string {
    return tensorShapeAutoDiscovery.getCurrentDocumentation();
  }

  /**
   * Get schema documentation for all kernel interfaces
   */
  static generateSchemaDocumentation(): string {
    return messageTensorConverter.generateSchemaDocumentation();
  }

  /**
   * Start auto-discovery monitoring
   */
  static startAutoDiscovery(): void {
    tensorShapeAutoDiscovery.start();
  }

  /**
   * Stop auto-discovery monitoring
   */
  static stopAutoDiscovery(): void {
    tensorShapeAutoDiscovery.stop();
  }

  /**
   * Convert message to tensor for specific kernel interface
   */
  static messageToTensor(kernelId: string, interfaceName: string, message: any): Float32Array | null {
    return messageTensorConverter.messageToTensor(kernelId, interfaceName, message);
  }

  /**
   * Convert tensor back to message for specific kernel interface
   */
  static tensorToMessage(kernelId: string, interfaceName: string, tensor: Float32Array): any | null {
    return messageTensorConverter.tensorToMessage(kernelId, interfaceName, tensor);
  }

  /**
   * Get all cognitive kernels
   */
  static getAllKernels(): CognitiveKernelDefinition[] {
    return cognitiveKernelRegistry.getAllKernels();
  }

  /**
   * Get kernels by category
   */
  static getKernelsByCategory(category: string): CognitiveKernelDefinition[] {
    return cognitiveKernelRegistry.getKernelsByCategory(category);
  }

  /**
   * Get specific kernel definition
   */
  static getKernel(id: string): CognitiveKernelDefinition | undefined {
    return cognitiveKernelRegistry.getKernel(id);
  }

  /**
   * Get evolution history
   */
  static getEvolutionHistory(): TensorShapeEvolution[] {
    return tensorShapeAutoDiscovery.getEvolutionHistory();
  }

  /**
   * Get all interface schemas
   */
  static getAllSchemas(): Map<string, MessageTensorSchema[]> {
    return messageTensorConverter.getAllSchemas();
  }
}

// Export the unified manager as default
export default TensorShapeManager;