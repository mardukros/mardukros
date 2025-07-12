/**
 * Kernel Interface Schema Mapping System
 * 
 * Maps kernel interfaces (like TaskMessage fields) to explicit tensor components,
 * providing a schema for tensor shape configuration and message field mapping.
 */

import { cognitiveKernelRegistry, KernelInterface } from './cognitive-kernel-registry.js';
import { TensorShape } from '../mad9ml/types.js';

/**
 * Message field to tensor component mapping
 */
export interface FieldTensorMapping {
  fieldPath: string; // e.g., 'metadata.confidence' or 'content.description'
  tensorLocation: {
    dimensionIndex: number;
    sliceStart?: number;
    sliceEnd?: number;
    channel?: number;
  };
  dataType: 'f32' | 'f16' | 'i32' | 'string' | 'boolean';
  encoding: 'direct' | 'embedding' | 'categorical' | 'normalized' | 'boolean_flag';
  validation?: {
    required: boolean;
    minValue?: number;
    maxValue?: number;
    allowedValues?: any[];
    pattern?: string;
  };
}

/**
 * Complete message schema with tensor mappings
 */
export interface MessageTensorSchema {
  messageType: string;
  kernelId: string;
  interfaceName: string;
  version: string;
  tensorShape: TensorShape;
  fieldMappings: FieldTensorMapping[];
  encodingRules: {
    embeddingDimension: number;
    categoricalEncoding: Record<string, number>;
    normalizationRanges: Record<string, { min: number; max: number }>;
    stringEmbeddings: Record<string, number[]>;
  };
  validationRules: {
    requiredFields: string[];
    conditionalFields: Record<string, string[]>;
    mutualExclusions: string[][];
  };
}

/**
 * Tensor encoding utilities
 */
export class TensorEncodingUtils {
  
  /**
   * Encode a message field value into tensor representation
   */
  static encodeField(value: any, mapping: FieldTensorMapping): number[] {
    switch (mapping.encoding) {
      case 'direct':
        return [typeof value === 'number' ? value : 0];
      
      case 'normalized':
        const range = mapping.validation;
        if (range?.minValue !== undefined && range?.maxValue !== undefined) {
          const normalized = (value - range.minValue) / (range.maxValue - range.minValue);
          return [Math.max(0, Math.min(1, normalized))];
        }
        return [value];
      
      case 'categorical':
        if (mapping.validation?.allowedValues) {
          const index = mapping.validation.allowedValues.indexOf(value);
          return [index >= 0 ? index : 0];
        }
        return [0];
      
      case 'boolean_flag':
        return [value ? 1.0 : 0.0];
      
      case 'embedding':
        // This would typically use a pre-trained embedding model
        // For now, return a placeholder embedding
        return this.generatePlaceholderEmbedding(String(value), 256);
      
      default:
        return [0];
    }
  }

  /**
   * Generate placeholder embedding for text (would be replaced with real embedding model)
   */
  private static generatePlaceholderEmbedding(text: string, dimension: number): number[] {
    const embedding = new Array(dimension);
    let hash = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Generate deterministic pseudo-random embedding
    for (let i = 0; i < dimension; i++) {
      hash = ((hash * 1103515245) + 12345) & 0x7fffffff;
      embedding[i] = (hash / 0x7fffffff) * 2 - 1; // Range [-1, 1]
    }
    
    return embedding;
  }

  /**
   * Decode tensor values back to message field value
   */
  static decodeField(tensorValues: number[], mapping: FieldTensorMapping): any {
    switch (mapping.encoding) {
      case 'direct':
        return tensorValues[0];
      
      case 'normalized':
        const range = mapping.validation;
        if (range?.minValue !== undefined && range?.maxValue !== undefined) {
          return tensorValues[0] * (range.maxValue - range.minValue) + range.minValue;
        }
        return tensorValues[0];
      
      case 'categorical':
        if (mapping.validation?.allowedValues) {
          const index = Math.round(tensorValues[0]);
          return mapping.validation.allowedValues[index] || mapping.validation.allowedValues[0];
        }
        return null;
      
      case 'boolean_flag':
        return tensorValues[0] > 0.5;
      
      case 'embedding':
        // This would typically use embedding similarity search
        return '<embedded_content>';
      
      default:
        return null;
    }
  }
}

/**
 * Schema generator for kernel interfaces
 */
export class KernelInterfaceSchemaGenerator {
  
