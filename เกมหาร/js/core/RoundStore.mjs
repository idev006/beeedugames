import { DivisionRules } from './DivisionRules.mjs';

const ALLOWED_SUBMIT_PHASES = new Set(['manipulating']);

export class RoundStore {
  #generationCounter = 0;

  constructor({ remediationThreshold = 2, resources = {} } = {}) {
    this.remediationThreshold = remediationThreshold;
    this.resourceConfig = resources;
    this.state = this.#emptyState();
  }

  #emptyState() {
    return {
      phase: 'booting',
      generationId: 0,
      scenarioId: null,
      scenario: null,
      dividend: 0,
      divisor: 0,
      fruits: [],
      basketIds: [],
      expandedFruitIds: [],
      fiveUnitFruitIds: [],
      selectedFruitId: null,
      selectedFruitIds: [],
      attempts: 0,
      hintsUsed: 0,
      resources: {
        gardenHearts: 0,
        dewDrops: 0,
      },
      remediationEnabled: false,
      feedback: null,
      reward: null,
    };
  }

  createRound(scenarioId, scenario) {
    const generationId = ++this.#generationCounter;
    const basketIds = Array.from({ length: scenario.divisor }, (_, index) => `basket-${index + 1}`);
    const objectTypes = Array.isArray(scenario.objectTypes) && scenario.objectTypes.length ? scenario.objectTypes : [scenario.objectType ?? 'apple'];
    this.state = {
      ...this.#emptyState(),
      phase: 'orienting',
      generationId,
      scenarioId,
      scenario,
      dividend: scenario.dividend,
      divisor: scenario.divisor,
      basketIds,
      resources: {
        gardenHearts: this.resourceConfig.gardenHearts?.initial ?? 0,
        dewDrops: this.resourceConfig.dewDrops?.initial ?? 0,
      },
      fruits: Array.from({ length: scenario.dividend }, (_, index) => ({
        id: `fruit-${index + 1}`,
        ownerId: 'source',
        objectType: objectTypes[index % objectTypes.length],
      })),
    };
    return this.snapshot();
  }

  start() {
    if (this.state.phase !== 'orienting') return false;
    this.state.phase = 'manipulating';
    return true;
  }

  selectFruit(fruitId, { toggle = false, additive = false } = {}) {
    if (this.state.phase !== 'manipulating') return false;
    const fruit = this.state.fruits.find((candidate) => candidate.id === fruitId);
    if (!fruit) return false;
    if (toggle) {
      this.state.selectedFruitIds = this.state.selectedFruitIds.includes(fruitId)
        ? this.state.selectedFruitIds.filter((id) => id !== fruitId)
        : [...this.state.selectedFruitIds, fruitId];
    } else if (additive) {
      this.state.selectedFruitIds = [...new Set([...this.state.selectedFruitIds, fruitId])];
    } else {
      this.state.selectedFruitIds = [fruitId];
    }
    this.state.selectedFruitId = this.state.selectedFruitIds.at(-1) ?? null;
    return true;
  }

  selectFruits(fruitIds, { append = false } = {}) {
    if (this.state.phase !== 'manipulating') return false;
    const validIds = new Set(this.state.fruits.map((fruit) => fruit.id));
    const nextIds = fruitIds.filter((fruitId) => validIds.has(fruitId));
    if (!nextIds.length) return false;
    this.state.selectedFruitIds = append ? [...new Set([...this.state.selectedFruitIds, ...nextIds])] : [...new Set(nextIds)];
    this.state.selectedFruitId = this.state.selectedFruitIds.at(-1) ?? null;
    return true;
  }

  clearSelection() {
    if (!this.state.selectedFruitId && !this.state.selectedFruitIds.length) return false;
    this.state.selectedFruitId = null;
    this.state.selectedFruitIds = [];
    return true;
  }

  moveFruit(fruitId, ownerId) {
    if (this.state.phase !== 'manipulating') return false;
    const validOwner = ownerId === 'source' || this.state.basketIds.includes(ownerId);
    const fruit = this.state.fruits.find((candidate) => candidate.id === fruitId);
    if (!fruit || !validOwner) return false;
    const previousOwner = fruit.ownerId;
    fruit.ownerId = ownerId;
    this.state.selectedFruitId = null;
    this.state.selectedFruitIds = [];
    this.#clearSplitCapsFor([previousOwner, ownerId]);
    this.#assertConservation();
    return true;
  }

  moveFruits(fruitIds, ownerId) {
    if (this.state.phase !== 'manipulating') return false;
    const validOwner = ownerId === 'source' || this.state.basketIds.includes(ownerId);
    if (!validOwner || !fruitIds.length) return false;
    const wanted = new Set(fruitIds);
    const fruits = this.state.fruits.filter((fruit) => wanted.has(fruit.id));
    if (fruits.length !== wanted.size) return false;
    const previousOwners = new Set(fruits.map((fruit) => fruit.ownerId));
    for (const fruit of fruits) fruit.ownerId = ownerId;
    this.state.selectedFruitId = null;
    this.state.selectedFruitIds = [];
    this.#clearSplitCapsFor([...previousOwners, ownerId]);
    this.#assertConservation();
    return true;
  }

  splitFruits(fruitIds) {
    if (this.state.phase !== 'manipulating') return false;
    const validIds = new Set(this.state.fruits.map((fruit) => fruit.id));
    const nextIds = fruitIds.filter((fruitId) => validIds.has(fruitId));
    if (nextIds.length <= 1) return false;
    if (nextIds.length >= 10) {
      // A 10-value token breaks into two 5-value tokens first.
      this.state.fiveUnitFruitIds = [...new Set([...this.state.fiveUnitFruitIds, ...nextIds])];
      this.state.expandedFruitIds = this.state.expandedFruitIds.filter((id) => !nextIds.includes(id));
    } else {
      // A 5-value (or smaller remainder) token breaks into single fruits.
      this.state.expandedFruitIds = [...new Set([...this.state.expandedFruitIds, ...nextIds])];
      this.state.fiveUnitFruitIds = this.state.fiveUnitFruitIds.filter((id) => !nextIds.includes(id));
    }
    return true;
  }

  resetDistribution() {
    if (this.state.phase !== 'manipulating') return false;
    for (const fruit of this.state.fruits) fruit.ownerId = 'source';
    this.state.selectedFruitId = null;
    this.state.selectedFruitIds = [];
    this.state.feedback = null;
    this.#clearSplitCapsFor(['source']);
    return true;
  }

  beginEvaluation() {
    if (!ALLOWED_SUBMIT_PHASES.has(this.state.phase)) return null;
    this.state.phase = 'evaluating';
    const basketCounts = this.state.basketIds.map((id) => this.countFor(id));
    const result = DivisionRules.evaluateGroups({
      dividend: this.state.dividend,
      divisor: this.state.divisor,
      basketCounts,
      sourceCount: this.countFor('source'),
    });
    this.state.attempts += 1;
    this.state.feedback = result;
    this.state.phase = result.correct ? 'feedbackCorrect' : 'feedbackWrong';
    return { ...result, generationId: this.state.generationId, attempt: this.state.attempts };
  }

  finishFeedback(generationId) {
    if (generationId !== this.state.generationId) return false;
    if (this.state.phase === 'feedbackCorrect') {
      this.state.phase = 'completed';
      return true;
    }
    if (this.state.phase === 'feedbackWrong') {
      this.state.remediationEnabled = this.state.attempts >= this.remediationThreshold;
      this.state.phase = this.state.remediationEnabled ? 'remediation' : 'manipulating';
      return true;
    }
    return false;
  }

  acknowledgeRemediation() {
    if (this.state.phase !== 'remediation') return false;
    this.state.phase = 'manipulating';
    return true;
  }

  useHint() {
    if (!['manipulating', 'remediation'].includes(this.state.phase)) return false;
    if (this.state.resources.dewDrops <= 0) return false;
    this.state.resources.dewDrops -= 1;
    this.state.hintsUsed += 1;
    this.state.remediationEnabled = true;
    return true;
  }

  guidedMove() {
    if (this.state.phase !== 'manipulating' || !this.state.remediationEnabled) return null;
    const fruit = this.state.fruits.find((candidate) => candidate.ownerId === 'source');
    if (!fruit) return null;
    const basketId = this.state.basketIds
      .map((id) => ({ id, count: this.countFor(id) }))
      .sort((a, b) => a.count - b.count || a.id.localeCompare(b.id))[0].id;
    this.moveFruit(fruit.id, basketId);
    return { fruitId: fruit.id, basketId };
  }

  grantReward(reward) {
    if (this.state.phase !== 'completed' || this.state.reward) return false;
    this.state.reward = { ...reward };
    return true;
  }

  countFor(ownerId) {
    return this.state.fruits.filter((fruit) => fruit.ownerId === ownerId).length;
  }

  snapshot() {
    return structuredClone(this.state);
  }

  #clearSplitCapsFor(ownerIds) {
    // A pile re-groups automatically whenever its own composition changes,
    // so split caps only ever last while the fruits stay put.
    const owners = new Set(ownerIds);
    const affected = new Set(this.state.fruits.filter((fruit) => owners.has(fruit.ownerId)).map((fruit) => fruit.id));
    this.state.expandedFruitIds = this.state.expandedFruitIds.filter((id) => !affected.has(id));
    this.state.fiveUnitFruitIds = this.state.fiveUnitFruitIds.filter((id) => !affected.has(id));
  }

  #assertConservation() {
    if (this.state.fruits.length !== this.state.dividend) {
      throw new Error('fruit conservation invariant failed');
    }
    const ids = new Set(this.state.fruits.map((fruit) => fruit.id));
    if (ids.size !== this.state.dividend) throw new Error('fruit IDs must be unique');
  }
}
