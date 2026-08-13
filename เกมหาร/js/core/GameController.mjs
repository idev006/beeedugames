import { AdaptiveDifficulty } from './AdaptiveDifficulty.mjs';
import { EventBus } from './EventBus.mjs';
import { FeedbackDirector } from './FeedbackDirector.mjs';
import { MultiplicationFactGenerator } from './MultiplicationFactGenerator.mjs?v=p11-chapter-driven-adaptive-v29';
import { RoundStore } from './RoundStore.mjs';
import { SceneDirector } from './SceneDirector.mjs';

export class GameController {
  #subscribers = new Set();
  #completedGenerations = new Set();
  #scenarioCursor = 0;
  #practiceSettings = {};
  #activeChapterId = null;

  constructor(config, repository) {
    this.config = config;
    this.repository = repository;
    this.events = new EventBus();
    this.store = new RoundStore({
      remediationThreshold: config.learning.remediation.wrongAttemptsBeforeGuidedMode,
      resources: config.classroomResources,
    });
    this.feedback = new FeedbackDirector(config.feedbackTimings);
    this.scenes = new SceneDirector(config.cinematics);
    this.facts = new MultiplicationFactGenerator(config);
    this.#activeChapterId = config.progression?.chapters?.[0]?.id ?? null;
    // The flow channel is built from the ACTIVE CHAPTER's practice profile so
    // its range always matches the curriculum being played — the settings grade
    // is only a fallback for chapters without a profile.
    this.adaptive = this.#buildAdaptive();
  }

  subscribe(listener) {
    this.#subscribers.add(listener);
    listener(this.#snapshot());
    return () => this.#subscribers.delete(listener);
  }

  createDefaultRound() {
    this.feedback.dispose();
    const scenario = this.#nextScenario();
    this.#scenarioCursor += 1;
    const state = this.store.createRound(scenario.id, scenario);
    this.scenes.reset(state.generationId);
    this.events.emit('round:created', { roundId: state.generationId, scenarioId: scenario.id });
    this.#notify();
  }

  dispatch(intent) {
    const action = this.#handlers()[intent.type];
    if (!action) return false;
    const changed = action(intent);
    if (changed) this.#notify();
    return Boolean(changed);
  }

  setPracticeSettings(settings = {}) {
    const previousGrade = this.#practiceSettings.gradeLevel;
    this.#practiceSettings = { ...this.#practiceSettings, ...settings };
    if (previousGrade !== this.#practiceSettings.gradeLevel) {
      this.#scenarioCursor = 0;
      // Any grade change (including the first explicit set) starts a fresh flow
      // channel from the active chapter's base profile.
      this.adaptive = this.#buildAdaptive();
    }
  }

  // Fresh flow channel for a new session (called by the shell on session
  // restart/handoff): back to the active chapter's base, never carried across
  // sittings.
  resetAdaptive() {
    this.adaptive = this.#buildAdaptive();
  }

  setActiveChapter(chapterId) {
    if (!this.config.progression?.chapters?.some((chapter) => chapter.id === chapterId)) return false;
    this.#activeChapterId = chapterId;
    this.#scenarioCursor = 0;
    // A chapter is a new curriculum zone: each one starts its own flow channel
    // from that chapter's base profile.
    this.adaptive = this.#buildAdaptive();
    this.createDefaultRound();
    return true;
  }

  #handlers() {
    return {
      START_ROUND: () => {
        const changed = this.store.start();
        if (changed) this.scenes.advance('start_round');
        return changed;
      },
      PICK_FRUIT: ({ fruitId, toggle = false, additive = false }) => this.store.selectFruit(fruitId, { toggle, additive }),
      SELECT_FRUITS: ({ fruitIds, append = false }) => this.store.selectFruits(fruitIds, { append }),
      CLEAR_SELECTION: () => this.store.clearSelection(),
      SPLIT_FRUITS: ({ fruitIds }) => this.store.splitFruits(fruitIds),
      PLACE_FRUIT: ({ fruitId, basketId }) => {
        const changed = this.store.moveFruit(fruitId, basketId);
        if (changed) this.events.emit('fruit:placed', { fruitId, basketId });
        return changed;
      },
      PLACE_FRUITS: ({ fruitIds, basketId }) => {
        const changed = this.store.moveFruits(fruitIds, basketId);
        if (changed) this.events.emit('fruit:placed', { fruitIds, basketId });
        return changed;
      },
      RETURN_FRUIT: ({ fruitId }) => this.store.moveFruit(fruitId, 'source'),
      RESET: () => this.store.resetDistribution(),
      REQUEST_HINT: () => {
        const changed = this.store.useHint();
        if (changed) this.scenes.advance('hint_requested');
        return changed;
      },
      GUIDED_MOVE: () => Boolean(this.store.guidedMove()),
      ACKNOWLEDGE_SCAFFOLD: () => this.store.acknowledgeRemediation(),
      SUBMIT: () => this.#submit(),
      SKIP_SHOT: () => this.scenes.skip(),
      SELECT_CHAPTER: ({ chapterId }) => this.setActiveChapter(chapterId),
      REFLECTION_SHOT: () => {
        this.scenes.advance('reflection_requested');
        return true;
      },
      REPLAY: () => {
        this.createDefaultRound();
        return false;
      },
    };
  }

  #submit() {
    const result = this.store.beginEvaluation();
    if (!result) return false;
    this.events.emit('answer:evaluated', {
      roundId: result.generationId,
      correct: result.correct,
      attempt: result.attempt,
    });
    this.scenes.advance('answer_evaluated');
    this.feedback.schedule(result, (generationId) => this.#finishFeedback(generationId));
    return true;
  }

