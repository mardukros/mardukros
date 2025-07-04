
import { WebSocket } from 'ws';

/**
 * Extended WebSocket interface with cognitive system enhancements
 */
export interface CognitiveWebSocket extends WebSocket {
  /**
   * Heartbeat tracking property
   */
  isAlive: boolean;
}
