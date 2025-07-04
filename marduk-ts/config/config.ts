import { env } from './env.js';

export const config = {
  ai: {
    openai: {
      model: env.openai.model,
      apiKey: env.openai.apiKey,
      organization: env.openai.organization,
      defaultTemperature: 0.7,
      defaultMaxTokens: 1000,
      contextLimit: 5
    }
  },
  memory: {
    paths: {
      dataDir: env.memory.dataDir,
      backupDir: env.memory.backupDir
    },
    optimization: {
      cleanupThreshold: 0.9,
      cleanupAmount: 0.1,
      indexingBatchSize: 1000,
      maxQueryResults: 100,
      persistenceInterval: 5 * 60 * 1000
    }
  },
  server: {
    port: env.server.port,
    host: env.server.host,
    websocket: {
      path: '/ws',
      heartbeatInterval: 30000
    }
  },
  logging: {
    level: env.logging.level,
    file: env.logging.file,
    maxSize: 5242880, // 5MB
    maxFiles: 5
  }
};

export default config;