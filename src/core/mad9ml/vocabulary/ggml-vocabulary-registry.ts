/**
 * GGML Vocabulary Registry - Dynamic registry for adaptive vocabulary catalog
 * 
 * Provides centralized management of GGML-adaptive vocabularies with
 * tensor metadata, auto-discovery, validation, and kernel integration.
 */

import {
  VocabularyItem,
  VocabularyType,
  VocabularyRegistryConfig,
  RegistryStatistics,
  DiscoveryResult,
  ValidationResult,
  ValidationRule,
  ImplementationStatus
} from './vocabulary-types.js';
import { GgmlVocabularyScanner, ScannerConfig } from './vocabulary-scanner.js';
import { TensorShape } from '../types.js';

/**
 * Registry event types for monitoring
 */
export type RegistryEventType = 
  | 'item_registered' 
  | 'item_updated' 
  | 'item_removed' 
  | 'validation_completed' 
  | 'inconsistency_detected'
  | 'auto_update_completed';

/**
 * Registry event data
 */
export interface RegistryEvent {
  type: RegistryEventType;
  timestamp: number;
  itemId?: string;
  data: any;
  severity: 'info' | 'warning' | 'error';
}

/**
 * Hook function for kernel integration
 */
export type KernelHook = (item: VocabularyItem) => Promise<void>;

/**
 * Inconsistency detection result
 */
export interface InconsistencyReport {
  itemId: string;
  inconsistencies: Inconsistency[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedActions: string[];
  autoFixable: boolean;
}

/**
 * Individual inconsistency
 */
export interface Inconsistency {
  type: 'signature_mismatch' | 'tensor_shape_conflict' | 'missing_implementation' | 'deprecated_usage' | 'performance_regression';
  description: string;
  expected: any;
  actual: any;
  impact: 'low' | 'medium' | 'high';
}

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'typescript' | 'markdown' | 'yaml';

/**
 * GGML Vocabulary Registry implementation
 */
export class GgmlVocabularyRegistry {
  private config: VocabularyRegistryConfig;
  private items: Map<string, VocabularyItem> = new Map();
  private scanner: GgmlVocabularyScanner;
  private eventListeners: Map<RegistryEventType, ((event: RegistryEvent) => void)[]> = new Map();
  private kernelHooks: KernelHook[] = [];
  private updateInterval?: NodeJS.Timeout;
  private validationInterval?: NodeJS.Timeout;
  private statistics: RegistryStatistics;
  private events: RegistryEvent[] = [];

  constructor(config: VocabularyRegistryConfig) {
    this.config = config;
    this.statistics = this.initializeStatistics();
    
    // Initialize scanner
    const scannerConfig: ScannerConfig = {
      rootPath: process.cwd(),
      scanPaths: config.scanPaths,
      excludePatterns: config.excludePatterns,
      fileExtensions: ['.ts', '.js', '.tsx', '.jsx'],
      maxFileSize: 1024 * 1024, // 1MB
      maxDepth: 10,
      followSymlinks: false,
      cacheResults: config.cachingEnabled,
      verbose: false
    };
    
    this.scanner = new GgmlVocabularyScanner(scannerConfig);
    
    // Start auto-update if configured
    if (config.autoUpdate) {
      this.startAutoUpdate();
    }
  }

  /**
   * Initialize the registry with auto-discovery
   */
  async initialize(): Promise<void> {
    console.log(`🚀 Initializing GGML Vocabulary Registry: ${this.config.name}`);
    
    if (this.config.autoDiscovery) {
      await this.performAutoDiscovery();
    }
    
    if (this.config.autoValidation) {
      await this.validateAllItems();
    }
    
    this.emitEvent({
      type: 'auto_update_completed',
      timestamp: Date.now(),
      data: { initialized: true },
      severity: 'info'
    });
    
    console.log(`✅ Registry initialized with ${this.items.size} vocabulary items`);
  }

