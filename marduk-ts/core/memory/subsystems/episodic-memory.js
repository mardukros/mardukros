import { BaseMemorySubsystem } from '../base/memory-subsystem.js';
export class EpisodicMemory extends BaseMemorySubsystem {
    constructor() {
        super('episodic_memory', {
            capacity: 5000,
            persistence: true,
            indexing: ['type', 'timestamp', 'tags']
        });
        this.initializeMemory();
    }
    async initializeMemory() {
        await this.store({
            id: 'event:experiment-a-completion',
            type: 'event',
            content: {
                description: "Experiment A completed successfully",
                timestamp: "2024-12-10T12:00:00Z",
                context: "Research Phase 1",
                actors: ["Research Team A"],
                location: "Lab 1"
            },
            metadata: {
                importance: 0.8,
                lastAccessed: Date.now(),
                tags: ['experiment', 'success', 'research'],
                emotionalValence: 0.7
            }
        });
        await this.store({
            id: 'event:bug-identification',
            type: 'event',
            content: {
                description: "Bug identified in Chaos Module",
                timestamp: "2024-12-11T09:30:00Z",
                context: "System Maintenance",
                actors: ["QA Team", "Development Team"],
                location: "Development Environment"
            },
            metadata: {
                importance: 0.9,
                lastAccessed: Date.now(),
                tags: ['bug', 'chaos-module', 'maintenance'],
                emotionalValence: -0.3
            }
        });
    }
    async handleMessage(message) {
        if (message.type === 'task') {
            if (message.query.includes('event')) {
                const query = {
                    type: 'event',
                    term: message.query,
                    filters: { importance: { min: 0.7 } }
                };
                const response = await this.query(query);
                this.sendResponse(message.task_id, this.formatEvents(response.items));
            }
            else if (message.query.includes('experience')) {
                const query = {
                    type: 'experience',
                    term: message.query
                };
                const response = await this.query(query);
                this.sendResponse(message.task_id, this.formatEvents(response.items));
            }
        }
    }
    matchesQuery(item, query) {
        const memoryItem = item;
        const searchTerm = query.term.toLowerCase();
        // Check description match
        if (memoryItem.content.description.toLowerCase().includes(searchTerm)) {
            return true;
        }
        // Check context match
        if (memoryItem.content.context?.toLowerCase().includes(searchTerm)) {
            return true;
        }
        // Check actors match
        if (memoryItem.content.actors?.some(actor => actor.toLowerCase().includes(searchTerm))) {
            return true;
        }
        // Check tags match
        if (memoryItem.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
            return true;
        }
        return false;
    }
    formatEvents(events) {
        return events.map(event => {
            let formatted = `[${event.content.timestamp}] ${event.content.description}`;
            if (event.content.context) {
                formatted += ` (Context: ${event.content.context})`;
            }
            if (event.metadata.importance > 0.8) {
                formatted += ' [High Importance]';
            }
            return formatted;
        });
    }
    // Additional methods for episodic memory specific functionality
    async addEvent(description, context) {
        const event = {
            id: `event:${Date.now()}`,
            type: 'event',
            content: {
                description,
                timestamp: new Date().toISOString(),
                context
            },
            metadata: {
                importance: 0.5, // Default importance
                lastAccessed: Date.now(),
                tags: this.extractTags(description)
            }
        };
        await this.store(event);
    }
    extractTags(text) {
        // Simple tag extraction based on common keywords
        const keywords = ['experiment', 'bug', 'success', 'failure', 'research', 'maintenance'];
        return keywords.filter(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
    }
}
//# sourceMappingURL=episodic-memory.js.map