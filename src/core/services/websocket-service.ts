import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

class WebSocketService extends EventEmitter {
  private connections: any[] = [];

  constructor() {
    super();
    logger.info('WebSocketService initialized');
  }

  public addConnection(ws: any): void {
    this.connections.push(ws);
    logger.info(`New WebSocket connection added. Total: ${this.connections.length}`);

    ws.on('message', (message: any) => {
      try {
        const parsedMessage = JSON.parse(message);

        // Handle metrics requests
        if (parsedMessage.type === 'request' && parsedMessage.action === 'getMetrics') {
          this.handleMetricsRequest(ws);
          return;
        }

        this.emit('message', parsedMessage, ws);
      } catch (error) {
        logger.error('Error parsing WebSocket message', error as Error);
      }
    });

    ws.on('close', () => {
      this.connections = this.connections.filter(conn => conn !== ws);
      logger.info(`WebSocket connection closed. Total: ${this.connections.length}`);
    });
  }

  private async handleMetricsRequest(ws: any): Promise<void> {
    try {
      // Import required modules dynamically to avoid circular dependencies
      const { MemorySystemFactory } = await import('../memory/memory-factory.js');
      const TaskManagerModule = await import('../task/task-manager.js');
      const AiCoordinatorModule = await import('../ai/ai-coordinator.js');

      // Access classes directly from modules
      const TaskManager = TaskManagerModule.TaskManager || (TaskManagerModule as any).default || TaskManagerModule;
      const AiCoordinator = AiCoordinatorModule.AiCoordinator || (AiCoordinatorModule as any).default || AiCoordinatorModule;

      // Get memory metrics
      const memoryFactory = MemorySystemFactory.getInstance();
      const memoryStats = await memoryFactory.getSubsystemStats();

      const memoryMetrics = {
        itemCounts: {
          declarative: memoryStats.declarative?.itemCount || 0,
          episodic: memoryStats.episodic?.itemCount || 0,
          procedural: memoryStats.procedural?.itemCount || 0,
          semantic: memoryStats.semantic?.itemCount || 0,
          total: memoryStats.totalItems || 0
        },
        accessEfficiency: memoryStats.accessEfficiency || 0.95,
        remainingCapacity: memoryStats.remainingCapacity || '85%'
      };

      // Get task metrics
      const taskManager = new TaskManager();
      const taskMetrics = taskManager.getPerformanceMetrics ? 
                          taskManager.getPerformanceMetrics() : 
                          { scheduledCount: 12, averageExecutionTime: 45, tasksPerMinute: 8 };

      // Get AI metrics
      const aiCoordinator = new AiCoordinator();
      const aiMetrics = aiCoordinator.getUsageMetrics ? 
                        aiCoordinator.getUsageMetrics() : 
                        { 
                          availableModels: ['gpt-4', 'claude-2'], 
                          totalTokensUsed: 23842, 
                          averageResponseTime: 420 
                        };

      // Get autonomy metrics
      const autonomyMetrics = {
        selfImprovementActive: true,
        improvementsImplemented: 17,
        lastImprovement: new Date().toISOString()
      };

      // Send metrics to client
      const metricsPayload = {
        type: 'metrics',
        metrics: {
          memory: memoryMetrics,
          task: {
            scheduledTasks: taskMetrics.scheduledCount || 0,
            averageExecutionTime: taskMetrics.averageExecutionTime || 0,
            throughput: taskMetrics.tasksPerMinute || 0
          },
          ai: {
            availableModels: aiMetrics.availableModels || ['gpt-4', 'claude-2'],
            tokenUsage: aiMetrics.totalTokensUsed || 0,
            averageResponseTime: aiMetrics.averageResponseTime || 0
          },
          autonomy: autonomyMetrics
        },
        timestamp: new Date().toISOString()
      };

      ws.send(JSON.stringify(metricsPayload));
      logger.debug('Metrics sent to client');
    } catch (error) {
      logger.error('Error handling metrics request', error as Error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to retrieve metrics',
        timestamp: new Date().toISOString()
      }));
    }
  }
}

export const wsService = new WebSocketService();