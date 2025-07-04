import { WebSocket } from 'ws';
export class BaseMemorySubsystem {
    items = new Map();
    config;
    ws;
    subsystemName;
    constructor(subsystemName, config = {}) {
        this.subsystemName = subsystemName;
        this.config = {
            capacity: 1000,
            persistence: false,
            indexing: [],
            ...config
        };
        this.ws = new WebSocket('ws://localhost:8080');
        this.setupWebSocket();
    }
    setupWebSocket() {
        this.ws.on('open', () => {
            console.log(`${this.subsystemName} connected to WebSocket server`);
            this.register();
        });
        this.ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleMessage(message);
            }
            catch (error) {
                console.error(`Error processing message in ${this.subsystemName}:`, error);
            }
        });
    }
    register() {
        this.ws.send(JSON.stringify({
            type: "register",
            subsystem: this.subsystemName
        }));
    }
    sendResponse(taskId, result) {
        const response = {
            type: "response",
            subsystem: this.subsystemName,
            task_id: taskId,
            result
        };
        this.ws.send(JSON.stringify(response));
    }
    // MemorySubsystem interface implementation
    async query(query) {
        const items = Array.from(this.items.values())
            .filter(item => this.matchesQuery(item, query));
        return {
            items,
            metadata: { total: items.length }
        };
    }
    async store(item) {
        if (this.items.size >= (this.config.capacity || 1000)) {
            await this.cleanup();
        }
        this.items.set(item.id, item);
    }
    async update(id, updates) {
        const item = this.items.get(id);
        if (item) {
            this.items.set(id, { ...item, ...updates });
        }
    }
    async delete(id) {
        this.items.delete(id);
    }
    async cleanup() {
        // Implement cleanup strategy (e.g., LRU, priority-based)
        const itemsArray = Array.from(this.items.entries());
        itemsArray.sort((a, b) => {
            const aAccessed = a[1].metadata?.lastAccessed || 0;
            const bAccessed = b[1].metadata?.lastAccessed || 0;
            return aAccessed - bAccessed;
        });
        // Remove oldest 10% of items
        const removeCount = Math.floor(this.items.size * 0.1);
        itemsArray.slice(0, removeCount).forEach(([id]) => this.items.delete(id));
    }
}
//# sourceMappingURL=memory-subsystem.js.map