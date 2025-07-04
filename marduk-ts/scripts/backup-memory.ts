```typescript
import { MemorySystemFactory } from '../core/memory/memory-factory.js';
import { logger } from '../core/utils/logger.js';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import { env } from '../config/env.js';

async function backupMemory(): Promise<void> {
  const factory = MemorySystemFactory.getInstance();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join(env.memory.backupDir, timestamp);

  try {
    logger.info('Starting memory backup', { timestamp });
    mkdirSync(backupDir, { recursive: true });

    // Backup each subsystem
    for (const [name, subsystem] of Object.entries(factory.getSubsystems())) {
      const backupPath = join(backupDir, `${name}.json`);
      const data = Array.from(subsystem.items.entries());
      
      writeFileSync(backupPath, JSON.stringify(data, null, 2));
      logger.info(`Backed up ${name} memory subsystem`, { 
        items: data.length,
        path: backupPath 
      });
    }

    // Backup system state
    const monitor = factory.getMonitor();
    monitor.updateStats();
    const statsPath = join(backupDir, 'stats.json');
    writeFileSync(statsPath, JSON.stringify(monitor.getAllStats(), null, 2));

    logger.info('Memory backup completed successfully', { backupDir });

  } catch (error) {
    logger.error('Error during memory backup', error as Error);
    process.exit(1);
  }
}

// Run backup if called directly
if (require.main === module) {
  backupMemory().catch(error => {
    logger.error('Fatal error during memory backup', error as Error);
    process.exit(1);
  });
}

export { backupMemory };
```