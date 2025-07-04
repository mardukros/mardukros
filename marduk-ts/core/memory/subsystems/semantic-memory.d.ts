import { BaseMemorySubsystem } from '../base/memory-subsystem.js';
import { TaskMessage } from '../../types/messages.js';
import { MemoryItem, MemoryQuery } from '../types/memory-types.js';
export declare class SemanticMemory extends BaseMemorySubsystem {
    constructor();
    private initializeMemory;
    protected handleMessage(message: TaskMessage): Promise<void>;
    protected matchesQuery(item: MemoryItem, query: MemoryQuery): boolean;
    private findRelationships;
    private findConcepts;
    addConcept(name: string, description: string, category: string[]): Promise<void>;
    addRelationship(sourceConcept: string, targetConcept: string, relationType: string, strength: number): Promise<void>;
}
//# sourceMappingURL=semantic-memory.d.ts.map