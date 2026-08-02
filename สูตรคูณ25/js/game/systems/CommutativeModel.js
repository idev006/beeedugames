import { EnergyBeadFactory } from "../visuals/EnergyBeadFactory.js?v=20260731-60";

const PANEL = Object.freeze({ x: 640, y: 105, width: 720, height: 170 });
const FIELD = Object.freeze({ width: 600, height: 92, centerY: 14 });

export class CommutativeModel {
  constructor(scene, layer) {
    this.scene = scene;
    this.layer = layer;
    this.container = null;
    this.groupGraphics = null;
    this.dots = [];
    this.titleText = null;
    this.insightText = null;
    this.round = null;
    this.animationToken = 0;
  }

  render(round) {
    this.clear();
    this.round = round;
    this.container = this.scene.add.container(PANEL.x, PANEL.y).setDepth(6).setVisible(false);
    const background = this.scene.add.graphics();
    background.fillStyle(0x10285c, 0.86)
      .fillRoundedRect(-PANEL.width / 2, -PANEL.height / 2, PANEL.width, PANEL.height, 28);
    background.lineStyle(3, 0x71e5ca, 0.82)
      .strokeRoundedRect(-PANEL.width / 2, -PANEL.height / 2, PANEL.width, PANEL.height, 28);
    this.titleText = this.scene.add.text(0, -63, "", textStyle(22, "#fff6a8", 5)).setOrigin(0.5);
    this.insightText = this.scene.add.text(0, 70, "", textStyle(14, "#b8fff0", 3)).setOrigin(0.5);
    this.groupGraphics = this.scene.add.graphics();
    this.container.add([background, this.groupGraphics, this.titleText, this.insightText]);
    this.createUnits();
    this.layer.add(this.container);
    this.positionDots(this.primaryLayout(), false);
    this.drawGroups(round.groupCount, this.primaryRows(), 0x71e5ca);
  }

  createUnits() {
    if (this.isWeighted()) {
      const chunks = this.round.representationPlan.chunks;
      for (let group = 0; group < this.round.groupCount; group += 1) {
        chunks.forEach((value) => {
          const unit = this.createWeightedUnit(value);
          this.dots.push(unit);
          this.container.add(unit);
        });
      }
      return;
    }
    const total = this.round.correct;
    const radius = dotRadius(this.round.groupCount, this.round.itemsPerGroup);
    for (let index = 0; index < total; index += 1) {
      const dot = EnergyBeadFactory.create(this.scene, {
        radius,
        variant: Math.floor(index / Math.max(1, this.round.itemsPerGroup))
      });
      this.dots.push(dot);
      this.container.add(dot);
    }
  }

  createWeightedUnit(value) {
    const unit = this.scene.add.container(0, 0);
    const isTen = value === 10;
    const halo = this.scene.add.graphics();
    halo.fillStyle(isTen ? 0x65f4e0 : 0xffcf4a, 0.18)
      .fillRoundedRect(-14, -9, 28, 18, 8);
    const background = this.scene.add.graphics();
    background.fillGradientStyle(
      isTen ? 0xd9fffa : 0xfff5ad,
      isTen ? 0x73ebd4 : 0xffdc58,
      isTen ? 0x159fc0 : 0xffa13d,
      isTen ? 0x0b729e : 0xe8782d,
      1
    )
      .fillRoundedRect(-12, -7, 24, 14, 6);
    background.lineStyle(1.5, 0xffffff, 0.92).strokeRoundedRect(-12, -7, 24, 14, 6);
    const shine = this.scene.add.ellipse(-4, -3, 7, 3, 0xffffff, 0.52).setAngle(-14);
    const label = this.scene.add.text(0, 0, String(value), textStyle(9, "#123368", 0)).setOrigin(0.5);
    unit.add([halo, background, shine, label]);
    return unit;
  }