  #finishFeedback(generationId) {
    if (!this.store.finishFeedback(generationId)) return;
    const state = this.store.snapshot();
    if (state.phase === 'completed') this.#completeOnce(state);
    if (state.phase === 'remediation') {
      this.scenes.advance('remediation_enabled');
      this.events.emit('remediation:enabled', { roundId: generationId });
    }
    this.#notify();
  }

  #completeOnce(state) {
    if (this.#completedGenerations.has(state.generationId)) return;
    this.#completedGenerations.add(state.generationId);
    // P1-1 flow signal: a round counts as mastered only when solved on the
    // first check without a hint — the same quality bar the mastery window uses.
    this.adaptive?.record({ correct: state.attempts === 1 && state.hintsUsed === 0 });
    const scenario = state.scenario ?? this.config.scenarios[state.scenarioId];
    const stars = Math.max(1, scenario.reward.stars - Math.max(0, state.attempts - 1) - state.hintsUsed);
    this.store.grantReward({ ...scenario.reward, stars });
    this.scenes.advance('reward_granted');
    const saved = this.repository.saveBest({
      scenarioId: state.scenarioId,
      chapterId: this.#activeChapterId,
      bandId: this.config.defaults.bandId,
      stars,
      attempts: state.attempts,
      hintsUsed: state.hintsUsed,
      dividend: state.dividend,
      divisor: state.divisor,
      quotient: Math.floor(state.dividend / state.divisor),
      remainder: state.dividend % state.divisor,
      playerId: state.settings?.playerId,
      playerName: state.settings?.playerName,
      completedAt: new Date().toISOString(),
    });
    this.lastReward = {
      stars,
      score: saved?.score ?? null,
      rank: saved?.rank ?? null,
      inTopTen: saved?.rank != null,
    };
    this.events.emit('reward:granted', { roundId: state.generationId, stars, score: this.lastReward.score, rank: this.lastReward.rank });
  }

  #notify() {
    const state = this.#snapshot();
    for (const listener of this.#subscribers) listener(state);
  }

  #snapshot() {
    return { ...this.store.snapshot(), activeChapterId: this.#activeChapterId, cinematic: this.scenes.snapshot(), lastReward: this.lastReward ?? null };
  }

  #activePractice() {
    return this.config.progression?.chapters?.find((chapter) => chapter.id === this.#activeChapterId)?.practice ?? {};
  }

  #scenarioIds() {
    const grade = this.#practiceSettings.gradeLevel ?? this.config.settingsDefaults?.gradeLevel;
    return this.config.practiceProfiles?.[grade]?.scenarioIds ?? this.config.missions[this.config.defaults.missionId].scenarioIds;
  }

  #nextScenario() {
    const grade = this.#practiceSettings.gradeLevel ?? this.config.settingsDefaults?.gradeLevel;
    const practice = this.#activePractice();
    const generated = this.facts.scenarioFor(practice.factPracticeProfile ?? this.config.practiceProfiles?.[grade]?.factPracticeProfile, this.#scenarioCursor, { random: this.#practiceSettings.randomFacts !== false, selectedDivisors: this.#practiceSettings.selectedDivisors ?? practice.selectedDivisors, allowRemainder: practice.allowRemainder ?? this.#practiceSettings.allowRemainder, rangeOverride: this.adaptive?.bounds() });
    if (generated) return generated;
    const scenarioIds = this.#scenarioIds();
    const scenarioId = scenarioIds[this.#scenarioCursor % scenarioIds.length];
    const fallback = { ...this.config.scenarios[scenarioId], id: scenarioId };
    // P0-1 fruit novelty: static config scenarios hard-code apples — rotate the
    // fruit by round cursor so even the fallback path varies (same mechanic).
    if (!Array.isArray(fallback.objectTypes) || !fallback.objectTypes.length) {
      const objectTypes = this.config.factPractice?.objectTypes ?? ['apple'];
      const objectType = objectTypes[this.#scenarioCursor % objectTypes.length] ?? 'apple';
      return { ...fallback, objectType, objectTypes: [objectType] };
    }
    return fallback;
  }

  #activePracticeProfile() {
    const chapterProfile = this.config.progression?.chapters?.find((chapter) => chapter.id === this.#activeChapterId)?.practice?.factPracticeProfile;
    return chapterProfile ?? this.#practiceSettings.gradeLevel ?? this.config.settingsDefaults?.gradeLevel ?? 'p1';
  }

  #buildAdaptive() {
    const settings = this.config.factPractice;
    const profile = settings?.gradeProfiles?.[this.#activePracticeProfile()];
    if (!settings?.enabled || !profile) return null;
    return new AdaptiveDifficulty({
      baseRange: {
        divisor: { min: profile.divisor.min, max: profile.divisor.max },
        quotient: { min: profile.quotient.min, max: profile.quotient.max },
      },
      maxRange: {
        divisor: { min: settings.divisor.min, max: settings.divisor.max },
        quotient: { min: settings.quotient.min, max: settings.quotient.max },
      },
      windowSize: this.config.learning.mastery.windowSize,
      correctRequired: this.config.learning.mastery.correctRequired,
    });
  }

  dispose() {
    this.feedback.dispose();
    this.scenes.dispose();
    this.events.emit('round:disposed', { roundId: this.store.state.generationId });
    this.events.dispose();
    this.#subscribers.clear();
  }
}
