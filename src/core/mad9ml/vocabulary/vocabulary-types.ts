/**
 * GGML Vocabulary Types - Type definitions for adaptive vocabulary catalog
 * 
 * Defines types for cataloging functions, libraries, and dictionaries
 * with tensor metadata and adaptation parameters.
 */

import { TensorShape, Tensor } from '../types.js';

/**
 * Base vocabulary item type
 */
export type VocabularyType = 'function' | 'library' | 'dictionary' | 'kernel' | 'operator' | 'primitive';

/**
 * Data types supported in GGML operations
 */
export type GgmlDataType = 'f32' | 'f16' | 'i32' | 'i16' | 'i8' | 'q8_0' | 'q8_1' | 'q4_0' | 'q4_1';

/**
 * Vocabulary implementation status
 */
export type ImplementationStatus = 'implemented' | 'stub' | 'missing' | 'deprecated' | 'experimental';

/**
 * Function signature metadata
 */
export interface FunctionSignature {
  name: string;
  parameters: FunctionParameter[];
  returnType: FunctionReturnType;
  isAsync: boolean;
  isVarArgs: boolean;
  contextRequirements: string[];
}

/**
 * Function parameter definition
 */
export interface FunctionParameter {
  name: string;
  type: string;
  tensorShape?: TensorShape;
  optional: boolean;
  defaultValue?: any;
  constraints?: ParameterConstraints;
  description: string;
}

/**
 * Function return type definition
 */
export interface FunctionReturnType {
  type: string;
  tensorShape?: TensorShape;
  dataType?: GgmlDataType;
  description: string;
}

/**
 * Parameter constraints for validation
 */
export interface ParameterConstraints {
  minValue?: number;
  maxValue?: number;
  allowedValues?: any[];
  shapeConstraints?: TensorShapeConstraints;
  typeConstraints?: string[];
}

/**
 * Tensor shape constraints
 */
export interface TensorShapeConstraints {
  minDimensions: number;
  maxDimensions: number;
  fixedDimensions?: number[];
  compatibleShapes?: TensorShape[];
  broadcastable: boolean;
}

/**
 * Tensor metadata with GGML-specific information
 */
export interface TensorMetadata {
  shape: TensorShape;
  dataType: GgmlDataType;
  memoryLayout: 'row-major' | 'column-major' | 'custom';
  alignment: number;
  quantization?: QuantizationInfo;
  sparsity?: SparsityInfo;
  distribution?: TensorDistribution;
  semantics: TensorSemantics;
}

/**
 * Quantization information for compressed tensors
 */
export interface QuantizationInfo {
  method: 'q8_0' | 'q8_1' | 'q4_0' | 'q4_1' | 'custom';
  bitsPerWeight: number;
  compressionRatio: number;
  accuracy: number;
}

/**
 * Sparsity information for sparse tensors
 */
export interface SparsityInfo {
  sparsityRatio: number;
  pattern: 'random' | 'structured' | 'block' | 'custom';
  compressionFormat: 'csr' | 'csc' | 'coo' | 'custom';
}

/**
 * Tensor value distribution characteristics
 */
export interface TensorDistribution {
  mean: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  entropy: number;
  distributionType: 'normal' | 'uniform' | 'exponential' | 'custom';
}

/**
 * Semantic meaning of tensor dimensions
 */
export interface TensorSemantics {
  dimensionMeanings: string[];
  interpretations: Record<string, string>;
  cognitiveRole: 'input' | 'output' | 'state' | 'parameter' | 'intermediate';
  abstraction: 'concrete' | 'symbolic' | 'meta' | 'emergent';
}

/**
 * Adaptation metadata for evolutionary learning
 */
export interface AdaptationMetadata {
  mutability: 'immutable' | 'slow' | 'moderate' | 'fast' | 'dynamic';
  adaptationRate: number;
  learningConstraints: LearningConstraints;
  evolutionParameters: EvolutionParameters;
  stabilityMetrics: StabilityMetrics;
  feedbackMechanisms: FeedbackMechanism[];
}

/**
 * Learning constraints for adaptation
 */
export interface LearningConstraints {
  maxMutationRate: number;
  preserveStructure: boolean;
  constrainedDimensions: number[];
  invariantProperties: string[];
  adaptationBounds: {
    min: number;
    max: number;
  };
}

/**
 * Evolution parameters for vocabulary adaptation
 */
export interface EvolutionParameters {
  selectionPressure: number;
  crossoverRate: number;
  mutationProbability: number;
  elitismRatio: number;
  diversityPreservation: number;
  fitnessFunction: string;
}

/**
 * Stability metrics for tracking adaptation health
 */
export interface StabilityMetrics {
  convergenceRate: number;
  oscillationAmplitude: number;
  driftMagnitude: number;
  robustness: number;
  resilience: number;
  adaptability: number;
}

/**
 * Feedback mechanism for adaptation control
 */
export interface FeedbackMechanism {
  type: 'performance' | 'error' | 'gradient' | 'attention' | 'reward';
  weight: number;
  delay: number;
  threshold: number;
  enabled: boolean;
}

/**
 * Usage statistics for vocabulary items
 */
export interface UsageStatistics {
  callCount: number;
  totalExecutionTime: number;
  averageExecutionTime: number;
  errorRate: number;
  lastUsed: number;
  firstUsed: number;
  hotSpots: string[];
  dependencies: string[];
  dependents: string[];
}

