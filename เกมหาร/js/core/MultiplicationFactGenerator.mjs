const DEFAULT_CHARACTERS = [
  'pompom-cloud-monster',
  'bento-pebble-monster',
  'tamo-sunspot-monster',
  'nara-sprout-monster',
  'teebo-moss-monster',
];

const DEFAULT_NAMES = ['ปอมปอม', 'เบนโตะ', 'ทาโม', 'นารา', 'ทีโบ'];

export class MultiplicationFactGenerator {
  constructor(config) {
    this.config = config;
  }

  scenarioFor(gradeLevel, cursor = 0, options = {}) {
    const bank = this.factsFor(gradeLevel, options);
    if (!bank.length) return null;
    const fact = bank[options.random ? Math.floor(Math.random() * bank.length) : cursor % bank.length];
    // P1-3 scenario diversity: each grade profile lists its framings ladder
    // (partitive → quotative → transfer) and the round cursor rotates through
    // them deterministically, so the same engine keeps offering new questions.
    const profile = this.config.factPractice?.gradeProfiles?.[gradeLevel];
    const framings = options.framing ? [options.framing] : (profile?.framings ?? ['partitive']);
    const framing = framings[cursor % framings.length] ?? 'partitive';
    const objectTypes = this.config.factPractice?.objectTypes ?? ['apple'];
    const objectType = objectTypes[cursor % objectTypes.length] ?? 'apple';
    const remainder = options.allowRemainder ? (options.random ? Math.floor(Math.random() * fact.divisor) : cursor % fact.divisor) : 0;
    const dividend = fact.dividend + remainder;
    const recipients = Array.from({ length: fact.divisor }, (_, index) => ({
      name: DEFAULT_NAMES[index % DEFAULT_NAMES.length],
      characterId: DEFAULT_CHARACTERS[index % DEFAULT_CHARACTERS.length],
    }));
    return {
      id: `fact-${dividend}-div-${fact.divisor}`,
      title: `${dividend} ÷ ${fact.divisor}`,
      dividend,
      divisor: fact.divisor,
      objectType,
      objectTypes: [objectType],
      quotient: fact.quotient,
      remainder,
      // P1-3: framing metadata — the engine always builds `divisor` groups of
      // `quotient` fruits each; the framing only changes how the question is
      // asked and which number is the answer.
      framing,
      groups: fact.divisor,
      quota: fact.quotient,
      representation: 'concrete_fact',
      source: 'multiplication_fact_generator',
      recipientNames: recipients.map((recipient) => recipient.name),
      recipientCharacterIds: recipients.map((recipient) => recipient.characterId),
      guideCharacterId: 'teebo-moss-monster',
      hostCharacterId: 'nara-sprout-monster',
      reward: { stars: 3, worldChange: 'party-flowers-bloom' },
    };
  }

  factsFor(gradeLevel, options = {}) {
    const settings = this.config.factPractice;
    const profile = settings?.gradeProfiles?.[gradeLevel];
    if (!settings?.enabled || !profile) return [];
    const maxDividend = Math.min(profile.maxConcreteDividend, settings.maxConcreteDividend);
    // P1-1 adaptive difficulty: an optional rangeOverride (from AdaptiveDifficulty)
    // widens/narrows the grade profile range without touching the global caps.
    const override = options.rangeOverride ?? {};
    const effDivisor = {
      min: Math.max(profile.divisor.min, Math.round(Number(override.divisor?.min) || profile.divisor.min)),
      max: Math.min(settings.divisor.max, Math.max(profile.divisor.min, Math.round(Number(override.divisor?.max) || profile.divisor.max))),
    };
    const effQuotient = {
      min: Math.max(profile.quotient.min, Math.round(Number(override.quotient?.min) || profile.quotient.min)),
      max: Math.min(settings.quotient.max, Math.max(profile.quotient.min, Math.round(Number(override.quotient?.max) || profile.quotient.max))),
    };
  const allowedDivisors = Array.isArray(options.selectedDivisors) && options.selectedDivisors.length ? new Set(options.selectedDivisors.map(Number)) : null;
  const facts = [];
  const seen = new Set();
  const addFact = (divisor, quotient) => {
    const dividend = divisor * quotient;
    const key = `${dividend}/${divisor}`;
    if (seen.has(key) || (allowedDivisors && !allowedDivisors.has(divisor)) || divisor > settings.divisor.max || quotient > settings.quotient.max || dividend > maxDividend) return;
    seen.add(key);
    facts.push({ dividend, divisor, quotient });
  };
  let divisors;
  if (allowedDivisors) {
    // P1-1 gap fix: the table filter must respect the adaptive rangeOverride —
    // otherwise the flow-channel divisor ceiling is silently bypassed whenever
    // tables are pinned (the default setting pins [2..12]). Intersect the
    // selected tables with the effective (adaptive-aware) range. If the player
    // explicitly chose ONLY tables above the ceiling, keep their choice rather
    // than return an empty bank — an explicit choice wins over the range.
    const withinRange = [...allowedDivisors].filter((divisor) => divisor >= effDivisor.min && divisor <= effDivisor.max);
    divisors = withinRange.length ? withinRange : [...allowedDivisors];
    divisors.sort((a, b) => a - b);
  } else {
    divisors = Array.from({ length: effDivisor.max - effDivisor.min + 1 }, (_, index) => effDivisor.min + index);
  }
    for (const fact of profile.seedFacts ?? []) addFact(fact.divisor, fact.quotient);
    for (const divisor of divisors) {
      for (let quotient = effQuotient.min; quotient <= effQuotient.max; quotient += 1) {
        addFact(divisor, quotient);
      }
    }
    return facts;
  }
}
