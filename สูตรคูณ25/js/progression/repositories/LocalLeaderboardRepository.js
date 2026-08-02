import { LeaderboardRepository } from "./LeaderboardRepository.js?v=20260802-02";
import {
  LEADERBOARD_LIMIT,
  normalizeLeaderboardEntry,
  rankLeaderboardEntries
} from "../leaderboard/LeaderboardEntryPolicy.js?v=20260802-01";

// V2 stores earned stars. V1 used an opaque normalized score and is intentionally
// left untouched so invalid legacy entries cannot leak into the child-facing board.
const DEFAULT_KEY = "luminara.leaderboard.v2";
export class LocalLeaderboardRepository extends LeaderboardRepository {
  constructor(storage = globalThis.localStorage, key = DEFAULT_KEY) {
    super();
    this.storage = storage;
    this.key = key;
  }

  read() {
    try {
      const parsed = JSON.parse(this.storage?.getItem(this.key) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  write(boards) {
    this.storage?.setItem(this.key, JSON.stringify(boards));
  }

  async submit(entry) {
    const validated = normalizeLeaderboardEntry(entry);
    if (!validated) throw new Error("INVALID_LEADERBOARD_ENTRY");
    const boards = this.read();
    const board = Array.isArray(boards[validated.boardKey])
      ? boards[validated.boardKey].map(normalizeLeaderboardEntry).filter(Boolean)
      : [];
    const normalized = { ...validated, submittedAt: validated.submittedAt || new Date().toISOString() };
    const deduped = board.filter((item) => item.sessionId !== normalized.sessionId);
    deduped.push(normalized);
    boards[validated.boardKey] = rankLeaderboardEntries(deduped).slice(0, LEADERBOARD_LIMIT);
    this.write(boards);
    return normalized;
  }

  async getTop(boardKey, limit = 10) {
    const board = this.read()[boardKey];
    if (!Array.isArray(board)) return [];
    const safeLimit = Math.min(LEADERBOARD_LIMIT, Math.max(1, Math.round(Number(limit) || LEADERBOARD_LIMIT)));
    const unique = new Map();
    board.map(normalizeLeaderboardEntry).filter(Boolean).forEach((entry) => unique.set(entry.sessionId, entry));
    return rankLeaderboardEntries([...unique.values()]).slice(0, safeLimit);
  }

  async getPersonalBest(playerId, boardKey) {
    return (await this.getTop(boardKey, LEADERBOARD_LIMIT)).find((entry) => entry.playerId === playerId) || null;
  }

  async removePlayerData(playerId) {
    const boards = this.read();
    Object.keys(boards).forEach((key) => {
      boards[key] = Array.isArray(boards[key])
        ? boards[key].map(normalizeLeaderboardEntry).filter((entry) => entry && entry.playerId !== playerId)
        : [];
    });
    this.write(boards);
  }
}
