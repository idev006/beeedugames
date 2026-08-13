// DifficultyGauge — P1-1 visibility: turns the adaptive flow-channel level into
// a friendly growth stage (ต้นกล้า → ใบไม้ → ดอกไม้ → ผลไม้ / ผลิบาน) so players
// can SEE the channel move on the mission board. Pure logic — no Vue, no DOM,
// no icons — it returns an IconLanguage key (the single source for glyph/label)
// plus the normalized position for a tiny progress bar.
//
// The stage depends on how far the channel has climbed within THIS grade's own
// headroom (`level / ceiling`), not the raw level: p1's channel can rise ~21
// steps and p6's can rise 0, so an absolute threshold would lie to one of them.
// A grade already at its caps (ceiling 0) reads as "ผลิบาน" — every fact is
// already the hardest that grade offers.

export function difficultyStage({ level = 0, ceiling = NaN } = {}) {
  const safeLevel = Math.max(0, Number(level) || 0);
  const numericCeiling = Number(ceiling);
  // Missing/unknown ceiling (e.g. the adaptive channel is absent) reads as a
  // neutral seedling; only an explicit 0 (a grade already at its caps) blooms.
  if (Number.isNaN(numericCeiling)) return { key: 'growthSeed', fraction: 0 };
  const safeCeiling = Math.max(0, numericCeiling);
  if (safeCeiling <= 0) return { key: 'growthBloom', fraction: 1 };
  const fraction = Math.min(1, safeLevel / safeCeiling);
  if (fraction <= 0) return { key: 'growthSeed', fraction: 0 };
  if (fraction < 1 / 3) return { key: 'growthLeaf', fraction };
  if (fraction < 2 / 3) return { key: 'growthFlower', fraction };
  return { key: 'growthFruit', fraction };
}
