import { MemorySystemFactory } from './memory-factory.js';
import { AiCoordinator } from '../ai/ai-coordinator.js';
import { MemoryQuery, MemoryResponse } from './types/base-types.js';
import { logger } from '../utils/logger.js';

export class MemoryIntegration {
  private factory: MemorySystemFactory;
  private aiCoordinator: AiCoordinator;

  constructor() {
    this.factory = MemorySystemFactory.getInstance();
    this.aiCoordinator = new AiCoordinator();
  }

  async enhanceQuery(query: MemoryQuery): Promise<MemoryQuery> {
    try {
      const enhancedQuery = await this.aiCoordinator.processQuery(
        `Enhance memory query: ${JSON.stringify(query)}`,
        {
          systemPrompt: 'You are a memory query enhancement system. Analyze and improve the query to maximize relevant results.'
        }
      );

      return {
        ...query,
        term: enhancedQuery.content,
        metadata: {
          ...query.metadata,
          enhanced: true,
          originalTerm: query.term
        }
      };
    } catch (error) {
      logger.warn('Failed to enhance query, using original', { error });
      return query;
    }
  }

  async synthesizeResults(response: MemoryResponse): Promise<MemoryResponse> {
    try {
      const synthesis = await this.aiCoordinator.processQuery(
        `Synthesize memory results: ${JSON.stringify(response.items)}`,
        {
          systemPrompt: 'You are a memory synthesis system. Analyze and combine related items to provide cohesive insights.'
        }
      );

      return {
        ...response,
        metadata: {
          ...response.metadata,
          synthesis: synthesis.content,
          synthesized: true
        }
      };
    } catch (error) {
      logger.warn('Failed to synthesize results, returning original', { error });
      return response;
    }
  }

  async optimizeMemory(): Promise<void> {
    try {
      const monitor = this.factory.getMonitor();
      monitor.updateStats();
      const stats = monitor.getAllStats();

      // Use AI to analyze memory usage patterns
      const analysis = await this.aiCoordinator.processQuery(
        `Analyze memory system health: ${JSON.stringify(stats)}`,
        {
          systemPrompt: 'You are a memory optimization advisor. Analyze system health and suggest improvements.'
        }
      );

      logger.info('Memory optimization analysis', { 
        analysis: analysis.content 
      });

      await this.factory.cleanup();
      await this.factory.createSnapshot();

    } catch (error) {
      logger.error('Error during memory optimization', error as Error);
      throw error;
    }
  }
}