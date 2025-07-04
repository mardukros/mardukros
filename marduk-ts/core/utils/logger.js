import winston from 'winston';
import { env } from '../../config/env.js';
const { combine, timestamp, printf, colorize } = winston.format;
const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});
class Logger {
    static instance;
    logger;
    constructor() {
        this.logger = winston.createLogger({
            level: env.logging.level,
            format: combine(timestamp(), customFormat),
            transports: [
                new winston.transports.File({
                    filename: env.logging.file,
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                    tailable: true
                }),
                new winston.transports.Console({
                    format: combine(colorize(), customFormat)
                })
            ]
        });
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    info(message, metadata = {}) {
        this.logger.info(message, metadata);
    }
    warn(message, metadata = {}) {
        this.logger.warn(message, metadata);
    }
    error(message, error, metadata = {}) {
        const errorMetadata = error ? {
            ...metadata,
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            }
        } : metadata;
        this.logger.error(message, errorMetadata);
    }
    debug(message, metadata = {}) {
        this.logger.debug(message, metadata);
    }
    async rotateLog() {
        this.info('Log rotation initiated');
    }
}
export const logger = Logger.getInstance();
//# sourceMappingURL=logger.js.map