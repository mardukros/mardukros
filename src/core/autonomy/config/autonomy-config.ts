export interface AutonomyConfig {
  analysis: {
    minImpactThreshold: number;
    maxPatternsPerRun: number;
    analysisTimeout: number;
  };
  optimization: {
    minSuccessRate: number;
    maxRetries: number;
    optimizationTimeout: number;
  };
  scheduling: {
    checkInterval: number;
    rewriteInterval: number;
    maxConcurrentOptimizations: number;
  };
}

export const defaultConfig: AutonomyConfig = {
  analysis: {
    minImpactThreshold: 0.5,
    maxPatternsPerRun: 100,
    analysisTimeout: 30000 // 30 seconds
  },
  optimization: {
    minSuccessRate: 0.7,
    maxRetries: 3,
    optimizationTimeout: 60000 // 1 minute
  },
  scheduling: {
    checkInterval: 60 * 60 * 1000, // 1 hour
    rewriteInterval: 24 * 60 * 60 * 1000, // 24 hours
    maxConcurrentOptimizations: 5
  }
};

export class AutonomyConfigManager {
  private static instance: AutonomyConfigManager;
  private config: AutonomyConfig;

  private constructor() {
    this.config = { ...defaultConfig };
  }

  static getInstance(): AutonomyConfigManager {
    if (!AutonomyConfigManager.instance) {
      AutonomyConfigManager.instance = new AutonomyConfigManager();
    }
    return AutonomyConfigManager.instance;
  }

  getConfig(): AutonomyConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AutonomyConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
      analysis: { ...this.config.analysis, ...updates.analysis },
      optimization: { ...this.config.optimization, ...updates.optimization },
      scheduling: { ...this.config.scheduling, ...updates.scheduling }
    };
  }
}