  /**
   * Register a vocabulary item manually
   */
  async registerItem(item: VocabularyItem): Promise<boolean> {
    try {
      // Validate item before registration
      const validation = await this.validateItem(item);
      if (!validation.isValid) {
        console.warn(`⚠️ Cannot register invalid item: ${item.id}`);
        return false;
      }

      // Check for conflicts
      const existing = this.items.get(item.id);
      if (existing && existing.hash === item.hash) {
        return true; // No changes
      }

      // Update item metadata
      item.registrationTime = existing?.registrationTime || Date.now();
      item.lastModified = Date.now();

      // Store item
      this.items.set(item.id, item);
      
      // Update statistics
      this.updateStatistics();
      
      // Execute kernel hooks
      await this.executeKernelHooks(item);
      
      // Emit event
      this.emitEvent({
        type: existing ? 'item_updated' : 'item_registered',
        timestamp: Date.now(),
        itemId: item.id,
        data: { item },
        severity: 'info'
      });
      
      console.log(`📝 ${existing ? 'Updated' : 'Registered'} vocabulary item: ${item.name}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Failed to register item ${item.id}:`, error);
      return false;
    }
  }

  /**
   * Unregister a vocabulary item
   */
  unregisterItem(itemId: string): boolean {
    const item = this.items.get(itemId);
    if (!item) {
      return false;
    }

    this.items.delete(itemId);
    this.updateStatistics();
    
    this.emitEvent({
      type: 'item_removed',
      timestamp: Date.now(),
      itemId,
      data: { item },
      severity: 'info'
    });
    
    console.log(`🗑️ Unregistered vocabulary item: ${item.name}`);
    return true;
  }

  /**
   * Get vocabulary item by ID
   */
  getItem(itemId: string): VocabularyItem | undefined {
    return this.items.get(itemId);
  }

  /**
   * Find vocabulary items by criteria
   */
  findItems(criteria: {
    type?: VocabularyType;
    category?: string;
    tags?: string[];
    implementationStatus?: ImplementationStatus;
    name?: string;
  }): VocabularyItem[] {
    const items = Array.from(this.items.values());
    
    return items.filter(item => {
      if (criteria.type && item.type !== criteria.type) return false;
      if (criteria.category && item.category !== criteria.category) return false;
      if (criteria.implementationStatus && item.implementationStatus !== criteria.implementationStatus) return false;
      if (criteria.name && !item.name.toLowerCase().includes(criteria.name.toLowerCase())) return false;
      if (criteria.tags && !criteria.tags.some(tag => item.tags.includes(tag))) return false;
      return true;
    });
  }

  /**
   * Get all vocabulary items
   */
  getAllItems(): VocabularyItem[] {
    return Array.from(this.items.values());
  }

  /**
   * Perform auto-discovery scan
   */
  async performAutoDiscovery(): Promise<DiscoveryResult> {
    console.log(`🔍 Performing auto-discovery scan...`);
    
    const result = await this.scanner.scan();
    
    // Process discovered items
    for (const item of result.discovered) {
      await this.registerItem(item);
    }
    
    // Process updated items
    for (const item of result.updated) {
      await this.registerItem(item);
    }
    
    // Remove items that no longer exist
    for (const itemId of result.removed) {
      this.unregisterItem(itemId);
    }
    
    console.log(`✅ Auto-discovery completed: ${result.discovered.length} new, ${result.updated.length} updated`);
    
    return result;
  }

  /**
   * Validate all vocabulary items
   */
  async validateAllItems(): Promise<Map<string, ValidationResult>> {
    console.log(`🔍 Validating all vocabulary items...`);
    
    const results = new Map<string, ValidationResult>();
    
    for (const [itemId, item] of this.items) {
      const validation = await this.validateItem(item);
      results.set(itemId, validation);
      
      // Update item validation result
      item.validationResult = validation;
      item.lastModified = Date.now();
    }
    
    this.updateStatistics();
    
    this.emitEvent({
      type: 'validation_completed',
      timestamp: Date.now(),
      data: { validatedCount: results.size },
      severity: 'info'
    });
    
    console.log(`✅ Validation completed for ${results.size} items`);
    
    return results;
  }

