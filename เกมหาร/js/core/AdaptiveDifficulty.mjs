// AdaptiveDifficulty — flow-channel steering for P1-1 (GAME-DESIGN-THEORY-AUDIT).
//
// The game already carries a mastery window in config (`learning.mastery`:
// 4 correct in the last 5 rounds, max 1 hint). This class turns that window
// into a signal: a passed window raises the divisor/quotient range one step,
// two consecutive failed windows lower it one step. The range never drops
// below the grade's base profile (kids are never pushed under their floor)
// and never exceeds the global fact-practice cap. Pure logic — no Vue, no
// DOM, no persistence — so unit tests drive it directly.

export class AdaptiveDifficulty {
  constructor({
    baseRange,
    maxRange,
    windowSize = 5,
    correctRequired = 4,
    step = 1,
    failWindowsToStepDown = 2,
  } = {}) {
    this.base = this.#normalizeRange(baseRange);
    this.max = this.#normalizeRange(maxRange);
    this.windowSize = Math.max(2, Math.round(Number(windowSize) || 5));
    this.correctRequired = Math.max(1, Math.round(Number(correctRequired) || 4));
    this.step = Math.max(1, Math.round(Number(step) || 1));
    this.failWindowsToStepDown = Math.max(1, Math.round(Number(failWindowsToStepDown) || 2));
    this.level = 0;
    this.recent = [];
    this.failStreak = 0;
  }

  // Records one completed round result and re-evaluates the rolling window.
  // Returns the current snapshot so callers can react without re-reading.
  record({ correct = false } = {}) {
    this.recent.push(Boolean(correct));
    if (this.recent.length >= this.windowSize) {
      const passed = this.recent.filter(Boolean).length >= this.correctRequired;
      this.recent = [];
      if (passed) {
        this.#raise();
        this.failStreak = 0;
      } else {
        this.failStreak += 1;
        if (this.failStreak >= this.failWindowsToStepDown) {
          this.#lower();
          this.failStreak = 0;
        }
      }
    }
    return this.snapshot();
  }

  // Current adjusted range the generator should sample facts from.
  bounds() {
    const divisorMax = this.#cappedMax(this.base.divisor.max, this.max.divisor.max);
    const quotientMax = this.#cappedMax(this.base.quotient.max, this.max.quotient.max);
    return {
      divisor: { min: this.base.divisor.min, max: divisorMax },
      quotient: { min: this.base.quotient.min, max: quotientMax },
    };
  }

  // ceiling = how many steps this grade's channel can still rise (global caps
  // minus the grade base). Exposed in snapshot() so UI can show the flow
  // channel's position (P1-1 difficulty gauge).
  #ceiling() {
    return Math.max(
      0,
      this.max.divisor.max - this.base.divisor.max,
      this.max.quotient.max - this.base.quotient.max,
    );
  }

  snapshot() {
    return { level: this.level, bounds: this.bounds(), ceiling: this.#ceiling() };
  }

  // Back to the grade's base profile (fresh session / grade change).
  reset() {
    this.level = 0;
    this.recent = [];
    this.failStreak = 0;
  }

  #raise() {
    // Keep raising while at least one dimension still has headroom; bounds()
    // caps each dimension individually, so a quotient already at its global cap
    // never blocks the divisor from widening (and vice versa).
    this.level = Math.min(this.level + this.step, this.#ceiling());
  }

  #lower() {
    this.level = Math.max(0, this.level - this.step);
  }

  #cappedMax(baseMax, globalMax) {
    return Math.min(globalMax, Math.max(baseMax, baseMax + this.level * this.step));
  }

  #normalizeRange(range) {
    const divisor = range?.divisor ?? {};
    const quotient = range?.quotient ?? {};
    return {
      divisor: {
        min: Math.max(1, Math.round(Number(divisor.min) || 2)),
        max: Math.max(2, Math.round(Number(divisor.max) || 2)),
      },
      quotient: {
        min: Math.max(1, Math.round(Number(quotient.min) || 2)),
        max: Math.max(2, Math.round(Number(quotient.max) || 2)),
      },
    };
  }
}
