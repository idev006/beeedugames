export class RewardPresenter {
  constructor(scene, config, store) {
    this.scene = scene;
    this.config = config;
    this.store = store;
    this.activeRewards = new Set();
    this.dock = null;
    this.createDock();
  }

  createDock() {
    if (!this.scene.textures.exists("gameplay-objects-rewards")) return;
    this.dock = this.scene.add.image(1128, 246, "gameplay-objects-rewards", 15)
      .setDisplaySize(92, 92)
      .setAlpha(0.88)
      .setDepth(6);
    this.scene.tweens.add({
      targets: this.dock,
      scale: { from: 0.16, to: 0.19 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
  }

  show() {
    const atlas = this.config.assets.atlases?.gameplayObjectsRewards;
    const rewardFrames = atlas?.rewardFrames || [];
    if (!rewardFrames.length || !this.scene.textures.exists("gameplay-objects-rewards")) return;

    const rewardIndex = (Math.max(1, this.store.repaired) - 1) % rewardFrames.length;
    const rewardFrame = rewardFrames[rewardIndex];
    const rewardName = atlas.rewardNames?.[rewardIndex] || "ชิ้นส่วนซ่อมเมือง";
    const reward = this.scene.add.container(640, 388).setDepth(28).setScale(0.2);
    const halo = this.scene.add.circle(0, 0, 112, 0xffd44d, 0.24);
    const image = this.scene.add.image(0, 0, "gameplay-objects-rewards", rewardFrame)
      .setDisplaySize(220, 220);
    const text = this.scene.add.text(0, 126, `ได้รับ ${rewardName}!`, {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "23px",
      fontStyle: "900",
      color: "#fff6a8",
      stroke: "#123368",
      strokeThickness: 6
    }).setOrigin(0.5);
    reward.add([halo, image, text]);
    this.activeRewards.add(reward);

    this.scene.tweens.add({
      targets: reward,
      scale: 0.86,
      y: 338,
      duration: 360,
      ease: "Back.out",
      onComplete: () => {
        this.scene.tweens.add({
          targets: reward,
          alpha: 0,
          y: 280,
          delay: 520,
          duration: 300,
          onComplete: () => {
            this.activeRewards.delete(reward);
            reward.destroy();
          }
        });
      }
    });
  }

  destroy() {
    this.activeRewards.forEach((reward) => reward.destroy());
    this.activeRewards.clear();
    this.dock?.destroy();
    this.dock = null;
  }
}
