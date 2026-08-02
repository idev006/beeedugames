import { AnswerLayoutEngine } from "../AnswerLayoutEngine.js?v=20260731-53";

const PhaserRef = window.Phaser;
const NEUTRAL_CORE = "cyan";

export class AnswerField {
  constructor(scene, layer, onSelect) {
    this.scene = scene;
    this.layer = layer;
    this.onSelect = onSelect;
    this.layout = new AnswerLayoutEngine();
    this.targets = [];
    this.enabled = false;
    this.mode = "hidden";
  }

  render(round) {
    this.clear();
    this.enabled = false;
    this.mode = "hidden";
    const positions = this.layout.generate(round.answers.length);
    round.answers.forEach((answer, index) => {
      const position = positions[index] || positions[0];
      this.targets.push(this.createTarget(position, answer, index));
    });
  }

  createTarget(position, answer, index) {
    const coreName = NEUTRAL_CORE;
    const color = 0x71e5ca;
    const container = this.scene.add.container(position.x, position.y).setDepth(7);
    container.setAlpha(0.94);
    const aura = this.scene.add.circle(0, 4, 106, color, 0.14);
    const shadow = this.scene.add.graphics();
    shadow.fillStyle(0x10285c, 0.44).fillEllipse(0, 91, 176, 38);
    const image = this.scene.add.image(0, 0, `answer-core-${coreName}`).setDisplaySize(214, 214);
    const valuePlate = this.scene.add.circle(0, 8, 48, 0xf7fbff, 0.96)
      .setStrokeStyle(4, 0x71e5ca, 0.95);
    const label = this.scene.add.text(0, 8, String(answer.value), {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "48px",
      fontStyle: "900",
      color: "#123368",
      stroke: "#ffffff",
      strokeThickness: 8,
      shadow: { color: "#123368", blur: 5, fill: true, offsetX: 0, offsetY: 3 }
    }).setOrigin(0.5);
    const lockChip = this.createLockChip();
    container.add([aura, shadow, image, valuePlate, label, lockChip]);
    image.setInteractive({ useHandCursor: true });
    image.on("pointerdown", () => {
      if (!this.enabled) return;
      this.scene.tweens.add({
        targets: container,
        scale: 0.94,
        duration: 80,
        yoyo: true,
        ease: "Sine.out"
      });
      this.onSelect(answer.value);
    });
    image.on("pointerover", () => this.scene.tweens.add({ targets: container, scale: 1.09, duration: 120 }));
    image.on("pointerout", () => this.scene.tweens.add({ targets: container, scale: 1, duration: 120 }));
    this.scene.tweens.add({
      targets: aura,
      scale: { from: 0.88, to: 1.22 },
      alpha: { from: 0.12, to: 0.3 },
      yoyo: true,
      repeat: -1,
      duration: 980 + index * 90,
      ease: "Sine.inOut"
    });
    this.scene.tweens.add({
      targets: container,
      y: position.y - 8,
      duration: 1450 + PhaserRef.Math.Between(0, 420),
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
    this.layer.add(container);
    return {
      id: `answer-${answer.value}`,
      kind: "answer",
      label: `คำตอบ ${answer.value}`,
      value: answer.value,
      correct: answer.correct,
      container,
      inputObject: image,
      lockChip,
      bounds: { cx: position.x, cy: position.y, activeRadius: 92, nearRadius: 118 }
    };
  }

  createLockChip() {
    const chip = this.scene.add.container(0, 82);
    const background = this.scene.add.graphics();
    background.fillStyle(0x10285c, 0.94).fillRoundedRect(-78, -16, 156, 32, 14);
    background.lineStyle(2, 0xffd44d, 0.9).strokeRoundedRect(-78, -16, 156, 32, 14);
    const text = this.scene.add.text(0, 0, "ล็อก • เติมให้ครบ", {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "14px",
      fontStyle: "900",
      color: "#fff6a8",
      stroke: "#123368",
      strokeThickness: 3
    }).setOrigin(0.5);
    chip.add([background, text]);
    chip.message = text;
    return chip;
  }

  findAt(x, y, radiusName) {
    if (!this.enabled) return null;
    return this.targets.find((target) => (
      Math.hypot(x - target.bounds.cx, y - target.bounds.cy) <= target.bounds[radiusName]
    ));
  }

  getPublicTargets(gameWidth, gameHeight) {
    if (!this.enabled) return [];
    return this.targets.map((target) => ({
      id: target.id,
      kind: target.kind,
      value: target.value,
      ncx: target.bounds.cx / gameWidth,
      ncy: target.bounds.cy / gameHeight,
      nrx: target.bounds.nearRadius / gameWidth,
      nry: target.bounds.nearRadius / gameHeight
    }));
  }

  selectTarget(target) {
    if (!this.enabled || !target) return;
    this.onSelect?.(target.value);
  }

  clear() {
    this.layer.removeAll(true);
    this.targets = [];
  }

  setMode(mode) {
    const nextMode = ["hidden", "preview", "unlocking", "active", "feedback"].includes(mode)
      ? mode
      : "hidden";
    if (this.mode === nextMode) return;
    this.mode = nextMode;
    this.enabled = nextMode === "active";
    this.targets.forEach((target) => {
      if (!target.container?.active) return;
      this.scene.tweens.killTweensOf(target.container);
      if (nextMode === "active") {
        target.lockChip?.setVisible(false);
        target.container.setVisible(true).setAlpha(0).setScale(0.78);
        this.scene.tweens.add({
          targets: target.container,
          alpha: 1,
          scale: 1,
          duration: 360,
          ease: "Back.out"
        });
      } else if (nextMode === "preview" || nextMode === "unlocking") {
        target.lockChip?.setVisible(true);
        target.lockChip?.message?.setText(nextMode === "unlocking" ? "กำลังปลดล็อก…" : "ล็อก • เติมให้ครบ");
        target.container.setVisible(true).setAlpha(0.84).setScale(0.9);
      } else if (nextMode === "feedback") {
        target.lockChip?.setVisible(false);
        target.container.setVisible(true).setAlpha(1).setScale(1);
      } else {
        target.container.setVisible(false).setAlpha(1).setScale(1);
      }
      if (target.inputObject?.input) target.inputObject.input.enabled = this.enabled;
    });
  }

  setEnabled(enabled) {
    this.setMode(enabled ? "active" : "hidden");
  }

  destroy() {
    this.clear();
    this.scene = null;
    this.layer = null;
    this.onSelect = null;
    this.enabled = false;
    this.mode = "hidden";
  }
}
