export interface ServerConfig {
  port: number;
  host: string;
  websocket: {
    path: string;
    heartbeatInterval: number;
  };
}

export interface MemoryConfig {
  paths: {
    dataDir: string;
    backupDir: string;
  };
  optimization: {
    cleanupThreshold: number;
    cleanupAmount: number;
    indexingBatchSize: number;
    maxQueryResults: number;
    persistenceInterval: number;
  };
}

export interface AiConfig {
  openai: {
    model: string;
    apiKey: string;
    organization?: string;
    defaultTemperature: number;
    defaultMaxTokens: number;
    contextLimit: number;
  };
}

export interface LoggingConfig {
  level: string;
  file: string;
  maxSize: number;
  maxFiles: number;
}

export interface AppConfig {
  server: ServerConfig;
  memory: MemoryConfig;
  ai: AiConfig;
  logging: LoggingConfig;
}