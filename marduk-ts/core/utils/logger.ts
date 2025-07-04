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
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: env.logging.level,
      format: combine(
        timestamp(),
        customFormat
      ),
      transports: [
        new winston.transports.File({ 
          filename: env.logging.file,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
          tailable: true
        }),
        new winston.transports.Console({
          format: combine(
            colorize(),
            customFormat
          )
        })
      ]
    });
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, metadata: object = {}): void {
    this.logger.info(message, metadata);
  }

  warn(message: string, metadata: object = {}): void {
    this.logger.warn(message, metadata);
  }

  error(message: string, error?: Error, metadata: object = {}): void {
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

  debug(message: string, metadata: object = {}): void {
    this.logger.debug(message, metadata);
  }

  async rotateLog(): Promise<void> {
    this.info('Log rotation initiated');
  }
}

export const logger = Logger.getInstance();