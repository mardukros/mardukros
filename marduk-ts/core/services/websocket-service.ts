import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import config from '../../config/config.js';

export class WebSocketService extends EventEmitter {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor() {
    super();
    this.wss = new WebSocketServer({ 
      port: config.server.port,
      path: config.server.websocket.path
    });
    this.setupServer();
  }

  private setupServer(): void {
    this.wss.on('connection', this.handleConnection.bind(this));
    
    this.wss.on('error', (error) => {
      logger.error('WebSocket server error:', error);
    });

    logger.info(`WebSocket server running on ws://${config.server.host}:${config.server.port}${config.server.websocket.path}`);
  }

  private handleConnection(ws: WebSocket): void {
    this.clients.add(ws);
    logger.info(`Client connected. Total clients: ${this.clients.size}`);

    ws.on('message', (data) => this.handleMessage(ws, data));
    ws.on('close', () => this.handleDisconnect(ws));
    ws.on('error', (error) => this.handleError(ws, error));

    // Set up heartbeat
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    }, config.server.websocket.heartbeatInterval);

    ws.on('close', () => clearInterval(heartbeat));
  }

  private handleMessage(ws: WebSocket, data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());
      this.emit('message', message, ws);
    } catch (error) {
      logger.error('Error processing message:', error);
      this.sendError(ws, 'Invalid message format');
    }
  }

  private handleDisconnect(ws: WebSocket): void {
    this.clients.delete(ws);
    logger.info(`Client disconnected. Total clients: ${this.clients.size}`);
  }

  private handleError(ws: WebSocket, error: Error): void {
    logger.error('WebSocket client error:', error);
    this.clients.delete(ws);
  }

  broadcast(message: any): void {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  sendTo(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, message: string): void {
    this.sendTo(ws, {
      type: 'error',
      message,
      timestamp: new Date().toISOString()
    });
  }

  getConnectedClients(): number {
    return this.clients.size;
  }
}

export const wsService = new WebSocketService();