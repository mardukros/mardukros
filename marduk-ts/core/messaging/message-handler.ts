import { Message, ResponseMessage } from '../messaging/types/message-types.js';
import { logger } from '../utils/logger.js';
import { TaskScheduler } from '../task/task-scheduler.js';

export class MessageHandler {
  constructor(
    private scheduler: TaskScheduler
  ) {}

  handleMessage(message: Message): void {
    try {
      switch (message.type) {
        case 'response':
          this.handleResponse(message as ResponseMessage);
          break;
        case 'error':
          this.handleError(message);
          break;
        default:
          logger.warn(`Unhandled message type: ${message.type}`);
      }
    } catch (error) {
      logger.error('Error handling message:', error as Error);
    }
  }

  private handleResponse(response: ResponseMessage): void {
    logger.info(`Response from ${response.subsystem}:`, { 
      taskId: response.task_id,
      result: response.result 
    });
    this.scheduler.scheduleNextTask();
  }

  private handleError(message: Message): void {
    logger.error('Error message received:', message);
  }
}