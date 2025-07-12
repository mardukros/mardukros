/**
 * GGML Vocabulary Scanner - Auto-discovery and analysis of vocabulary items
 * 
 * Scans codebase to find functions, libraries, and dictionaries,
 * analyzes their tensor metadata and implementation status.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import {
  VocabularyItem,
  VocabularyType,
  ImplementationStatus,
  FunctionSignature,
  TensorMetadata,
  AdaptationMetadata,
  SourceLocation,
  DiscoveryResult,
  DiscoveryError,
  DiscoveryStatistics,
  ValidationResult,
  UsageStatistics,
  PerformanceMetrics,
  TensorShape,
  GgmlDataType
} from './vocabulary-types.js';

/**
 * Scanner configuration
 */
export interface ScannerConfig {
  rootPath: string;
  scanPaths: string[];
  excludePatterns: string[];
  fileExtensions: string[];
  maxFileSize: number;
  maxDepth: number;
  followSymlinks: boolean;
  cacheResults: boolean;
  verbose: boolean;
}

/**
 * Pattern matching for vocabulary identification
 */
interface VocabularyPattern {
  type: VocabularyType;
  pattern: RegExp;
  category: string;
  extractor: (match: RegExpMatchArray, content: string, filePath: string) => Partial<VocabularyItem>;
}

/**
 * GGML Vocabulary Scanner implementation
 */
export class GgmlVocabularyScanner {
  private config: ScannerConfig;
  private patterns: VocabularyPattern[];
  private cache: Map<string, VocabularyItem> = new Map();
  private fileHashes: Map<string, string> = new Map();

  constructor(config: ScannerConfig) {
    this.config = config;
    this.patterns = this.initializePatterns();
  }

  /**
   * Scan for vocabulary items in the configured paths
   */
  async scan(): Promise<DiscoveryResult> {
    const startTime = Date.now();
    const result: DiscoveryResult = {
      discovered: [],
      updated: [],
      removed: [],
      errors: [],
      statistics: {
        filesScanned: 0,
        functionsFound: 0,
        librariesFound: 0,
        dictionariesFound: 0,
        errorsEncountered: 0,
        processingTime: 0
      },
      executionTime: 0
    };

    console.log(`🔍 Starting vocabulary scan from ${this.config.rootPath}`);

    try {
      // Scan each configured path
      for (const scanPath of this.config.scanPaths) {
        const fullPath = join(this.config.rootPath, scanPath);
        await this.scanDirectory(fullPath, result);
      }

      // Clean up removed files
      this.cleanupRemovedFiles(result);

      result.statistics.processingTime = Date.now() - startTime;
      result.executionTime = result.statistics.processingTime;

      console.log(`✅ Vocabulary scan completed in ${result.executionTime}ms`);
      console.log(`📊 Found ${result.discovered.length} items, updated ${result.updated.length}`);

    } catch (error) {
      const discoveryError: DiscoveryError = {
        type: 'access',
        message: `Scan failed: ${error.message}`,
        location: {
          filePath: this.config.rootPath,
          lineNumber: 0,
          columnNumber: 0,
          functionName: 'scan',
          module: 'GgmlVocabularyScanner'
        },
        severity: 'critical'
      };
      result.errors.push(discoveryError);
      result.statistics.errorsEncountered++;
    }

    return result;
  }

