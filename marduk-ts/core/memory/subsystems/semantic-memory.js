import { BaseMemorySubsystem } from '../base/memory-subsystem.js';
export class SemanticMemory extends BaseMemorySubsystem {
    constructor() {
        super('semantic_memory', {
            capacity: 20000,
            persistence: true,
            indexing: ['type', 'category', 'relationships']
        });
        this.initializeMemory();
    }
    async initializeMemory() {
        await this.store({
            id: 'concept:chaos-theory',
            type: 'concept',
            content: {
                name: 'Chaos Theory',
                description: 'A branch of mathematics focused on dynamic systems highly sensitive to initial conditions',
                relationships: [
                    {
                        type: 'is_foundation_for',
                        target: 'Dynamic Systems',
                        strength: 0.9,
                        bidirectional: true
                    },
                    {
                        type: 'uses',
                        target: 'Nonlinear Equations',
                        strength: 0.8
                    }
                ],
                properties: {
                    complexity: 'high',
                    applicationDomain: ['mathematics', 'physics', 'complex systems']
                }
            },
            metadata: {
                confidence: 0.95,
                lastAccessed: Date.now(),
                category: ['mathematics', 'theory', 'systems'],
                source: 'academic-research'
            }
        });
        await this.store({
            id: 'concept:dynamic-systems',
            type: 'concept',
            content: {
                name: 'Dynamic Systems',
                description: 'Mathematical models describing behavior of complex systems over time',
                relationships: [
                    {
                        type: 'uses',
                        target: 'Differential Equations',
                        strength: 0.9
                    },
                    {
                        type: 'is_studied_by',
                        target: 'Chaos Theory',
                        strength: 0.9,
                        bidirectional: true
                    }
                ]
            },
            metadata: {
                confidence: 0.9,
                lastAccessed: Date.now(),
                category: ['mathematics', 'systems', 'modeling'],
                source: 'academic-research'
            }
        });
    }
    async handleMessage(message) {
        if (message.type === 'task') {
            if (message.query.includes('relationship')) {
                const relationships = await this.findRelationships(message.query);
                this.sendResponse(message.task_id, relationships);
            }
            else if (message.query.includes('concept')) {
                const concepts = await this.findConcepts(message.query);
                this.sendResponse(message.task_id, concepts);
            }
        }
    }
    matchesQuery(item, query) {
        const memoryItem = item;
        const searchTerm = query.term.toLowerCase();
        // Check name and description match
        if (memoryItem.content.name.toLowerCase().includes(searchTerm) ||
            memoryItem.content.description?.toLowerCase().includes(searchTerm)) {
            return true;
        }
        // Check relationships match
        if (memoryItem.content.relationships.some(rel => rel.target.toLowerCase().includes(searchTerm) ||
            rel.type.toLowerCase().includes(searchTerm))) {
            return true;
        }
        // Check category match
        if (memoryItem.metadata.category.some(cat => cat.toLowerCase().includes(searchTerm))) {
            return true;
        }
        return false;
    }
    async findRelationships(query) {
        const searchQuery = {
            type: 'concept',
            term: query,
            filters: { confidence: { min: 0.7 } }
        };
        const response = await this.query(searchQuery);
        const items = response.items;
        return items.flatMap(item => item.content.relationships.map(rel => `${item.content.name} ${rel.type} ${rel.target} (strength: ${rel.strength})`));
    }
    async findConcepts(query) {
        const searchQuery = {
            type: 'concept',
            term: query
        };
        const response = await this.query(searchQuery);
        const items = response.items;
        return items.map(item => {
            let result = `${item.content.name}`;
            if (item.content.description) {
                result += `\n  Description: ${item.content.description}`;
            }
            if (item.content.relationships.length > 0) {
                result += '\n  Relationships:';
                item.content.relationships.forEach(rel => {
                    result += `\n    - ${rel.type} ${rel.target} (${rel.strength})`;
                });
            }
            return result;
        });
    }
    // Additional methods for semantic memory specific functionality
    async addConcept(name, description, category) {
        const concept = {
            id: `concept:${name.toLowerCase().replace(/\s+/g, '-')}`,
            type: 'concept',
            content: {
                name,
                description,
                relationships: []
            },
            metadata: {
                confidence: 0.7, // Initial confidence
                lastAccessed: Date.now(),
                category
            }
        };
        await this.store(concept);
    }
    async addRelationship(sourceConcept, targetConcept, relationType, strength) {
        const source = Array.from(this.items.values())
            .find(item => item.content.name === sourceConcept);
        if (source) {
            source.content.relationships.push({
                type: relationType,
                target: targetConcept,
                strength
            });
            await this.update(source.id, source);
        }
    }
}
//# sourceMappingURL=semantic-memory.js.map