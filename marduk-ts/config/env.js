import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();
export const env = {
    openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4-1106-preview',
        organization: process.env.OPENAI_ORG_ID
    },
    server: {
        port: parseInt(process.env.PORT || '8080', 10),
        host: process.env.HOST || 'localhost'
    },
    memory: {
        dataDir: process.env.MEMORY_DATA_DIR || './data/memory',
        backupDir: process.env.MEMORY_BACKUP_DIR || './data/backups'
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || './logs/marduk.log'
    }
};
export function validateEnv() {
    const requiredVars = ['OPENAI_API_KEY'];
    const missing = requiredVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
}
export function loadEnv() {
    validateEnv();
}
//# sourceMappingURL=env.js.map