  /**
   * Generate complete schema for all kernel interfaces
   */
  public generateAllSchemas(): Map<string, MessageTensorSchema[]> {
    const kernels = cognitiveKernelRegistry.getAllKernels();
    const schemas = new Map<string, MessageTensorSchema[]>();
    
    kernels.forEach(kernel => {
      const kernelSchemas = kernel.interfaces.map(iface => 
        this.generateInterfaceSchema(kernel.id, iface)
      );
      schemas.set(kernel.id, kernelSchemas);
    });
    
    return schemas;
  }

  /**
   * Generate schema for a specific kernel interface
   */
  public generateInterfaceSchema(kernelId: string, kernelInterface: KernelInterface): MessageTensorSchema {
    return {
      messageType: `${kernelId}_${kernelInterface.name}`,
      kernelId,
      interfaceName: kernelInterface.name,
      version: '1.0.0',
      tensorShape: kernelInterface.tensorComponent.dimensions,
      fieldMappings: this.generateFieldMappings(kernelInterface),
      encodingRules: this.generateEncodingRules(kernelInterface),
      validationRules: this.generateValidationRules(kernelInterface)
    };
  }

  /**
   * Generate field mappings for an interface
   */
  private generateFieldMappings(kernelInterface: KernelInterface): FieldTensorMapping[] {
    const mappings: FieldTensorMapping[] = [];
    const dimensions = kernelInterface.tensorComponent.dimensions;
    
    // Map each message field to tensor locations
    kernelInterface.messageFields.forEach((field, index) => {
      const mapping = this.createFieldMapping(field, index, dimensions);
      if (mapping) {
        mappings.push(mapping);
      }
    });
    
    return mappings;
  }

  /**
   * Create field mapping for a specific message field
   */
  private createFieldMapping(field: string, index: number, dimensions: number[]): FieldTensorMapping | null {
    // Determine encoding based on field name and type
    let encoding: FieldTensorMapping['encoding'] = 'direct';
    let dataType: FieldTensorMapping['dataType'] = 'f32';
    
    if (field.includes('id') || field.includes('name') || field.includes('query') || field.includes('description')) {
      encoding = 'embedding';
      dataType = 'string';
    } else if (field.includes('priority') || field.includes('confidence') || field.includes('relevance')) {
      encoding = 'normalized';
      dataType = 'f32';
    } else if (field.includes('type') || field.includes('status') || field.includes('category')) {
      encoding = 'categorical';
      dataType = 'string';
    } else if (field.includes('timestamp') || field.includes('time')) {
      encoding = 'normalized';
      dataType = 'f32';
    }

    // Determine tensor location based on field index and dimensions
    const tensorLocation = this.calculateTensorLocation(index, dimensions, encoding);
    
    return {
      fieldPath: field,
      tensorLocation,
      dataType,
      encoding,
      validation: this.generateFieldValidation(field, encoding)
    };
  }

  /**
   * Calculate tensor location for a field
   */
  private calculateTensorLocation(index: number, dimensions: number[], encoding: string): any {
    if (encoding === 'embedding') {
      // Embeddings typically go in the main feature dimension
      return {
        dimensionIndex: 1, // Usually the second dimension
        sliceStart: 0,
        sliceEnd: dimensions[1] || 256
      };
    } else {
      // Metadata fields go in the metadata dimension
      const metadataDimIndex = dimensions.length - 1;
      return {
        dimensionIndex: metadataDimIndex,
        channel: index % (dimensions[metadataDimIndex] || 8)
      };
    }
  }

  /**
   * Generate field validation rules
   */
  private generateFieldValidation(field: string, encoding: string): FieldTensorMapping['validation'] {
    const validation: FieldTensorMapping['validation'] = {
      required: field.includes('id') || field.includes('query') || field.includes('type')
    };

    if (encoding === 'normalized') {
      if (field.includes('confidence') || field.includes('relevance') || field.includes('priority')) {
        validation.minValue = 0;
        validation.maxValue = 1;
      } else if (field.includes('timestamp')) {
        validation.minValue = 0;
        validation.maxValue = Date.now() * 2; // Allow future timestamps
      }
    } else if (encoding === 'categorical') {
      validation.allowedValues = this.getPredefinedValues(field);
    }

    return validation;
  }