/**
 * Performance metrics for vocabulary items
 */
export interface PerformanceMetrics {
  computationalComplexity: string;
  memoryComplexity: string;
  parallelizability: number;
  cacheEfficiency: number;
  throughput: number;
  latency: number;
  resourceUtilization: ResourceUtilization;
}

/**
 * Resource utilization breakdown
 */
export interface ResourceUtilization {
  cpu: number;
  memory: number;
  bandwidth: number;
  storage: number;
  gpu?: number;
  customResources?: Record<string, number>;
}

/**
 * Validation result for vocabulary items
 */
export interface ValidationResult {
  isValid: boolean;
  isImplemented: boolean;
  isStub: boolean;
  hasTests: boolean;
  hasDocumentation: boolean;
  codeQuality: number;
  issues: ValidationIssue[];
  suggestions: string[];
  lastValidated: number;
}

/**
 * Validation issue details
 */
export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  location: SourceLocation;
  suggestedFix?: string;
}

/**
 * Source code location information
 */
export interface SourceLocation {
  filePath: string;
  lineNumber: number;
  columnNumber: number;
  functionName: string;
  module: string;
}

/**
 * Complete vocabulary item definition
 */
export interface VocabularyItem {
  id: string;
  name: string;
  type: VocabularyType;
  description: string;
  category: string;
  tags: string[];
  version: string;
  
  // Core metadata
  signature: FunctionSignature;
  tensorMetadata: TensorMetadata;
  adaptationMetadata: AdaptationMetadata;
  
  // Implementation details
  sourceLocation: SourceLocation;
  implementationStatus: ImplementationStatus;
  dependencies: string[];
  
  // Runtime information
  usageStatistics: UsageStatistics;
  performanceMetrics: PerformanceMetrics;
  validationResult: ValidationResult;
  
  // Registry metadata
  registrationTime: number;
  lastModified: number;
  hash: string;
  
  // Integration hooks
  kernelIntegration?: KernelIntegration;
  membraneIntegration?: MembraneIntegration;
}

/**
 * Kernel integration configuration
 */
export interface KernelIntegration {
  kernelId: string;
  inputMappings: PortMapping[];
  outputMappings: PortMapping[];
  executionMode: 'sync' | 'async' | 'stream';
  resourceRequirements: ResourceRequirements;
}

/**
 * Port mapping for kernel integration
 */
export interface PortMapping {
  vocabularyPort: string;
  kernelPort: string;
  transformation?: string;
  validation?: string;
}

/**
 * Resource requirements for execution
 */
export interface ResourceRequirements {
  minMemory: number;
  preferredMemory: number;
  cpuCores: number;
  gpuMemory?: number;
  specialHardware?: string[];
}

/**
 * Membrane integration configuration
 */
export interface MembraneIntegration {
  membraneId: string;
  channelMappings: ChannelMapping[];
  messageTypes: string[];
  routingRules: RoutingRule[];
}

/**
 * Channel mapping for membrane integration
 */
export interface ChannelMapping {
  vocabularyChannel: string;
  membraneChannel: string;
  messageFormat: string;
  serialization: string;
}

/**
 * Routing rule for message handling
 */
export interface RoutingRule {
  condition: string;
  action: 'route' | 'filter' | 'transform' | 'duplicate';
  target: string;
  priority: number;
}

/**
 * Vocabulary registry configuration
 */
export interface VocabularyRegistryConfig {
  id: string;
  name: string;
  autoDiscovery: boolean;
  autoValidation: boolean;
  autoUpdate: boolean;
  scanPaths: string[];
  excludePatterns: string[];
  validationRules: ValidationRule[];
  cachingEnabled: boolean;
  cacheSize: number;
  metadataRetention: number;
}

/**
 * Validation rule for vocabulary items
 */
export interface ValidationRule {
  name: string;
  type: 'syntax' | 'semantic' | 'performance' | 'compatibility';
  severity: 'error' | 'warning' | 'info';
  condition: string;
  message: string;
  enabled: boolean;
}

/**
 * Registry statistics and health information
 */
export interface RegistryStatistics {
  totalItems: number;
  implementedItems: number;
  stubItems: number;
  deprecatedItems: number;
  validItems: number;
  invalidItems: number;
  averageQuality: number;
  totalMemoryUsage: number;
  cacheHitRate: number;
  lastUpdate: number;
  categoryDistribution: Record<string, number>;
  typeDistribution: Record<VocabularyType, number>;
  healthScore: number;
}

/**
 * Auto-discovery result
 */
export interface DiscoveryResult {
  discovered: VocabularyItem[];
  updated: VocabularyItem[];
  removed: string[];
  errors: DiscoveryError[];
  statistics: DiscoveryStatistics;
  executionTime: number;
}

/**
 * Discovery error information
 */
export interface DiscoveryError {
  type: 'parse' | 'validation' | 'access' | 'dependency';
  message: string;
  location: SourceLocation;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Discovery execution statistics
 */
export interface DiscoveryStatistics {
  filesScanned: number;
  functionsFound: number;
  librariesFound: number;
  dictionariesFound: number;
  errorsEncountered: number;
  processingTime: number;
}