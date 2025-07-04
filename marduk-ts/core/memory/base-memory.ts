import { WebSocket } from 'ws';
import { TaskMessage, ResponseMessage } from '../types/messages.js';
import { MemoryError } from '../errors/memory-errors.js';

export abstract class BaseMemory {
  protected ws: WebSocket;
  protected subsystemName: string;

  constructor(subsystemName: string) {
    this.subsystemName = subsystemName;
    this.ws = new WebSocket('ws://localhost:8080');
    this.setupWebSocket();
  }

  protected setupWebSocket(): void {
    this.ws.on('open', () => {
      console.log(`${this.subsystemName} connected to WebSocket server`);
      this.register();
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString()) as TaskMessage;
        this.handleMessage(message);
      } catch (error) {
        throw new MemoryError(`Error processing message in ${this.subsystemName}`, 'MESSAGE_PROCESSING_ERROR', { error });
      }
    });
  }

  protected register(): void {
    this.ws.send(JSON.stringify({ 
      type: "register", 
      subsystem: this.subsystemName 
    }));
  }

  protected abstract handleMessage(message: TaskMessage): void;

  protected sendResponse(taskId: number, result: any): void {
    const response: ResponseMessage = {
      type: "response",
      subsystem: this.subsystemName,
      task_id: taskId,
      result
    };
    this.ws.send(JSON.stringify(response));
  }
}
