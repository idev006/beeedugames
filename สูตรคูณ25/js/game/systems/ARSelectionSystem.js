import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js?v=20260730-11";

const PhaserRef = window.Phaser;

export class ARSelectionSystem {
  constructor(scene, config, store, bridge, targetFieldResolver) {
    this.scene = scene;
    this.config = config;
    this.store = store;
    this.bridge = bridge;
    this.targetFieldResolver = targetFieldResolver;
    this.target = null;
    this.dwellStartedAt = 0;
    this.armed = true;
    this.lockUntil = 0;
    this.lastProgressSignature = "";
  }

  resetRound() {
    this.clearHover();
    this.emitProgress({ progress: 0, label: "" }, true);
  }

  update() {
    const pointer = this.bridge.arPointer;
    if (!pointer.visible) {
      this.clearHover();
      this.emitProgress({ progress: 0, label: "" });
      return;
    }

    const x = pointer.x * GAME_WIDTH;
    const y = pointer.y * GAME_HEIGHT;
    const now = performance.now();
    const targetField = this.targetFieldResolver?.();
    if (!targetField) {
      this.clearHover();
      return;
    }
    const activeTarget = targetField.findAt(x, y, "activeRadius");
    const nearTarget = activeTarget || targetField.findAt(x, y, "nearRadius");

    if (this.store.transitioning || now < this.lockUntil) {
      this.clearHover();
      this.emitProgress({
        progress: 0,
        label: "เลือกแล้ว",
        status: "รับคำตอบแล้ว รอแกนพลังงานชุดถัดไป..."
      });
      return;
    }

    if (!this.armed) {
      this.clearHover();
      if (!activeTarget) {
        this.armed = true;
        this.emitProgress({
          progress: 0,
          label: "",
          status: "พร้อมเลือกครั้งใหม่ เล็งไปที่เป้าหมายถัดไปได้เลย"
        }, true);
      } else {
        this.emitProgress({
          progress: 0,
          label: "ยกนิ้ว",
          status: "เลื่อนนิ้วออกจากเป้าหมายก่อน แล้วจึงเล็งครั้งใหม่"
        });
      }
      return;
    }

    if (!activeTarget) {
      const phase = this.store.learningPhase;
      const phaseLabel = phase === "grouping" ? "หาแท่น" : phase === "answering" ? "หาแกน" : "รอดูการจัดกลุ่ม";
      const phaseStatus = phase === "grouping"
        ? "เห็นนิ้วแล้ว: เล็งกลางแท่นพลังงานทีละกลุ่ม"
        : phase === "answering"
          ? "เห็นนิ้วแล้ว: เล็งกลางแกนคริสตัลคำตอบ"
          : "จุดพลังงานกำลังสลับมุมมอง กรุณารอสักครู่";
      this.clearHover();
      this.emitProgress({
        progress: 0,
        label: nearTarget ? "เล็งกลาง" : phaseLabel,
        status: nearTarget
          ? `ขยับ pointer เข้าใกล้กลาง${nearTarget.label}อีกนิด`
          : phaseStatus
      });
      return;
    }

    if (this.target?.id !== activeTarget.id) {
      this.clearHover();
      this.target = activeTarget;
      this.dwellStartedAt = now;
      this.scene.tweens.add({
        targets: activeTarget.container,
        scale: 1.14,
        duration: 130,
        ease: "Back.out"
      });
    }

    const dwellMs = activeTarget.kind === "group"
      ? Number(this.config.ar.groupDwellMs) || 180
      : activeTarget.kind === "batch"
        ? Number(this.config.ar.batchDwellMs) || 450
        : Number(this.store.settings.arAnswerDwellMs) || Number(this.config.ar.answerDwellMs) || Number(this.config.ar.dwellMs) || 500;
    const progress = PhaserRef.Math.Clamp((now - this.dwellStartedAt) / dwellMs, 0, 1);
    this.emitProgress({
      progress,
      label: progress >= 0.98 ? "เลือก" : "ล็อก",
      status: activeTarget.kind === "group"
        ? `กำลังชาร์จ ${activeTarget.label} ${Math.round(progress * 100)}%`
        : activeTarget.kind === "batch"
          ? `กำลังเปิด ${activeTarget.label} ${Math.round(progress * 100)}%`
        : `กำลังล็อก ${activeTarget.label} ${Math.round(progress * 100)}%`
    });
    if (progress < 1) return;

    const value = activeTarget.value;
    this.armed = false;
    this.lockUntil = now + (activeTarget.kind === "group" ? 100 : activeTarget.kind === "batch" ? 300 : 700);
    this.clearHover();
    this.emitProgress({
      progress: 1,
      label: activeTarget.kind === "group" ? "ชาร์จแล้ว" : activeTarget.kind === "batch" ? "เริ่มชาร์จ" : "เลือกแล้ว",
      status: activeTarget.kind === "group"
        ? `${activeTarget.label} มีพลังแล้ว เล็งกลุ่มถัดไปได้เลย`
        : activeTarget.kind === "batch"
          ? "คันโยกสายฟ้ากำลังชาร์จแท่งที่เหลือเรียงทีละกลุ่ม"
        : `รับคำตอบ ${value} แล้ว`
    }, true);
    this.bridge.emit("ar:selection", {
      targetId: activeTarget.id,
      kind: activeTarget.kind,
      label: activeTarget.label,
      value
    });
    targetField.selectTarget(activeTarget);
  }

  emitProgress(payload, force = false) {
    // Quantization prevents a 60 FPS Phaser loop from flooding Vue with redundant events.
    const signature = `${Math.round((payload.progress || 0) * 20)}|${payload.label || ""}|${payload.status || ""}`;
    if (!force && signature === this.lastProgressSignature) return;
    this.lastProgressSignature = signature;
    this.bridge.emit("ar:progress", payload);
  }

  clearHover() {
    if (this.target?.container?.active) {
      this.scene.tweens.add({ targets: this.target.container, scale: 1, duration: 120 });
    }
    this.target = null;
    this.dwellStartedAt = 0;
  }

  destroy() {
    this.clearHover();
    this.targetFieldResolver = null;
    this.scene = null;
    this.bridge = null;
  }
}
