import { GAME_WIDTH } from "../constants.js?v=20260730-11";

export class FeedbackDirector {
  constructor(scene, bridge, lumin, companionActor, energyPods, rewards) {
    this.scene = scene;
    this.bridge = bridge;
    this.lumin = lumin;
    this.companionActor = companionActor;
    this.energyPods = energyPods;
    this.rewards = rewards;
    this.text = scene.add.text(GAME_WIDTH / 2, 300, "", {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "34px",
      fontStyle: "900",
      color: "#ffffff",
      stroke: "#123368",
      strokeThickness: 8
    }).setOrigin(0.5).setDepth(30);
  }

  clear() {
    this.text?.setText("");
  }

  show(correct, detail = {}) {
    if (!this.scene?.sys?.displayList) return;
    const wrongMessage = detail.attemptsForRound >= 2
      ? `ยังไม่พอดี คำตอบของ ${detail.table} กลุ่ม × ${detail.multiplier} แสง คือ ${detail.correct}`
      : `ยังไม่พอดี ลองนับ ${detail.table} แท่น แท่นละ ${detail.multiplier} แสงอีกครั้ง`;
    this.text.setText(correct ? "ซ่อมพลังสำเร็จ!" : wrongMessage);
    this.text.setColor(correct ? "#fff6a8" : "#ffd0dc");
    this.lumin.setFrame(correct ? 5 : 4);
    this.companionActor.react(correct);
    this.energyPods.setState(correct ? "full" : "damaged");

    if (correct) {
      this.bridge.emit("ar:pointer-park", {
        x: 0.88,
        y: 0.88,
        durationMs: 700,
        label: "พัก",
        status: "ซ่อมสำเร็จ! พักตัวชี้ระหว่างเตรียมภารกิจใหม่"
      });
      const vfx = this.scene.add.sprite(GAME_WIDTH / 2, 380, "energy-vfx", 0)
        .setScale(0.72)
        .setDepth(24)
        .play("energy-success");
      vfx.once("animationcomplete", () => vfx.destroy());
      this.rewards.show();
    } else {
      this.scene.time.delayedCall(600, () => this.energyPods?.setState("charging"));
    }

    this.scene.time.delayedCall(850, () => {
      if (!this.scene?.sys?.displayList) return;
      this.lumin?.setFrame(0);
      this.companionActor?.reset();
      if (!correct) this.clear();
    });
  }

  destroy() {
    this.text?.destroy();
    this.text = null;
    this.scene = null;
    this.bridge = null;
    this.lumin = null;
    this.companionActor = null;
    this.energyPods = null;
    this.rewards = null;
  }
}
