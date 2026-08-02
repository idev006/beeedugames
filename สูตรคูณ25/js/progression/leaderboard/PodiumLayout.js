const DEFAULTS = Object.freeze({
  goldAnchor: Object.freeze({ xPercent: 50, yPercent: 42.1 }),
  horizontalStepPercent: 12.5,
  silverDropPercent: 3.8,
  bronzeDropPercent: 6.4,
  labelAnchorYPercent: 64.3
});

export class PodiumLayout {
  constructor(config = {}) {
    this.gold = config.goldAnchor || DEFAULTS.goldAnchor;
    this.stepX = finiteOr(config.horizontalStepPercent, DEFAULTS.horizontalStepPercent);
    this.labelY = finiteOr(config.labelAnchorYPercent, DEFAULTS.labelAnchorYPercent);
    this.dropY = Object.freeze([
      0,
      finiteOr(config.silverDropPercent, DEFAULTS.silverDropPercent),
      finiteOr(config.bronzeDropPercent, DEFAULTS.bronzeDropPercent)
    ]);
    this.direction = Object.freeze([0, -1, 1]);
  }

  getAnchor(index) {
    const rankIndex = Math.max(0, Math.min(2, Math.round(Number(index) || 0)));
    return Object.freeze({
      xPercent: finiteOr(this.gold.xPercent, DEFAULTS.goldAnchor.xPercent) + this.direction[rankIndex] * this.stepX,
      yPercent: finiteOr(this.gold.yPercent, DEFAULTS.goldAnchor.yPercent) + this.dropY[rankIndex]
    });
  }

  getStyle(index) {
    const anchor = this.getAnchor(index);
    return Object.freeze({
      "--podium-x": `${anchor.xPercent}%`,
      "--podium-y": `${anchor.yPercent}%`,
      "--label-y": `${this.labelY}%`
    });
  }
}

function finiteOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
