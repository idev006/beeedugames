// Owns the deterministic, non-timed scoring contract shared by the progress
// repository (persistence) and the completion card (display), so the score a
// child sees is exactly the score that was saved to the local Hall of Fame.
//
// Contract (chapter 12): mastery quality before speed — stars, attempts and
// hints matter most; a non-timed challenge bonus from problem difficulty
// (dividend, divisor, quotient, remainder presence) is added after; elapsed
// time is never used so children are not pressured to rush.

export function challengeBonus(record) {
  const dividend = Number(record.dividend) || 0;
  const divisor = Number(record.divisor) || 0;
  const quotient = Number(record.quotient) || (divisor ? Math.floor(dividend / divisor) : 0);
  const remainder = Number(record.remainder) || 0;
  return Math.min(120, Math.round(divisor * 2.2 + quotient * 1.8 + dividend / 12 + (remainder > 0 ? 12 : 0)));
}

export function roundScore(record) {
  const stars = Number(record.stars) || 0;
  const attempts = Math.max(0, Number(record.attempts) - 1);
  const hints = Number(record.hintsUsed) || 0;
  return Math.max(0, stars * 100 + challengeBonus(record) - attempts * 25 - hints * 15);
}

// Same ordering contract as the persisted Hall of Fame: higher score first,
// then more stars, fewer attempts, fewer hints, then oldest completion first.
export function compareEntries(left, right) {
  return (
    right.score - left.score
    || right.stars - left.stars
    || left.attempts - right.attempts
    || left.hintsUsed - right.hintsUsed
    || String(left.completedAt).localeCompare(String(right.completedAt))
  );
}