  beginTransformation(duration, onComplete) {
    if (!this.container?.active || !this.round) return;
    const token = ++this.animationToken;
    this.container.setVisible(true).setAlpha(0).setScale(0.94);
    this.titleText.setText(`${this.round.groupCount} กลุ่ม • กลุ่มละ ${this.round.itemsPerGroup}`);
    this.insightText.setText("จุดพลังชุดเดิม กำลังจัดกลุ่มใหม่");
    this.positionDots(this.primaryLayout(), false);
    this.drawGroups(this.round.groupCount, this.primaryRows(), 0x71e5ca);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      scale: 1,
      duration: 260,
      ease: "Back.out",
      onComplete: () => {
        if (token !== this.animationToken || !this.container?.active) return;
        this.animateToSwapped(duration, token, onComplete);
      }
    });
  }

  animateToSwapped(duration, token, onComplete) {
    const targetPositions = this.swappedLayout();
    this.groupGraphics.setAlpha(1);
    this.scene.tweens.add({ targets: this.groupGraphics, alpha: 0, duration: 160 });
    let completed = 0;
    this.dots.forEach((dot, index) => {
      const target = targetPositions[index];
      this.scene.tweens.add({
        targets: dot,
        x: target.x,
        y: target.y,
        duration,
        delay: Math.min(180, index * 4),
        ease: "Sine.inOut",
        onComplete: () => {
          completed += 1;
          if (completed !== this.dots.length || token !== this.animationToken) return;
          this.finishTransformationVisual();
          onComplete?.();
        }
      });
    });
  }

  showAnswering() {
    if (!this.container?.active || !this.round) return;
    this.animationToken += 1;
    this.scene.tweens.killTweensOf(this.dots);
    this.container.setVisible(true).setAlpha(1).setScale(1);
    this.positionDots(this.swappedLayout(), false);
    if (this.isWeighted()) this.groupGraphics.clear();
    else this.drawGroups(this.round.itemsPerGroup, this.round.groupCount, 0xffd44d);
    this.titleText.setText(
      `${this.round.groupCount} × ${this.round.itemsPerGroup} = ` +
      `${this.round.itemsPerGroup} × ${this.round.groupCount}`
    );
    this.insightText.setText(this.answeringInsight());
  }

  showResult(total) {
    if (!this.container?.active || !this.round) return;
    this.titleText.setText(
      `${this.round.groupCount} × ${this.round.itemsPerGroup} = ` +
      `${this.round.itemsPerGroup} × ${this.round.groupCount} = ${total}`
    );
    this.insightText.setText("สลับที่ได้ เพราะจำนวนทั้งหมดไม่เปลี่ยน");
    this.scene.tweens.add({
      targets: this.container,
      scale: { from: 0.97, to: 1.04 },
      yoyo: true,
      duration: 260,
      ease: "Back.out"
    });
  }

  nudge() {
    if (!this.container?.visible) return;
    this.insightText?.setText("ลองนับกรอบกลุ่ม หรือย้อนกลับไปสร้างกลุ่มอีกครั้ง");
    this.scene.tweens.add({
      targets: this.container,
      x: { from: PANEL.x - 5, to: PANEL.x + 5 },
      yoyo: true,
      repeat: 2,
      duration: 75
    });
  }

  hide() {
    this.animationToken += 1;
    this.container?.setVisible(false);
  }

  primaryLayout() {
    if (this.isWeighted()) return createMatrixLayout(this.round.groupCount, this.primaryRows());
    return createGroupedLayout(this.round.groupCount, this.round.itemsPerGroup).positions;
  }

  swappedLayout() {
    if (this.isWeighted()) return createCompactLayout(this.dots.length);
    return createGroupedLayout(this.round.itemsPerGroup, this.round.groupCount).positions;
  }

  primaryRows() {
    return this.isWeighted()
      ? this.round.representationPlan.chunks.length
      : this.round.itemsPerGroup;
  }

  isWeighted() {
    return this.round?.representationPlan?.mode !== "equal-groups";
  }

  finishTransformationVisual() {
    this.groupGraphics.setAlpha(0);
    if (this.isWeighted()) {
      this.groupGraphics.clear();
      const plan = this.round.representationPlan;
      if (plan.mode === "quarter-hundred") {
        const remainder = plan.remainderGroups ? ` และอีก ${plan.remainderGroups} กลุ่ม` : "";
        this.titleText.setText(`${plan.anchorExplanation} • ได้ ${plan.hundreds} ชุดร้อย${remainder}`);
        this.insightText.setText("รวมทุก 4 กลุ่มของ 25 เป็นพลัง 100");
      } else {
        this.titleText.setText(plan.decomposition);
        this.insightText.setText("แท่งสิบและหน่วยชุดเดิม ถูกจัดตามค่าประจำหลัก");
      }
      return;
    }
    this.drawGroups(this.round.itemsPerGroup, this.round.groupCount, 0xffd44d);
    this.scene.tweens.add({ targets: this.groupGraphics, alpha: 1, duration: 220 });
    this.titleText.setText(`${this.round.itemsPerGroup} กลุ่ม • กลุ่มละ ${this.round.groupCount}`);
    this.insightText.setText("จำนวนจุดเท่าเดิม แม้สลับจำนวนกลุ่ม");
  }

  answeringInsight() {
    const plan = this.round.representationPlan;
    if (plan?.mode === "quarter-hundred") {
      return `${plan.anchorExplanation} • รวมเป็นกี่ร้อยและเหลือกี่กลุ่ม?`;
    }
    if (plan?.mode === "place-value") return `${plan.decomposition} • รวมทั้งหมดเท่าไร?`;
    return "จุดชุดเดิมทั้งหมด • ผลรวมควรเป็นเท่าไร?";
  }

  positionDots(positions, animate) {
    this.dots.forEach((dot, index) => {
      const position = positions[index];
      if (animate) this.scene.tweens.add({ targets: dot, ...position, duration: 300 });
      else dot.setPosition(position.x, position.y);
    });
  }

  drawGroups(columns, rows, color) {
    this.groupGraphics.clear();
    if (this.isWeighted()) {
      const layout = createMatrixLayout(columns, rows);
      const metrics = matrixMetrics(columns, rows);
      this.groupGraphics.lineStyle(Math.max(1.5, metrics.radius * 0.35), color, 0.72);
      for (let column = 0; column < columns; column += 1) {
        const first = layout[column * rows];
        const last = layout[column * rows + rows - 1];
        const width = Math.max(18, metrics.gapX * 0.72);
        const top = first.y - metrics.radius - 4;
        const height = Math.max(18, last.y - first.y + metrics.radius * 2 + 8);
        this.drawGroupCard(first.x - width / 2, top, width, height, color);
      }
      return;
    }
    const model = createGroupedLayout(columns, rows);
    this.groupGraphics.lineStyle(2, color, 0.82);
    model.groups.forEach((group) => {
      this.drawGroupCard(group.x, group.y, group.width, group.height, color);
    });
  }

  drawGroupCard(x, y, width, height, color) {
    const radius = Math.min(10, width / 4, height / 4);
    this.groupGraphics.fillStyle(0x163f78, 0.48)
      .fillRoundedRect(x, y, width, height, radius);
    this.groupGraphics.lineStyle(2, color, 0.86)
      .strokeRoundedRect(x, y, width, height, radius);
    this.groupGraphics.lineStyle(1, 0xffffff, 0.34)
      .strokeRoundedRect(x + 3, y + 3, width - 6, Math.max(6, height * 0.28), Math.max(3, radius - 2));
  }

  clear() {
    this.animationToken += 1;
    this.layer.removeAll(true);
    this.container = null;
    this.groupGraphics = null;
    this.dots = [];
    this.titleText = null;
    this.insightText = null;
    this.round = null;
  }

  destroy() {
    this.clear();
    this.scene = null;
    this.layer = null;
  }
}

