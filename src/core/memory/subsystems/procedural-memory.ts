import { BaseMemoryItem, ProcedureMemoryItem } from '../types/memory-items.js';
import { BaseMemorySubsystem } from './base/memory-subsystem.js';
import { MemoryQuery, MemoryOperationResult } from '../types/memory-types.js';
import { logger } from '../../utils/logger.js';

/**
 * Subsystem for storing and retrieving procedural knowledge 
 * (how to perform tasks, workflows, algorithms)
 */
export class ProceduralMemory extends BaseMemorySubsystem {
  private items: Map<string, ProcedureMemoryItem> = new Map();

  constructor() {
    super('procedural', { 
      // Use properly defined configuration properties
      persistence: true,
      capacity: 1000 // Fixed property name
    });
    this.initializeWithDefaultWorkflows();
  }

  /**
   * Specialized query method for procedural memory
   */
  async query(query: MemoryQuery) {
    logger.info(`Querying procedural memory with: ${JSON.stringify(query)}`);

    // Apply specialized filtering for procedural memory
    const items = await this.getItems(query);

    return {
      success: true,
      items,
      itemCount: items.length
    };
  }

  /**
   * Handle specialized procedural memory message
   */
  async handleMessage(message: any): Promise<void> {
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
// Consider extracting this duplicated code into a shared function
    logger.info(`Processing procedural memory message: ${message.type}`);

    if (message.type === 'query_workflows') {
      const query: MemoryQuery = {
        type: 'procedure',
        searchTerm: message.searchTerm || '',
        limit: message.limit || 10
      };

      const response = await this.query(query);

      // Return the result directly rather than using sendResponse
      const result = {
        taskId: message.task_id,
        success: true,
        items: this.formatWorkflows(response.items as ProcedureMemoryItem[])
      };

      logger.info(`Sending procedural memory response: ${JSON.stringify(result)}`);
    } else {
      logger.warn(`Unknown procedural memory request type: ${message.type}`);
    }
  }

  /**
   * Handle specialized procedural memory message with response
   */
  async handleRequestMessage(message: any) {
    logger.info(`Processing procedural memory message: ${message.type}`);

    if (message.type === 'query_workflows') {
      const query: MemoryQuery = {
        type: 'procedure',
        searchTerm: message.searchTerm || '',
        limit: message.limit || 10
      };

      const response = await this.query(query);

      // Return the result directly rather than using sendResponse
      return {
        taskId: message.task_id,
        success: true,
        items: this.formatWorkflows(response.items as ProcedureMemoryItem[])
      };
    }

    return { success: false, error: 'Unknown procedural memory request type' };
  }

  /**
   * Filter for procedural memory items containing search term
   */
  matchesQuery(item: BaseMemoryItem, query: MemoryQuery): boolean {
    if (!query.searchTerm) return true;

    return this.filterBySearchTerm(item, query.searchTerm);
  }

  /**
   * Filter for procedural memory items containing search term
   */
  filterBySearchTerm(item: BaseMemoryItem, searchTerm: string): boolean {
    if (!searchTerm) return true;

    const memoryItem = item as ProcedureMemoryItem;
    const searchTermLower = searchTerm.toLowerCase();

    const contentTitle = memoryItem.content.name || '';
    return contentTitle.toLowerCase().includes(searchTermLower) || 
           (memoryItem.metadata.tags || []).some(tag => tag.toLowerCase().includes(searchTermLower));
  }

  /**
   * Format workflows for client response
   */
  formatWorkflows(workflows: ProcedureMemoryItem[]) {
    return workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.content.name || '',
      steps: workflow.content.steps || [],
      estimatedDuration: workflow.content.estimated_duration || 0,
      successRate: workflow.metadata.success_rate || 0,
      complexity: workflow.metadata.complexity || 1,
      tags: workflow.metadata.tags || []
    }));
  }

  /**
   * Implementation of abstract method to store a memory item
   */
  async store(item: BaseMemoryItem): Promise<MemoryOperationResult> {
    try {
      this.items.set(item.id, item as ProcedureMemoryItem);
      return {
        success: true,
        itemId: item.id,
        message: `Stored procedure with id: ${item.id}`
      };
    } catch (error) {
      logger.error(`Error storing procedural memory item: ${error}`);
      return {
        success: false,
        message: `Failed to store procedure: ${error}`
      };
    }
  }

  /**
   * Retrieve items based on query
   */
  async getItems(query: MemoryQuery): Promise<ProcedureMemoryItem[]> {
    const results: ProcedureMemoryItem[] = [];

    for (const item of this.items.values()) {
      if (this.matchesQuery(item, query)) {
        results.push(item);
      }
    }

    return results.slice(0, query.limit || 10);
  }

  /**
   * Initialize with some default workflows
   */
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
// This function should be refactored into smaller parts
  private async initializeWithDefaultWorkflows() {
    logger.info('Initializing procedural memory with default workflows');

    await this.store({
      id: 'workflow:bug-resolution',
      type: 'procedure',
      content: {
        name: 'Bug Resolution Process',
        steps: [
          'Reproduce the issue',
          'Analyze error logs',
          'Identify root cause',
          'Develop fix',
          'Test solution',
          'Document resolution',
          'Deploy fix'
        ],
        prerequisites: ['debugging-tools', 'system-knowledge'],
        estimated_duration: 90
      },
      metadata: {
        lastAccessed: Date.now(),
        tags: ['debugging', 'maintenance', 'quality'],
        success_rate: 0.92,
        complexity: 3
      }
    } as ProcedureMemoryItem);

    await this.store({
      id: 'workflow:feature-development',
      type: 'procedure',
      content: {
        name: 'Feature Development Process',
        steps: [
          'Define requirements',
          'Design architecture',
          'Implement core logic',
          'Write tests',
          'Integrate with existing systems',
          'Document functionality',
          'Deploy to staging',
          'Request review'
        ],
        prerequisites: ['development-tools', 'system-architecture-knowledge'],
        estimated_duration: 240
      },
      metadata: {
        lastAccessed: Date.now(),
        tags: ['development', 'feature', 'implementation'],
        success_rate: 0.85,
        complexity: 4
      }
    } as ProcedureMemoryItem);
  }
}