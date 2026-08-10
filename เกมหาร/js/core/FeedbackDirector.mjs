export class FeedbackDirector {
  #timers = new Set();

  constructor(timings) {
    this.timings = timings;
  }

  schedule(result, onElapsed) {
    const duration = result.correct
      ? this.timings.correctEvidenceHoldMs + this.timings.correctCelebrateMs
      : this.timings.wrongCompareHoldMs + this.timings.wrongGuideMs;
    const timer = setTimeout(() => {
      this.#timers.delete(timer);
      onElapsed(result.generationId);
    }, duration);
    this.#timers.add(timer);
  }

  dispose() {
    for (const timer of this.#timers) clearTimeout(timer);
    this.#timers.clear();
  }
}
