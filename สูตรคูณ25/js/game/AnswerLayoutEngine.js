const DEFAULTS = Object.freeze({
  minX: 205,
  maxX: 1080,
  minY: 370,
  maxY: 660,
  targetRadius: 112,
  minCenterDistance: 238,
  maxAttemptsPerTarget: 160
});

export class AnswerLayoutEngine {
  constructor(options = {}) {
    this.options = { ...DEFAULTS, ...options };
    this.lastSignature = "";
    this.fallbackLayouts = [
      [
        { x: 360, y: 390 },
        { x: 570, y: 640 },
        { x: 790, y: 390 },
        { x: 850, y: 660 },
        { x: 1050, y: 390 }
      ],
      [
        { x: 350, y: 400 },
        { x: 590, y: 650 },
        { x: 810, y: 385 },
        { x: 850, y: 660 },
        { x: 1060, y: 400 }
      ]
    ];
  }

  generate(count, random = Math.random) {
    const safeCount = Math.max(1, Math.min(5, Math.floor(count)));

    for (let layoutAttempt = 0; layoutAttempt < 12; layoutAttempt += 1) {
      const positions = [];
      for (let index = 0; index < safeCount; index += 1) {
        const candidate = this.findCandidate(positions, random);
        if (!candidate) break;
        positions.push(candidate);
      }

      if (positions.length === safeCount) {
        const signature = this.signature(positions);
        if (signature !== this.lastSignature || layoutAttempt === 11) {
          this.lastSignature = signature;
          return positions;
        }
      }
    }

    const fallback = this.pickFallback(safeCount, random);
    this.lastSignature = this.signature(fallback);
    return fallback;
  }

  findCandidate(existing, random) {
    const options = this.options;
    for (let attempt = 0; attempt < options.maxAttemptsPerTarget; attempt += 1) {
      const candidate = {
        x: Math.round(lerp(options.minX, options.maxX, random())),
        y: Math.round(lerp(options.minY, options.maxY, random()))
      };
      if (this.isSafe(candidate, existing)) return candidate;
    }
    return null;
  }

  isSafe(candidate, existing) {
    if (existing.some((point) => distance(candidate, point) < this.options.minCenterDistance)) {
      return false;
    }

    // Keep choices away from Lumin in the lower-left corner.
    if (distance(candidate, { x: 116, y: 646 }) < 300) return false;

    // Reserve the lower-right camera-preview area used by AR.
    if (insideExpandedRect(candidate, { x: 1010, y: 625, w: 270, h: 175 }, this.options.targetRadius)) {
      return false;
    }

    return true;
  }

  pickFallback(count, random) {
    const source = this.fallbackLayouts[Math.floor(random() * this.fallbackLayouts.length)];
    return source.slice(0, count).map((point) => ({ ...point }));
  }

  signature(positions) {
    return positions
      .map((point) => `${Math.round(point.x / 80)}:${Math.round(point.y / 80)}`)
      .join("|");
  }
}

function lerp(min, max, amount) {
  return min + (max - min) * amount;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function insideExpandedRect(point, rect, padding) {
  return (
    point.x >= rect.x - padding &&
    point.x <= rect.x + rect.w + padding &&
    point.y >= rect.y - padding &&
    point.y <= rect.y + rect.h + padding
  );
}
