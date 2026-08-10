export class SceneDirector {
  constructor(config = {}) {
    this.config = config;
    this.scene = null;
    this.shotIndex = -1;
    this.roundGenerationId = 0;
  }

  start(sceneId = this.config.defaultSceneId) {
    this.scene = this.#findScene(sceneId);
    this.shotIndex = this.scene?.shots?.length ? 0 : -1;
    return this.snapshot();
  }

  reset(roundGenerationId, sceneId = this.config.defaultSceneId) {
    this.roundGenerationId = roundGenerationId;
    return this.start(sceneId);
  }

  advance(eventName) {
    if (!this.scene) this.start();
    const targetId = {
      start_round: 'player-handoff',
      hint_requested: 'teebo-round-robin',
      answer_evaluated: 'compare-equality',
      remediation_enabled: 'teebo-round-robin',
      reward_granted: 'reward-bloom',
      reflection_requested: 'reflection',
    }[eventName];
    if (targetId) return this.#goTo(targetId);
    return this.snapshot();
  }

  skip() {
    if (!this.scene?.skipAllowed || this.shotIndex < 0) return false;
    const nextIndex = Math.min(this.shotIndex + 1, this.scene.shots.length - 1);
    if (nextIndex === this.shotIndex) return false;
    this.shotIndex = nextIndex;
    return true;
  }

  snapshot() {
    const shot = this.scene?.shots?.[this.shotIndex] ?? null;
    return {
      sceneId: this.scene?.id ?? null,
      sceneTitle: this.scene?.title ?? '',
      shot: shot ? { ...shot } : null,
      shotIndex: this.shotIndex,
      shotCount: this.scene?.shots?.length ?? 0,
      skipAllowed: Boolean(this.scene?.skipAllowed),
      reducedMotionBehavior: this.scene?.reducedMotionBehavior ?? 'static_focus',
      roundGenerationId: this.roundGenerationId,
    };
  }

  dispose() {
    this.scene = null;
    this.shotIndex = -1;
    this.roundGenerationId = 0;
  }

  #findScene(sceneId) {
    return this.config.scenes?.find((scene) => scene.id === sceneId) ?? this.config.scenes?.[0] ?? null;
  }

  #goTo(shotId) {
    const index = this.scene?.shots?.findIndex((shot) => shot.id === shotId) ?? -1;
    if (index >= 0) this.shotIndex = index;
    return this.snapshot();
  }
}
