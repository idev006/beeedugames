import { DisposableBag } from "../../core/DisposableBag.js?v=20260730-31";
import { FRAME_NAMES, GAME_HEIGHT, GAME_WIDTH } from "../constants.js?v=20260730-11";
import { CompanionActor } from "../entities/CompanionActor.js?v=20260731-53";
import { RewardPresenter } from "../entities/RewardPresenter.js?v=20260730-29";
import { AnswerField } from "../systems/AnswerField.js?v=20260731-55";
import { ARSelectionSystem } from "../systems/ARSelectionSystem.js?v=20260802-02";
import { BatchChargeSequencer } from "../systems/BatchChargeSequencer.js?v=20260801-65";
import { CommutativeModel } from "../systems/CommutativeModel.js?v=20260731-60";
import { CompositeTargetField } from "../systems/CompositeTargetField.js?v=20260731-53";
import { EnergyPodField } from "../systems/EnergyPodField.js?v=20260801-66";
import { FeedbackDirector } from "../systems/FeedbackDirector.js?v=20260731-36";
import { MilestoneDirector } from "../systems/MilestoneDirector.js?v=20260731-35";

const PhaserRef = window.Phaser;

export class LuminaraScene extends PhaserRef.Scene {
  constructor() {
    super("LuminaraScene");
    this.cleanedUp = false;
    this.acceptsStoreEvents = false;
  }

  init(data) {
    this.store = data.store;
    this.configData = data.config;
    this.bridge = data.bridge;
  }

  preload() {
    Object.entries(this.configData.assets.characters).forEach(([id, path]) => {
      this.load.spritesheet(id, assetUrl(path), { frameWidth: 512, frameHeight: 512 });
    });
    Object.entries(this.configData.assets.gameplayObjects.energyPods).forEach(([id, path]) => {
      this.load.image(`energy-pod-${id}`, assetUrl(path));
    });
    Object.entries(this.configData.assets.gameplayObjects.answerCores).forEach(([id, path]) => {
      this.load.image(`answer-core-${id}`, assetUrl(path));
    });
    const gameplayAtlas = this.configData.assets.atlases?.gameplayObjectsRewards;
    if (gameplayAtlas) {
      this.load.spritesheet("gameplay-objects-rewards", assetUrl(gameplayAtlas.path), {
        frameWidth: gameplayAtlas.frameWidth,
        frameHeight: gameplayAtlas.frameHeight
      });
    }
    this.load.spritesheet("energy-vfx", assetUrl(this.configData.assets.vfx.energy), {
      frameWidth: 512,
      frameHeight: 512
    });
  }

  create() {
    this.cleanedUp = false;
    this.acceptsStoreEvents = true;
    this.disposables = new DisposableBag();
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x061d3c, 0.1).setOrigin(0).setDepth(-9);
    this.createAnimations();
    this.createOrgans();
    this.connectNervousSystem();

