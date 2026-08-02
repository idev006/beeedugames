const PhaserRef = window.Phaser;
const STAGE_POSITION = Object.freeze({ x: 92, y: 116 });
const OFFSTAGE_X = -92;
const DEFAULT_SCALE = 0.27;
const GLIMSHADE_SCALE = 0.25;

export class CompanionActor {
  constructor(scene, config, store) {
    this.scene = scene;
    this.config = config;
    this.store = store;
    this.currentId = "pix";
    this.state = "idle";
    this.idleFrame = 0;
    this.transitionTween = null;
    this.reactionTween = null;
    this.reactionTimer = null;
    this.sprite = scene.add.sprite(
      STAGE_POSITION.x,
      STAGE_POSITION.y,
      this.currentId,
      0
    ).setScale(DEFAULT_SCALE).setDepth(8);
    this.floatTween = scene.tweens.add({
      targets: this.sprite,
      y: STAGE_POSITION.y - 10,
      angle: { from: -1.2, to: 1.2 },
      duration: 1650,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
    this.idleTimer = scene.time.addEvent({
      delay: 920,
      loop: true,
      callback: () => this.advanceIdle()
    });
  }

  updateForDistrict() {
    const companions = this.config.assets.districtCompanions || ["pix", "maru", "zen", "glimshade"];
    const districtIndex = Math.max(0, this.store.levelIndex - 1);
    const nextId = companions[districtIndex % companions.length];
    if (!nextId || nextId === this.currentId) return;
    this.transitionTo(nextId, false);
  }

  transitionTo(nextId, celebrate = true) {
    if (!nextId || nextId === this.currentId || !this.sprite?.active) return;
    this.state = "transition";
    this.clearReactionTimer();
    this.reactionTween?.stop();
    this.reactionTween = null;
    this.transitionTween?.stop();
    this.floatTween?.pause();
    const targetScale = nextId === "glimshade" ? GLIMSHADE_SCALE : DEFAULT_SCALE;

    this.transitionTween = this.scene.tweens.add({
      targets: this.sprite,
      x: OFFSTAGE_X,
      alpha: 0,
      scaleX: 0.12,
      scaleY: 0.12,
      duration: 260,
      ease: "Back.in",
      onComplete: () => {
        if (!this.sprite?.active) return;
        this.currentId = nextId;
        this.sprite
          .setTexture(nextId, celebrate ? 6 : 0)
          .setPosition(OFFSTAGE_X, STAGE_POSITION.y)
          .setScale(0.12)
          .setAlpha(0);
        this.transitionTween = this.scene.tweens.add({
          targets: this.sprite,
          x: STAGE_POSITION.x,
          alpha: 1,
          scaleX: targetScale,
          scaleY: targetScale,
          duration: 460,
          ease: "Back.out",
          onComplete: () => {
            if (this.sprite?.active) {
              this.state = "idle";
              this.sprite.setFrame(0);
            }
            this.floatTween?.resume();
            this.transitionTween = null;
          }
        });
      }
    });
  }

  advanceIdle() {
    if (this.state !== "idle" || !this.sprite?.active) return;
    this.idleFrame = this.idleFrame === 0 ? 1 : 0;
    this.sprite.setFrame(this.idleFrame);
  }

  observeGroup(progress, total) {
    if (!this.sprite?.active || this.state === "transition") return;
    const isComplete = progress >= total;
    this.playReaction(isComplete ? 6 : 2, isComplete ? 900 : 460, isComplete ? 1.13 : 1.06);
  }

  encourage() {
    if (!this.sprite?.active || this.state === "transition") return;
    this.playReaction(3, 650, 1.08);
  }

  guidePhase(phase) {
    if (!this.sprite?.active || this.state === "transition") return;
    if (phase === "grouping") {
      this.sprite.setAlpha(1);
      this.playReaction(3, 620, 1.08);
      return;
    }
    if (phase === "transforming") {
      this.sprite.setAlpha(0.9);
      this.playReaction(2, 900, 1.04);
      return;
    }
    this.sprite.setAlpha(0.76);
    this.reset();
  }

  react(correct) {
    this.playReaction(correct ? 5 : 4, correct ? 1050 : 780, correct ? 1.16 : 0.96);
  }

  reset() {
    if (!this.sprite?.active || this.state === "transition") return;
    this.clearReactionTimer();
    this.state = "idle";
    this.idleFrame = 0;
    const baseScale = this.currentId === "glimshade" ? GLIMSHADE_SCALE : DEFAULT_SCALE;
    this.sprite.setFrame(0).setScale(baseScale);
  }

  playReaction(frame, duration, scale) {
    if (!this.sprite?.active) return;
    this.clearReactionTimer();
    this.state = "reacting";
    this.sprite.setFrame(frame);
    this.reactionTween?.stop();
    const baseScale = this.currentId === "glimshade" ? GLIMSHADE_SCALE : DEFAULT_SCALE;
    this.reactionTween = this.scene.tweens.add({
      targets: this.sprite,
      scaleX: baseScale * scale,
      scaleY: baseScale * scale,
      duration: 180,
      yoyo: true,
      ease: "Back.out",
      onComplete: () => {
        this.reactionTween = null;
      }
    });
    this.reactionTimer = this.scene.time.delayedCall(duration, () => {
      this.reactionTimer = null;
      this.reset();
    });
  }

  clearReactionTimer() {
    this.reactionTimer?.remove(false);
    this.reactionTimer = null;
  }

  destroy() {
    this.clearReactionTimer();
    this.idleTimer?.remove(false);
    this.idleTimer = null;
    this.reactionTween?.stop();
    this.reactionTween = null;
    this.transitionTween?.stop();
    this.transitionTween = null;
    this.floatTween?.remove();
    this.floatTween = null;
    this.sprite?.destroy();
    this.sprite = null;
  }
}
