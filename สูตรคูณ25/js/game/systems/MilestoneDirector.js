import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js?v=20260730-11";

export class MilestoneDirector {
  constructor(scene, config, bridge, companionActor) {
    this.scene = scene;
    this.config = config;
    this.bridge = bridge;
    this.companionActor = companionActor;
    this.overlay = null;
    this.showTimer = null;
    this.hideTimer = null;
  }

  show(milestone) {
    if (!milestone || !this.scene?.sys?.displayList) return;
    this.clear();

    const leadMs = this.config.progression?.announcementLeadMs || 600;
    const visibleMs = this.config.progression?.announcementVisibleMs || 2350;
    this.bridge.emit("ar:pointer-park", {
      x: 0.9,
      y: 0.9,
      durationMs: leadMs + visibleMs,
      label: "รางวัล",
      status: `ซ่อมครบ ${milestone.repaired} จุด กำลังต้อนรับสมาชิกใหม่`
    });

    this.showTimer = this.scene.time.delayedCall(leadMs, () => {
      if (!this.scene?.sys?.displayList) return;
      this.render(milestone);
      this.companionActor?.transitionTo(milestone.companionId, true);
      this.hideTimer = this.scene.time.delayedCall(visibleMs - 360, () => this.hide());
    });
  }

  render(milestone) {
    const root = this.scene.add.container(0, 0).setDepth(100).setAlpha(0);
    const shield = this.scene.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x06152f,
      0.76
    ).setInteractive();
    const panel = this.scene.add.rectangle(640, 400, 820, 360, 0x123b78, 0.98)
      .setStrokeStyle(6, 0x85f4dd, 1);
    const ribbon = this.scene.add.rectangle(640, 247, 540, 58, 0xffd44d, 1);
    const headline = this.scene.add.text(640, 247, `ซ่อมครบ ${milestone.repaired} จุด!`, {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "30px",
      fontStyle: "700",
      color: "#17325e"
    }).setOrigin(0.5);
    const character = this.scene.add.sprite(430, 432, milestone.companionId, 6)
      .setScale(milestone.companionId === "glimshade" ? 0.38 : 0.42);
    const announcement = this.scene.add.text(725, 340, `${milestone.companionName}มาช่วยทีมแล้ว!`, {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "34px",
      fontStyle: "700",
      color: "#fff6a8",
      stroke: "#0b2555",
      strokeThickness: 6
    }).setOrigin(0.5);
    const role = this.scene.add.text(725, 402, milestone.companionRole, {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "23px",
      fontStyle: "700",
      color: "#85f4dd",
      backgroundColor: "#0b2b60",
      padding: { x: 18, y: 8 }
    }).setOrigin(0.5);
    const arrival = this.scene.add.text(725, 462, milestone.arrivalLine, {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "20px",
      color: "#ffffff",
      align: "center",
      wordWrap: { width: 390 }
    }).setOrigin(0.5);
    const destination = this.scene.add.text(640, 548, `เขตถัดไป • ${milestone.districtName}`, {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "21px",
      fontStyle: "700",
      color: "#ffd44d"
    }).setOrigin(0.5);

    root.add([shield, panel, ribbon, headline, character, announcement, role, arrival, destination]);
    this.overlay = root;
    character.setScale(character.scaleX * 0.45).setAlpha(0);
    announcement.setX(780).setAlpha(0);

    this.scene.tweens.add({ targets: root, alpha: 1, duration: 240, ease: "Sine.out" });
    this.scene.tweens.add({
      targets: character,
      scaleX: milestone.companionId === "glimshade" ? 0.38 : 0.42,
      scaleY: milestone.companionId === "glimshade" ? 0.38 : 0.42,
      alpha: 1,
      duration: 520,
      ease: "Back.out"
    });
    this.scene.tweens.add({
      targets: announcement,
      x: 725,
      alpha: 1,
      delay: 180,
      duration: 420,
      ease: "Back.out"
    });
  }

  hide() {
    if (!this.overlay?.active || !this.scene?.sys?.displayList) return;
    const target = this.overlay;
    this.overlay = null;
    this.scene.tweens.add({
      targets: target,
      alpha: 0,
      duration: 300,
      ease: "Sine.in",
      onComplete: () => target.destroy(true)
    });
  }

  clear() {
    this.showTimer?.remove(false);
    this.hideTimer?.remove(false);
    this.showTimer = null;
    this.hideTimer = null;
    this.overlay?.destroy(true);
    this.overlay = null;
  }

  destroy() {
    this.clear();
    this.scene = null;
    this.config = null;
    this.bridge = null;
    this.companionActor = null;
  }
}
