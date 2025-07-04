
/**
 * Environment configuration for the Marduk system
 */

// Default environment values
export const defaultEnv = {
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
  PORT: 3000,
  MEMORY_STORAGE: 'in-memory',
  OPTIMIZATION_INTERVAL: 3600000, // 1 hour
  MAX_MEMORY_ITEMS: 10000,
  logging: {
    level: 'info',
    file: 'logs/marduk.log'
  }
};

// Export environment with fallbacks to defaults
export const env = {
  NODE_ENV: process.env.NODE_ENV || defaultEnv.NODE_ENV,
  LOG_LEVEL: process.env.LOG_LEVEL || defaultEnv.LOG_LEVEL,
  PORT: parseInt(process.env.PORT || String(defaultEnv.PORT), 10),
  MEMORY_STORAGE: process.env.MEMORY_STORAGE || defaultEnv.MEMORY_STORAGE,
  OPTIMIZATION_INTERVAL: parseInt(process.env.OPTIMIZATION_INTERVAL || String(defaultEnv.OPTIMIZATION_INTERVAL), 10),
  MAX_MEMORY_ITEMS: parseInt(process.env.MAX_MEMORY_ITEMS || String(defaultEnv.MAX_MEMORY_ITEMS), 10),
};

/**
 * Load environment variables
 */
export function loadEnv(): void {
  // This function could be expanded to load from .env files
  // or validate environment configuration
  
  // For now, just return the already loaded env
  return;
}
