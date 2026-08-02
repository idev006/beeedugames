import { AnswerGenerator } from "./AnswerGenerator.js?v=20260802-12";
import { RepresentationStrategy } from "./RepresentationStrategy.js?v=20260731-57";

const PhaserRef = window.Phaser;

export class RoundFactory {
  constructor(config, store) {
    this.config = config;
    this.store = store;
    this.representationStrategy = new RepresentationStrategy(config.learning?.representation);
  }

  create() {
    const { tableMin, tableMax, difficulty } = this.store.settings;
    const min = Math.min(tableMin, tableMax);
    const max = Math.max(tableMin, tableMax);
    const verticalSlice = this.config.learning?.verticalSlice;
    const table = verticalSlice?.enabled
      ? verticalSlice.table
      : PhaserRef.Math.Between(min, max);
    const multiplier = verticalSlice?.enabled
      ? verticalSlice.multiplier
      : PhaserRef.Math.Between(this.config.multipliers.min, this.config.multipliers.max);
    const correct = table * multiplier;
    const difficultyConfig = this.config.difficulty.levels[difficulty];
    const answers = AnswerGenerator.build(
      correct,
      table,
      multiplier,
      difficultyConfig.answers,
      difficultyConfig.mistakeSpread,
      this.config.learning?.answerDistractors
    );
    const representationPlan = this.representationStrategy.create(table, multiplier);

    return {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      table,
      multiplier,
      correct,
      answers,
      representation: representationPlan.mode,
      representationPlan,
      groupCount: representationPlan.groupCount,
      itemsPerGroup: representationPlan.itemsPerGroup,
      district: this.store.levelIndex % this.config.assets.backgrounds.length,
      repairedTarget: Math.max(3, Math.ceil((max - min + 1) / 2))
    };
  }
}
