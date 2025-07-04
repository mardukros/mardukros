import { MemoryMonitor } from './utils/memory-monitor.js';
export declare class MemorySystemFactory {
    private static instance;
    private subsystems;
    private monitor;
    private constructor();
    static getInstance(): MemorySystemFactory;
    private initializeSubsystems;
    getSubsystem<T>(name: string): T;
    getMonitor(): MemoryMonitor;
    generateHealthReport(): Promise<string>;
    createSnapshot(): Promise<void>;
    cleanup(): Promise<void>;
}
//# sourceMappingURL=memory-factory.d.ts.map