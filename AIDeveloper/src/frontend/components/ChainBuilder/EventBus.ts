/**
 * EventBus for inter-module communication in the ChainBuilder.
 * 
 * This class implements a pub-sub pattern to enable decoupled communication
 * between modules and the ChainBuilder. It supports typed events and
 * asynchronous event handling.
 * 
 * @security Event payloads are not sanitized here; consumers must validate
 * and sanitize data to prevent XSS or injection attacks. Rate limiting
 * is applied to prevent abuse.
 */

import { ChainEvent, ChainEventType } from './ChainBuilder.types';

/**
 * Event listener function type.
 */
export type EventListener = (event: ChainEvent) => void | Promise<void>;

/**
 * EventBus class for managing events.
 */
export class EventBus {
  private listeners: Map<ChainEventType, EventListener[]> = new Map();
  private rateLimit: { requests: number; windowMs: number; } = { requests: 100, windowMs: 60000 }; // Default: 100 req/min
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  /**
   * Sets the rate limit configuration.
   * @param config Rate limit configuration
   */
  setRateLimit(config: { requests: number; windowMs: number }): void {
    this.rateLimit = config;
  }

  /**
   * Subscribes to an event type.
   * @param eventType The event type to listen for
   * @param listener The listener function
   * @returns Unsubscribe function
   */
  subscribe(eventType: ChainEventType, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Publishes an event to all subscribers.
   * @param event The event to publish
   * @throws Error if rate limit exceeded
   */
  async publish(event: ChainEvent): Promise<void> {
    // Rate limiting check
    const now = Date.now();
    const key = event.source;
    const current = this.requestCounts.get(key);

    if (current && now < current.resetTime) {
      if (current.count >= this.rateLimit.requests) {
        throw new Error('Rate limit exceeded');
      }
      current.count++;
    } else {
      this.requestCounts.set(key, { count: 1, resetTime: now + this.rateLimit.windowMs });
    }

    const listeners = this.listeners.get(event.type);
    if (listeners) {
      await Promise.all(listeners.map(async (listener) => {
        try {
          await listener(event);
        } catch (error) {
          console.error(`Error in event listener for ${event.type}:`, error);
          // Log but don't throw to prevent one listener from breaking others
        }
      }));
    }
  }

  /**
   * Clears all listeners (useful for cleanup).
   */
  clear(): void {
    this.listeners.clear();
    this.requestCounts.clear();
  }
}

/**
 * Singleton instance of EventBus.
 */
export const eventBus = new EventBus();