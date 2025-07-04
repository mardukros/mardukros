
import { CodeAnalyzer } from "./code-analyzer.js";
import { CodeOptimizer, OptimizationResult, CodePattern } from "./code-optimizer.js";
import { logger } from "../utils/logger.js";

export interface AnalysisIssue {
  type: string;
  message: string;
  file: string;
  line?: number;
  code?: string;
  solution?: string;
}

export interface AnalysisResult {
  issues: AnalysisIssue[];
}

export interface RewriteResult {
  patterns: CodePattern[];
  optimizations: OptimizationResult[];
  metrics: {
    performanceImprovement: number;
    memoryOptimization: number;
    complexityReduction: number;
  };
}

export class SelfRewriter {
  private analyzer: CodeAnalyzer;
  private optimizer: CodeOptimizer;
  private lastRewrite: number = 0;
  private readonly REWRITE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.analyzer = new CodeAnalyzer();
    this.optimizer = new CodeOptimizer();
  }

  async analyze(): Promise<CodePattern[]> {
    const analysisResult = await this.analyzer.analyzeProject();
    
    // Convert analysis issues to code patterns
    return analysisResult.issues.map((issue, index) => {
      // Handle property names as they may come from different sources
      const type = issue.type || 'type_issue';
      const description = 'description' in issue ? issue.description : 
                         'message' in issue ? (issue as any).message : 
                         'Code issue detected';
      
      const filePath = 'filePath' in issue ? issue.filePath : 
                      'file' in issue ? (issue as any).file : 
                      '';
                      
      const lineStart = 'lineStart' in issue ? issue.lineStart : 
                       'line' in issue ? (issue as any).line : 
                       0;
                       
      const lineEnd = 'lineEnd' in issue ? issue.lineEnd : 
                     (lineStart + (('codeFragment' in issue && issue.codeFragment) ? 
                                 issue.codeFragment.split('\n').length - 1 : 0));
                     
      const codeFragment = 'codeFragment' in issue ? issue.codeFragment : 
                          'code' in issue ? (issue as any).code : 
                          '';
                          
      const suggestedFix = 'suggestedFix' in issue ? issue.suggestedFix : 
                          'solution' in issue ? (issue as any).solution : 
                          '';
      
      return {
        id: `pattern-${index}`,
        type: this.mapIssueTypeToPatternType(type),
        description,
        filePath,
        lineStart,
        lineEnd,
        severity: this.mapIssueTypeToSeverity(type),
        impact: this.calculateImpact(type),
        codeFragment,
        suggestedFix,
        location: filePath
      };
    });
  }
  
  private calculateImpact(issueType: string): number {
    switch (issueType) {
      case 'error': return 0.8;
      case 'warning': return 0.5;
      case 'info': return 0.3;
      default: return 0.4;
    }
  }
  
  private mapIssueTypeToPatternType(issueType: string): CodePattern['type'] {
    switch (issueType) {
      case 'error': return 'inefficiency';
      case 'warning': return 'complexity';
      case 'info': return 'redundancy';
      default: return 'type_issue';
    }
  }
  
  private mapIssueTypeToSeverity(issueType: string): CodePattern['severity'] {
    switch (issueType) {
      case 'error': return 'high';
      case 'warning': return 'medium';
      case 'info': return 'low';
      default: return 'low';
    }
  }

  async rewrite(): Promise<RewriteResult> {
    try {
      logger.info("Starting system self-rewrite analysis");

      // Analyze current system state
      const patterns = await this.analyze();

      // Apply optimizations
      const optimizations = await this.optimizer.optimizeSystem(patterns);

      // Calculate improvement metrics
      const metrics = this.calculateMetrics(optimizations);

      const result: RewriteResult = {
        patterns,
        optimizations,
        metrics,
      };

      this.lastRewrite = Date.now();
      logger.info("System self-rewrite completed", { metrics });

      return result;
    } catch (error) {
      logger.error("Error during system self-rewrite:", error instanceof Error ? error : String(error));
      throw error;
    }
  }

  private calculateMetrics(
    optimizations: OptimizationResult[],
  ): RewriteResult["metrics"] {
    const successfulOpts = optimizations.filter(
      (opt) => opt.success && opt.metrics,
    );

    if (successfulOpts.length === 0) {
      return {
        performanceImprovement: 0,
        memoryOptimization: 0,
        complexityReduction: 0,
      };
    }

    return {
      performanceImprovement: this.calculateAverageMetric(
        successfulOpts,
        "performance",
      ),
      memoryOptimization: this.calculateAverageMetric(successfulOpts, "memory"),
      complexityReduction:
        1 - this.calculateAverageMetric(successfulOpts, "complexity"),
    };
  }

  private calculateAverageMetric(
    optimizations: OptimizationResult[],
    metric: string,
  ): number {
    const values = optimizations
      .map((opt) => opt.metrics?.[metric as keyof typeof opt.metrics])
      .filter(
        (val): val is number => val !== undefined && typeof val === "number",
      );

    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  shouldRewrite(): boolean {
    return Date.now() - this.lastRewrite >= this.REWRITE_INTERVAL;
  }
}
