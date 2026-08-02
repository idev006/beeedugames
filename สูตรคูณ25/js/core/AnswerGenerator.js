const PhaserRef = window.Phaser;

function positiveUnique(values, correct) {
  return [...new Set(values.map((value) => Math.round(Number(value))))]
    .filter((value) => Number.isFinite(value) && value > 0 && value !== correct);
}

export class AnswerGenerator {
  static build(correct, table, multiplier, count, spread, policy = {}) {
    const answerCount = Math.max(3, Math.round(Number(count) || 4));
    const answers = new Set([correct]);
    const unitDigit = correct % 10;
    const configuredTarget = policy.sameUnitByAnswerCount?.[String(answerCount)];
    const sameUnitTarget = Math.min(
      answerCount - 2,
      Math.max(1, Math.round(Number(configuredTarget) || (answerCount >= 5 ? 2 : 1)))
    );

    const sameUnitCandidates = this.buildSameUnitCandidates(correct, policy);
    for (const value of PhaserRef.Utils.Array.Shuffle(sameUnitCandidates)) {
      answers.add(value);
      if ([...answers].filter((candidate) => candidate !== correct && candidate % 10 === unitDigit).length >= sameUnitTarget) break;
    }

    const misconceptionCandidates = this.buildMisconceptionCandidates(correct, table, multiplier, spread);
    const differentUnit = misconceptionCandidates.find((value) => value % 10 !== unitDigit);
    if (differentUnit && answers.size < answerCount) answers.add(differentUnit);

    for (const value of PhaserRef.Utils.Array.Shuffle(misconceptionCandidates)) {
      if (answers.size >= answerCount) break;
      answers.add(value);
    }

    for (let distance = 1; answers.size < answerCount && distance <= 60; distance += 1) {
      const offsets = [distance, -distance, distance * 10, distance * -10];
      for (const offset of offsets) {
        const value = correct + offset;
        if (value > 0 && value !== correct) answers.add(value);
        if (answers.size >= answerCount) break;
      }
    }

    return PhaserRef.Utils.Array.Shuffle([...answers].slice(0, answerCount)).map((value) => ({
      value,
      correct: value === correct
    }));
  }

  static buildSameUnitCandidates(correct, policy = {}) {
    const decadeStep = Math.max(10, Math.round(Number(policy.decadeStep) || 10));
    const maxDistance = Math.max(2, Math.round(Number(policy.maxDecadeDistance) || 3));
    const values = [];
    for (let distance = 1; distance <= maxDistance; distance += 1) {
      values.push(correct - (decadeStep * distance), correct + (decadeStep * distance));
    }
    return positiveUnique(values, correct);
  }

  static buildMisconceptionCandidates(correct, table, multiplier, spread) {
    return positiveUnique([
      table * Math.max(1, multiplier - 1),
      table * Math.min(12, multiplier + 1),
      Math.max(1, table - 1) * multiplier,
      Math.min(25, table + 1) * multiplier,
      table + multiplier,
      correct + table,
      correct - table,
      correct + multiplier,
      correct - multiplier,
      correct + spread,
      correct - spread,
      (table + 1) * Math.max(1, multiplier - 1),
      Math.max(1, table - 1) * Math.min(12, multiplier + 1)
    ], correct);
  }
}
