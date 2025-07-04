import { calculateMemoryUsage } from './memory-cleanup.js';
import { memorySettings } from '../config.js';
export class MemoryMonitor {
    subsystems;
    lastCleanup = null;
    lastPersistence = null;
    stats = new Map();
    constructor(subsystems) {
        this.subsystems = subsystems;
    }
    getStats(subsystemName) {
        return this.stats.get(subsystemName) || null;
    }
    getAllStats() {
        return Object.fromEntries(this.stats.entries());
    }
    updateStats() {
        Object.entries(this.subsystems).forEach(([name, subsystem]) => {
            const itemCount = subsystem.items.size;
            const memoryUsage = calculateMemoryUsage(subsystem.items);
            const indexSize = this.calculateIndexSize(subsystem);
            const stats = {
                itemCount,
                memoryUsage,
                indexSize,
                lastCleanup: this.lastCleanup,
                lastPersistence: this.lastPersistence,
                healthStatus: this.calculateHealthStatus(itemCount, memoryUsage)
            };
            this.stats.set(name, stats);
        });
    }
    calculateIndexSize(subsystem) {
        // Estimate index size based on item count and average key size
        const avgKeySize = 32; // bytes
        return subsystem.items.size * avgKeySize;
    }
    calculateHealthStatus(itemCount, memoryUsage) {
        const memoryThreshold = memorySettings.cleanupThreshold;
        const criticalThreshold = 0.95;
        if (memoryUsage > criticalThreshold) {
            return 'critical';
        }
        if (memoryUsage > memoryThreshold) {
            return 'warning';
        }
        return 'healthy';
    }
    notifyCleanup() {
        this.lastCleanup = new Date();
    }
    notifyPersistence() {
        this.lastPersistence = new Date();
    }
    generateReport() {
        let report = '=== Memory System Health Report ===\n\n';
        this.stats.forEach((stats, subsystem) => {
            report += `${subsystem} Memory:\n`;
            report += `  Status: ${stats.healthStatus}\n`;
            report += `  Items: ${stats.itemCount}\n`;
            report += `  Memory Usage: ${(stats.memoryUsage / 1024 / 1024).toFixed(2)} MB\n`;
            report += `  Index Size: ${(stats.indexSize / 1024).toFixed(2)} KB\n`;
            if (stats.lastCleanup) {
                report += `  Last Cleanup: ${stats.lastCleanup.toISOString()}\n`;
            }
            if (stats.lastPersistence) {
                report += `  Last Persistence: ${stats.lastPersistence.toISOString()}\n`;
            }
            report += '\n';
        });
        return report;
    }
}
//# sourceMappingURL=memory-monitor.js.map