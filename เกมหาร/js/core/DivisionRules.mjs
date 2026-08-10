export class DivisionRules {
  static calculate(dividend, divisor) {
    if (!Number.isInteger(dividend) || dividend < 0) {
      throw new RangeError('dividend must be a non-negative integer');
    }
    if (!Number.isInteger(divisor) || divisor <= 0) {
      throw new RangeError('divisor must be a positive integer');
    }
    return {
      quotient: Math.floor(dividend / divisor),
      remainder: dividend % divisor,
    };
  }

  static evaluateGroups({ dividend, divisor, basketCounts, sourceCount }) {
    if (!Array.isArray(basketCounts) || basketCounts.length !== divisor) {
      throw new RangeError('basket count must match divisor');
    }
    if (basketCounts.some((count) => !Number.isInteger(count) || count < 0)) {
      throw new RangeError('group sizes must be non-negative integers');
    }
    if (!Number.isInteger(sourceCount) || sourceCount < 0) {
      throw new RangeError('sourceCount must be a non-negative integer');
    }

    const distributed = basketCounts.reduce((total, count) => total + count, 0);
    if (distributed + sourceCount !== dividend) {
      throw new Error('fruit conservation invariant failed');
    }

    const expected = this.calculate(dividend, divisor);
    const equalGroups = new Set(basketCounts).size === 1;
    const groupsMatchQuotient = basketCounts.every((count) => count === expected.quotient);
    const remainderMatches = sourceCount === expected.remainder;

    return {
      correct: equalGroups && groupsMatchQuotient && remainderMatches,
      equalGroups,
      groupsMatchQuotient,
      remainderMatches,
      ...expected,
    };
  }

  static validateBandScenario(band, scenario) {
    const result = this.calculate(scenario.dividend, scenario.divisor);
    const valid = scenario.dividend >= band.dividend.min
      && scenario.dividend <= band.dividend.max
      && scenario.divisor >= band.divisor.min
      && scenario.divisor <= band.divisor.max
      && (band.allowRemainder || result.remainder === 0);
    return { valid, ...result };
  }
}