function createMatrixLayout(columns, rows) {
  const metrics = matrixMetrics(columns, rows);
  const positions = [];
  const startX = -((columns - 1) * metrics.gapX) / 2;
  const startY = FIELD.centerY - ((rows - 1) * metrics.gapY) / 2;
  for (let column = 0; column < columns; column += 1) {
    for (let row = 0; row < rows; row += 1) {
      positions.push({ x: startX + column * metrics.gapX, y: startY + row * metrics.gapY });
    }
  }
  return positions;
}

function createCompactLayout(count) {
  const columns = Math.min(12, Math.max(1, Math.ceil(Math.sqrt(count * 2.2))));
  const rows = Math.ceil(count / columns);
  const gapX = Math.min(42, FIELD.width / Math.max(1, columns - 1));
  const gapY = Math.min(18, FIELD.height / Math.max(1, rows - 1));
  const positions = [];
  for (let index = 0; index < count; index += 1) {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const itemsInRow = Math.min(columns, count - row * columns);
    positions.push({
      x: -((itemsInRow - 1) * gapX) / 2 + column * gapX,
      y: FIELD.centerY - ((rows - 1) * gapY) / 2 + row * gapY
    });
  }
  return positions;
}

function matrixMetrics(columns, rows) {
  const gapX = Math.min(58, FIELD.width / Math.max(1, columns - 1));
  const gapY = Math.min(17, FIELD.height / Math.max(1, rows - 1));
  return { gapX, gapY, radius: dotRadius(columns, rows) };
}

