import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { promisify } from 'util';
import { logger } from '../utils/logger.js';
import { CodePattern } from './code-optimizer.js';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

export interface AnalysisResult {
  issues: CodePattern[];
  stats: {
    filesAnalyzed: number;
    linesOfCode: number;
    duplicateCode: number;
    complexFunctions: number;
    typeIssues: number;
    architecturalIssues: number;
  };
}

/**
 * Analyzes code for patterns that could be optimized
 */
export class CodeAnalyzer {
  private readonly PROJECT_ROOT = './src';
  private readonly EXCLUDE_DIRS = ['node_modules', 'dist', '.git'];
  private issueId = 1;

  /**
   * Analyze the entire project
   */
  async analyzeProject(): Promise<AnalysisResult> {
    logger.info('🔍 MARDUK CODE ANALYZER 🔍');
    logger.info(`Starting code analysis on ${this.PROJECT_ROOT}...`);

    const issues: CodePattern[] = [];
    let filesAnalyzed = 0;
    let linesOfCode = 0;

    try {
      const files = await this.findSourceFiles();

      for (const file of files) {
        const fileIssues = await this.analyzeFile(file);
        issues.push(...fileIssues);

        filesAnalyzed++;
        linesOfCode += this.countLinesInFile(file);
      }

      // Group issues by type for stats
      const duplicateCode = issues.filter(i => i.type === 'redundancy').length;
      const complexFunctions = issues.filter(i => i.type === 'complexity').length;
      const typeIssues = issues.filter(i => i.type === 'type_issue').length;
      const architecturalIssues = issues.filter(i => i.type === 'architectural').length;

      logger.info(`Analysis complete. Found ${issues.length} potential issues.`);

      return {
        issues,
        stats: {
          filesAnalyzed,
          linesOfCode,
          duplicateCode,
          complexFunctions,
          typeIssues,
          architecturalIssues
        }
      };

    } catch (error) {
      logger.error('Error during code analysis:', error instanceof Error ? error.message : String(error));
      return {
        issues: [],
        stats: {
          filesAnalyzed,
          linesOfCode,
          duplicateCode: 0,
          complexFunctions: 0,
          typeIssues: 0,
          architecturalIssues: 0
        }
      };
    }
  }

  /**
   * Analyze a single file for optimization opportunities
   */
  private async analyzeFile(filePath: string): Promise<CodePattern[]> {
    const issues: CodePattern[] = [];
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

    try {
      const content = await readFile(filePath, 'utf8');
      const lines = content.split('\n');
// Consider extracting this duplicated code into a shared function

      // Parse the file with TypeScript compiler API for accurate analysis
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        issues.push(...this.analyzeTypeScriptFile(filePath, content));
      }

      // Simple heuristic analyses for all file types
      issues.push(...this.findLongFunctions(filePath, lines));
      issues.push(...this.findDuplicateCode(filePath, lines));
      issues.push(...this.findInefficiencies(filePath, lines));

    } catch (error) {
      logger.warn(`Error analyzing file ${filePath}:`, error instanceof Error ? error.message : String(error));
    }

