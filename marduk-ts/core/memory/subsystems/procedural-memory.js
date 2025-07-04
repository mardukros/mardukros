import { BaseMemorySubsystem } from '../base/memory-subsystem.js';
export class ProceduralMemory extends BaseMemorySubsystem {
    constructor() {
        super('procedural_memory', {
            capacity: 5000,
            persistence: true,
            indexing: ['type', 'category', 'tags']
        });
        this.initializeMemory();
    }
    async initializeMemory() {
        await this.store({
            id: 'workflow:chaos-analysis',
            type: 'workflow',
            content: {
                title: 'Chaos Theory Analysis',
                steps: [
                    'Define research objectives',
                    'Collect system data',
                    'Identify initial conditions',
                    'Run simulations',
                    'Analyze sensitivity patterns',
                    'Document findings'
                ],
                tags: ['analysis', 'chaos-theory', 'research'],
                prerequisites: ['basic-mathematics', 'system-dynamics'],
                estimatedDuration: 120 // minutes
            },
            metadata: {
                successRate: 0.85,
                lastAccessed: Date.now(),
                category: ['research', 'analysis'],
                complexity: 4
            }
        });
        await this.store({
            id: 'workflow:bug-resolution',
            type: 'workflow',
            content: {
                title: 'Bug Resolution Process',
                steps: [
                    'Reproduce the issue',
                    'Analyze error logs',
                    'Identify root cause',
                    'Develop fix',
                    'Test solution',
                    'Document resolution',
                    'Deploy fix'
                ],
                tags: ['debugging', 'maintenance', 'quality'],
                prerequisites: ['debugging-tools', 'system-knowledge'],
                estimatedDuration: 90
            },
            metadata: {
                successRate: 0.92,
                lastAccessed: Date.now(),
                category: ['maintenance', 'quality-assurance'],
                complexity: 3
            }
        });
    }
    async handleMessage(message) {
        if (message.type === 'task') {
            if (message.query.includes('workflow')) {
                const query = {
                    type: 'workflow',
                    term: message.query,
                    filters: { complexity: { max: 4 } }
                };
                const response = await this.query(query);
                this.sendResponse(message.task_id, this.formatWorkflows(response.items));
            }
            else if (message.query.includes('steps')) {
                const query = {
                    type: 'workflow',
                    term: message.query
                };
                const response = await this.query(query);
                if (response.items.length > 0) {
                    const workflow = response.items[0];
                    this.sendResponse(message.task_id, this.formatSteps(workflow));
                }
                else {
                    this.sendResponse(message.task_id, []);
                }
            }
        }
    }
    matchesQuery(item, query) {
        const memoryItem = item;
        const searchTerm = query.term.toLowerCase();
        // Check title match
        if (memoryItem.content.title.toLowerCase().includes(searchTerm)) {
            return true;
        }
        // Check steps match
        if (memoryItem.content.steps.some(step => step.toLowerCase().includes(searchTerm))) {
            return true;
        }
        // Check tags match
        if (memoryItem.content.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) {
            return true;
        }
        // Check category match
        if (memoryItem.metadata.category.some(cat => cat.toLowerCase().includes(searchTerm))) {
            return true;
        }
        return false;
    }
    formatWorkflows(workflows) {
        return workflows.map(workflow => {
            let formatted = `${workflow.content.title}\n`;
            formatted += `Duration: ${workflow.content.estimatedDuration} minutes\n`;
            formatted += `Complexity: ${workflow.metadata.complexity}/5\n`;
            formatted += `Success Rate: ${(workflow.metadata.successRate || 0) * 100}%\n`;
            if (workflow.content.prerequisites?.length) {
                formatted += `Prerequisites: ${workflow.content.prerequisites.join(', ')}\n`;
            }
            formatted += 'Steps:\n';
            workflow.content.steps.forEach((step, index) => {
                formatted += `  ${index + 1}. ${step}\n`;
            });
            return formatted;
        });
    }
    formatSteps(workflow) {
        return workflow.content.steps.map((step, index) => `${index + 1}. ${step}`);
    }
    // Additional methods for procedural memory specific functionality
    async addWorkflow(title, steps, tags = [], prerequisites = [], estimatedDuration) {
        const workflow = {
            id: `workflow:${title.toLowerCase().replace(/\s+/g, '-')}`,
            type: 'workflow',
            content: {
                title,
                steps,
                tags,
                prerequisites,
                estimatedDuration
            },
            metadata: {
                successRate: 0.5, // Initial success rate
                lastAccessed: Date.now(),
                category: this.extractCategories(tags),
                complexity: this.calculateComplexity(steps, prerequisites)
            }
        };
        await this.store(workflow);
    }
    extractCategories(tags) {
        // Map common tags to categories
        const categoryMap = {
            'analysis': ['research', 'analysis'],
            'debugging': ['maintenance', 'quality-assurance'],
            'research': ['research', 'development'],
            'maintenance': ['maintenance', 'operations']
        };
        return Array.from(new Set(tags.flatMap(tag => categoryMap[tag] || [tag])));
    }
    calculateComplexity(steps, prerequisites) {
        // Calculate complexity based on number of steps and prerequisites
        const stepComplexity = Math.min(5, Math.ceil(steps.length / 3));
        const prereqComplexity = Math.min(5, prerequisites.length);
        return Math.ceil((stepComplexity + prereqComplexity) / 2);
    }
    async updateSuccessRate(id, success) {
        const workflow = this.items.get(id);
        if (workflow) {
            const currentRate = workflow.metadata.successRate || 0.5;
            const weight = 0.1; // Weight for new result
            const newRate = success
                ? currentRate + (1 - currentRate) * weight
                : currentRate * (1 - weight);
            await this.update(id, {
                metadata: {
                    ...workflow.metadata,
                    successRate: newRate,
                    lastAccessed: Date.now()
                }
            });
        }
    }
}
//# sourceMappingURL=procedural-memory.js.map