import { LeaderboardRepository } from "./LeaderboardRepository.js?v=20260802-03";
import {
  LEADERBOARD_LIMIT,
  normalizeLeaderboardEntry,
  rankLeaderboardEntries
} from "../leaderboard/LeaderboardEntryPolicy.js?v=20260802-01";

export class RemoteLeaderboardRepository extends LeaderboardRepository {
  constructor(client) {
    super();
    this.client = client;
  }

  beginSession(session) {
    return this.client.beginSession(session);
  }

  async submit(entry) {
    const validated = normalizeLeaderboardEntry(entry);
    if (!validated) throw new Error("INVALID_LEADERBOARD_ENTRY");
    const securedEntry = entry.security ? { ...validated, security: entry.security } : validated;
    const result = normalizeLeaderboardEntry(await this.client.submit(securedEntry));
    if (!result) throw new Error("INVALID_REMOTE_LEADERBOARD_RESPONSE");
    return result;
  }

  async getTop(boardKey, limit = LEADERBOARD_LIMIT) {
    const safeLimit = Math.min(LEADERBOARD_LIMIT, Math.max(1, Math.round(Number(limit) || LEADERBOARD_LIMIT)));
    const result = await this.client.getTop(boardKey, safeLimit);
    return rankLeaderboardEntries(Array.isArray(result) ? result.map(normalizeLeaderboardEntry).filter(Boolean) : [])
      .slice(0, safeLimit);
  }

  async getBoards() {
    const result = await this.client.getBoards();
    return Array.isArray(result) ? result.filter((board) => (
      typeof board?.boardKey === "string" && Number(board.count) > 0
    )) : [];
  }

  async getHallSnapshot() {
    const result = await this.client.getHallSnapshot();
    const boards = Array.isArray(result?.boards) ? result.boards.filter((board) => (
      typeof board?.boardKey === "string" && Number(board.count) > 0
    )) : [];
    const entriesByBoard = Object.fromEntries(boards.map((board) => [
      board.boardKey,
      rankLeaderboardEntries((result.entriesByBoard?.[board.boardKey] || [])
        .map(normalizeLeaderboardEntry).filter(Boolean)).slice(0, LEADERBOARD_LIMIT)
    ]));
    return { generatedAt: String(result?.generatedAt || ""), boards, entriesByBoard };
  }

  async getPersonalBest(playerId, boardKey) {
    const result = await this.client.getPersonalBest(playerId, boardKey);
    return normalizeLeaderboardEntry(result);
  }

  async removePlayerData() {
    throw new Error("REMOTE_PLAYER_REMOVAL_REQUIRES_ADMIN");
  }
}
