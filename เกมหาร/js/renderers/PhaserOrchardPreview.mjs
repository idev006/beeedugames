export function createPhaserOrchardPreview(container, options) {
  const Phaser = globalThis.Phaser;
  if (!container || !Phaser || !options?.appleSrc || !options?.characterSrc) return { destroy() {} };
  let latestOptions = { ...options };
  let activeScene = null;
  let previousSignature = '';

  const config = {
    type: Phaser.CANVAS,
    parent: container,
    width: container.clientWidth || 960,
    height: container.clientHeight || 130,
    transparent: true,
    fps: { target: 30, forceSetTimeOut: false },
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: {
      preload() {
        this.load.image('apple', options.appleSrc);
        this.load.spritesheet('monster', options.characterSrc, { frameWidth: 512, frameHeight: 512 });
      },
      create() {
        const makeScene = (nextOptions = latestOptions) => {
          latestOptions = { ...latestOptions, ...nextOptions };
          const width = this.scale.width;
          const height = this.scale.height;
          this.children.removeAll();
          this.tweens.killAll();
          const glow = this.add.ellipse(width / 2, height * 0.72, width * 0.78, height * 0.32, 0xf7efd9, 0.72);
          glow.setStrokeStyle(3, 0xd8c798, 0.7);
          const phaseFrame = latestOptions.phase === 'feedbackWrong' ? 6 : latestOptions.phase === 'remediation' ? 7 : latestOptions.phase === 'feedbackCorrect' ? 10 : 1;
          const monster = this.add.sprite(width * 0.16, height * 0.58, 'monster', phaseFrame).setScale(0.18);
          const sourceCount = Math.max(0, Number(latestOptions.sourceCount ?? 0));
          const counts = String(latestOptions.basketCounts ?? '').split(',').filter(Boolean).map(Number);
          const signature = `${sourceCount}|${counts.join(',')}|${latestOptions.phase ?? ''}`;
          const changed = previousSignature && previousSignature !== signature;
          previousSignature = signature;
          // Decorative strip: cap the sprite count so a 300-fruit round never
          // rebuilds a full scene graph per fruit move (measured: 25 baskets × 5
          // apples recreated on every placement tanked the frame rate).
          const sourceApples = Array.from({ length: Math.min(sourceCount, 8) }, (_, index) => {
            const row = Math.floor(index / 4);
            const apple = this.add.image(width * (0.34 + (index % 4) * 0.055), height * (0.42 + row * 0.2), 'apple').setScale(0.07);
            apple.setAngle(index % 2 ? 5 : -5);
            return apple;
          });
          const equalNonZero = counts.length > 1 && counts.every((count) => count > 0 && count === counts[0]);
          counts.slice(0, 12).forEach((count, basketIndex) => {
            const baseX = width * (0.64 + basketIndex * 0.11);
            const baseY = height * 0.66;
            const ring = this.add.circle(baseX, baseY, 20, 0xffffff, 0.65);
            ring.setStrokeStyle(3, equalNonZero ? 0x34725a : 0xd8c798, equalNonZero ? 0.95 : 0.75);
            for (let index = 0; index < Math.min(count, 3); index += 1) {
              this.add.image(baseX - 18 + index * 9, baseY - 9 - (index % 2) * 8, 'apple').setScale(0.045);
            }
            if (!latestOptions.reducedSensory && changed) {
              this.tweens.add({ targets: ring, scale: 1.18, duration: 180, yoyo: true, ease: 'Sine.out' });
            }
          });
          if (latestOptions.reducedSensory) return;
          this.tweens.add({ targets: monster, y: monster.y - 8, duration: 980, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
          if (changed && sourceCount > 0) {
            const arc = this.add.image(width * 0.54, height * 0.35, 'apple').setScale(0.055).setAlpha(0.82);
            this.tweens.add({ targets: arc, y: arc.y - 18, alpha: 0, scale: 0.03, duration: 420, ease: 'Sine.out' });
          }
          if (equalNonZero) {
            this.tweens.add({ targets: glow, scaleX: 1.03, scaleY: 1.12, duration: 880, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
          }
          sourceApples.forEach((apple, index) => {
            this.tweens.add({ targets: apple, y: apple.y - 10, duration: 720 + index * 60, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
          });
        };
        activeScene = this;
        this.renderPreview = makeScene;
        makeScene();
        this.scale.on('resize', makeScene);
      },
    },
  };

  let game = null;
  try {
    game = new Phaser.Game(config);
  } catch {
    return { update() {}, destroy() {} };
  }
  return {
    update(nextOptions) {
      if (!activeScene) return;
      const { sourceCount = 0, basketCounts = '', phase = '' } = nextOptions ?? {};
      const nextSignature = `${sourceCount}|${String(basketCounts).split(',').filter(Boolean).join(',')}|${phase}`;
      // Skip the rebuild entirely when the visible state did not change — the
      // scene graph is only rebuilt when a move/phase actually alters it.
      if (nextSignature === previousSignature) return;
      activeScene.renderPreview(nextOptions);
    },
    destroy() { game?.destroy(true); },
  };
}
