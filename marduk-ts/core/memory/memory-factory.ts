import { memoryConfigs } from './config.js';
import { DeclarativeMemory } from './subsystems/declarative-memory.js';
import { EpisodicMemory } from './subsystems/episodic-memory.js';
import { ProceduralMemory } from './subsystems/procedural-memory.js';
import { SemanticMemory } from './subsystems/semantic-memory.js';
import { MemoryMonitor } from './utils/memory-monitor.js';

export class MemorySystemFactory {
  private static instance: MemorySystemFactory;
  private subsystems: Record<string, any> = {};
  private monitor: MemoryMonitor;

  private constructor() {
    this.initializeSubsystems();
    this.monitor = new MemoryMonitor(this.subsystems);
  }

  static getInstance(): MemorySystemFactory {
    if (!MemorySystemFactory.instance) {
      MemorySystemFactory.instance = new MemorySystemFactory();
    }
    return MemorySystemFactory.instance;
  }

  private initializeSubsystems(): void {
    this.subsystems.declarative = new DeclarativeMemory();
    this.subsystems.episodic = new EpisodicMemory();
    this.subsystems.procedural = new ProceduralMemory();
    this.subsystems.semantic = new SemanticMemory();
  }

  getSubsystem<T>(name: string): T {
    if (!this.subsystems[name]) {
      throw new Error(`Memory subsystem '${name}' not found`);
    }
    return this.subsystems[name] as T;
  }

  getMonitor(): MemoryMonitor {
    return this.monitor;
  }

  async generateHealthReport(): Promise<string> {
    this.monitor.updateStats();
    return this.monitor.generateReport();
  }

  async createSnapshot(): Promise<void> {
    await Promise.all(
      Object.values(this.subsystems).map(subsystem => 
        subsystem.createSnapshot())
    );
    this.monitor.notifyPersistence();
  }

  async cleanup(): Promise<void> {
    await Promise.all(
      Object.entries(this.subsystems).map(([name, subsystem]) => {
        const config = memoryConfigs[name];
        if (config?.capacity) {
          return subsystem.cleanup(config.capacity);
        }
      })
    );
    this.monitor.notifyCleanup();
  }
}