export class DisposableBag {
  constructor() {
    this.disposables = new Set();
    this.disposed = false;
  }

  add(disposable) {
    if (typeof disposable !== "function") return disposable;
    if (this.disposed) {
      disposable();
      return disposable;
    }
    this.disposables.add(disposable);
    return disposable;
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.disposables.forEach((dispose) => {
      try {
        dispose();
      } catch {
        // One failing organ must not prevent the remaining resources from releasing.
      }
    });
    this.disposables.clear();
  }
}