  /**
   * Validate a single vocabulary item
   */
  async validateItem(item: VocabularyItem): Promise<ValidationResult> {
    const issues = [];
    
    // Check implementation status
    const isImplemented = item.implementationStatus === 'implemented';
    const isStub = item.implementationStatus === 'stub';
    
    // Check for required fields
    if (!item.name) {
      issues.push({
        type: 'error' as const,
        severity: 'high' as const,
        message: 'Item name is required',
        location: item.sourceLocation,
        suggestedFix: 'Provide a valid name for the vocabulary item'
      });
    }
    
    // Check tensor metadata
    if (!item.tensorMetadata || !item.tensorMetadata.shape || item.tensorMetadata.shape.length === 0) {
      issues.push({
        type: 'warning' as const,
        severity: 'medium' as const,
        message: 'Tensor metadata is incomplete',
        location: item.sourceLocation,
        suggestedFix: 'Define proper tensor shape and metadata'
      });
    }
    
    // Check function signature
    if (item.type === 'function' && (!item.signature || !item.signature.parameters)) {
      issues.push({
        type: 'warning' as const,
        severity: 'medium' as const,
        message: 'Function signature is incomplete',
        location: item.sourceLocation,
        suggestedFix: 'Define function parameters and return type'
      });
    }
    
    return {
      isValid: issues.filter(i => i.type === 'error').length === 0,
      isImplemented,
      isStub,
      hasTests: false, // Would need to check for test files
      hasDocumentation: !!item.description,
      codeQuality: this.calculateCodeQuality(item),
      issues,
      suggestions: [],
      lastValidated: Date.now()
    };
  }

  /**
   * Detect inconsistencies in the vocabulary
   */
  async detectInconsistencies(): Promise<InconsistencyReport[]> {
    console.log(`🔍 Detecting inconsistencies...`);
    
    const reports: InconsistencyReport[] = [];
    
    for (const [itemId, item] of this.items) {
      const inconsistencies: Inconsistency[] = [];
      
      // Check for stub implementations in critical paths
      if (item.implementationStatus === 'stub' && item.category === 'core') {
        inconsistencies.push({
          type: 'missing_implementation',
          description: 'Core vocabulary item is not implemented',
          expected: 'implemented',
          actual: 'stub',
          impact: 'high'
        });
      }
      
      // Check for deprecated items still in use
      if (item.implementationStatus === 'deprecated' && item.usageStatistics.callCount > 0) {
        inconsistencies.push({
          type: 'deprecated_usage',
          description: 'Deprecated item is still being used',
          expected: 'no usage',
          actual: `${item.usageStatistics.callCount} calls`,
          impact: 'medium'
        });
      }
      
      // Check tensor shape consistency
      if (item.tensorMetadata.shape.includes(0)) {
        inconsistencies.push({
          type: 'tensor_shape_conflict',
          description: 'Tensor shape contains zero dimensions',
          expected: 'positive dimensions',
          actual: item.tensorMetadata.shape,
          impact: 'high'
        });
      }
      
      if (inconsistencies.length > 0) {
        const maxImpact = Math.max(...inconsistencies.map(i => 
          i.impact === 'high' ? 3 : i.impact === 'medium' ? 2 : 1
        ));
        
        const severity = maxImpact >= 3 ? 'critical' : 
                        maxImpact >= 2 ? 'high' : 'medium';
        
        reports.push({
          itemId,
          inconsistencies,
          severity,
          suggestedActions: this.generateSuggestedActions(inconsistencies),
          autoFixable: inconsistencies.every(i => 
            i.type === 'tensor_shape_conflict' || i.type === 'signature_mismatch'
          )
        });
      }
    }
    
    if (reports.length > 0) {
      this.emitEvent({
        type: 'inconsistency_detected',
        timestamp: Date.now(),
        data: { reports },
        severity: 'warning'
      });
    }
    
    console.log(`🔍 Found ${reports.length} inconsistencies`);
    
    return reports;
  }