  /**
   * Get predefined values for categorical fields
   */
  private getPredefinedValues(field: string): any[] {
    if (field.includes('type')) {
      return ['fact', 'concept', 'event', 'procedure', 'relationship', 'query_interaction'];
    } else if (field.includes('status')) {
      return ['pending', 'active', 'completed', 'failed', 'deferred'];
    } else if (field.includes('priority')) {
      return ['low', 'medium', 'high', 'critical'];
    } else if (field.includes('category')) {
      return ['memory', 'task', 'ai', 'autonomy', 'meta-cognitive'];
    }
    return [];
  }

  /**
   * Generate encoding rules for an interface
   */
  private generateEncodingRules(kernelInterface: KernelInterface): any {
    const embeddingDim = kernelInterface.tensorComponent.dimensions[1] || 256;
    
    return {
      embeddingDimension: embeddingDim,
      categoricalEncoding: this.generateCategoricalEncodings(),
      normalizationRanges: this.generateNormalizationRanges(),
      stringEmbeddings: {}
    };
  }

  /**
   * Generate categorical encoding mappings
   */
  private generateCategoricalEncodings(): Record<string, number> {
    return {
      // Task types
      'fact': 0, 'concept': 1, 'event': 2, 'procedure': 3, 'relationship': 4, 'query_interaction': 5,
      // Task statuses
      'pending': 0, 'active': 1, 'completed': 2, 'failed': 3, 'deferred': 4,
      // Priorities
      'low': 0, 'medium': 1, 'high': 2, 'critical': 3,
      // Categories
      'memory': 0, 'task': 1, 'ai': 2, 'autonomy': 3, 'meta-cognitive': 4
    };
  }

  /**
   * Generate normalization ranges
   */
  private generateNormalizationRanges(): Record<string, { min: number; max: number }> {
    return {
      'confidence': { min: 0, max: 1 },
      'relevance': { min: 0, max: 1 },
      'priority': { min: 0, max: 1 },
      'timestamp': { min: 0, max: Date.now() * 2 },
      'duration': { min: 0, max: 86400000 }, // 24 hours in ms
      'importance': { min: 0, max: 1 },
      'strength': { min: 0, max: 1 },
      'quality': { min: 0, max: 1 }
    };
  }

  /**
   * Generate validation rules for an interface
   */
  private generateValidationRules(kernelInterface: KernelInterface): any {
    const requiredFields = kernelInterface.messageFields.filter(field => 
      field.includes('id') || field.includes('query') || field.includes('type')
    );

    return {
      requiredFields,
      conditionalFields: {
        'query': ['context', 'options'],
        'store': ['content', 'metadata'],
        'analyze': ['criteria', 'scope']
      },
      mutualExclusions: [
        ['create', 'update', 'delete'],
        ['sync', 'async']
      ]
    };
  }
}

/**
 * Message validation and conversion system
 */
export class MessageTensorConverter {
  private schemas: Map<string, MessageTensorSchema[]>;

  constructor() {
    this.schemas = new KernelInterfaceSchemaGenerator().generateAllSchemas();
  }

  /**
   * Convert message to tensor representation
   */
  public messageToTensor(kernelId: string, interfaceName: string, message: any): Float32Array | null {
    const schema = this.getSchema(kernelId, interfaceName);
    if (!schema) {
      console.error(`Schema not found for ${kernelId}.${interfaceName}`);
      return null;
    }

    // Validate message against schema
    const validationResult = this.validateMessage(message, schema);
    if (!validationResult.valid) {
      console.error('Message validation failed:', validationResult.errors);
      return null;
    }

    // Create tensor with correct shape
    const tensorSize = schema.tensorShape.reduce((prod, dim) => prod * dim, 1);
    const tensor = new Float32Array(tensorSize);

    // Encode each field into tensor
    schema.fieldMappings.forEach(mapping => {
      const value = this.getFieldValue(message, mapping.fieldPath);
      if (value !== undefined) {
        const encodedValues = TensorEncodingUtils.encodeField(value, mapping);
        this.writeTensorValues(tensor, encodedValues, mapping.tensorLocation, schema.tensorShape);
      }
    });

    return tensor;
  }

  /**
   * Convert tensor back to message representation
   */
  public tensorToMessage(kernelId: string, interfaceName: string, tensor: Float32Array): any | null {
    const schema = this.getSchema(kernelId, interfaceName);
    if (!schema) {
      console.error(`Schema not found for ${kernelId}.${interfaceName}`);
      return null;
    }

    const message: any = {};

    // Decode each field from tensor
    schema.fieldMappings.forEach(mapping => {
      const tensorValues = this.readTensorValues(tensor, mapping.tensorLocation, schema.tensorShape);
      const decodedValue = TensorEncodingUtils.decodeField(tensorValues, mapping);
      this.setFieldValue(message, mapping.fieldPath, decodedValue);
    });

    return message;
  }

