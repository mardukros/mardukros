/**
 * Agentic Grammar Extractor - Extracts agentic primitives from TypeScript/JavaScript code
 * 
 * Analyzes source code to identify agentic patterns (actions, percepts, memory operations,
 * decision-making, planning, etc.) and converts them to structured representations.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { 
  AgenticPrimitive, 
  AgenticPrimitiveType, 
  AgenticGrammarConfig,
  GrammarToken 
} from './types.js';

export class AgenticGrammarExtractor {
  private config: AgenticGrammarConfig;
  private extractedPrimitives: Map<string, AgenticPrimitive> = new Map();
  private grammarTokens: Map<string, GrammarToken> = new Map();

  constructor(config: AgenticGrammarConfig) {
    this.config = config;
  }

  /**
   * Extracts agentic primitives from all configured source directories
   */
  async extractAgenticPrimitives(): Promise<Map<string, AgenticPrimitive>> {
    console.log('🧬 Extracting agentic primitives from codebase...');
    
    this.extractedPrimitives.clear();
    
    for (const sourceDir of this.config.extraction.sourceDirectories) {
      await this.extractFromDirectory(sourceDir);
    }
    
    console.log(`✨ Extracted ${this.extractedPrimitives.size} agentic primitives`);
    return this.extractedPrimitives;
  }

  /**
   * Extracts primitives from a directory recursively
   */
  private async extractFromDirectory(dirPath: string): Promise<void> {
    try {
      const entries = readdirSync(dirPath);
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          if (!this.isExcluded(fullPath)) {
            await this.extractFromDirectory(fullPath);
          }
        } else if (stat.isFile() && this.isValidSourceFile(fullPath)) {
          await this.extractFromFile(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not process directory ${dirPath}:`, error);
    }
  }

  /**
   * Extracts agentic primitives from a single file
   */
  private async extractFromFile(filePath: string): Promise<void> {
    try {
      const content = readFileSync(filePath, 'utf8');
      
      if (content.length > this.config.extraction.maxFileSize) {
        console.warn(`Skipping large file: ${filePath}`);
        return;
      }
      
      const lines = content.split('\n');
      
      // Extract different types of agentic primitives
      await this.extractActions(filePath, lines);
      await this.extractPercepts(filePath, lines);
      await this.extractMemoryOperations(filePath, lines);
      await this.extractDecisions(filePath, lines);
      await this.extractPlanning(filePath, lines);
      await this.extractCommunication(filePath, lines);
      await this.extractAdaptation(filePath, lines);
      await this.extractAttention(filePath, lines);
      await this.extractGoals(filePath, lines);
      await this.extractConstraints(filePath, lines);
      
    } catch (error) {
      console.warn(`Warning: Could not process file ${filePath}:`, error);
    }
  }

  /**
   * Extracts action primitives (function calls, method invocations)
   */
  private async extractActions(filePath: string, lines: string[]): Promise<void> {
    const actionPatterns = [
      /(\w+)\s*\.\s*(\w+)\s*\(/g,                    // method calls
      /(\w+)\s*\(/g,                                 // function calls
      /async\s+(\w+)\s*\(/g,                         // async functions
      /(?:execute|perform|run|process|handle)(\w*)/gi, // action verbs
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of actionPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const actionName = match[1] || match[0];
          
          if (this.isSignificantAction(actionName)) {
            const primitive = this.createAgenticPrimitive(
              'action',
              actionName,
              filePath,
              i + 1,
              match.index,
              line.length
            );
            
            primitive.semanticComplexity = this.calculateSemanticComplexity(line);
            primitive.functionalDepth = this.calculateFunctionalDepth(lines, i);
            
            this.extractedPrimitives.set(primitive.id, primitive);
          }
        }
      }
    }
  }

  /**
   * Extracts percept primitives (data input, sensor readings)
   */
  private async extractPercepts(filePath: string, lines: string[]): Promise<void> {
    const perceptPatterns = [
      /(?:read|get|fetch|receive|input|sense|detect)(\w*)/gi,
      /(?:import|require)\s*\(/g,
      /(?:addEventListener|on|subscribe)(\w*)/gi,
      /(?:\.value|\.data|\.input|\.sensor)/g,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of perceptPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const perceptName = match[1] || match[0];
          
          if (this.isSignificantPercept(perceptName)) {
            const primitive = this.createAgenticPrimitive(
              'percept',
              perceptName,
              filePath,
              i + 1,
              match.index,
              line.length
            );
            
            this.extractedPrimitives.set(primitive.id, primitive);
          }
        }
      }
    }
  }

  /**
   * Extracts memory operation primitives (data storage, state management)
   */
  private async extractMemoryOperations(filePath: string, lines: string[]): Promise<void> {
    const memoryPatterns = [
      /(?:store|save|cache|persist|remember|recall)(\w*)/gi,
      /(?:Map|Set|Array|Object)\.(?:set|get|has|add|delete)/g,
      /(?:localStorage|sessionStorage|database|memory)/gi,
      /(?:this\.|private\s+|protected\s+|public\s+)(\w+)(?:\s*[:=])/g,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of memoryPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const memoryName = match[1] || match[0];
          
          if (this.isSignificantMemoryOperation(memoryName)) {
            const primitive = this.createAgenticPrimitive(
              'memory',
              memoryName,
              filePath,
              i + 1,
              match.index,
              line.length
            );
            
            this.extractedPrimitives.set(primitive.id, primitive);
          }
        }
      }
    }
  }

  /**
   * Extracts decision primitives (conditional logic, branching)
   */
  private async extractDecisions(filePath: string, lines: string[]): Promise<void> {
    const decisionPatterns = [
      /if\s*\(/g,
      /switch\s*\(/g,
      /\?\s*.*\s*:/g,  // ternary
      /(?:decide|choose|select|determine|evaluate)(\w*)/gi,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of decisionPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const decisionName = `decision_${i}_${match.index}`;
          
          const primitive = this.createAgenticPrimitive(
            'decision',
            decisionName,
            filePath,
            i + 1,
            match.index,
            line.length
          );
          
          primitive.semanticComplexity = this.calculateDecisionComplexity(line);
          this.extractedPrimitives.set(primitive.id, primitive);
        }
      }
    }
  }

  /**
   * Extracts planning primitives (loop structures, sequences)
   */
  private async extractPlanning(filePath: string, lines: string[]): Promise<void> {
    const planningPatterns = [
      /for\s*\(/g,
      /while\s*\(/g,
      /do\s*\{/g,
      /(?:plan|schedule|sequence|iterate|loop)(\w*)/gi,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of planningPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const planningName = match[1] || `planning_${i}_${match.index}`;
          
          const primitive = this.createAgenticPrimitive(
            'planning',
            planningName,
            filePath,
            i + 1,
            match.index,
            line.length
          );
          
          this.extractedPrimitives.set(primitive.id, primitive);
        }
      }
    }
  }

  /**
   * Extracts communication primitives (message passing, events)
   */
  private async extractCommunication(filePath: string, lines: string[]): Promise<void> {
    const communicationPatterns = [
      /(?:emit|send|publish|broadcast|notify|message)(\w*)/gi,
      /(?:websocket|socket|channel|queue|topic)/gi,
      /(?:postMessage|addEventListener|dispatchEvent)/g,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of communicationPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const commName = match[1] || match[0];
          
          const primitive = this.createAgenticPrimitive(
            'communication',
            commName,
            filePath,
            i + 1,
            match.index,
            line.length
          );
          
          this.extractedPrimitives.set(primitive.id, primitive);
        }
      }
    }
  }

  /**
   * Extracts adaptation primitives (learning, parameter updates)
   */
  private async extractAdaptation(filePath: string, lines: string[]): Promise<void> {
    const adaptationPatterns = [
      /(?:learn|adapt|evolve|mutate|optimize|adjust)(\w*)/gi,
      /(?:update|modify|change|improve)(\w*)/gi,
      /(?:gradient|backprop|train|fit)/gi,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of adaptationPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const adaptName = match[1] || match[0];
          
          const primitive = this.createAgenticPrimitive(
            'adaptation',
            adaptName,
            filePath,
            i + 1,
            match.index,
            line.length
          );
          
          this.extractedPrimitives.set(primitive.id, primitive);
        }
      }
    }
  }

  /**
   * Extracts attention primitives (focus allocation, prioritization)
   */
  private async extractAttention(filePath: string, lines: string[]): Promise<void> {
    const attentionPatterns = [
      /(?:focus|attend|prioritize|allocate|distribute)(\w*)/gi,
      /(?:attention|priority|weight|importance)/gi,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of attentionPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const attentionName = match[1] || match[0];
          
          const primitive = this.createAgenticPrimitive(
            'attention',
            attentionName,
            filePath,
            i + 1,
            match.index,
            line.length
          );
          
          this.extractedPrimitives.set(primitive.id, primitive);
        }
      }
    }
  }

  /**
   * Extracts goal primitives (objective functions, targets)
   */
  private async extractGoals(filePath: string, lines: string[]): Promise<void> {
    const goalPatterns = [
      /(?:goal|objective|target|aim|purpose)(\w*)/gi,
      /(?:achieve|accomplish|complete|finish)(\w*)/gi,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of goalPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const goalName = match[1] || match[0];
          
          const primitive = this.createAgenticPrimitive(
            'goal',
            goalName,
            filePath,
            i + 1,
            match.index,
            line.length
          );
          
          this.extractedPrimitives.set(primitive.id, primitive);
        }
      }
    }
  }

  /**
   * Extracts constraint primitives (limitations, boundaries)
   */
  private async extractConstraints(filePath: string, lines: string[]): Promise<void> {
    const constraintPatterns = [
      /(?:limit|bound|restrict|constrain|validate)(\w*)/gi,
      /(?:min|max|range|threshold|boundary)/gi,
      /(?:assert|check|verify|ensure)/gi,
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of constraintPatterns) {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const constraintName = match[1] || match[0];
          
          const primitive = this.createAgenticPrimitive(
            'constraint',
            constraintName,
            filePath,
            i + 1,
            match.index,
            line.length
          );
          
          this.extractedPrimitives.set(primitive.id, primitive);
        }
      }
    }
  }

  /**
   * Creates a standardized agentic primitive
   */
  private createAgenticPrimitive(
    type: AgenticPrimitiveType,
    name: string,
    filePath: string,
    line: number,
    startColumn: number,
    endColumn: number
  ): AgenticPrimitive {
    const id = `${type}_${name}_${filePath}_${line}_${startColumn}`.replace(/[^a-zA-Z0-9_]/g, '_');
    
    return {
      id,
      type,
      name,
      sourceLocation: {
        filePath,
        startLine: line,
        endLine: line,
        startColumn,
        endColumn
      },
      parameters: [],
      semanticComplexity: 1.0,
      functionalDepth: 1,
      dependencies: [],
      metadata: {
        extracted: Date.now(),
        extractorVersion: '1.0.0'
      }
    };
  }

  /**
   * Utility methods for significance checks
   */
  private isSignificantAction(actionName: string): boolean {
    const insignificantActions = ['console', 'log', 'debug', 'toString', 'valueOf'];
    return actionName.length > 2 && !insignificantActions.includes(actionName);
  }

  private isSignificantPercept(perceptName: string): boolean {
    return perceptName.length > 2;
  }

  private isSignificantMemoryOperation(memoryName: string): boolean {
    return memoryName.length > 2;
  }

  /**
   * Calculates semantic complexity based on line content
   */
  private calculateSemanticComplexity(line: string): number {
    const complexityIndicators = [
      /async|await/g,
      /Promise|then|catch/g,
      /class|interface|extends|implements/g,
      /generic|<.*>/g,
      /\[\]|\{.*\}/g,
    ];

    let complexity = 1.0;
    for (const pattern of complexityIndicators) {
      const matches = line.match(pattern);
      if (matches) {
        complexity += matches.length * 0.2;
      }
    }

    return Math.min(complexity, 3.0);
  }

  /**
   * Calculates functional depth based on nesting
   */
  private calculateFunctionalDepth(lines: string[], currentLine: number): number {
    let depth = 0;
    const openBraces = /\{/g;
    const closeBraces = /\}/g;

    for (let i = 0; i < currentLine; i++) {
      const line = lines[i];
      const opens = (line.match(openBraces) || []).length;
      const closes = (line.match(closeBraces) || []).length;
      depth += opens - closes;
    }

    return Math.max(depth, 1);
  }

  /**
   * Calculates decision complexity
   */
  private calculateDecisionComplexity(line: string): number {
    const complexityIndicators = [
      /&&|\|\|/g,  // logical operators
      /==|!=|<=|>=|<|>/g,  // comparison operators
      /\?.*:/g,  // ternary
    ];

    let complexity = 1.0;
    for (const pattern of complexityIndicators) {
      const matches = line.match(pattern);
      if (matches) {
        complexity += matches.length * 0.1;
      }
    }

    return complexity;
  }

  /**
   * Checks if a file should be processed
   */
  private isValidSourceFile(filePath: string): boolean {
    const ext = extname(filePath).toLowerCase();
    return this.config.extraction.fileExtensions.includes(ext);
  }

  /**
   * Checks if a path should be excluded
   */
  private isExcluded(path: string): boolean {
    return this.config.extraction.excludePatterns.some(pattern => 
      path.includes(pattern)
    );
  }

  /**
   * Gets extraction statistics
   */
  getExtractionStatistics(): {
    totalPrimitives: number;
    primitivesByType: Record<AgenticPrimitiveType, number>;
    averageComplexity: number;
    averageDepth: number;
  } {
    const primitivesByType = {} as Record<AgenticPrimitiveType, number>;
    let totalComplexity = 0;
    let totalDepth = 0;

    for (const primitive of this.extractedPrimitives.values()) {
      primitivesByType[primitive.type] = (primitivesByType[primitive.type] || 0) + 1;
      totalComplexity += primitive.semanticComplexity;
      totalDepth += primitive.functionalDepth;
    }

    const count = this.extractedPrimitives.size;
    
    return {
      totalPrimitives: count,
      primitivesByType,
      averageComplexity: count > 0 ? totalComplexity / count : 0,
      averageDepth: count > 0 ? totalDepth / count : 0
    };
  }
}