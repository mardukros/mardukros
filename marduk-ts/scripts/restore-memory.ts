import { MemorySystemFactory } from '../core/memory/memory-factory.js';
import { logger } from '../core/utils/logger.js';
import { join } from 'path';
import { readFileSync, readdirSync } from 'fs';
import { env } from '../config/env.js';

async function restoreMemory(timestamp?: string): Promise<void> {
  const factory = MemorySystemFactory.getInstance();

  try {
    // If no timestamp provided, use latest backup
    if (!timestamp) {
      const backups = readdirSync(env.memory.backupDir)
        .filter(dir => /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/.test(dir))
        .sort()
        .reverse();

      if (backups.length === 0) {
        throw new Error('No backups found');
      }

      timestamp = backups[0];
    }

    const backupDir = join(env.memory.backupDir, timestamp);
    logger.info('Starting memory restoration', { timestamp });

    // Restore each subsystem
    for (const [name, subsystem] of Object.entries(factory.getSubsystems())) {
      const backupPath = join(backupDir, `${name}.json`);
      const data = JSON.parse(readFileSync(backupPath, 'utf8'));
      
      subsystem.items.clear();
      data.forEach(([id, item]) => subsystem.items.set(id, item));
      
      logger.info(`Restored ${name} memory subsystem`, { 
        items: data.length 
      });
    }

    // Verify restoration
    const monitor = factory.getMonitor();
    monitor.updateStats();
    const report = monitor.generateReport();
    logger.info('Memory restoration completed', { report });

  } catch (error) {
    logger.error('Error during memory restoration', error as Error);
    process.exit(1);
  }
}

// Run restore if called directly
if (require.main === module) {
  const timestamp = process.argv[2];
  restoreMemory(timestamp).catch(error => {
    logger.error('Fatal error during memory restoration', error as Error);
    process.exit(1);
  });
}

export { restoreMemory };