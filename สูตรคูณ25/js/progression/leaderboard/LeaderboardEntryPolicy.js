export const LEADERBOARD_LIMIT = 10;

export function normalizeLeaderboardEntry(entry) {
  if (
    !entry ||
    typeof entry.boardKey !== "string" || !entry.boardKey ||
    typeof entry.sessionId !== "string" || !entry.sessionId ||
    typeof entry.playerId !== "string" || !entry.playerId ||
    !Number.isFinite(entry.score) || entry.score <= 0 ||
    !Number.isFinite(entry.accuracy) || entry.accuracy < 0 || entry.accuracy > 1 ||
    !Number.isFinite(entry.elapsedSeconds) || entry.elapsedSeconds < 1
  ) return null;

  const correctAnswers = Math.max(0, Math.round(Number(entry.correctAnswers) || 0));
  const totalAnswers = Math.max(correctAnswers, Math.round(Number(entry.totalAnswers) || correctAnswers));
  return {
    ...entry,
    score: Math.round(entry.score),
    accuracy: Number(entry.accuracy),
    correctAnswers,
    totalAnswers,
    elapsedSeconds: Math.round(entry.elapsedSeconds),
    repaired: Math.max(0, Math.round(Number(entry.repaired) || 0)),
    displayName: String(entry.displayName || "นักซ่อมแสง").slice(0, 12)
  };
}

export function rankLeaderboardEntries(entries) {
  return [...entries].sort((a, b) => (
    b.score - a.score ||
    b.accuracy - a.accuracy ||
    a.elapsedSeconds - b.elapsedSeconds ||
    String(a.submittedAt || "").localeCompare(String(b.submittedAt || ""))
  ));
}

export function mergeLeaderboardEntries(...collections) {
  const unique = new Map();
  collections.flat().map(normalizeLeaderboardEntry).filter(Boolean).forEach((entry) => {
    const current = unique.get(entry.sessionId);
    if (!current || rankLeaderboardEntries([entry, current])[0] === entry) {
      unique.set(entry.sessionId, entry);
    }
  });
  return rankLeaderboardEntries([...unique.values()]);
}

