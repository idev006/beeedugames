import { EventBus } from "./EventBus.js?v=20260731-36";
import { RoundFactory } from "./RoundFactory.js?v=20260802-58";

function cloneDomainData(value) {
  return JSON.parse(JSON.stringify(value || {}));
}

export class GameStore extends EventBus {
  constructor(config) {
    super();
    this.config = config;
    this.settings = {
      tableMin: config.tables.defaultMin,
      tableMax: config.tables.defaultMax,
      seconds: config.session.defaultSeconds,
      musicVolume: config.audio.musicVolume,
      sfxVolume: config.audio.sfxVolume,
      arAnswerDwellMs: config.ar.answerDwellMs,
      difficulty: config.difficulty.default,
      mode: "challenge"
    };
    this.resetRuntime();
    this.roundFactory = new RoundFactory(config, this);
  }

  resetRuntime() {
    if (this.pendingTransitionTimer) window.clearTimeout(this.pendingTransitionTimer);
    this.runtimeGeneration = (this.runtimeGeneration || 0) + 1;
    this.pendingTransitionTimer = null;
    this.started = false;
    this.sessionState = "idle";
    this.finishReason = null;
    this.stars = 0;
    this.lives = this.config.session.startingLives;
    this.secondsLeft = this.settings?.seconds || this.config.session.defaultSeconds;
    this.combo = 0;
    this.repaired = 0;
    this.totalAnswers = 0;
    this.correctAnswers = 0;
    this.answerEvidence = [];
    this.levelIndex = 1;
    this.roundIndex = 0;
    this.currentRound = null;
    this.transitioning = false;
    this.milestoneActive = false;
    this.groupProgress = 0;
    this.groupCompleted = false;
    this.learningPhase = "idle";
    this.scaffoldReason = null;
    this._chargedGroups = new Set();
    this.roundMistakes = 0;
    this.learningStats = cloneDomainData(this.initialLearningStats);
    this.missionTitle = "เตรียมเปิดหอชาร์จพลัง";
    this.missionHint = "เลือกคริสตัลที่เติมพลังได้พอดี";
    this.miniGroupCount = 3;
  }

  start(options = {}) {
    this.resetRuntime();
    const requestedLevel = Math.round(Number(options.levelIndex));
    if (Number.isFinite(requestedLevel)) {
      this.levelIndex = Math.max(0, Math.min(this.config.assets.backgrounds.length - 1, requestedLevel));
    }
    this.sessionSettings = { ...this.settings };
    this.secondsLeft = Math.min(
      this.config.session.maxSeconds,
      Math.max(this.config.session.minSeconds, this.settings.seconds)
    );
    this.started = true;
    this.sessionId = globalThis.crypto?.randomUUID?.() || `session-${Date.now()}-${this.runtimeGeneration}`;
    this.sessionStartedAt = Date.now();
    this.sessionState = "playing";
    this.nextRound();
    this.emit("runtime:update");
  }

  setLearningHistory(history) {
    this.initialLearningStats = cloneDomainData(history);
    if (!this.started) this.learningStats = cloneDomainData(this.initialLearningStats);
  }

  tick() {
    if (!this.started || this.milestoneActive || this.sessionState !== "playing" || this.learningPhase === "transforming") return;
    this.secondsLeft = Math.max(0, this.secondsLeft - 1);
    if (this.secondsLeft <= 0) this.finish("time");
    this.emit("runtime:update");
  }

  nextRound() {
    this.roundIndex += 1;
    this.currentRound = this.roundFactory.create();
    this.currentRound.startedAt = performance.now();
    this.roundMistakes = 0;
    this.groupProgress = 0;
    const guided = this.shouldGuideRound(this.currentRound);
    this.groupCompleted = !guided;
    this.learningPhase = guided ? "grouping" : "answering";
    this.scaffoldReason = guided ? "first-exposure" : "mastered";
    this.currentRound.guidedExposureCompleted = false;
    this.currentRound.startedGuided = guided;
    this._chargedGroups = new Set();
    this.sessionState = "playing";
    this.missionTitle = `${this.currentRound.groupCount} หอชาร์จ หอละ ${this.currentRound.itemsPerGroup} แสง`;
    this.updateMissionCopy();
    this.miniGroupCount = this.currentRound.groupCount;
    this.emit("round:new", { round: this.currentRound });
    this.emit("phase:changed", { phase: this.learningPhase, reason: this.scaffoldReason });
    this.emit("runtime:update");
  }

