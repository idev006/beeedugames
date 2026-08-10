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
    const divisors = allowedDivisors ? [...allowedDivisors].filter((divisor) => divisor >= settings.divisor.min && divisor <= settings.divisor.max).sort((a, b) => a - b) : Array.from({ length: profile.divisor.max - profile.divisor.min + 1 }, (_, index) => profile.divisor.min + index);
    for (const fact of profile.seedFacts ?? []) addFact(fact.divisor, fact.quotient);
    for (const divisor of divisors) {
      for (let quotient = profile.quotient.min; quotient <= profile.quotient.max; quotient += 1) {
        addFact(divisor, quotient);
      }
    }
    return facts;
  }
}