  /**
   * Export vocabulary catalog in specified format
   */
  async exportCatalog(format: ExportFormat): Promise<string> {
    const items = this.getAllItems();
    const stats = this.getStatistics();
    
    switch (format) {
      case 'json':
        return JSON.stringify({
          registry: this.config,
          statistics: stats,
          items: items
        }, null, 2);
        
      case 'typescript':
        return this.generateTypeScriptDefinitions(items);
        
      case 'markdown':
        return this.generateMarkdownDocumentation(items, stats);
        
      case 'yaml':
        // Would need yaml library
        return JSON.stringify({
          registry: this.config,
          statistics: stats,
          items: items
        }, null, 2);
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Add kernel integration hook
   */
  addKernelHook(hook: KernelHook): void {
    this.kernelHooks.push(hook);
  }

  /**
   * Remove kernel integration hook
   */
  removeKernelHook(hook: KernelHook): void {
    const index = this.kernelHooks.indexOf(hook);
    if (index >= 0) {
      this.kernelHooks.splice(index, 1);
    }
  }

  /**
   * Add event listener
   */
  addEventListener(eventType: RegistryEventType, listener: (event: RegistryEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: RegistryEventType, listener: (event: RegistryEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index >= 0) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Get registry statistics
   */
  getStatistics(): RegistryStatistics {
    this.updateStatistics();
    return { ...this.statistics };
  }

  /**
   * Get recent events
   */
  getEvents(limit: number = 100): RegistryEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Start auto-update process
   */
  private startAutoUpdate(): void {
    // Auto-discovery every 5 minutes
    this.updateInterval = setInterval(async () => {
      await this.performAutoDiscovery();
    }, 5 * 60 * 1000);
    
    // Validation every 10 minutes  
    this.validationInterval = setInterval(async () => {
      await this.validateAllItems();
      await this.detectInconsistencies();
    }, 10 * 60 * 1000);
  }

  /**
   * Stop auto-update process
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
    
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
      this.validationInterval = undefined;
    }
    
    console.log(`🛑 GGML Vocabulary Registry stopped`);
  }

  /**
   * Private utility methods
   */
  
  private initializeStatistics(): RegistryStatistics {
    return {
      totalItems: 0,
      implementedItems: 0,
      stubItems: 0,
      deprecatedItems: 0,
      validItems: 0,
      invalidItems: 0,
      averageQuality: 0,
      totalMemoryUsage: 0,
      cacheHitRate: 0,
      lastUpdate: Date.now(),
      categoryDistribution: {},
      typeDistribution: {} as Record<VocabularyType, number>,
      healthScore: 1.0
    };
  }

  private updateStatistics(): void {
    const items = Array.from(this.items.values());
    
    this.statistics.totalItems = items.length;
    this.statistics.implementedItems = items.filter(i => i.implementationStatus === 'implemented').length;
    this.statistics.stubItems = items.filter(i => i.implementationStatus === 'stub').length;
    this.statistics.deprecatedItems = items.filter(i => i.implementationStatus === 'deprecated').length;
    this.statistics.validItems = items.filter(i => i.validationResult.isValid).length;
    this.statistics.invalidItems = items.length - this.statistics.validItems;
    
    // Calculate average quality
    if (items.length > 0) {
      this.statistics.averageQuality = items.reduce((sum, item) => 
        sum + item.validationResult.codeQuality, 0) / items.length;
    }
    
    // Update distributions
    this.statistics.categoryDistribution = {};
    this.statistics.typeDistribution = {} as Record<VocabularyType, number>;
    
    for (const item of items) {
      this.statistics.categoryDistribution[item.category] = 
        (this.statistics.categoryDistribution[item.category] || 0) + 1;
      this.statistics.typeDistribution[item.type] = 
        (this.statistics.typeDistribution[item.type] || 0) + 1;
    }
    
    // Calculate health score
    this.statistics.healthScore = this.calculateHealthScore();
    this.statistics.lastUpdate = Date.now();
  }

  private calculateHealthScore(): number {
    if (this.statistics.totalItems === 0) return 1.0;
    
    const implementedRatio = this.statistics.implementedItems / this.statistics.totalItems;
    const validRatio = this.statistics.validItems / this.statistics.totalItems;
    const qualityScore = this.statistics.averageQuality;
    
    return (implementedRatio * 0.4 + validRatio * 0.4 + qualityScore * 0.2);
  }

  private calculateCodeQuality(item: VocabularyItem): number {
    let quality = 0.5; // Base score
    
    // Documentation
    if (item.description) quality += 0.2;
    
    // Implementation status
    if (item.implementationStatus === 'implemented') quality += 0.2;
    else if (item.implementationStatus === 'stub') quality -= 0.3;
    
    // Tensor metadata completeness
    if (item.tensorMetadata && item.tensorMetadata.shape.length > 0) quality += 0.1;
    
    return Math.max(0, Math.min(1, quality));
  }

  private async executeKernelHooks(item: VocabularyItem): Promise<void> {
    for (const hook of this.kernelHooks) {
      try {
        await hook(item);
      } catch (error) {
        console.error(`❌ Kernel hook failed for item ${item.id}:`, error);
      }
    }
  }

  private emitEvent(event: RegistryEvent): void {
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > 1000) {
      this.events.splice(0, this.events.length - 1000);
    }
    
    // Notify listeners
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(event);
        } catch (error) {
          console.error(`❌ Event listener failed:`, error);
        }
      }
    }
  }

