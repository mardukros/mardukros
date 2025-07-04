import { BaseMemorySubsystem } from '../base/memory-subsystem.js';
import { TaskMessage } from '../../types/messages.js';
import { MemoryItem, MemoryQuery } from '../types/base-types.js';
export declare class ProceduralMemory extends BaseMemorySubsystem {
    constructor();
    private initializeMemory;
    protected handleMessage(message: TaskMessage): Promise<void>;
    protected matchesQuery(item: MemoryItem, query: MemoryQuery): boolean;
    private formatWorkflows;
    private formatSteps;
    addWorkflow(title: string, steps: string[], tags?: string[], prerequisites?: string[], estimatedDuration?: number): Promise<void>;
    private extractCategories;
    private calculateComplexity;
    updateSuccessRate(id: string, success: boolean): Promise<void>;
}
//# sourceMappingURL=procedural-memory.d.ts.map