  /**
   * Scan a directory recursively
   */
  private async scanDirectory(
    dirPath: string,
    result: DiscoveryResult,
    depth: number = 0
  ): Promise<void> {
    if (depth > this.config.maxDepth) return;

    try {
      const entries = readdirSync(dirPath);

      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        const stat = statSync(fullPath);

        // Skip excluded patterns
        if (this.isExcluded(fullPath)) continue;

        if (stat.isDirectory()) {
          await this.scanDirectory(fullPath, result, depth + 1);
        } else if (stat.isFile()) {
          await this.scanFile(fullPath, result);
        }
      }
    } catch (error) {
      const discoveryError: DiscoveryError = {
        type: 'access',
        message: `Directory scan failed: ${error.message}`,
        location: {
          filePath: dirPath,
          lineNumber: 0,
          columnNumber: 0,
          functionName: 'scanDirectory',
          module: 'GgmlVocabularyScanner'
        },
        severity: 'medium'
      };
      result.errors.push(discoveryError);
      result.statistics.errorsEncountered++;
    }
  }

  /**
   * Scan a single file for vocabulary items
   */
  private async scanFile(filePath: string, result: DiscoveryResult): Promise<void> {
    // Check file extension
    const ext = extname(filePath);
    if (!this.config.fileExtensions.includes(ext)) return;

    // Check file size
    const stat = statSync(filePath);
    if (stat.size > this.config.maxFileSize) return;

    try {
      const content = readFileSync(filePath, 'utf-8');
      const fileHash = this.calculateHash(content);
      
      result.statistics.filesScanned++;

      // Skip if file hasn't changed
      if (this.config.cacheResults && this.fileHashes.get(filePath) === fileHash) {
        return;
      }

      this.fileHashes.set(filePath, fileHash);

      // Extract vocabulary items from file
      const items = await this.extractVocabularyItems(content, filePath);
      
      for (const item of items) {
        // Check if item exists in cache
        const existingItem = this.cache.get(item.id);
        
        if (existingItem) {
          // Update existing item
          const updatedItem = this.mergeVocabularyItems(existingItem, item);
          this.cache.set(item.id, updatedItem);
          result.updated.push(updatedItem);
        } else {
          // New item discovered
          this.cache.set(item.id, item);
          result.discovered.push(item);
        }

        // Update statistics
        switch (item.type) {
          case 'function':
            result.statistics.functionsFound++;
            break;
          case 'library':
            result.statistics.librariesFound++;
            break;
          case 'dictionary':
            result.statistics.dictionariesFound++;
            break;
        }
      }

      if (this.config.verbose) {
        console.log(`📄 Scanned ${relative(this.config.rootPath, filePath)}: ${items.length} items`);
      }

    } catch (error) {
      const discoveryError: DiscoveryError = {
        type: 'parse',
        message: `File parsing failed: ${error.message}`,
        location: {
          filePath,
          lineNumber: 0,
          columnNumber: 0,
          functionName: 'scanFile',
          module: 'GgmlVocabularyScanner'
        },
        severity: 'low'
      };
      result.errors.push(discoveryError);
      result.statistics.errorsEncountered++;
    }
  }

  /**
   * Extract vocabulary items from file content
   */
  private async extractVocabularyItems(content: string, filePath: string): Promise<VocabularyItem[]> {
    const items: VocabularyItem[] = [];

    for (const pattern of this.patterns) {
      const matches = content.matchAll(pattern.pattern);
      
      for (const match of matches) {
        try {
          const partialItem = pattern.extractor(match, content, filePath);
          const item = await this.buildCompleteVocabularyItem(partialItem, content, filePath, match);
          items.push(item);
        } catch (error) {
          console.warn(`⚠️ Failed to extract item from ${filePath}: ${error.message}`);
        }
      }
    }

    return items;
  }

  /**
   * Build a complete vocabulary item from extracted data
   */
  private async buildCompleteVocabularyItem(
    partial: Partial<VocabularyItem>,
    content: string,
    filePath: string,
    match: RegExpMatchArray
  ): Promise<VocabularyItem> {
    const now = Date.now();
    const lineNumber = this.getLineNumber(content, match.index || 0);
    
    // Generate ID if not provided
    const id = partial.id || this.generateId(partial.name || 'unknown', filePath);
    
    const item: VocabularyItem = {
      id,
      name: partial.name || 'unknown',
      type: partial.type || 'function',
      description: partial.description || '',
      category: partial.category || this.categorizeByPath(filePath),
      tags: partial.tags || [],
      version: partial.version || '1.0.0',
      
      signature: partial.signature || this.generateDefaultSignature(partial.name || 'unknown'),
      tensorMetadata: partial.tensorMetadata || this.generateDefaultTensorMetadata(),
      adaptationMetadata: partial.adaptationMetadata || this.generateDefaultAdaptationMetadata(),
      
      sourceLocation: {
        filePath,
        lineNumber,
        columnNumber: match.index ? this.getColumnNumber(content, match.index) : 0,
        functionName: partial.name || 'unknown',
        module: this.getModuleName(filePath)
      },
      implementationStatus: await this.analyzeImplementationStatus(partial.name || 'unknown', content),
      dependencies: partial.dependencies || [],
      
      usageStatistics: this.generateDefaultUsageStatistics(),
      performanceMetrics: this.generateDefaultPerformanceMetrics(),
      validationResult: await this.validateVocabularyItem(partial, content),
      
      registrationTime: now,
      lastModified: now,
      hash: this.calculateHash(JSON.stringify(partial)),
      
      kernelIntegration: partial.kernelIntegration,
      membraneIntegration: partial.membraneIntegration
    };

    return item;
  }

  /**
   * Initialize vocabulary detection patterns
   */
  private initializePatterns(): VocabularyPattern[] {
    return [
      // TypeScript/JavaScript function patterns
      {
        type: 'function',
        pattern: /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*{/g,
        category: 'function',
        extractor: (match, content, filePath) => ({
          name: match[1],
          type: 'function' as VocabularyType,
          description: this.extractJSDocDescription(content, match.index || 0),
          category: this.categorizeByPath(filePath)
        })
      },
      
      // Arrow function patterns
      {
        type: 'function',
        pattern: /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*/g,
        category: 'function',
        extractor: (match, content, filePath) => ({
          name: match[1],
          type: 'function' as VocabularyType,
          description: this.extractJSDocDescription(content, match.index || 0),
          category: this.categorizeByPath(filePath)
        })
      },
      
      // Class method patterns
      {
        type: 'function',
        pattern: /(?:public|private|protected)?\s*(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*{/g,
        category: 'method',
        extractor: (match, content, filePath) => ({
          name: match[1],
          type: 'function' as VocabularyType,
          description: this.extractJSDocDescription(content, match.index || 0),
          category: 'method'
        })
      },
      
      // Interface/type definitions (dictionaries)
      {
        type: 'dictionary',
        pattern: /(?:export\s+)?(?:interface|type)\s+(\w+)\s*[={]/g,
        category: 'type',
        extractor: (match, content, filePath) => ({
          name: match[1],
          type: 'dictionary' as VocabularyType,
          description: this.extractJSDocDescription(content, match.index || 0),
          category: 'type'
        })
      },
      
      // Class definitions (libraries)
      {
        type: 'library',
        pattern: /(?:export\s+)?(?:abstract\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?(?:\s+implements\s+[^{]+)?\s*{/g,
        category: 'class',
        extractor: (match, content, filePath) => ({
          name: match[1],
          type: 'library' as VocabularyType,
          description: this.extractJSDocDescription(content, match.index || 0),
          category: 'class'
        })
      },
      
      // GGML kernel patterns
      {
        type: 'kernel',
        pattern: /(?:createKernel|registerKernel|GgmlKernel)\s*\(\s*['"]([\w-]+)['"]|(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*.*[Kk]ernel/g,
        category: 'kernel',
        extractor: (match, content, filePath) => ({
          name: match[1] || match[2],
          type: 'kernel' as VocabularyType,
          description: this.extractJSDocDescription(content, match.index || 0),
          category: 'kernel'
        })
      },
      
      // Tensor operation patterns
      {
        type: 'operator',
        pattern: /(?:export\s+)?(?:const|let|var|function)\s+(\w*[Tt]ensor\w*|\w*[Oo]perator\w*|\w*[Oo]p)\s*[=:]/g,
        category: 'tensor-op',
        extractor: (match, content, filePath) => ({
          name: match[1],
          type: 'operator' as VocabularyType,
          description: this.extractJSDocDescription(content, match.index || 0),
          category: 'tensor-op'
        })
      }
    ];
  }

  /**
   * Extract JSDoc description from code
   */
  private extractJSDocDescription(content: string, startIndex: number): string {
    // Look backward for JSDoc comment
    const beforeMatch = content.substring(0, startIndex);
    const jsdocMatch = beforeMatch.match(/\/\*\*[\s\S]*?\*\/\s*$/);
    
    if (jsdocMatch) {
      const jsdoc = jsdocMatch[0];
      const descMatch = jsdoc.match(/\/\*\*\s*\n?\s*\*\s*([^\n@]+)/);
      return descMatch ? descMatch[1].trim() : '';
    }
    
    return '';
  }

  /**
   * Analyze implementation status of a vocabulary item
   */
  private async analyzeImplementationStatus(name: string, content: string): Promise<ImplementationStatus> {
    // Look for common stub patterns
    const stubPatterns = [
      /throw\s+new\s+Error\s*\(\s*['"]not\s+implemented['"]|TODO:|FIXME:|STUB:/i,
      /return\s+undefined;?\s*$/m,
      /\/\/\s*TODO/i,
      /\/\*\s*TODO\s*\*\//i
    ];

    for (const pattern of stubPatterns) {
      if (pattern.test(content)) {
        return 'stub';
      }
    }

    // Check for experimental markers
    if (/experimental|alpha|beta|unstable/i.test(content)) {
      return 'experimental';
    }

    // Check for deprecated markers
    if (/@deprecated|deprecated|obsolete/i.test(content)) {
      return 'deprecated';
    }

    return 'implemented';
  }

  /**
   * Validate a vocabulary item
   */
  private async validateVocabularyItem(
    partial: Partial<VocabularyItem>,
    content: string
  ): Promise<ValidationResult> {
    const issues = [];
    
    // Check for basic implementation
    const isImplemented = partial.name && content.includes(partial.name);
    const isStub = !isImplemented || /TODO|FIXME|STUB/i.test(content);
    
    // Check for tests
    const hasTests = content.includes('test') || content.includes('spec');
    
    // Check for documentation
    const hasDocumentation = content.includes('/**') || content.includes('///');
    
    return {
      isValid: isImplemented,
      isImplemented,
      isStub,
      hasTests,
      hasDocumentation,
      codeQuality: this.calculateCodeQuality(content),
      issues,
      suggestions: [],
      lastValidated: Date.now()
    };
  }

  /**
   * Calculate code quality score
   */
  private calculateCodeQuality(content: string): number {
    let score = 0.5; // Base score
    
    // Add points for documentation
    if (content.includes('/**')) score += 0.2;
    
    // Add points for error handling
    if (content.includes('try') || content.includes('catch')) score += 0.1;
    
    // Add points for type annotations
    if (content.includes(': ') && !content.includes('// ')) score += 0.1;
    
    // Subtract points for TODOs
    if (content.includes('TODO')) score -= 0.1;
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate default function signature
   */
  private generateDefaultSignature(name: string): FunctionSignature {
    return {
      name,
      parameters: [],
      returnType: {
        type: 'any',
        description: 'Return type not analyzed'
      },
      isAsync: false,
      isVarArgs: false,
      contextRequirements: []
    };
  }

  /**
   * Generate default tensor metadata
   */
  private generateDefaultTensorMetadata(): TensorMetadata {
    return {
      shape: [1],
      dataType: 'f32' as GgmlDataType,
      memoryLayout: 'row-major',
      alignment: 32,
      semantics: {
        dimensionMeanings: ['unknown'],
        interpretations: {},
        cognitiveRole: 'intermediate',
        abstraction: 'concrete'
      }
    };
  }

  /**
   * Generate default adaptation metadata
   */
  private generateDefaultAdaptationMetadata(): AdaptationMetadata {
    return {
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
    };
  }

  /**
   * Generate default usage statistics
   */
  private generateDefaultUsageStatistics(): UsageStatistics {
    return {
      callCount: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0,
      errorRate: 0,
      lastUsed: 0,
      firstUsed: Date.now(),
      hotSpots: [],
      dependencies: [],
      dependents: []
    };
  }

  /**
   * Generate default performance metrics
   */
  private generateDefaultPerformanceMetrics(): PerformanceMetrics {
    return {
      computationalComplexity: 'O(1)',
      memoryComplexity: 'O(1)',
      parallelizability: 0.5,
      cacheEfficiency: 0.5,
      throughput: 0,
      latency: 0,
      resourceUtilization: {
        cpu: 0,
        memory: 0,
        bandwidth: 0,
        storage: 0
      }
    };
  }

  /**
   * Merge vocabulary items (for updates)
   */
  private mergeVocabularyItems(existing: VocabularyItem, updated: VocabularyItem): VocabularyItem {
    return {
      ...existing,
      ...updated,
      registrationTime: existing.registrationTime, // Preserve original registration
      lastModified: Date.now(),
      usageStatistics: {
        ...existing.usageStatistics,
        ...updated.usageStatistics
      }
    };
  }

  /**
   * Clean up removed files from cache
   */
  private cleanupRemovedFiles(result: DiscoveryResult): void {
    // This would check for files that no longer exist and mark items as removed
    // Implementation depends on how we track file-to-item mappings
  }

  /**
   * Utility methods
   */
  private isExcluded(path: string): boolean {
    return this.config.excludePatterns.some(pattern => 
      new RegExp(pattern).test(path)
    );
  }

  private categorizeByPath(filePath: string): string {
    if (filePath.includes('/test/')) return 'test';
    if (filePath.includes('/core/')) return 'core';
    if (filePath.includes('/util/')) return 'utility';
    if (filePath.includes('/tensor/')) return 'tensor';
    if (filePath.includes('/kernel/')) return 'kernel';
    if (filePath.includes('/memory/')) return 'memory';
    if (filePath.includes('/attention/')) return 'attention';
    return 'general';
  }

  private generateId(name: string, filePath: string): string {
    const module = this.getModuleName(filePath);
    return `${module}:${name}`;
  }

  private getModuleName(filePath: string): string {
    const relativePath = relative(this.config.rootPath, filePath);
    const parts = relativePath.split('/');
    return parts[parts.length - 1].replace(/\.[^.]+$/, '');
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private getColumnNumber(content: string, index: number): number {
    const lastNewline = content.lastIndexOf('\n', index);
    return index - lastNewline;
  }

  private calculateHash(content: string): string {
    // Simple hash function for change detection
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }
}