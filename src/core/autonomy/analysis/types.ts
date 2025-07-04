/**
 * Analysis result interface
 */
export interface AnalysisResult {
  patterns: CodePattern[];
  timestamp: string;
  executionTime: number;
}

/**
 * Memory pattern interface
 */
export interface MemoryPattern {
  id: string;
  type: 'memory';
  location: string;
  description: string;
  impact: number;
  suggestion: string;
  memorySubsystem: string;
}

// Type definition for pattern types
export type PatternType = 'memory' | 'performance' | 'pattern' | 'optimization' | 'complexity' | 'redundancy' | 'inefficiency' | 'type_issue' | 'architectural';

/**
 * Code pattern interface - unified to avoid type conflicts
 */
export interface CodePattern {
  type: PatternType;
  id: string;
  filePath: string;
  location: string;
  description: string;
  impact: number;
  lineStart: number;
  lineEnd: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestion?: string;
  codeFragment?: string;
  suggestedFix?: string;
}