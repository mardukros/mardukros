/**
 * WebSocket Visualization Server - Real-time data streaming for visualizations
 * 
 * Provides WebSocket-based real-time communication for live visualization updates.
 */

import { UpdateMessage, RealTimeConfig } from './types.js';

export class WebSocketVisualizationServer {
  private server: any = null; // WebSocket server instance
  private clients: Set<any> = new Set();
  private config: RealTimeConfig;
  private messageQueue: UpdateMessage[] = [];
  private isRunning: boolean = false;

  constructor(config: Partial<RealTimeConfig> = {}) {
    this.config = {
      enabled: true,
      updateInterval: 1000,
      maxUpdatesPerSecond: 60,
      adaptiveRate: true,
      priorityFilter: [],
      ...config
    };
  }

  /**
   * Start the WebSocket server (browser-compatible version)
   */
  public start(port: number = 8080): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // In a browser environment, we'll simulate the server behavior
        if (typeof window !== 'undefined') {
          this.startBrowserMode();
          resolve();
        } else {
          // In Node.js environment, you would use 'ws' library here
          this.startNodeMode(port).then(resolve).catch(reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Start in browser mode (for demonstration)
   */
  private startBrowserMode(): void {
    this.isRunning = true;
    console.log('WebSocket Visualization Server started in browser mode');
    
    // Simulate periodic data generation
    setInterval(() => {
      if (this.isRunning) {
        this.broadcastUpdate({
          type: 'system_event',
          timestamp: new Date().toISOString(),
          data: this.generateSampleData(),
          priority: 'medium'
        });
      }
    }, this.config.updateInterval);
  }

  /**
   * Start in Node.js mode
   */
  private async startNodeMode(port: number): Promise<void> {
    // This would be implemented with the 'ws' library in a real Node.js environment
    console.log(`WebSocket server would start on port ${port}`);
    this.isRunning = true;
  }

  /**
   * Stop the server
   */
  public stop(): void {
    this.isRunning = false;
    
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    
    this.clients.clear();
    console.log('WebSocket Visualization Server stopped');
  }

  /**
   * Add a client connection
   */
  public addClient(client: any): void {
    this.clients.add(client);
    console.log(`Client connected. Total clients: ${this.clients.size}`);
    
    // Send initial data to new client
    this.sendToClient(client, {
      type: 'system_event',
      timestamp: new Date().toISOString(),
      data: { type: 'welcome', message: 'Connected to visualization server' },
      priority: 'high'
    });
  }

  /**
   * Remove a client connection
   */
  public removeClient(client: any): void {
    this.clients.delete(client);
    console.log(`Client disconnected. Total clients: ${this.clients.size}`);
  }

  /**
   * Broadcast update to all clients
   */
  public broadcastUpdate(message: UpdateMessage): void {
    if (!this.isRunning) return;

    // Apply priority filtering
    if (this.config.priorityFilter.length > 0 && 
        !this.config.priorityFilter.includes(message.priority)) {
      return;
    }

    // Add to message queue
    this.messageQueue.push(message);
    
    // Process queue
    this.processMessageQueue();
  }

  /**
   * Send message to specific client
   */
  public sendToClient(client: any, message: UpdateMessage): void {
    try {
      if (typeof client.send === 'function') {
        client.send(JSON.stringify(message));
      } else {
        // For browser-based simulation
        console.log('Sending to client:', message);
      }
    } catch (error) {
      console.error('Error sending message to client:', error);
      this.removeClient(client);
    }
  }

  /**
   * Process message queue with rate limiting
   */
  private processMessageQueue(): void {
    const maxMessages = Math.floor(this.config.maxUpdatesPerSecond / 10); // Process in batches
    const messagesToProcess = this.messageQueue.splice(0, maxMessages);
    
    messagesToProcess.forEach(message => {
      this.clients.forEach(client => {
        this.sendToClient(client, message);
      });
    });
  }

  /**
   * Generate sample data for demonstration
   */
  private generateSampleData(): any {
    const eventTypes = [
      'node_update',
      'edge_change', 
      'membrane_activity',
      'system_state_change',
      'performance_metric'
    ];
    
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    
    switch (eventType) {
      case 'node_update':
        return {
          type: 'node_update',
          nodeId: `node_${Math.floor(Math.random() * 10)}`,
          changes: {
            activation: Math.random(),
            position: {
              x: Math.random() * 800,
              y: Math.random() * 600,
              z: 0
            }
          }
        };
        
      case 'edge_change':
        return {
          type: 'edge_change',
          edgeId: `edge_${Math.floor(Math.random() * 15)}`,
          changes: {
            weight: Math.random(),
            flow: Math.random() * 0.5
          }
        };
        
      case 'membrane_activity':
        return {
          type: 'membrane_activity',
          membraneId: `membrane_${Math.floor(Math.random() * 3)}`,
          changes: {
            activity: Math.random(),
            messageCount: Math.floor(Math.random() * 20)
          }
        };
        
      case 'system_state_change':
        return {
          type: 'system_state_change',
          component: ['memory', 'tasks', 'ai', 'autonomy'][Math.floor(Math.random() * 4)],
          metric: Math.random(),
          status: Math.random() > 0.8 ? 'warning' : 'healthy'
        };
        
      case 'performance_metric':
        return {
          type: 'performance_metric',
          metrics: {
            fps: 45 + Math.random() * 15,
            renderTime: 10 + Math.random() * 10,
            memoryUsage: 50 + Math.random() * 30
          }
        };
        
      default:
        return { type: 'unknown', data: {} };
    }
  }

  /**
   * Get server statistics
   */
  public getStats(): any {
    return {
      isRunning: this.isRunning,
      clientCount: this.clients.size,
      queueSize: this.messageQueue.length,
      config: this.config
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<RealTimeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * WebSocket Client for receiving visualization updates
 */
export class WebSocketVisualizationClient {
  private socket: WebSocket | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  constructor() {}

  /**
   * Connect to WebSocket server
   */
  public connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url);
        
        this.socket.onopen = () => {
          console.log('Connected to visualization server');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
        
        this.socket.onclose = () => {
          console.log('Disconnected from visualization server');
          this.attemptReconnect(url);
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from server
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Send message to server
   */
  public send(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  /**
   * Register event handler
   */
  public on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove event handler
   */
  public off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(message: UpdateMessage): void {
    // Emit general message event
    this.emit('message', message);
    
    // Emit specific event based on message type
    this.emit(message.type, message);
    
    // Emit priority-based events
    this.emit(`priority_${message.priority}`, message);
  }

  /**
   * Emit event to handlers
   */
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in event handler for %s:', event, error);
        }
      });
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect(url).catch(() => {
          // Reconnect failed, will try again if under limit
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('reconnect_failed', null);
    }
  }

  /**
   * Get connection status
   */
  public getStatus(): string {
    if (!this.socket) return 'disconnected';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }
}