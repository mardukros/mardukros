import { BaseMemorySubsystem } from '../base/memory-subsystem.js';
import { TaskMessage } from '../../types/messages.js';
import { MemoryItem, MemoryQuery } from '../types/memory-types.js';
export declare class DeclarativeMemory extends BaseMemorySubsystem {
    constructor();
    private initializeMemory;
    protected handleMessage(message: TaskMessage): Promise<void>;
    protected matchesQuery(item: MemoryItem, query: MemoryQuery): boolean;
}
//# sourceMappingURL=declarative-memory.d.ts.map