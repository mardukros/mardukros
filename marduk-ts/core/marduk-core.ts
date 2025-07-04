import { WebSocket } from 'ws';
import { Message } from './messaging/types/message-types.js';
import { MessageHandler } from './messaging/message-handler.js';
import { TaskScheduler } from './task/task-scheduler.js';
import { logger } from './utils/logger.js';
import { env } from '../config/env.js';

const initialTasks = [
  { type: "task" as const, query: "Retrieve facts about chaos theory", task_id: 1 },
  { type: "task" as const, query: "Narrate recent events on project X", task_id: 2 },
  { type: "task" as const, query: "Provide workflows for bug resolution", task_id: 3 },
  { type: "task" as const, query: "Find relationships between Chaos Theory and Nonlinear Equations", task_id: 4 },
];

export class MardukCore {
  private ws: WebSocket;
  private scheduler: TaskScheduler;
  private messageHandler: MessageHandler;

  constructor() {
    this.ws = new WebSocket(`ws://${env.server.host}:${env.server.port}`);
    this.scheduler = new TaskScheduler(this.ws, initialTasks);
    this.messageHandler = new MessageHandler(this.scheduler);

    this.setupWebSocket();
  }

  private setupWebSocket(): void {
    this.ws.on('open', () => {
      logger.info('Marduk Core connected to WebSocket server');
      this.scheduler.scheduleNextTask();
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString()) as Message;
        this.messageHandler.handleMessage(message);
      } catch (error) {
        logger.error('Error processing message:', error as Error);
      }
    });

    this.ws.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });

    this.ws.on('close', () => {
      logger.info('WebSocket connection closed');
    });
  }
}