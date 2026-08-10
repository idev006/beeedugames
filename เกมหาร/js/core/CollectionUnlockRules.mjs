export const FUTURE_GATED_COLLECTION_IDS = new Set([
  'coll-seed-06',
  'coll-seed-08',
  'coll-tool-03',
  'coll-tool-04',
  'coll-tool-05',
  'coll-tool-06',
  'coll-tool-10',
  'coll-fest-06',
  'coll-fest-07',
]);

export function collectionUnlockIds(progress, record) {
  const divisor = Number(record.divisor) || 0;
  const quotient = Number(record.quotient) || 0;
  const remainder = Number(record.remainder) || 0;
  const attempts = Number(record.attempts) || 0;
  const hintsUsed = Number(record.hintsUsed) || 0;
  const completed = new Set(progress.completedChapterIds ?? []);
  const records = Object.values(progress.records ?? {});
  const ids = new Set(['coll-seed-01', 'coll-fest-01', 'coll-tool-09', 'coll-charm-01', 'coll-fest-03', 'coll-fest-04', 'coll-fest-05']);

  if (hintsUsed === 0) ids.add('coll-seed-02');
  if (hintsUsed > 0) ids.add('coll-fest-02');
  if (attempts > 1) ids.add('coll-seed-07').add('coll-tool-02');
  if (records.filter((item) => Number(item.remainder) === 0).length >= 5) ids.add('coll-tool-01');
  if (divisor >= 5 || quotient >= 5) ids.add('coll-tool-07');
  if (divisor >= 10 || quotient >= 10 || Number(record.dividend) >= 50) ids.add('coll-tool-08');

  if (remainder === 0) ids.add('coll-seed-09').add('coll-relic-09');
  if (remainder > 0) ids.add('coll-relic-01').add('coll-relic-02').add('coll-relic-04').add('coll-relic-05').add('coll-relic-07');
  if (remainder === 2) ids.add('coll-relic-03');
  if (remainder > 0 && attempts > 1) ids.add('coll-relic-08');
  if (records.some((item) => Number(item.remainder) === 0) && records.some((item) => Number(item.remainder) > 0)) ids.add('coll-relic-10');

  if (divisor === 2) ids.add('coll-seed-03').add('coll-charm-02');
  if (divisor === 3) ids.add('coll-seed-04').add('coll-charm-03');
  if (divisor === 4) ids.add('coll-seed-05').add('coll-charm-04');
  if (divisor === 5) ids.add('coll-charm-05');
  if (divisor === 10) ids.add('coll-charm-06');
  if (divisor === 13) ids.add('coll-charm-08');
  if (divisor === 20) ids.add('coll-charm-09');
  if (divisor === 25) ids.add('coll-charm-10');
  if (quotient === 12) ids.add('coll-charm-07');

  if (completed.has('prologue-harvest-wind')) ids.add('coll-seed-10').add('coll-fest-08');
  if (completed.has('seed-bank')) ids.add('coll-relic-06');
  if ((progress.completedChapterIds ?? []).length >= 5) ids.add('coll-fest-09');
  if ((progress.completedChapterIds ?? []).length >= 6) ids.add('coll-fest-10');

  return [...ids];
}
