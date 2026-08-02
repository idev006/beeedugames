export class EventBus {
  constructor() {
    this.handlers = new Map();
  }

  emit(name, detail = {}) {
    const event = { detail };
    (this.handlers.get(name) || []).forEach((handler) => handler(event));
  }

  on(name, handler) {
    if (!this.handlers.has(name)) this.handlers.set(name, []);
    this.handlers.get(name).push(handler);
    return () => this.off(name, handler);
  }

  off(name, handler) {
    const handlers = this.handlers.get(name);
    if (!handlers) return;
    const index = handlers.indexOf(handler);
    if (index >= 0) handlers.splice(index, 1);
  }
}
