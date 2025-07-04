import { WebSocket } from 'ws';
import { TaskMessage } from '../../types/messages.js';
import { MemoryItem, MemoryQuery, MemoryResponse, MemoryConfig, MemorySubsystem } from '../types/memory-types.js';
export declare abstract class BaseMemorySubsystem implements MemorySubsystem {
    protected items: Map<string | number, MemoryItem>;
    protected config: MemoryConfig;
    protected ws: WebSocket;
    protected subsystemName: string;
    constructor(subsystemName: string, config?: MemoryConfig);
    protected setupWebSocket(): void;
    protected register(): void;
    protected abstract handleMessage(message: TaskMessage): void;
    protected sendResponse(taskId: number, result: unknown): void;
    query(query: MemoryQuery): Promise<MemoryResponse>;
    store(item: MemoryItem): Promise<void>;
    update(id: string | number, updates: Partial<MemoryItem>): Promise<void>;
    delete(id: string | number): Promise<void>;
    protected abstract matchesQuery(item: MemoryItem, query: MemoryQuery): boolean;
    protected cleanup(): Promise<void>;
}
//# sourceMappingURL=memory-subsystem.d.ts.map