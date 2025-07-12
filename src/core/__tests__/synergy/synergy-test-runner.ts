/**
 * Synergy Test Runner
 * 
 * Orchestrates comprehensive multi-kernel synergy testing with reporting and visualization.
 * Provides CLI interface and automated test execution with coverage analysis.
 */

import { SynergyTestFramework } from './synergy-test-framework.js';
import { CoverageReporter, ScenarioVisualizer } from './visualization-reporter.js';
import * as fs from 'fs';
import * as path from 'path';

interface TestRunConfiguration {
  scenarios: string[];
  iterations: number;
  outputDir: string;
  generateVisualizations: boolean;
  exportFormats: ('json' | 'html' | 'markdown')[];
  verbose: boolean;
}

interface TestRunResult {
  success: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionTime: number;
  coverageAnalysis: any;
  workflowResults: any[];
  reportPaths: string[];
}

/**
 * Main test runner for synergy tests
 */
class SynergyTestRunner {
  private framework: SynergyTestFramework;
  private reporter: CoverageReporter;
  private visualizer: ScenarioVisualizer;

  constructor() {
    this.framework = new SynergyTestFramework();
    this.reporter = new CoverageReporter();
    this.visualizer = new ScenarioVisualizer();
  }

  /**
   * Run comprehensive synergy test suite
   */
  async runSynergyTests(config: TestRunConfiguration): Promise<TestRunResult> {
    const startTime = Date.now();
    const workflowResults: any[] = [];
    let passedTests = 0;
    let failedTests = 0;

    console.log('🧠 Starting Multi-Kernel Synergy Tests...');
    console.log(`📊 Configuration: ${JSON.stringify(config, null, 2)}`);

    try {
      // Ensure output directory exists
      if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
      }

      // Run initial coverage analysis
      const initialCoverage = this.framework.analyzeTestCoverage();
      console.log(`📈 Initial Coverage: ${(initialCoverage.kernelInteractions.coverage * 100).toFixed(1)}% kernel interactions, ${(initialCoverage.workflowCoverage.coverage * 100).toFixed(1)}% workflows`);

      // Execute test scenarios
      for (let iteration = 0; iteration < config.iterations; iteration++) {
        console.log(`\n🔄 Iteration ${iteration + 1}/${config.iterations}`);
        
        for (const scenario of config.scenarios) {
          try {
            console.log(`  🎯 Running scenario: ${scenario}`);
            const result = await this.executeTestScenario(scenario, iteration);
            
            result.workflowName = scenario;
            result.iteration = iteration;
            workflowResults.push(result);
            
            if (result.success) {
              passedTests++;
              console.log(`    ✅ Passed (${result.executionTime}ms)`);
            } else {
              failedTests++;
              console.log(`    ❌ Failed (${result.executionTime}ms)`);
            }

            if (config.verbose && result.synergyEffects) {
              console.log(`    🔗 Synergy Effects:`);
              Object.entries(result.synergyEffects).forEach(([key, value]) => {
                console.log(`      ${key}: ${typeof value === 'number' ? value.toFixed(3) : value}`);
              });
            }

            if (config.verbose && result.emergentBehaviors?.length > 0) {
              console.log(`    🌟 Emergent Behaviors: ${result.emergentBehaviors.length}`);
              result.emergentBehaviors.forEach((behavior: any) => {
                console.log(`      ${behavior.type} (strength: ${behavior.strength.toFixed(2)})`);
              });
            }

          } catch (error) {
            failedTests++;
            console.log(`    ❌ Error: ${error.message}`);
            workflowResults.push({
              workflowName: scenario,
              iteration: iteration,
              success: false,
              error: error.message,
              executionTime: 0
            });
          }
        }
      }

      // Final coverage analysis
      const finalCoverage = this.framework.analyzeTestCoverage();
      console.log(`\n📊 Final Coverage Analysis:`);
      console.log(`  Kernel Interactions: ${(finalCoverage.kernelInteractions.coverage * 100).toFixed(1)}%`);
      console.log(`  Workflows: ${(finalCoverage.workflowCoverage.coverage * 100).toFixed(1)}%`);
      console.log(`  Emergent Behaviors: ${(finalCoverage.emergentBehaviorCoverage.coverage * 100).toFixed(1)}%`);
      console.log(`  Recommendations: ${finalCoverage.recommendations.length}`);

      // Generate reports
      const reportPaths = await this.generateReports(
        finalCoverage, workflowResults, config
      );

      const executionTime = Date.now() - startTime;
      const totalTests = passedTests + failedTests;

      console.log(`\n🎉 Test Suite Completed in ${executionTime}ms`);
      console.log(`📈 Results: ${passedTests}/${totalTests} passed (${((passedTests/totalTests) * 100).toFixed(1)}%)`);
      console.log(`📝 Reports generated: ${reportPaths.join(', ')}`);

      return {
        success: failedTests === 0,
        totalTests: totalTests,
        passedTests: passedTests,
        failedTests: failedTests,
        executionTime: executionTime,
        coverageAnalysis: finalCoverage,
        workflowResults: workflowResults,
        reportPaths: reportPaths
      };

    } catch (error) {
      console.error(`💥 Test suite failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute a specific test scenario
   */
  private async executeTestScenario(scenario: string, iteration: number): Promise<any> {
    const testInputs = this.generateTestInputs(scenario, iteration);
    
    const startTime = Date.now();
    const result = await this.framework.executeWorkflow(scenario, testInputs);
    const endTime = Date.now();

    return {
      ...result,
      executionTime: endTime - startTime,
      startTime: startTime,
      endTime: endTime
    };
  }

  /**
   * Generate test inputs for scenarios
   */
  private generateTestInputs(scenario: string, iteration: number): any {
    const baseInputs = {
      'complex-reasoning': {
        problem: this.generateReasoningProblem(iteration),
        complexity: iteration % 2 === 0 ? 'high' : 'medium',
        constraints: this.generateConstraints(iteration)
      },
      'adaptive-learning': {
        experiences: this.generateLearningExperiences(iteration)
      },
      'attention-memory-fusion': {
        query: this.generateFusionQuery(iteration),
        depth: Math.min(5, 2 + iteration),
        maxIterations: Math.min(8, 3 + iteration)
      },
      'error-recovery': {
        errorType: this.generateErrorType(iteration),
        severity: iteration % 3 === 0 ? 'high' : 'medium'
      }
    };

    return baseInputs[scenario] || {};
  }

  private generateReasoningProblem(iteration: number): string {
    const problems = [
      'Optimize resource allocation across distributed cognitive kernels',
      'Design fault-tolerant multi-agent coordination protocol',
      'Develop adaptive attention allocation strategy for dynamic environments',
      'Create emergent behavior detection algorithm for complex systems',
      'Implement self-modifying cognitive architecture with safety constraints'
    ];

    return problems[iteration % problems.length];
  }

  private generateConstraints(iteration: number): string[] {
    const constraintSets = [
      ['real_time', 'limited_compute'],
      ['fault_tolerance', 'energy_efficiency'],
      ['scalability', 'security'],
      ['adaptive_behavior', 'stability'],
      ['performance', 'interpretability']
    ];

    return constraintSets[iteration % constraintSets.length];
  }

  private generateLearningExperiences(iteration: number): any[] {
    const baseExperiences = [
      { type: 'success', context: 'kernel_coordination', outcome: 0.8 + (iteration * 0.02) },
      { type: 'failure', context: 'resource_contention', outcome: 0.3 - (iteration * 0.01) },
      { type: 'emergent', context: 'behavior_discovery', outcome: 0.7 + (iteration * 0.03) }
    ];

    // Add iteration-specific experiences
    if (iteration > 2) {
      baseExperiences.push({
        type: 'adaptation',
        context: 'learned_optimization',
        outcome: Math.min(0.95, 0.6 + (iteration * 0.05))
      });
    }

    return baseExperiences;
  }

  private generateFusionQuery(iteration: number): string {
    const queries = [
      'Analyze cross-kernel communication patterns',
      'Identify emergent cognitive behaviors',
      'Optimize attention-memory coordination',
      'Detect performance synergy opportunities',
      'Map kernel interaction dependencies'
    ];

    return queries[iteration % queries.length];
  }

  private generateErrorType(iteration: number): string {
    const errorTypes = ['memory-corruption', 'attention-overflow', 'reasoning-deadlock', 'learning-divergence'];
    return errorTypes[iteration % errorTypes.length];
  }

  /**
   * Generate comprehensive reports
   */
  private async generateReports(
    coverageAnalysis: any, 
    workflowResults: any[], 
    config: TestRunConfiguration
  ): Promise<string[]> {
    const reportPaths: string[] = [];

    // Generate coverage report
    const report = this.reporter.generateCoverageReport(coverageAnalysis, workflowResults);

    // Export in requested formats
    for (const format of config.exportFormats) {
      const filename = `synergy-coverage-report.${format}`;
      const filepath = path.join(config.outputDir, filename);
      const content = this.reporter.exportReport(report, format);
      
      fs.writeFileSync(filepath, content);
      reportPaths.push(filepath);
    }

    // Generate visualizations if requested
    if (config.generateVisualizations) {
      const visualizationPaths = await this.generateVisualizationFiles(
        workflowResults, config.outputDir
      );
      reportPaths.push(...visualizationPaths);
    }

    // Generate test recommendations
    const recommendationsPath = await this.generateRecommendationsFile(
      coverageAnalysis.recommendations, config.outputDir
    );
    reportPaths.push(recommendationsPath);

    return reportPaths;
  }

  /**
   * Generate visualization files
   */
  private async generateVisualizationFiles(
    workflowResults: any[], 
    outputDir: string
  ): Promise<string[]> {
    const paths: string[] = [];

    try {
      // Synergy network visualization
      const synergyViz = this.visualizer.generateSynergyVisualization({
        synergyEffects: this.aggregateSynergyEffects(workflowResults),
        emergentBehaviors: this.aggregateEmergentBehaviors(workflowResults),
        resourceEfficiency: this.aggregateResourceEfficiency(workflowResults),
        workflowResults: workflowResults
      });

      const synergyPath = path.join(outputDir, 'synergy-network.json');
      fs.writeFileSync(synergyPath, synergyViz);
      paths.push(synergyPath);

      // Workflow timeline
      const timelineViz = this.visualizer.generateWorkflowTimeline(workflowResults);
      const timelinePath = path.join(outputDir, 'workflow-timeline.json');
      fs.writeFileSync(timelinePath, timelineViz);
      paths.push(timelinePath);

      // Emergent behavior map
      const behaviorViz = this.visualizer.generateEmergentBehaviorVisualization(
        this.aggregateEmergentBehaviors(workflowResults)
      );
      const behaviorPath = path.join(outputDir, 'emergent-behaviors.json');
      fs.writeFileSync(behaviorPath, behaviorViz);
      paths.push(behaviorPath);

    } catch (error) {
      console.warn(`⚠️  Failed to generate some visualizations: ${error.message}`);
    }

    return paths;
  }

  /**
   * Generate test recommendations file
   */
  private async generateRecommendationsFile(
    recommendations: any[], 
    outputDir: string
  ): Promise<string> {
    const recommendationsData = {
      timestamp: new Date().toISOString(),
      totalRecommendations: recommendations.length,
      highPriority: recommendations.filter(r => r.priority === 'high').length,
      mediumPriority: recommendations.filter(r => r.priority === 'medium').length,
      lowPriority: recommendations.filter(r => r.priority === 'low').length,
      recommendations: recommendations,
      automatedTestGeneration: this.generateAutomatedTestCode(recommendations)
    };

    const filepath = path.join(outputDir, 'test-recommendations.json');
    fs.writeFileSync(filepath, JSON.stringify(recommendationsData, null, 2));
    
    return filepath;
  }

  /**
   * Generate automated test code for recommendations
   */
  private generateAutomatedTestCode(recommendations: any[]): string {
    const testCode = recommendations
      .filter(rec => rec.priority === 'high')
      .map(rec => this.generateTestCodeForRecommendation(rec))
      .join('\n\n');

    return `// Auto-generated test code based on synergy test recommendations
// Generated: ${new Date().toISOString()}

${testCode}`;
  }

  private generateTestCodeForRecommendation(recommendation: any): string {
    const testName = recommendation.gap.replace(/-/g, '_');
    
    return `describe('${recommendation.description}', () => {
  it('should ${recommendation.suggestedTest.toLowerCase()}', async () => {
    // TODO: Implement test for ${recommendation.gap}
    // Priority: ${recommendation.priority}
    // Type: ${recommendation.type}
    
    const synergyFramework = new SynergyTestFramework();
    
    // ${recommendation.suggestedTest}
    const result = await synergyFramework.executeWorkflow('${testName.replace('_', '-')}', {
      // Configure test inputs based on recommendation
    });
    
    expect(result.success).toBe(true);
    expect(result.synergyEffects).toBeDefined();
    expect(result.emergentBehaviors.length).toBeGreaterThan(0);
  });
});`;
  }

  // Helper methods for aggregating results
  private aggregateSynergyEffects(workflowResults: any[]): any {
    const allEffects = workflowResults
      .filter(r => r.synergyEffects)
      .map(r => r.synergyEffects);

    if (allEffects.length === 0) return {};

    const aggregated = {};
    const keys = Object.keys(allEffects[0]);

    for (const key of keys) {
      const values = allEffects.map(e => e[key] || 0);
      aggregated[key] = values.reduce((sum, v) => sum + v, 0) / values.length;
    }

    return aggregated;
  }

  private aggregateEmergentBehaviors(workflowResults: any[]): any[] {
    return workflowResults
      .filter(r => r.emergentBehaviors)
      .flatMap(r => r.emergentBehaviors);
  }

  private aggregateResourceEfficiency(workflowResults: any[]): any {
    const efficiencies = workflowResults
      .filter(r => r.resourceEfficiency)
      .map(r => r.resourceEfficiency);

    if (efficiencies.length === 0) return {};

    const aggregated = {};
    const keys = Object.keys(efficiencies[0]);

    for (const key of keys) {
      const values = efficiencies.map(e => e[key] || 0);
      aggregated[key] = values.reduce((sum, v) => sum + v, 0) / values.length;
    }

    return aggregated;
  }
}

/**
 * CLI interface for running synergy tests
 */
async function runSynergyTestsCLI(): Promise<void> {
  const config: TestRunConfiguration = {
    scenarios: [
      'complex-reasoning',
      'adaptive-learning', 
      'attention-memory-fusion',
      'error-recovery'
    ],
    iterations: 3,
    outputDir: './test-results/synergy',
    generateVisualizations: true,
    exportFormats: ['json', 'html', 'markdown'],
    verbose: true
  };

  const runner = new SynergyTestRunner();
  
  try {
    const result = await runner.runSynergyTests(config);
    
    console.log('\n📊 Test Summary:');
    console.log(`  Success Rate: ${((result.passedTests / result.totalTests) * 100).toFixed(1)}%`);
    console.log(`  Total Execution Time: ${(result.executionTime / 1000).toFixed(1)}s`);
    console.log(`  Coverage Gaps: ${result.coverageAnalysis.recommendations.length}`);
    console.log(`  Reports Generated: ${result.reportPaths.length}`);

    if (result.success) {
      console.log('\n🎉 All synergy tests passed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Some synergy tests failed. Check reports for details.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
    process.exit(1);
  }
}

// Export for programmatic use
export { SynergyTestRunner, TestRunConfiguration, TestRunResult };

// CLI execution
if (require.main === module) {
  runSynergyTestsCLI();
}