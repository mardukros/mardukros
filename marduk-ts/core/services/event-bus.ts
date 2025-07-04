import { SystemEvent } from '../types/event-types.js';

type EventHandler = (event: SystemEvent) => void;

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)?.add(handler);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    this.handlers.get(eventType)?.delete(handler);
  }

  publish(event: SystemEvent): void {
    const handlers = this.handlers.get(event.type);
    handlers?.forEach(handler => handler(event));
  }
}