function dotRadius(columns, rows) {
  const gapX = Math.min(58, FIELD.width / Math.max(1, columns - 1));
  const gapY = Math.min(17, FIELD.height / Math.max(1, rows - 1));
  return Math.max(2.2, Math.min(7, Math.min(gapX, gapY) * 0.28));
}

function createGroupedLayout(groupCount, itemsPerGroup) {
  const safeGroups = Math.max(1, Math.min(12, Math.floor(groupCount)));
  const safeItems = Math.max(1, Math.min(12, Math.floor(itemsPerGroup)));
  const groupColumns = safeGroups <= 6 ? safeGroups : 6;
  const groupRows = Math.ceil(safeGroups / groupColumns);
  const cellWidth = FIELD.width / groupColumns;
  const cellHeight = FIELD.height / groupRows;
  const positions = [];
  const groups = [];

  for (let group = 0; group < safeGroups; group += 1) {
    const row = Math.floor(group / groupColumns);
    const column = group % groupColumns;
    const groupsInRow = Math.min(groupColumns, safeGroups - row * groupColumns);
    const centerX = -((groupsInRow - 1) * cellWidth) / 2 + column * cellWidth;
    const centerY = FIELD.centerY - ((groupRows - 1) * cellHeight) / 2 + row * cellHeight;
    const itemColumns = Math.min(4, Math.ceil(Math.sqrt(safeItems * 1.35)));
    const itemRows = Math.ceil(safeItems / itemColumns);
    const gapX = Math.min(16, (cellWidth - 18) / Math.max(1, itemColumns - 1));
    const gapY = Math.min(15, (cellHeight - 14) / Math.max(1, itemRows - 1));
    const radius = Math.max(2.8, Math.min(7, Math.min(gapX, gapY) * 0.28));
    const itemStartY = centerY - ((itemRows - 1) * gapY) / 2;

    for (let item = 0; item < safeItems; item += 1) {
      const itemRow = Math.floor(item / itemColumns);
      const itemColumn = item % itemColumns;
      const itemsInRow = Math.min(itemColumns, safeItems - itemRow * itemColumns);
      positions.push({
        x: centerX - ((itemsInRow - 1) * gapX) / 2 + itemColumn * gapX,
        y: itemStartY + itemRow * gapY
      });
    }

    const contentWidth = (Math.min(itemColumns, safeItems) - 1) * gapX + radius * 2;
    const contentHeight = (itemRows - 1) * gapY + radius * 2;
    const width = Math.min(cellWidth - 6, Math.max(30, contentWidth + 16));
    const height = Math.min(cellHeight - 5, Math.max(24, contentHeight + 12));
    groups.push({ x: centerX - width / 2, y: centerY - height / 2, width, height });
  }

  return { positions, groups };
}

function textStyle(size, color, strokeThickness) {
  return {
    fontFamily: "Mali, Segoe UI, sans-serif",
    fontSize: `${size}px`,
    fontStyle: "900",
    color,
    stroke: "#123368",
    strokeThickness,
    align: "center"
  };
}
