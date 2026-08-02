export class BatchChargeSequencer {
  constructor(scene, store, energyPods, intervalMs = 210) {
    this.scene = scene;
    this.store = store;
    this.energyPods = energyPods;
    this.intervalMs = Math.max(100, Number(intervalMs) || 210);
    this.timer = null;
    this.running = false;
    this.roundIndex = 0;
  }

  start() {
    if (this.running || this.store.learningPhase !== "grouping") return false;
    const pending = this.store.getUnchargedGroupIndices();
    if (!pending.length) return false;
    this.cancel();
    this.running = true;
    this.roundIndex = this.store.roundIndex;
    this.energyPods.setBatchCharging(true);
    this.chargeNext(pending);
    return true;
  }

  chargeNext(pending) {
    if (!this.canContinue()) {
      this.finish();
      return;
    }
    const index = pending.shift();
    if (!Number.isInteger(index)) {
      this.finish();
      return;
    }
    this.store.chargeGroup(index);
    if (!pending.length || this.store.learningPhase !== "grouping") {
      this.finish();
      return;
    }
    this.timer = this.scene.time.delayedCall(this.intervalMs, () => this.chargeNext(pending));
  }

  canContinue() {
    return Boolean(
      this.running &&
      this.scene?.sys?.isActive() &&
      this.store.roundIndex === this.roundIndex &&
      this.store.learningPhase === "grouping"
    );
  }

  finish() {
    this.timer = null;
    this.running = false;
  }

  cancel() {
    this.timer?.remove?.(false);
    this.timer = null;
    this.running = false;
  }

  destroy() {
    this.cancel();
    this.scene = null;
    this.store = null;
    this.energyPods = null;
  }
}