  submit(value) {
    if (
      !this.started ||
      this.sessionState !== "playing" ||
      !this.currentRound ||
      this.transitioning ||
      this.learningPhase !== "answering"
    ) return;
    const isCorrect = value === this.currentRound.correct;
    const responseTimeMs = Math.max(0, Math.round(performance.now() - (this.currentRound.startedAt || performance.now())));
    this.answerEvidence.push({
      sequence: this.answerEvidence.length + 1,
      roundIndex: this.roundIndex,
      table: this.currentRound.table,
      multiplier: this.currentRound.multiplier,
      selected: Math.round(Number(value)),
      responseTimeMs,
      atMs: Math.max(0, Date.now() - (this.sessionStartedAt || Date.now()))
    });
    const learningKey = `${this.currentRound.table}x${this.currentRound.multiplier}`;
    const stats = this.learningStats[learningKey] || {
      table: this.currentRound.table,
      multiplier: this.currentRound.multiplier,
      attempts: 0,
      correct: 0,
      totalResponseTimeMs: 0,
      accuracy: 0,
      lastSeen: null
    };
    stats.attempts += 1;
    stats.totalResponseTimeMs += responseTimeMs;
    stats.lastSeen = new Date().toISOString();
    this.totalAnswers += 1;
    this.transitioning = true;
    this.sessionState = "feedback";
    this.learningPhase = "feedback";
    const needsRemediation = Boolean(
      this.config.learning?.adaptiveScaffold?.remediateFastTrackMistake &&
      !this.currentRound.guidedExposureCompleted
    );

    if (isCorrect) {
      this.correctAnswers += 1;
      stats.correct += 1;
      this.combo += 1;
      this.repaired += 1;
      this.stars += 2 + Math.min(5, this.combo);
      const milestone = this.createMilestone();
      this.milestoneActive = Boolean(milestone);
      stats.accuracy = stats.correct / stats.attempts;
      this.learningStats[learningKey] = stats;
      this.emit("answer:correct", { value, milestone, responseTimeMs, learningKey, mastery: { ...stats } });
      if (milestone) this.emit("progress:milestone", milestone);
      this.emit("runtime:update");

      const delay = milestone
        ? this.config.progression?.milestoneDelayMs || 3200
        : this.config.progression?.normalRoundDelayMs || 900;
      const generation = this.runtimeGeneration;
      this.pendingTransitionTimer = window.setTimeout(() => {
        this.pendingTransitionTimer = null;
        if (!this.started || generation !== this.runtimeGeneration) return;
        if (milestone) {
          this.levelIndex = milestone.toLevelIndex;
          this.milestoneActive = false;
          this.emit("district:changed", milestone);
        }
        this.transitioning = false;
        this.nextRound();
      }, delay);
    } else {
      this.roundMistakes += 1;
      stats.accuracy = stats.correct / stats.attempts;
      this.learningStats[learningKey] = stats;
      this.combo = 0;
      this.lives = this.settings.mode === "practice"
        ? Math.max(1, this.lives - 1)
        : Math.max(0, this.lives - 1);
      this.emit("answer:wrong", {
        value,
        correct: this.currentRound.correct,
        table: this.currentRound.table,
        multiplier: this.currentRound.multiplier,
        attemptsForRound: this.roundMistakes,
        responseTimeMs,
        learningKey,
        mastery: { ...stats }
      });
      if (this.lives <= 0 && this.settings.mode !== "practice") {
        this.finish("lives");
      } else {
        const generation = this.runtimeGeneration;
        this.pendingTransitionTimer = window.setTimeout(() => {
          this.pendingTransitionTimer = null;
          if (!this.started || generation !== this.runtimeGeneration) return;
          this.transitioning = false;
          if (needsRemediation) {
            this.beginRemediation();
          } else {
            this.sessionState = "playing";
            this.learningPhase = "answering";
            this.updateMissionCopy();
            this.emit("phase:changed", { phase: "answering", reason: "retry" });
          }
          this.emit("runtime:update");
        }, 650);
      }
    }

    this.emit("runtime:update");
  }

