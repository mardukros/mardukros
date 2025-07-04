import { memoryConfigs } from './config.js';
import { DeclarativeMemory } from './subsystems/declarative-memory.js';
import { EpisodicMemory } from './subsystems/episodic-memory.js';
import { ProceduralMemory } from './subsystems/procedural-memory.js';
import { SemanticMemory } from './subsystems/semantic-memory.js';
import { MemoryMonitor } from './utils/memory-monitor.js';
export class MemorySystemFactory {
    static instance;
    subsystems = {};
    monitor;
    constructor() {
        this.initializeSubsystems();
        this.monitor = new MemoryMonitor(this.subsystems);
    }
    static getInstance() {
        if (!MemorySystemFactory.instance) {
            MemorySystemFactory.instance = new MemorySystemFactory();
        }
        return MemorySystemFactory.instance;
    }
    initializeSubsystems() {
        this.subsystems.declarative = new DeclarativeMemory();
        this.subsystems.episodic = new EpisodicMemory();
        this.subsystems.procedural = new ProceduralMemory();
        this.subsystems.semantic = new SemanticMemory();
    }
    getSubsystem(name) {
        if (!this.subsystems[name]) {
            throw new Error(`Memory subsystem '${name}' not found`);
        }
        return this.subsystems[name];
    }
    getMonitor() {
        return this.monitor;
    }
    async generateHealthReport() {
        this.monitor.updateStats();
        return this.monitor.generateReport();
    }
    async createSnapshot() {
        await Promise.all(Object.values(this.subsystems).map(subsystem => subsystem.createSnapshot()));
        this.monitor.notifyPersistence();
    }
    async cleanup() {
        await Promise.all(Object.entries(this.subsystems).map(([name, subsystem]) => {
            const config = memoryConfigs[name];
            if (config?.capacity) {
                return subsystem.cleanup(config.capacity);
            }
        }));
        this.monitor.notifyCleanup();
    }
}
//# sourceMappingURL=memory-factory.js.map