  private generateSuggestedActions(inconsistencies: Inconsistency[]): string[] {
    const actions = [];
    
    for (const inconsistency of inconsistencies) {
      switch (inconsistency.type) {
        case 'missing_implementation':
          actions.push('Implement the vocabulary item or mark as deprecated');
          break;
        case 'deprecated_usage':
          actions.push('Update code to use non-deprecated alternatives');
          break;
        case 'tensor_shape_conflict':
          actions.push('Fix tensor shape definition to use positive dimensions');
          break;
        case 'signature_mismatch':
          actions.push('Update function signature to match usage patterns');
          break;
        case 'performance_regression':
          actions.push('Optimize implementation or adjust performance expectations');
          break;
      }
    }
    
    return [...new Set(actions)]; // Remove duplicates
  }

  private generateTypeScriptDefinitions(items: VocabularyItem[]): string {
    let output = '// Auto-generated TypeScript definitions for GGML Vocabulary\n\n';
    
    // Group by type
    const byType = new Map<VocabularyType, VocabularyItem[]>();
    for (const item of items) {
      if (!byType.has(item.type)) {
        byType.set(item.type, []);
      }
      byType.get(item.type)!.push(item);
    }
    
    for (const [type, typeItems] of byType) {
      output += `// ${type.toUpperCase()} VOCABULARY\n\n`;
      
      for (const item of typeItems) {
        if (item.type === 'function') {
          output += this.generateFunctionDefinition(item);
        } else if (item.type === 'dictionary') {
          output += this.generateInterfaceDefinition(item);
        }
        output += '\n';
      }
    }
    
    return output;
  }

  private generateFunctionDefinition(item: VocabularyItem): string {
    const params = item.signature.parameters.map(p => 
      `${p.name}${p.optional ? '?' : ''}: ${p.type}`
    ).join(', ');
    
    return `/**\n * ${item.description}\n */\n` +
           `export declare function ${item.name}(${params}): ${item.signature.returnType.type};\n`;
  }

  private generateInterfaceDefinition(item: VocabularyItem): string {
    return `/**\n * ${item.description}\n */\n` +
           `export interface ${item.name} {\n  // TODO: Extract interface members\n}\n`;
  }

  private generateMarkdownDocumentation(items: VocabularyItem[], stats: RegistryStatistics): string {
    let output = `# GGML Vocabulary Catalog\n\n`;
    output += `Generated on: ${new Date().toISOString()}\n\n`;
    
    // Statistics
    output += `## Statistics\n\n`;
    output += `- Total Items: ${stats.totalItems}\n`;
    output += `- Implemented: ${stats.implementedItems}\n`;
    output += `- Stubs: ${stats.stubItems}\n`;
    output += `- Deprecated: ${stats.deprecatedItems}\n`;
    output += `- Health Score: ${(stats.healthScore * 100).toFixed(1)}%\n\n`;
    
    // Items by category
    const byCategory = new Map<string, VocabularyItem[]>();
    for (const item of items) {
      if (!byCategory.has(item.category)) {
        byCategory.set(item.category, []);
      }
      byCategory.get(item.category)!.push(item);
    }
    
    for (const [category, categoryItems] of byCategory) {
      output += `## ${category.toUpperCase()}\n\n`;
      
      for (const item of categoryItems) {
        output += `### ${item.name}\n\n`;
        output += `- **Type**: ${item.type}\n`;
        output += `- **Status**: ${item.implementationStatus}\n`;
        output += `- **Description**: ${item.description}\n`;
        output += `- **Tensor Shape**: [${item.tensorMetadata.shape.join(', ')}]\n`;
        output += `- **Source**: ${item.sourceLocation.filePath}:${item.sourceLocation.lineNumber}\n\n`;
      }
    }
    
    return output;
  }
}