  chargeGroup(index) {
    if (
      !this.started ||
      this.sessionState !== "playing" ||
      !this.currentRound ||
      this.transitioning ||
      this.learningPhase !== "grouping"
    ) return;
    const groupIndex = Number(index);
    if (!Number.isInteger(groupIndex) || groupIndex < 0 || groupIndex >= this.currentRound.groupCount) return;
    if (!this._chargedGroups) this._chargedGroups = new Set();
    if (this._chargedGroups.has(groupIndex)) return;

    this._chargedGroups.add(groupIndex);
    this.groupProgress = this._chargedGroups.size;
    this.emit("group:updated", {
      index: groupIndex,
      progress: this.groupProgress,
      total: this.currentRound.groupCount,
      completed: this.groupProgress >= this.currentRound.groupCount
    });

    if (this.groupProgress < this.currentRound.groupCount) {
      this.missionHint = `นับแล้ว ${this.groupProgress}/${this.currentRound.groupCount} กลุ่ม • กลุ่มละ ${this.currentRound.itemsPerGroup} ดวง`;
      this.emit("runtime:update");
      return;
    }

    this.groupCompleted = true;
    this.learningPhase = "transforming";
    this.missionHint = "ดูจุดพลังชุดเดิมจัดกลุ่มใหม่ โดยจำนวนไม่เพิ่มและไม่หาย";
    this.emit("phase:changed", { phase: "transforming", reason: "groups-complete" });
    this.emit("group:complete", {
      table: this.currentRound.table,
      multiplier: this.currentRound.multiplier,
      total: this.currentRound.correct,
      repeatedAddition: Array.from({ length: this.currentRound.groupCount }, () => this.currentRound.itemsPerGroup).join(" + ")
    });
    this.emit("runtime:update");
  }

  getUnchargedGroupIndices() {
    if (!this.currentRound || this.learningPhase !== "grouping") return [];
    const charged = this._chargedGroups || new Set();
    return Array.from(
      { length: this.currentRound.groupCount },
      (_, index) => index
    ).filter((index) => !charged.has(index));
  }

  completeTransformation() {
    if (!this.started || this.learningPhase !== "transforming" || !this.currentRound) return;
    this.currentRound.guidedExposureCompleted = true;
    this.learningPhase = "answering";
    this.sessionState = "playing";
    this.updateMissionCopy();
    this.emit("phase:changed", { phase: "answering", reason: "transform-complete" });
    this.emit("runtime:update");
  }

  beginRemediation() {
    if (!this.currentRound) return;
    this.groupProgress = 0;
    this.groupCompleted = false;
    this._chargedGroups = new Set();
    this.learningPhase = "grouping";
    this.scaffoldReason = "remediation";
    this.sessionState = "playing";
    this.updateMissionCopy();
    this.emit("phase:changed", { phase: "grouping", reason: "remediation", resetGroups: true });
  }

  shouldGuideRound(round) {
    if (this.config.learning?.equalGroupsMode === "required") return true;
    const policy = this.config.learning?.adaptiveScaffold;
    if (!policy?.enabled) return this.config.learning?.equalGroupsMode === "required";
    const stats = this.learningStats[`${round.table}x${round.multiplier}`];
    if (!stats) return true;
    return (
      stats.correct < (policy.minCorrectAttempts || 2) ||
      stats.accuracy < (policy.minAccuracy || 0.8)
    );
  }

