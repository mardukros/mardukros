```typescript
import { MemorySystemFactory } from '../core/memory/memory-factory.js';
import { MemoryOptimizer } from '../core/memory/utils/memory-optimization.js';
import { logger } from '../core/utils/logger.js';

async function optimizeMemory(): Promise<void> {
  const factory = MemorySystemFactory.getInstance();
  const optimizer = new MemoryOptimizer();
  const monitor = factory.getMonitor();

  try {
    logger.info('Starting memory optimization');
    monitor.updateStats();
    const stats = monitor.getAllStats();

    // Optimize each subsystem
    for (const [name, subsystem] of Object.entries(factory.getSubsystems())) {
      logger.info(`Optimizing ${name} memory subsystem`);
      const subsystemStats = stats[name];

      if (subsystemStats.healthStatus !== 'healthy') {
        await optimizer.optimizeMemory(
          subsystem.items,
          subsystem.config.capacity,
          subsystemStats
        );
      }
    }

    // Generate and log optimization report
    monitor.updateStats();
    const report = monitor.generateReport();
    logger.info('Memory optimization completed', { report });

  } catch (error) {
    logger.error('Error during memory optimization', error as Error);
    process.exit(1);
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeMemory().catch(error => {
    logger.error('Fatal error during memory optimization', error as Error);
    process.exit(1);
  });
}

export { optimizeMemory };
```