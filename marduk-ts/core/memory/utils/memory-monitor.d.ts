import { MemoryItem } from '../types/base-types.js';
export interface MemoryStats {
    itemCount: number;
    memoryUsage: number;
    indexSize: number;
    lastCleanup: Date | null;
    lastPersistence: Date | null;
    healthStatus: 'healthy' | 'warning' | 'critical';
}
export declare class MemoryMonitor {
    private subsystems;
    private lastCleanup;
    private lastPersistence;
    private stats;
    constructor(subsystems: Record<string, {
        items: Map<string | number, MemoryItem>;
    }>);
    getStats(subsystemName: string): MemoryStats | null;
    getAllStats(): Record<string, MemoryStats>;
    updateStats(): void;
    private calculateIndexSize;
    private calculateHealthStatus;
    notifyCleanup(): void;
    notifyPersistence(): void;
    generateReport(): string;
}
//# sourceMappingURL=memory-monitor.d.ts.map