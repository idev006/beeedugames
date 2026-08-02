export class RepresentationStrategy {
  constructor(config = {}) {
    this.config = {
      smallTableMax: 12,
      maxVisibleGroups: 12,
      tensUnit: 10,
      quarterHundredTable: 25,
      quarterGroupSize: 4,
      ...config
    };
  }

  create(table, multiplier) {
    const safeTable = positiveInteger(table);
    const safeMultiplier = positiveInteger(multiplier);
    const useOriginalOrientation = safeTable <= this.config.smallTableMax;
    const groupCount = useOriginalOrientation ? safeTable : safeMultiplier;
    const itemsPerGroup = useOriginalOrientation ? safeMultiplier : safeTable;
    const mode = this.selectMode(itemsPerGroup);
    const chunks = this.createChunks(itemsPerGroup, mode);
    const plan = {
      mode,
      groupCount: Math.min(groupCount, this.config.maxVisibleGroups),
      itemsPerGroup,
      chunks,
      swappedForDisplay: !useOriginalOrientation,
      total: safeTable * safeMultiplier,
      equation: `${safeTable} × ${safeMultiplier}`,
      visualEquation: `${groupCount} × ${itemsPerGroup}`
    };

    if (mode === "quarter-hundred") {
      const anchorSize = this.config.quarterGroupSize;
      plan.anchorSize = anchorSize;
      plan.hundreds = Math.floor(groupCount / anchorSize);
      plan.remainderGroups = groupCount % anchorSize;
      plan.anchorExplanation = `${anchorSize} × ${itemsPerGroup} = 100`;
    } else if (mode === "place-value") {
      const tens = Math.floor(itemsPerGroup / this.config.tensUnit) * this.config.tensUnit;
      const ones = itemsPerGroup % this.config.tensUnit;
      plan.tens = tens;
      plan.ones = ones;
      plan.decomposition = `${groupCount} × ${itemsPerGroup} = (${groupCount} × ${tens})${ones ? ` + (${groupCount} × ${ones})` : ""}`;
    }
    return plan;
  }

  selectMode(itemsPerGroup) {
    if (itemsPerGroup === this.config.quarterHundredTable) return "quarter-hundred";
    if (itemsPerGroup > this.config.smallTableMax) return "place-value";
    return "equal-groups";
  }

  createChunks(itemsPerGroup, mode) {
    if (mode === "equal-groups") {
      return Array.from({ length: itemsPerGroup }, () => 1);
    }
    const chunks = [];
    let remaining = itemsPerGroup;
    while (remaining >= this.config.tensUnit) {
      chunks.push(this.config.tensUnit);
      remaining -= this.config.tensUnit;
    }
    if (remaining > 0) chunks.push(remaining);
    return chunks;
  }
}

function positiveInteger(value) {
  return Math.max(1, Math.floor(Number(value) || 1));
}
