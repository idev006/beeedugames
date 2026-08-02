export class RewardService {
  constructor(progressStore, config) {
    this.progress = progressStore;
    this.config = config;
  }

  async handleCorrect(context) {
    const eventId = `${context.sessionId}:round:${context.roundIndex}:correct`;
    if (this.progress.hasProcessedEvent(eventId)) return [];

    const rewards = [{ type: "gear", amount: 1, reason: "repair" }];
    const accuracy = context.totalAnswers ? context.correctAnswers / context.totalAnswers : 0;
    if (context.correctAnswers > 0 && context.correctAnswers % 3 === 0 && accuracy >= 0.8) {
      rewards.push({ type: "crystal", amount: 1, reason: "accuracy" });
    }
    if (context.combo > 0 && context.combo % 5 === 0) {
      rewards.push({ type: "energyCell", amount: 1, reason: "combo" });
    }

    const mastery = context.mastery;
    if (mastery && !this.progress.snapshot.mastery[context.learningKey]) {
      const policy = this.config.learning?.adaptiveScaffold || {};
      if (mastery.correct >= (policy.minCorrectAttempts || 2) && mastery.accuracy >= (policy.minAccuracy || 0.8)) {
        rewards.push({ type: "prism", amount: 1, reason: "mastery" });
      }
    }

    await this.progress.applyRewardEvent(eventId, rewards);
    return rewards;
  }
}
