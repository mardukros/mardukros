import { MemorySystemFactory } from './memory-factory.js';
import { MemoryQuery, MemoryResponse } from './types/base-types.js';
import { TaskMessage } from '../types/messages.js';
import { logger } from '../utils/logger.js';

export class MemoryCoordinator {
  private factory: MemorySystemFactory;

  constructor() {
    this.factory = MemorySystemFactory.getInstance();
  }

  async handleMessage(message: TaskMessage): Promise<void> {
    try {
      const subsystems = this.determineTargetSubsystems(message);
      const responses = await Promise.all(
        subsystems.map(async subsystem => {
          try {
            const memorySystem = this.factory.getSubsystem(subsystem);
            return await memorySystem.handleMessage(message);
          } catch (error) {
            logger.error(`Error in ${subsystem} subsystem:`, error as Error);
            return null;
          }
        })
      );

      const validResponses = responses.filter(Boolean);
      if (validResponses.length > 0) {
        const aggregatedResponse = this.aggregateResponses(validResponses);
        this.sendResponse(message.task_id, aggregatedResponse);
      }
    } catch (error) {
      logger.error('Error handling message:', error as Error);
      this.sendErrorResponse(message.task_id, error as Error);
    }
  }

  private determineTargetSubsystems(message: TaskMessage): string[] {
    if (message.target) {
      return [message.target];
    }

    const query = message.query.toLowerCase();
    const subsystems: string[] = [];

    const patterns = {
      declarative: ['fact', 'concept', 'knowledge', 'definition'],
      episodic: ['event', 'experience', 'happened', 'occurred'],
      procedural: ['workflow', 'procedure', 'process', 'how to'],
      semantic: ['relationship', 'connection', 'related', 'means']
    };

    Object.entries(patterns).forEach(([system, keywords]) => {
      if (keywords.some(keyword => query.includes(keyword))) {
        subsystems.push(system);
      }
    });

    return subsystems.length > 0 ? subsystems : ['declarative', 'semantic'];
  }

  private aggregateResponses(responses: any[]): any {
    const uniqueResponses = new Map();
    
    responses.flat().forEach(response => {
      if (response && response.id) {
        const existing = uniqueResponses.get(response.id);
        if (!existing || response.relevance > existing.relevance) {
          uniqueResponses.set(response.id, response);
        }
      }
    });

    return Array.from(uniqueResponses.values())
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  }

  private sendResponse(taskId: number, result: any): void {
    const response = {
      type: 'response',
      task_id: taskId,
      result,
      timestamp: new Date().toISOString()
    };
    logger.info('Aggregated Response:', response);
  }

  private sendErrorResponse(taskId: number, error: Error): void {
    const response = {
      type: 'error',
      task_id: taskId,
      error: {
        message: error.message,
        type: error.name,
        timestamp: new Date().toISOString()
      }
    };
    logger.error('Error Response:', response);
  }

  async performMaintenance(): Promise<void> {
    try {
      await this.factory.cleanup();
      await this.factory.createSnapshot();
      
      const healthReport = await this.factory.generateHealthReport();
      logger.info('Memory System Health Report:', healthReport);
    } catch (error) {
      logger.error('Error during maintenance:', error);
    }
  }
}