// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function

import winston from 'winston';
import { defaultEnv } from '../../config/env.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

/**
 * Enhanced logger for Marduk cognitive system
 * Singleton pattern ensures consistent logging behavior across all subsystems
 */
class Logger {
  private static instance: Logger;
  private logger: winston.Logger;

  private constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || defaultEnv.logging?.level || 'info',
      format: combine(
        timestamp(),
        errors({ stack: true }),
        customFormat
      ),
      transports: [
        new winston.transports.Console({
          format: combine(
            colorize(),
            customFormat
          )
        })
      ]
    });

    // Add file transport if logging file is specified
    if (defaultEnv.logging?.file) {
      this.logger.add(new winston.transports.File({ 
        filename: defaultEnv.logging.file,
        maxsize: 5242880,
        maxFiles: 5,
        tailable: true
      }));
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta || {});
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta || {});
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta || {});
  }

  error(message: string, error?: Error | unknown): void {
    if (error instanceof Error) {
      this.logger.error(message, { 
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      });
    } else if (error) {
      this.logger.error(message, { error: String(error) });
    } else {
      this.logger.error(message);
    }
  }

  async rotateLog(): Promise<void> {
    this.info('Log rotation initiated');
    // Implementation depends on selected logging backend
  }
  
  /**
   * Save log output to a file with timestamp
   * @param content The content to log to file
   * @param directory The directory to save the log file in
   * @param prefix Optional prefix for the log filename
   */
  async saveToFile(content: string, directory: string, prefix: string = 'log'): Promise<string> {
    try {
      // Ensure the directory exists
      const fs = await import('fs/promises');
      const path = await import('path');
      
      try {
        await fs.mkdir(directory, { recursive: true });
      } catch (err) {
        this.warn(`Failed to create directory ${directory}`, err);
      }
      
      // Create a timestamped filename
      const now = new Date();
      const timestamp = now.toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const filename = path.join(directory, `${prefix}-${timestamp}.log`);
      
      // Add header with metadata
      const header = [
        '='.repeat(80),
        `MARDUK COGNITIVE SYSTEM LOG - ${prefix.toUpperCase()}`,
        `TIMESTAMP: ${now.toISOString()}`,
        `CONFIGURATION: ${process.env.NODE_ENV || 'development'}`,
        '='.repeat(80),
        '',
        content
      ].join('\n');
      
      // Write the content to the file
      await fs.writeFile(filename, header);
      this.info(`Neural log archive saved to ${filename}`);
      return filename;
    } catch (error) {
      this.error(`Failed to save log to file in ${directory}`, error);
      return '';
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
