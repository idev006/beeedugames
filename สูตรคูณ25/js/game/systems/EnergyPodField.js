import { EnergyBeadFactory } from "../visuals/EnergyBeadFactory.js?v=20260731-60";

const PhaserRef = window.Phaser;

export class EnergyPodField {
  constructor(scene, layer, onGroupSelect, onBatchSelect) {
    this.scene = scene;
    this.layer = layer;
    this.onGroupSelect = onGroupSelect;
    this.onBatchSelect = onBatchSelect;
    this.pods = [];
    this.bannerText = null;
    this.enabled = true;
    this.handlePointerSweep = this.handlePointerSweep.bind(this);
    this.scene.input.on("pointermove", this.handlePointerSweep);
  }

  render(round) {
    this.clear();
    this.enabled = true;
    this.layer.setVisible(true).setAlpha(1);
    this.layer.add(this.createMissionBanner(round));
    const groupCount = round.groupCount || round.table;
    const positions = createPodLayout(groupCount);
    for (let index = 0; index < groupCount; index += 1) {
      const position = positions[index];
      this.layer.add(this.createPod(
        position.x,
        position.y,
        index,
        round.itemsPerGroup
      ));
    }
    this.layer.add(this.createMasterRelay(1140, 112, groupCount));
  }

  createMissionBanner(round) {
    const banner = this.scene.add.container(510, 54);
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x10285c, 0.86).fillRoundedRect(-330, -30, 660, 60, 24);
    bg.lineStyle(2, 0x71e5ca, 0.62).strokeRoundedRect(-330, -30, 660, 60, 24);
    banner.add(bg);
    this.bannerText = this.scene.add.text(0, -9, `${round.groupCount} กลุ่ม • กลุ่มละ ${round.itemsPerGroup} ดวง`, {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "22px",
      fontStyle: "900",
      color: "#fff6a8",
      stroke: "#123368",
      strokeThickness: 5
    }).setOrigin(0.5);
    const instruction = this.scene.add.text(0, 15, "ลากผ่านทีละแท่ง หรือแตะคันโยกสายฟ้า", {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "13px",
      fontStyle: "700",
      color: "#d8fff8"
    }).setOrigin(0.5);
    banner.add([this.bannerText, instruction]);
    return banner;
  }

  createPod(x, y, index, multiplier) {
    const pod = this.scene.add.container(x, y);
    const chargedAura = this.scene.add.circle(0, 3, 58, 0x65f4e0, 0).setScale(0.82);
    const glow = this.scene.add.circle(0, 3, 50, 0x71e5ca, 0.2);
    const chargedRing = this.scene.add.circle(0, 2, 54, 0xffffff, 0)
      .setStrokeStyle(4, 0xffd44d, 0)
      .setScale(0.78);
    const sparkOrbit = this.createSparkOrbit(index);
    const image = this.scene.add.image(0, 0, "energy-pod-empty").setDisplaySize(116, 116);
    const glassHighlight = this.scene.add.ellipse(-19, -14, 13, 35, 0xffffff, 0.18).setAngle(28);
    const orbs = createQuantityMarks(this.scene, multiplier);
    const badge = this.scene.add.circle(0, 19, 21, 0x10285c, 0.9).setStrokeStyle(2, 0xffd44d, 0.95);
    const amount = this.scene.add.text(0, 17, String(multiplier), {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "22px",
      fontStyle: "900",
      color: "#ffffff",
      stroke: "#123368",
      strokeThickness: 5
    }).setOrigin(0.5);
    const unit = this.scene.add.text(0, 42, "ดวง", {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "11px",
      fontStyle: "800",
      color: "#fff6a8",
      stroke: "#123368",
      strokeThickness: 3
    }).setOrigin(0.5);
    const groupLabel = this.scene.add.text(0, -52, `กลุ่ม ${index + 1}`, {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "14px",
      fontStyle: "800",
      color: "#ffffff",
      stroke: "#123368",
      strokeThickness: 3
    }).setOrigin(0.5);
    const glint = this.scene.add.star(34, -34, 4, 1.5, 5.5, 0xffffff, 0.86).setAngle(45);
    pod.add([
      chargedAura,
      glow,
      chargedRing,
      sparkOrbit,
      image,
      glassHighlight,
      ...orbs,
      badge,
      amount,
      unit,
      groupLabel,
      glint
    ]);
    image.setInteractive({ useHandCursor: true });
    image.on("pointerdown", () => this.onGroupSelect?.(index));
    this.pods.push({
      id: `group-${index}`,
      kind: "group",
      label: `กลุ่ม ${index + 1}`,
      value: index,
      container: pod,
      glow,
      chargedAura,
      chargedRing,
      sparkOrbit,
      glint,
      image,
      inputObject: image,
      orbs,
      index,
      charged: false,
      bounds: { cx: x, cy: y, activeRadius: 66, nearRadius: 86 }
    });
    this.scene.tweens.add({
      targets: glow,
      alpha: { from: 0.12, to: 0.36 },
      scale: { from: 0.9, to: 1.2 },
      duration: 820 + index * 95,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
    this.scene.tweens.add({
      targets: glint,
      alpha: { from: 0.18, to: 0.96 },
      scale: { from: 0.55, to: 1.25 },
      angle: 135,
      duration: 760 + (index % 4) * 170,
      delay: index * 85,
      yoyo: true,
      repeat: -1,
      repeatDelay: 900 + (index % 3) * 240,
      ease: "Sine.inOut"
    });
    this.scene.tweens.add({
      targets: pod,
      y: y - 6,
      duration: 1350 + index * 110,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
    return pod;
  }

  createSparkOrbit(index) {
    const orbit = this.scene.add.container(0, 2).setAlpha(0);
    const colors = [0xffffff, 0x65f4e0, 0xffd44d, 0xa98cff];
    for (let sparkIndex = 0; sparkIndex < 4; sparkIndex += 1) {
      const angle = (Math.PI * 2 * sparkIndex) / 4 + index * 0.17;
      const radius = 61 + (sparkIndex % 2) * 4;
      orbit.add(this.scene.add.star(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        4,
        1.5,
        5,
        colors[sparkIndex],
        0.95
      ));
    }
    return orbit;
  }

  createMasterRelay(x, y, groupCount) {
    const relay = this.scene.add.container(x, y);
    const aura = this.scene.add.circle(0, 0, 64, 0xffd44d, 0.16);
    const plate = this.scene.add.graphics();
    plate.fillGradientStyle(0x1b4c84, 0x1b4c84, 0x0b285a, 0x0b285a, 0.98)
      .fillRoundedRect(-86, -48, 172, 96, 25);
    plate.lineStyle(4, 0xffd44d, 0.96).strokeRoundedRect(-86, -48, 172, 96, 25);
    plate.lineStyle(2, 0x71e5ca, 0.9).strokeRoundedRect(-79, -41, 158, 82, 20);
    const lever = this.scene.add.text(0, -9, "⚡", {
      fontFamily: "Segoe UI Emoji, sans-serif",
      fontSize: "38px",
      color: "#fff4a3",
      stroke: "#b86b13",
      strokeThickness: 4
    }).setOrigin(0.5);
    const label = this.scene.add.text(0, 27, "ชาร์จครบทุกแท่ง", {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "15px",
      fontStyle: "900",
      color: "#ffffff",
      stroke: "#10285c",
      strokeThickness: 4
    }).setOrigin(0.5);
    relay.add([aura, plate, lever, label]);
    relay.setSize(172, 96);
    relay.setInteractive(new PhaserRef.Geom.Rectangle(0, 0, 172, 96), PhaserRef.Geom.Rectangle.Contains);
    relay.input.cursor = "pointer";
    const target = {
      id: "group-master-relay",
      kind: "batch",
      label: "คันโยกชาร์จครบทุกแท่ง",
      value: "all",
      container: relay,
      inputObject: relay,
      aura,
      lever,
      charged: false,
      batch: true,
      groupCount,
      bounds: { cx: x, cy: y, activeRadius: 70, nearRadius: 88 }
    };
    relay.on("pointerdown", () => this.selectTarget(target));
    relay.on("pointerover", () => relay.setScale(1.06));
    relay.on("pointerout", () => relay.setScale(1));
    this.pods.push(target);
    this.scene.tweens.add({
      targets: aura,
      alpha: { from: 0.12, to: 0.42 },
      scale: { from: 0.88, to: 1.2 },
      duration: 920,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
    this.scene.tweens.add({
      targets: lever,
      scale: { from: 0.94, to: 1.1 },
      duration: 620,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
    return relay;
  }

  handlePointerSweep(pointer) {
    if (!this.enabled || !pointer?.isDown) return;
    const x = Number.isFinite(pointer.worldX) ? pointer.worldX : pointer.x;
    const y = Number.isFinite(pointer.worldY) ? pointer.worldY : pointer.y;
    const target = this.findAt(x, y, "activeRadius");
    if (!target || target.kind !== "group") return;
    this.selectTarget(target);
  }

  setGroupCharged(index) {
    const pod = this.pods.find((entry) => !entry.batch && entry.index === index);
    if (!pod) return;
    pod.charged = true;
    pod.inputObject?.disableInteractive();
    pod.image.setTexture("energy-pod-full");
    pod.orbs.forEach((orb) => orb.setAlpha(1));
    this.playChargeBurst(pod);
    this.scene.tweens.killTweensOf([pod.glint, pod.glow]);
    this.scene.tweens.add({
      targets: pod.glint,
      alpha: 1,
      scale: 1.8,
      angle: "+=180",
      duration: 300,
      yoyo: true,
      ease: "Back.out"
    });
    this.scene.tweens.add({
      targets: pod.container,
      scale: { from: 0.94, to: 1.08 },
      duration: 240,
      yoyo: true,
      ease: "Back.out"
    });
  }

  playChargeBurst(pod) {
    const baseScaleX = pod.image.scaleX;
    const baseScaleY = pod.image.scaleY;
    pod.image.setTint(0xd9fffb);
    pod.chargedAura.setFillStyle(0x65f4e0, 0.82).setAlpha(0.82).setScale(0.72);
    pod.chargedRing.setStrokeStyle(5, 0xffef79, 1).setAlpha(1).setScale(0.7);
    this.scene.tweens.add({
      targets: pod.chargedRing,
      alpha: 0.12,
      scale: 1.52,
      duration: 430,
      ease: "Cubic.out"
    });
    this.scene.tweens.add({
      targets: pod.image,
      scaleX: { from: baseScaleX * 0.94, to: baseScaleX * 1.08 },
      scaleY: { from: baseScaleY * 0.94, to: baseScaleY * 1.08 },
      duration: 180,
      yoyo: true,
      ease: "Back.out",
      onComplete: () => {
        if (!pod.image?.active) return;
        pod.image.setScale(baseScaleX, baseScaleY).clearTint();
      }
    });

    const colors = [0x65f4e0, 0xffef79, 0xffffff, 0xa98cff];
    for (let index = 0; index < 10; index += 1) {
      const angle = (Math.PI * 2 * index) / 10;
      const particle = this.scene.add.star(0, 2, 4, 1.5, 5, colors[index % colors.length], 1);
      pod.container.add(particle);
      this.scene.tweens.add({
        targets: particle,
        x: Math.cos(angle) * (72 + (index % 3) * 9),
        y: 2 + Math.sin(angle) * (62 + (index % 2) * 12),
        alpha: 0,
        scale: { from: 0.55, to: 1.45 },
        angle: 150,
        duration: 480 + (index % 3) * 70,
        ease: "Cubic.out",
        onComplete: () => particle.destroy()
      });
    }
    this.scene.time.delayedCall(300, () => {
      if (pod.container?.active) this.startChargedGlow(pod);
    });
  }

  startChargedGlow(pod) {
    pod.chargedAura.setFillStyle(0x65f4e0, 0.48).setAlpha(0.48);
    pod.chargedRing.setStrokeStyle(3, 0xffd44d, 0.9).setAlpha(0.9);
    pod.sparkOrbit.setAlpha(1);
    this.scene.tweens.add({
      targets: pod.chargedAura,
      alpha: { from: 0.3, to: 0.68 },
      scale: { from: 0.94, to: 1.22 },
      duration: 680 + (pod.index % 3) * 110,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
    this.scene.tweens.add({
      targets: pod.chargedRing,
      alpha: { from: 0.48, to: 1 },
      scale: { from: 0.96, to: 1.1 },
      duration: 520 + (pod.index % 4) * 90,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut"
    });
    this.scene.tweens.add({
      targets: pod.sparkOrbit,
      angle: 360,
      duration: 2100 + pod.index * 80,
      repeat: -1,
      ease: "Linear"
    });
  }

  setChargeProgress(progress, total) {
    if (!this.bannerText) return;
    this.bannerText.setText(`ชาร์จแล้ว ${progress}/${total} กลุ่ม`);
  }

  setBatchCharging(active) {
    const relay = this.pods.find((entry) => entry.batch);
    if (!relay) return;
    relay.charged = Boolean(active);
    relay.inputObject?.disableInteractive();
    relay.container?.setAlpha(active ? 0.78 : 1);
    relay.lever?.setText(active ? "✨" : "⚡");
    if (active) this.setEnabled(false);
  }

  setBuildComplete(repeatedAddition, total) {
    this.enabled = false;
    this.bannerText?.setText(`ครบกลุ่มแล้ว • ${repeatedAddition} = ${total}`);
    this.pods.forEach((pod) => pod.inputObject?.disableInteractive());
  }

  setVisible(visible) {
    this.layer?.setVisible(Boolean(visible));
  }

  fadeOut(duration = 420) {
    if (!this.layer?.active) return;
    this.scene.tweens.killTweensOf(this.layer);
    this.scene.tweens.add({
      targets: this.layer,
      alpha: 0,
      duration,
      ease: "Cubic.in",
      onComplete: () => {
        if (!this.layer?.active) return;
        this.layer.setVisible(false).setAlpha(1);
      }
    });
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    this.pods.forEach((pod) => {
      if (!pod.inputObject?.input || pod.charged) return;
      pod.inputObject.input.enabled = this.enabled;
    });
  }

  findAt(x, y, radiusName) {
    if (!this.enabled) return null;
    return this.pods.find((pod) => (
      !pod.charged &&
      Math.hypot(x - pod.bounds.cx, y - pod.bounds.cy) <= pod.bounds[radiusName]
    ));
  }

  getPublicTargets(gameWidth, gameHeight) {
    if (!this.enabled) return [];
    return this.pods
      .filter((pod) => !pod.charged)
      .map((pod) => ({
        id: pod.id,
        kind: pod.kind,
        value: pod.value,
        ncx: pod.bounds.cx / gameWidth,
        ncy: pod.bounds.cy / gameHeight,
        nrx: pod.bounds.nearRadius / gameWidth,
        nry: pod.bounds.nearRadius / gameHeight
      }));
  }

  selectTarget(target) {
    if (!this.enabled || !target || target.charged) return;
    target.charged = true;
    target.inputObject?.disableInteractive();
    if (target.batch) {
      target.container?.setAlpha(0.72);
      this.onBatchSelect?.();
      return;
    }
    this.onGroupSelect?.(target.index);
  }

  setState(state) {
    this.pods.forEach((pod, index) => {
      if (!pod.image) return;
      pod.image.setTexture(`energy-pod-${state}`);
      this.scene.tweens.add({
        targets: pod.container,
        scale: { from: 0.94, to: 1.08 },
        duration: 220 + index * 25,
        yoyo: true,
        ease: "Back.out"
      });
    });
  }

  clear() {
    this.layer.removeAll(true);
    this.pods = [];
    this.bannerText = null;
    this.enabled = false;
  }

  destroy() {
    this.scene?.input?.off("pointermove", this.handlePointerSweep);
    this.clear();
    this.scene = null;
    this.layer = null;
    this.onGroupSelect = null;
    this.onBatchSelect = null;
  }
}

function createOrbPositions(count) {
  const safeCount = Math.max(1, Math.min(12, Number(count) || 1));
  const columns = safeCount <= 4 ? safeCount : 4;
  const rows = Math.ceil(safeCount / columns);
  const gapX = safeCount <= 4 ? 17 : 13;
  const gapY = 12;
  const positions = [];
  for (let index = 0; index < safeCount; index += 1) {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const itemsInRow = Math.min(columns, safeCount - row * columns);
    positions.push({
      x: (column - (itemsInRow - 1) / 2) * gapX,
      y: -24 + (row - (rows - 1) / 2) * gapY
    });
  }
  return positions;
}

function createPodLayout(count) {
  const safeCount = Math.max(1, Math.min(12, Math.floor(count)));
  const rows = safeCount <= 7 ? 1 : 2;
  const columns = rows === 1 ? safeCount : Math.ceil(safeCount / 2);
  const gapX = columns <= 1 ? 0 : Math.min(126, 760 / (columns - 1));
  const positions = [];
  for (let index = 0; index < safeCount; index += 1) {
    const row = rows === 1 ? 0 : Math.floor(index / columns);
    const column = rows === 1 ? index : index % columns;
    const itemsInRow = rows === 1
      ? safeCount
      : Math.min(columns, safeCount - row * columns);
    const rowWidth = (itemsInRow - 1) * gapX;
    positions.push({
      x: 640 - rowWidth / 2 + column * gapX,
      y: rows === 1 ? 154 + (index % 2) * 5 : 135 + row * 126 + (column % 2) * 4
    });
  }
  return positions;
}

function createQuantityMarks(scene, amount) {
  if (amount <= 12) {
    const orbPositions = createOrbPositions(amount);
    const radius = amount <= 4 ? 7.5 : amount <= 8 ? 6 : 5;
    return orbPositions.map(({ x, y }, index) => EnergyBeadFactory.create(scene, {
      x,
      y: y - 6,
      radius,
      variant: index,
      alpha: 0.9
    }));
  }

  const chunks = [];
  let remaining = amount;
  while (remaining >= 10) {
    chunks.push(10);
    remaining -= 10;
  }
  if (remaining > 0) chunks.push(remaining);
  return chunks.map((value, index) => {
    const x = (index - (chunks.length - 1) / 2) * 29;
    const chip = scene.add.container(x, -22);
    const isTen = value === 10;
    const halo = scene.add.graphics();
    halo.fillStyle(isTen ? 0x65f4e0 : 0xffcf4a, 0.22)
      .fillRoundedRect(-16, -12, 32, 24, 10);
    const background = scene.add.graphics();
    background.fillGradientStyle(
      isTen ? 0xd9fffa : 0xfff5ad,
      isTen ? 0x73ebd4 : 0xffdc58,
      isTen ? 0x159fc0 : 0xffa13d,
      isTen ? 0x0b729e : 0xe8782d,
      1
    ).fillRoundedRect(-14, -10, 28, 20, 8);
    background.lineStyle(1.5, 0xffffff, 0.96).strokeRoundedRect(-14, -10, 28, 20, 8);
    const shine = scene.add.ellipse(-5, -4, 9, 4, 0xffffff, 0.58).setAngle(-14);
    const text = scene.add.text(0, 0, String(value), {
      fontFamily: "Mali, Segoe UI, sans-serif",
      fontSize: "11px",
      fontStyle: "900",
      color: "#123368"
    }).setOrigin(0.5);
    chip.add([halo, background, shine, text]);
    chip.setAlpha(0.9);
    return chip;
  });
}
