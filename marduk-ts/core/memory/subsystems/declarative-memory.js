import { BaseMemorySubsystem } from '../base/memory-subsystem.js';
export class DeclarativeMemory extends BaseMemorySubsystem {
    constructor() {
        super('declarative_memory', {
            capacity: 10000,
            persistence: true,
            indexing: ['type', 'tags']
        });
        this.initializeMemory();
    }
    async initializeMemory() {
        await this.store({
            id: 'fact:chaos-theory',
            type: 'fact',
            content: 'Chaos theory studies the behavior of dynamical systems that are highly sensitive to initial conditions.',
            metadata: {
                tags: ['chaos-theory', 'mathematics', 'systems'],
                confidence: 0.95,
                lastAccessed: Date.now(),
                source: 'academic-research'
            }
        });
        await this.store({
            id: 'fact:dynamic-systems',
            type: 'fact',
            content: 'Dynamic systems are mathematical models that describe the behavior of complex systems over time.',
            metadata: {
                tags: ['dynamic-systems', 'mathematics', 'modeling'],
                confidence: 0.9,
                lastAccessed: Date.now(),
                source: 'academic-research'
            }
        });
    }
    async handleMessage(message) {
        if (message.type === 'task' && message.query.includes('fact')) {
            const query = {
                type: 'fact',
                term: message.query,
                filters: { confidence: { min: 0.8 } }
            };
            const response = await this.query(query);
            this.sendResponse(message.task_id, response.items.map(item => item.content));
        }
    }
    matchesQuery(item, query) {
        const memoryItem = item;
        const searchTerm = query.term.toLowerCase();
        // Check content match
        if (memoryItem.content.toLowerCase().includes(searchTerm)) {
            return true;
        }
        // Check tags match
        if (memoryItem.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=declarative-memory.js.map