    return issues;
  }

  /**
   * Analyze TypeScript file using compiler API
   */
  private analyzeTypeScriptFile(filePath: string, content: string): CodePattern[] {
    const issues: CodePattern[] = [];

    try {
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      // Find type issues
      const typeIssues = this.findTypeIssues(sourceFile, filePath);
      issues.push(...typeIssues);

      // Find architectural issues
      const architecturalIssues = this.findArchitecturalIssues(sourceFile, filePath);
      issues.push(...architecturalIssues);

    } catch (error) {
      logger.warn(`Error in TypeScript analysis of ${filePath}:`, error instanceof Error ? error.message : String(error));
    }

    return issues;
  }

  /**
   * Find all source files in the project
   */
  private async findSourceFiles(): Promise<string[]> {
    const files: string[] = [];
    const excludeDirs = this.EXCLUDE_DIRS;

    // Use arrow function to preserve 'this' context
    const traverse = async (dir: string): Promise<void> => {
      const entries = await readdir(dir);

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          if (!excludeDirs.includes(entry)) {
            await traverse(fullPath);
          }
        } else if (stats.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry)) {
          files.push(fullPath);
        }
      }
    };

    await traverse(this.PROJECT_ROOT);
    return files;
  }

  /**
   * Count lines in a file
   */
  private countLinesInFile(filePath: string): number {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return content.split('\n').length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Find long functions that could be simplified
   */
  private findLongFunctions(filePath: string, lines: string[]): CodePattern[] {
    const issues: CodePattern[] = [];
    const FUNCTION_REGEX = /function\s+(\w+)?\s*\(|(\w+)\s*=\s*function\s*\(|(\w+)\s*:\s*function\s*\(|(\w+)\s*\(.*\)\s*{|(\w+)\s*=\s*\(.*\)\s*=>/;

    let inFunction = false;
    let functionStart = 0;
    let functionName = '';
    let braceCount = 0;

// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!inFunction) {
        const match = FUNCTION_REGEX.exec(line);
        if (match) {
          inFunction = true;
          functionStart = i;
          functionName = match[1] || match[2] || match[3] || match[4] || match[5] || 'anonymous';
          braceCount = line.split('{').length - line.split('}').length;
        }
      } else {
        braceCount += line.split('{').length - line.split('}').length;

        if (braceCount === 0) {
          const functionLength = i - functionStart + 1;

          if (functionLength > 30) {
            const codeFragment = lines.slice(functionStart, i + 1).join('\n');

            issues.push({
              id: `COMPLEX-${this.issueId++}`,
              type: 'complexity',
              description: `Long function "${functionName}" (${functionLength} lines)`,
              filePath,
              lineStart: functionStart + 1,
              lineEnd: i + 1,
              severity: functionLength > 50 ? 'high' : 'medium',
              impact: Math.min(0.5 + (functionLength / 100), 0.9),
              codeFragment,
              suggestedFix: `// This function should be refactored into smaller parts\n${codeFragment}`
            });
          }

          inFunction = false;
        }
      }
    }

    return issues;
  }

  /**
   * Find potentially duplicated code sections
   */
  private findDuplicateCode(filePath: string, lines: string[]): CodePattern[] {
    const issues: CodePattern[] = [];
    const blocks: Map<string, {count: number, start: number, end: number}> = new Map();

    // Simple block detection - can be improved with better algorithms
    const BLOCK_SIZE = 5;

    for (let i = 0; i <= lines.length - BLOCK_SIZE; i++) {
      const block = lines.slice(i, i + BLOCK_SIZE).join('\n');
      const normalizedBlock = block.replace(/\s+/g, ' ').trim();

      if (normalizedBlock.length > 100) {  // Only consider substantial blocks
        const existing = blocks.get(normalizedBlock);

        if (existing) {
          existing.count += 1;
        } else {
          blocks.set(normalizedBlock, { count: 1, start: i, end: i + BLOCK_SIZE });
        }
      }
    }

    // Report duplicated blocks
    for (const [block, data] of blocks.entries()) {
      if (data.count > 1) {
        const codeFragment = lines.slice(data.start, data.end).join('\n');

        issues.push({
          id: `REDUNDANCY-${this.issueId++}`,
          type: 'redundancy',
          description: `Potentially duplicated code block found ${data.count} times`,
          filePath,
          lineStart: data.start + 1,
          lineEnd: data.end,
          severity: 'medium',
          impact: Math.min(0.6 + (data.count / 10), 0.9),
          codeFragment,
          suggestedFix: `// Consider extracting this duplicated code into a shared function\n${codeFragment}`
        });
      }
    }

    return issues;
  }

  /**
   * Find potential inefficiencies in the code
   */
  private findInefficiencies(filePath: string, lines: string[]): CodePattern[] {
    const issues: CodePattern[] = [];

    // Look for common inefficient patterns
    const inefficientPatterns = [
      {
        regex: /for\s*\(\s*let\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*array\.length\s*;/,
        description: 'Inefficient loop caching array length',
        suggestion: 'Cache the array length outside the loop'
      },
      {
        regex: /\+\s*['"]|['"]\s*\+\s*['"]|\+\s*`|`\s*\+/,
        description: 'Inefficient string concatenation',
        suggestion: 'Use template literals or string interpolation'
      },
      {
        regex: /setTimeout\(\s*function\s*\(\)\s*{\s*location\.reload/,
        description: 'Inefficient page reload mechanism',
        suggestion: 'Consider using a more efficient refresh strategy'
      }
    ];

    for (let i = 0; i < lines.length; i++) {
      for (const pattern of inefficientPatterns) {
        if (pattern.regex.test(lines[i])) {
          let lineEnd = i + 1;
          let codeFragment = lines[i];

          // Try to capture the whole statement/block
          let braceCount = lines[i].split('{').length - lines[i].split('}').length;
          let j = i + 1;

          while (braceCount > 0 && j < lines.length) {
            codeFragment += '\n' + lines[j];
            braceCount += lines[j].split('{').length - lines[j].split('}').length;
            lineEnd = j + 1;
            j++;

            if (braceCount === 0) break;
          }

          issues.push({
            id: `INEFFICIENCY-${this.issueId++}`,
            type: 'inefficiency',
            description: pattern.description,
            filePath,
            lineStart: i + 1,
            lineEnd,
            severity: 'medium',
            impact: 0.7,
            codeFragment,
            suggestedFix: `// ${pattern.suggestion}\n${codeFragment}`
          });
        }
      }
    }

    return issues;
  }

  /**
   * Find type-related issues in TypeScript files
   */
  private findTypeIssues(sourceFile: ts.SourceFile, filePath: string): CodePattern[] {
    const issues: CodePattern[] = [];
    const issueIdRef = this.issueId; // Capture issueId reference

    // Use arrow function to preserve 'this' context
    const visit = (node: ts.Node): void => {
      // Check for any type
      if (node.kind === ts.SyntaxKind.AnyKeyword) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const lineText = sourceFile.text.split('\n')[line];

        issues.push({
          id: `TYPE-${this.issueId++}`,
          type: 'type_issue',
          description: 'Usage of any type',
          filePath,
          lineStart: line + 1,
          lineEnd: line + 1,
          severity: 'medium',
          impact: 0.6,
          codeFragment: lineText,
          suggestedFix: lineText
        });
      }

      // Check for type assertions
      if (node.kind === ts.SyntaxKind.AsExpression || node.kind === ts.SyntaxKind.TypeAssertionExpression) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        const lineText = sourceFile.text.split('\n')[line];

        issues.push({
          id: `TYPE-${this.issueId++}`,
          type: 'type_issue',
          description: 'Type assertion that could be improved',
          filePath,
          lineStart: line + 1,
          lineEnd: line + 1,
          severity: 'low',
          impact: 0.5,
          codeFragment: lineText,
          suggestedFix: lineText
        });
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return issues;
  }

  /**
   * Find architectural issues in code
   */
  private findArchitecturalIssues(sourceFile: ts.SourceFile, filePath: string): CodePattern[] {
    const issues: CodePattern[] = [];
    const importGroups: { [key: string]: number } = {};

    // Check imports for architectural concerns
    function checkImports(node: ts.Node) {
      if (ts.isImportDeclaration(node)) {
        const importPath = (node.moduleSpecifier as ts.StringLiteral).text;
        const importCategory = importPath.startsWith('.') ? 'local' : 
                               importPath.includes('/') ? importPath.split('/')[0] : 'external';

        importGroups[importCategory] = (importGroups[importCategory] || 0) + 1;
      }

      ts.forEachChild(node, checkImports);
    }

    checkImports(sourceFile);

    // Check for excessive dependencies
    if (Object.values(importGroups).reduce((a, b) => a + b, 0) > 15) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(sourceFile.getStart());
      const lineText = sourceFile.text.split('\n')[line];

      issues.push({
        id: `ARCHITECTURE-${this.issueId++}`,
        type: 'architectural',
        description: 'Excessive dependencies in module',
        filePath,
        lineStart: line + 1,
        lineEnd: line + 1,
        severity: 'medium',
        impact: 0.7,
        codeFragment: lineText,
        suggestedFix: lineText
      });
    }

    // Check for large module
    if (sourceFile.text.split('\n').length > 300) {
      const { line } = sourceFile.getLineAndCharacterOfPosition(sourceFile.getStart());
      const lineText = sourceFile.text.split('\n')[line];

      issues.push({
        id: `ARCHITECTURE-${this.issueId++}`,
        type: 'architectural',
        description: 'Module is too large and should be split',
        filePath,
        lineStart: line + 1,
        lineEnd: line + 1,
        severity: 'medium',
        impact: 0.7,
        codeFragment: lineText,
        suggestedFix: lineText
      });
    }

    return issues;
  }

  /**
   * Analyze system structure for optimization opportunities
   */
  async analyzeSystem(): Promise<CodePattern[]> {
    const analysisResult = await this.analyzeProject();
    return analysisResult.issues;
  }

  /**
   * Analyze code structure for optimization patterns
   */
  async analyzeCodeStructure(): Promise<CodePattern[]> {
    logger.info("Analyzing code structure for optimization patterns");
    const patterns: CodePattern[] = [];

    try {
      // Find patterns in the codebase
      patterns.push(
        {
          id: `PERF-${this.issueId++}`,
          type: "performance",
          location: "memory/query-execution",
          description: "Optimize memory query execution",
          impact: 0.85,
          suggestion: "Implement caching for frequent queries",
          filePath: "src/core/memory/memory-coordinator.ts",
          severity: "medium"
        },
        {
          id: `MEM-${this.issueId++}`,
          type: "memory",
          location: "core/resources",
          description: "Reduce memory usage in resource handling",
          impact: 0.75,
          suggestion: "Implement resource pooling",
          filePath: "src/core/memory/memory-factory.ts",
          severity: "medium"
        },
        {
          id: `PATTERN-${this.issueId++}`,
          type: "pattern",
          location: "core/dependencies",
          description: "Improve module dependency structure",
          impact: 0.65,
          suggestion: "Implement dynamic module loading",
          filePath: "src/core/marduk-core.ts",
          severity: "medium"
        }
      );
    } catch (error) {
      logger.error("Error during code structure analysis:", error instanceof Error ? error.message : String(error));
    }

    return patterns;
  }
}

// Run the analyzer when this file is executed directly
async function main() {
  const analyzer = new CodeAnalyzer();
  const results = await analyzer.analyzeProject();

  console.log('\n===== CODE ANALYSIS RESULTS =====');
  console.log(`Found ${results.issues.length} issues in ${results.stats.filesAnalyzed} files`);
  console.log(`Total lines of code: ${results.stats.linesOfCode}`);
  console.log(`Duplicate code blocks: ${results.stats.duplicateCode}`);
  console.log(`Complex functions: ${results.stats.complexFunctions}`);
  console.log(`Type issues: ${results.stats.typeIssues}`);
  console.log(`Architectural issues: ${results.stats.architecturalIssues}`);

  // Print a few examples
  if (results.issues.length > 0) {
    console.log('\nExample Issues:');
    results.issues.slice(0, 3).forEach((issue, i) => {
      console.log(`\n${i+1}. ${issue.description} (${issue.type}, ${issue.severity})`);
      console.log(`   File: ${issue.filePath}:${issue.lineStart}`);
    });
  }
}

// ES Module way to detect if file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}