  /**
   * Get schema for kernel interface
   */
  private getSchema(kernelId: string, interfaceName: string): MessageTensorSchema | null {
    const kernelSchemas = this.schemas.get(kernelId);
    if (!kernelSchemas) return null;
    
    return kernelSchemas.find(schema => schema.interfaceName === interfaceName) || null;
  }

  /**
   * Validate message against schema
   */
  private validateMessage(message: any, schema: MessageTensorSchema): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    schema.validationRules.requiredFields.forEach(field => {
      if (this.getFieldValue(message, field) === undefined) {
        errors.push(`Required field missing: ${field}`);
      }
    });

    // Check conditional fields
    Object.entries(schema.validationRules.conditionalFields).forEach(([trigger, dependents]) => {
      if (this.getFieldValue(message, trigger) !== undefined) {
        dependents.forEach(dependent => {
          if (this.getFieldValue(message, dependent) === undefined) {
            errors.push(`Conditional field missing: ${dependent} (required when ${trigger} is present)`);
          }
        });
      }
    });

    // Check mutual exclusions
    schema.validationRules.mutualExclusions.forEach(exclusions => {
      const presentFields = exclusions.filter(field => this.getFieldValue(message, field) !== undefined);
      if (presentFields.length > 1) {
        errors.push(`Mutually exclusive fields present: ${presentFields.join(', ')}`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get field value from message using dot notation path
   */
  private getFieldValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set field value in message using dot notation path
   */
  private setFieldValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Write values to tensor at specified location
   */
  private writeTensorValues(tensor: Float32Array, values: number[], location: any, shape: number[]): void {
    // Calculate flat index from tensor location
    const index = this.calculateFlatIndex(location, shape);
    values.forEach((value, offset) => {
      if (index + offset < tensor.length) {
        tensor[index + offset] = value;
      }
    });
  }

  /**
   * Read values from tensor at specified location
   */
  private readTensorValues(tensor: Float32Array, location: any, shape: number[]): number[] {
    const index = this.calculateFlatIndex(location, shape);
    const length = location.sliceEnd ? location.sliceEnd - (location.sliceStart || 0) : 1;
    
    const values: number[] = [];
    for (let i = 0; i < length && index + i < tensor.length; i++) {
      values.push(tensor[index + i]);
    }
    
    return values;
  }

  /**
   * Calculate flat array index from tensor location
   */
  private calculateFlatIndex(location: any, shape: number[]): number {
    let index = 0;
    let stride = 1;
    
    // Calculate stride for each dimension
    for (let i = shape.length - 1; i >= 0; i--) {
      if (i === location.dimensionIndex) {
        index += (location.sliceStart || location.channel || 0) * stride;
      }
      stride *= shape[i];
    }
    
    return index;
  }

  /**
   * Get all available schemas
   */
  public getAllSchemas(): Map<string, MessageTensorSchema[]> {
    return new Map(this.schemas);
  }

  /**
   * Generate schema documentation
   */
  public generateSchemaDocumentation(): string {
    let doc = '# Kernel Interface Tensor Schema Documentation\n\n';
    
    this.schemas.forEach((schemas, kernelId) => {
      doc += `## ${kernelId}\n\n`;
      
      schemas.forEach(schema => {
        doc += `### ${schema.interfaceName}\n\n`;
        doc += `**Tensor Shape**: [${schema.tensorShape.join(', ')}]\n`;
        doc += `**Message Type**: ${schema.messageType}\n`;
        doc += `**Version**: ${schema.version}\n\n`;
        
        doc += '**Field Mappings**:\n';
        schema.fieldMappings.forEach(mapping => {
          doc += `- \`${mapping.fieldPath}\` → Dimension ${mapping.tensorLocation.dimensionIndex}`;
          if (mapping.tensorLocation.channel !== undefined) {
            doc += `, Channel ${mapping.tensorLocation.channel}`;
          }
          doc += ` (${mapping.encoding})\n`;
        });
        
        doc += '\n**Required Fields**: ' + schema.validationRules.requiredFields.join(', ') + '\n\n';
      });
    });
    
    return doc;
  }
}

// Export singleton instances
export const kernelInterfaceSchemaGenerator = new KernelInterfaceSchemaGenerator();
export const messageTensorConverter = new MessageTensorConverter();