    const cleanup = () => this.cleanup();
    this.events.once(PhaserRef.Scenes.Events.SHUTDOWN, cleanup);
    this.events.once(PhaserRef.Scenes.Events.DESTROY, cleanup);
    if (this.store.currentRound) this.renderRound(this.store.currentRound);
  }

  createAnimations() {
    ["lumin", "pix", "maru", "zen", "glimshade"].forEach((key) => {
      FRAME_NAMES.forEach((name, index) => {
        if (!this.anims.exists(`${key}-${name}`)) {
          this.anims.create({ key: `${key}-${name}`, frames: [{ key, frame: index }], frameRate: 1 });
        }
      });
    });
    if (!this.anims.exists("energy-success")) {
      this.anims.create({
        key: "energy-success",
        frames: this.anims.generateFrameNumbers("energy-vfx", { start: 0, end: 11 }),
        frameRate: 18,
        repeat: 0
      });
    }
  }

  createOrgans() {
    this.lumin = this.add.sprite(116, 646, "lumin", 0).setScale(0.52).setDepth(8);
    this.companion = new CompanionActor(this, this.configData, this.store);
    this.hintLayer = this.add.container(0, 0);
    this.conceptLayer = this.add.container(0, 0);
    this.answerLayer = this.add.container(0, 0);
    this.energyPods = new EnergyPodField(
      this,
      this.hintLayer,
      (index) => this.store.chargeGroup(index),
      () => this.batchCharge.start()
    );
    this.batchCharge = new BatchChargeSequencer(this, this.store, this.energyPods);
    this.commutativeModel = new CommutativeModel(this, this.conceptLayer);
    this.answers = new AnswerField(this, this.answerLayer, (value) => this.store.submit(value));
    this.selectionTargets = new CompositeTargetField(() => {
      if (this.store.learningPhase === "grouping") return [this.energyPods];
      if (this.store.learningPhase === "answering") return [this.answers];
      return [];
    });
    this.rewards = new RewardPresenter(this, this.configData, this.store);
    this.feedback = new FeedbackDirector(
      this,
      this.bridge,
      this.lumin,
      this.companion,
      this.energyPods,
      this.rewards
    );
    this.milestones = new MilestoneDirector(
      this,
      this.configData,
      this.bridge,
      this.companion
    );
    this.arSelection = new ARSelectionSystem(
      this,
      this.configData,
      this.store,
      this.bridge,
      () => this.selectionTargets
    );
  }

  connectNervousSystem() {
    this.disposables.add(this.store.on("round:new", (event) => this.renderRound(event.detail.round)));
    this.disposables.add(this.store.on("group:updated", (event) => {
      this.energyPods.setGroupCharged(event.detail.index);
      this.energyPods.setChargeProgress(event.detail.progress, event.detail.total);
      this.companion.observeGroup(event.detail.progress, event.detail.total);
      this.emitSelectionTargets();
    }));
    this.disposables.add(this.store.on("group:complete", (event) => {
      this.energyPods.setBuildComplete(event.detail.repeatedAddition, event.detail.total);
      this.companion.observeGroup(event.detail.total, event.detail.total);
      this.emitSelectionTargets();
    }));
    this.disposables.add(this.store.on("phase:changed", (event) => {
      this.applyLearningPhase(event.detail.phase, event.detail);
    }));
    this.disposables.add(this.store.on("answer:correct", () => {
      this.answers.setMode("feedback");
      this.commutativeModel.showResult(this.store.currentRound.correct);
      this.feedback.show(true);
    }));
    this.disposables.add(this.store.on("answer:wrong", (event) => {
      this.answers.setMode("feedback");
      this.commutativeModel.nudge();
      this.feedback.show(false, event.detail);
    }));
    this.disposables.add(this.store.on("progress:milestone", (event) => {
      this.milestones.show(event.detail);
    }));
  }

  renderRound(round) {
    if (!round || !this.isRenderable()) return;
    this.batchCharge?.cancel();
    this.companion.updateForDistrict();
    this.energyPods.render(round);
    this.commutativeModel.render(round);
    this.answers.render(round);
    this.feedback.clear();
    this.arSelection.resetRound();
    this.applyLearningPhase(this.store.learningPhase, { reason: this.store.scaffoldReason });
  }

  applyLearningPhase(phase, detail = {}) {
    if (!this.isRenderable() || !this.store.currentRound) return;
    this.companion.guidePhase(phase);
    this.guideLumin(phase);
    if (phase === "grouping") {
      if (detail.resetGroups) this.energyPods.render(this.store.currentRound);
      this.energyPods.setVisible(true);
      this.energyPods.setEnabled(true);
      this.commutativeModel.hide();
      this.answers.setMode("preview");
    } else if (phase === "transforming") {
      this.energyPods.setEnabled(false);
      this.energyPods.fadeOut(460);
      this.answers.setMode("unlocking");
      const duration = this.configData.learning?.adaptiveScaffold?.transformDurationMs || 850;
      this.commutativeModel.beginTransformation(duration, () => {
        if (this.store.learningPhase === "transforming") this.store.completeTransformation();
      });
    } else if (phase === "answering") {
      this.energyPods.setEnabled(false);
      this.energyPods.setVisible(false);
      this.commutativeModel.showAnswering();
      this.answers.setMode("active");
    } else {
      this.energyPods.setEnabled(false);
      this.answers.setMode("feedback");
    }
    this.arSelection.resetRound();
    this.emitSelectionTargets();
  }

  guideLumin(phase) {
    if (!this.lumin?.active) return;
    const frame = phase === "answering" ? 3 : phase === "transforming" ? 2 : 0;
    this.lumin.setFrame(frame).setAlpha(phase === "grouping" ? 0.82 : 1);
    this.tweens.killTweensOf(this.lumin);
    this.tweens.add({
      targets: this.lumin,
      scaleX: phase === "answering" ? 0.56 : 0.52,
      scaleY: phase === "answering" ? 0.56 : 0.52,
      duration: 260,
      ease: "Back.out"
    });
  }

  emitSelectionTargets() {
    this.bridge.emit(
      "scene:targets",
      this.selectionTargets.getPublicTargets(GAME_WIDTH, GAME_HEIGHT)
    );
  }

  update() {
    this.arSelection?.update();
  }

  isRenderable() {
    return Boolean(this.acceptsStoreEvents && this.sys?.displayList && this.add);
  }

  cleanup() {
    if (this.cleanedUp) return;
    this.cleanedUp = true;
    this.acceptsStoreEvents = false;
    this.disposables?.dispose();
    this.disposables = null;
    this.arSelection?.destroy();
    this.batchCharge?.destroy();
    this.selectionTargets?.destroy();
    this.commutativeModel?.destroy();
    this.feedback?.destroy();
    this.answers?.destroy();
    this.energyPods?.destroy();
    this.rewards?.destroy();
    this.milestones?.destroy();
    this.companion?.destroy();
    this.arSelection = null;
    this.batchCharge = null;
    this.selectionTargets = null;
    this.commutativeModel = null;
    this.feedback = null;
    this.answers = null;
    this.energyPods = null;
    this.rewards = null;
    this.milestones = null;
    this.companion = null;
    this.bridge?.emit("scene:targets", []);
  }
}

function assetUrl(path) {
  const url = new URL(path, window.location.href);
  url.searchParams.set("v", "20260801-65");
  return url.href;
}
