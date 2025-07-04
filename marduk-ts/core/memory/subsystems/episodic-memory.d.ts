import { BaseMemorySubsystem } from '../base/memory-subsystem.js';
import { TaskMessage } from '../../types/messages.js';
import { MemoryItem, MemoryQuery } from '../types/memory-types.js';
export declare class EpisodicMemory extends BaseMemorySubsystem {
    constructor();
    private initializeMemory;
    protected handleMessage(message: TaskMessage): Promise<void>;
    protected matchesQuery(item: MemoryItem, query: MemoryQuery): boolean;
    private formatEvents;
    addEvent(description: string, context?: string): Promise<void>;
    private extractTags;
}
//# sourceMappingURL=episodic-memory.d.ts.map