// CollectionTeaser — P2-1 "Explorer bait": the collection book reveals a
// *hint* of the next unlockable item (silhouette + condition) so replay has a
// concrete goal to chase. Pure function over progress + catalog; no IO.
//
// Rules:
//  - The next teaser is the first catalog item (catalog order = learning
//    journey order) that is NOT yet unlocked AND NOT future-gated (future
//    telemetry that v1 cannot record yet — teasing those would be a lie).
//  - When everything is unlocked, next() returns null and the UI shows the
//    "complete" state instead.

export const COLLECTION_TIER_LABELS = Object.freeze({
  seed: 'เมล็ดพันธุ์',
  tool: 'อุปกรณ์สวน',
  charm: 'เครื่องราง',
  relic: 'โบราณวัตถุ',
  festival: 'ของที่ระลึกเทศกาล',
});

export function collectionTierLabel(tier) {
  return COLLECTION_TIER_LABELS[tier] ?? tier;
}

// progress: { collection?: Record<itemId, true>, completedChapterIds?: [] }
// rewards:  catalog array (config.assets.items.collectionRewards) in journey order
// futureGatedIds: iterable of ids that cannot be unlocked by v1 telemetry yet
export function nextCollectionTeaser({ progress, rewards, futureGatedIds = [] }) {
  const unlocked = new Set(Object.keys(progress?.collection ?? {}));
  const gated = new Set(futureGatedIds ?? []);
  const catalog = Array.isArray(rewards) ? rewards : [];
  const next = catalog.find((item) => item && !unlocked.has(item.id) && !gated.has(item.id));
  if (!next) return null;
  return {
    id: next.id,
    label: next.label,
    tier: next.tier,
    tierLabel: collectionTierLabel(next.tier),
    hint: next.hint ?? '',
    src: next.src ?? '',
  };
}
