// SessionDirector owns the player-set play session: the countdown clock,
// pause/resume, the end-of-session boundary, and the fair score accumulation
// for rounds completed inside the session. It is the single owner of time in
// the shell (chapter 3 planned a SessionDirector; this is its v1 scope) and
// knows nothing about Vue, DOM or persistence — the shell subscribes to its
// snapshot. The ticker is injectable so unit tests can drive time manually.

export class SessionDirector {
  constructor({ durationSeconds = 300, ticker = (fn, ms) => setInterval(fn, ms), clearer = (id) => clearInterval(id) } = {}) {
    this.ticker = ticker;
    this.clearer = clearer;
    this.timerId = null;
    this.listeners = new Set();
    this.state = this.#freshState(durationSeconds);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  snapshot() {
    return { ...this.state };
  }

  start() {
    if (this.state.ended) return;
    this.state.running = true;
    this.state.paused = false;
    this.#startTicker();
    this.#emit();
  }

  pause() {
    if (!this.state.running || this.state.paused || this.state.ended) return;
    this.state.paused = true;
    this.#stopTicker();
    this.#emit();
  }

  resume() {
    if (!this.state.running || !this.state.paused || this.state.ended) return;
    this.state.paused = false;
    this.#startTicker();
    this.#emit();
  }

  setDuration(seconds) {
    const duration = Math.max(1, Math.round(Number(seconds) || 300));
    this.state.durationSeconds = duration;
    this.state.remainingSeconds = Math.min(this.state.remainingSeconds, duration);
    this.#emit();
  }

  // Records a completed round (score + stars) into the session total. Rounds
  // finished after the session has ended stay free-play and never accumulate.
  recordRound({ score = 0, stars = 0 } = {}) {
    if (this.state.ended) return;
    this.state.completedRounds += 1;
    this.state.totalStars += stars;
    this.state.totalScore += Math.max(0, Number(score) || 0);
    this.#emit();
  }

  // Fresh session: same duration, full clock, counters zeroed, ticking again.
  restart() {
    const duration = this.state.durationSeconds;
    this.#stopTicker();
    this.state = this.#freshState(duration);
    this.state.running = true;
    this.#startTicker();
    this.#emit();
  }

  dispose() {
    this.#stopTicker();
    this.listeners.clear();
  }

  #freshState(durationSeconds) {
    const duration = Math.max(1, Math.round(Number(durationSeconds) || 300));
    return {
      durationSeconds: duration,
      remainingSeconds: duration,
      running: false,
      paused: false,
      ended: false,
      completedRounds: 0,
      totalStars: 0,
      totalScore: 0,
    };
  }

  #tick = () => {
    if (this.state.paused || this.state.ended) return;
    this.state.remainingSeconds = Math.max(0, this.state.remainingSeconds - 1);
    if (this.state.remainingSeconds === 0) {
      this.#stopTicker();
      this.state.running = false;
      this.state.ended = true;
    }
    this.#emit();
  };

  #startTicker() {
    this.#stopTicker();
    this.timerId = this.ticker(this.#tick, 1000);
  }

  #stopTicker() {
    if (this.timerId !== null) {
      this.clearer(this.timerId);
      this.timerId = null;
    }
  }

  #emit() {
    const snapshot = this.snapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
}