  updateMissionCopy() {
    if (!this.currentRound) return;
    const { groupCount, itemsPerGroup } = this.currentRound;
    const swapNote = this.currentRound.representationPlan?.swappedForDisplay
      ? ` • มอง ${this.currentRound.table} × ${this.currentRound.multiplier} เป็น ${groupCount} × ${itemsPerGroup}`
      : "";
    if (this.learningPhase === "grouping") {
      this.missionHint = `ขั้น 1/2 • เติม ${groupCount} กลุ่ม กลุ่มละ ${itemsPerGroup} ดวง เพื่อปลดล็อกตัวเลือก${swapNote}`;
    } else if (this.learningPhase === "transforming") {
      this.missionHint = "กำลังจัดจุดพลังชุดเดิมและปลดล็อกตัวเลือก";
    } else if (this.learningPhase === "answering") {
      this.missionHint = `ขั้น 2/2 • ${groupCount} กลุ่ม กลุ่มละ ${itemsPerGroup} รวมเป็นเท่าไร`;
    }
  }

  get learningPhaseLabel() {
    return {
      grouping: "ขั้น 1/2 สร้างกลุ่ม",
      transforming: "กำลังสลับมุมมอง",
      answering: "ขั้น 2/2 เลือกคำตอบ",
      feedback: "ตรวจคำตอบ"
    }[this.learningPhase] || "เตรียมภารกิจ";
  }

  finish(reason) {
    if (!this.started || this.sessionState === "result") return false;
    if (this.pendingTransitionTimer) window.clearTimeout(this.pendingTransitionTimer);
    this.pendingTransitionTimer = null;
    this.runtimeGeneration += 1;
    this.started = false;
    this.sessionState = "result";
    this.finishReason = reason;
    this.transitioning = false;
    this.milestoneActive = false;
    const elapsedMs = Math.max(1, Date.now() - (this.sessionStartedAt || Date.now()));
    this.emit("game:finish", {
      reason,
      learningStats: this.getLearningSummary(),
      result: {
        sessionId: this.sessionId,
        elapsedSeconds: Math.max(1, Math.round(elapsedMs / 1000)),
        totalAnswers: this.totalAnswers,
        correctAnswers: this.correctAnswers,
        repaired: this.repaired,
        stars: this.stars,
        masteredPairs: Object.values(this.learningStats).filter((entry) => (
          entry.correct >= (this.config.learning?.adaptiveScaffold?.minCorrectAttempts || 2) &&
          entry.accuracy >= (this.config.learning?.adaptiveScaffold?.minAccuracy || 0.8)
        )).length,
        proof: {
          version: 1,
          elapsedMs,
          attempts: this.answerEvidence.map((attempt) => ({ ...attempt }))
        }
      },
      settings: { ...this.sessionSettings }
    });
    this.emit("runtime:update");
    return true;
  }

  getLearningSummary() {
    return Object.values(this.learningStats).map((entry) => ({
      ...entry,
      averageResponseTimeMs: entry.attempts
        ? Math.round(entry.totalResponseTimeMs / entry.attempts)
        : 0
    }));
  }

  createMilestone() {
    if (this.config.progression?.autoDistrictDuringSession === false) return null;
    const repairsPerDistrict = this.config.progression?.repairsPerDistrict || 4;
    const lastLevelIndex = this.config.assets.backgrounds.length - 1;
    if (this.repaired <= 0 || this.repaired % repairsPerDistrict !== 0 || this.levelIndex >= lastLevelIndex) {
      return null;
    }

    const toLevelIndex = this.levelIndex + 1;
    const companions = this.config.assets.districtCompanions || ["pix", "maru", "zen", "glimshade"];
    const companionId = companions[Math.max(0, toLevelIndex - 1) % companions.length];
    const profile = this.config.assets.characterPortraits?.[companionId] || {};
    const district = this.config.assets.backgrounds[toLevelIndex] || {};

    return {
      repaired: this.repaired,
      fromLevelIndex: this.levelIndex,
      toLevelIndex,
      companionId,
      companionName: profile.name || companionId,
      companionRole: profile.role || "สมาชิกทีมช่าง",
      arrivalLine: profile.arrivalLine || "พร้อมช่วยทีมซ่อมเมืองในภารกิจถัดไป",
      districtName: district.label || `เขตที่ ${toLevelIndex + 1}`
    };
  }
}
