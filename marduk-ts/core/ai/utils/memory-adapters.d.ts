/**
 * Memory subsystem adapters for the context source system
 * These adapters integrate the existing memory subsystems with the context sources framework
 */
import { ContextItem, ContextSource, MemorySubsystemAdapter } from './context-sources.js';
/**
 * Semantic memory subsystem adapter
 * Provides concept and relationship information from semantic memory
 */
export declare class SemanticMemoryAdapter extends MemorySubsystemAdapter {
    constructor();
    getContext(query: string, options?: any): Promise<ContextItem[]>;
}
/**
 * Declarative memory subsystem adapter
 * Provides factual knowledge from declarative memory
 */
export declare class DeclarativeMemoryAdapter extends MemorySubsystemAdapter {
    constructor();
    getContext(query: string, options?: any): Promise<ContextItem[]>;
}
/**
 * Episodic memory subsystem adapter
 * Provides event and experience information from episodic memory
 */
export declare class EpisodicMemoryAdapter extends MemorySubsystemAdapter {
    constructor();
    getContext(query: string, options?: any): Promise<ContextItem[]>;
}
/**
 * Procedural memory subsystem adapter
 * Provides workflow and process information from procedural memory
 */
export declare class ProceduralMemoryAdapter extends MemorySubsystemAdapter {
    constructor();
    getContext(query: string, options?: any): Promise<ContextItem[]>;
}
/**
 * User activity memory adapter
 * Provides information about recent user activity and interactions
 */
export declare class UserActivityAdapter implements ContextSource {
    private activities;
    constructor();
    recordActivity(description: string, type: string, tags?: string[]): void;
    getContext(query: string, options?: any): Promise<ContextItem[]>;
    getSourceType(): string;
    getPriority(): number;
}
//# sourceMappingURL=memory-adapters.d.ts.map