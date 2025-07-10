type EventHandler = (...args: any[]) => void;

class EventEmitter {
  private events: Record<string, EventHandler[]> = {};

  on(event: string, handler: EventHandler): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  off(event: string, handler: EventHandler): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(handler => handler(...args));
  }
}

// Create a singleton instance
export const eventEmitter = new EventEmitter(); 