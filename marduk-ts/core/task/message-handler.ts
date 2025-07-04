import { Message, ResponseMessage, isResponseMessage } from '../../types/messages.js';
import { Logger } from '../utils/logger.js';
import { TaskScheduler } from './task-scheduler.js';

export class MessageHandler {
  constructor(
    private logger: Logger,
    private scheduler: TaskScheduler
  ) {}

  handleMessage(message: Message): void {
    if (isResponseMessage(message)) {
      this.handleResponse(message);
    }
  }

  private handleResponse(response: ResponseMessage): void {
    console.log(`Response from ${response.subsystem}:`, response.result);
    this.logger.logResponse(response);
    this.scheduler.scheduleNextTask();
  }
}