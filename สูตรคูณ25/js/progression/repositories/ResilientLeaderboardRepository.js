import { LeaderboardRepository } from "./LeaderboardRepository.js?v=20260802-03";
import {
  LEADERBOARD_LIMIT,
  mergeLeaderboardEntries
} from "../leaderboard/LeaderboardEntryPolicy.js?v=20260802-01";

const DEFAULT_QUEUE_KEY = "luminara.leaderboard.sync.v1";
const MAX_QUEUE_SIZE = 100;

export class ResilientLeaderboardRepository extends LeaderboardRepository {
  constructor(localRepository, remoteRepository, storage = globalThis.localStorage, options = {}) {
    super();
    this.local = localRepository;
    this.remote = remoteRepository;
    this.storage = storage;
    this.queueKey = options.queueKey || DEFAULT_QUEUE_KEY;
    this.flushPromise = null;
  }

  async beginSession(session) {
    try { return await this.remote.beginSession(session); } catch { return null; }
  }

  async submit(entry) {
    const localEntry = await this.local.submit(entry);
    try {
      await this.remote.submit(entry);
      this.removeQueued(localEntry.sessionId);
    } catch {
      // Signed tickets expire quickly. Never queue secured worldwide submissions;
      // keep the earned score locally instead of replaying stale proof later.
      if (!entry.security) this.enqueue(localEntry);
    }
    return localEntry;
  }

  async getTop(boardKey, limit = LEADERBOARD_LIMIT) {
    await this.flushQueue();
    const localEntries = await this.local.getTop(boardKey, limit);
    try {
      const remoteEntries = await this.remote.getTop(boardKey, limit);
      return mergeLeaderboardEntries(remoteEntries, localEntries).slice(0, limit);
    } catch {
      return localEntries;
    }
  }

  async getRemoteTop(boardKey, limit = LEADERBOARD_LIMIT) {
    await this.flushQueue();
    return this.remote.getTop(boardKey, limit);
  }

  getRemoteBoards() {
    return this.remote.getBoards();
  }

  getRemoteHallSnapshot() {
    return this.remote.getHallSnapshot();
  }

  async getPersonalBest(playerId, boardKey) {
    const localBest = await this.local.getPersonalBest(playerId, boardKey);
    try {
      const remoteBest = await this.remote.getPersonalBest(playerId, boardKey);
      return mergeLeaderboardEntries([remoteBest, localBest].filter(Boolean))[0] || null;
    } catch {
      return localBest;
    }
  }

  async removePlayerData(playerId) {
    await this.local.removePlayerData(playerId);
    this.writeQueue(this.readQueue().filter((entry) => entry.playerId !== playerId));
    try { await this.remote.removePlayerData(playerId); } catch { /* Admin-only online removal. */ }
  }

  flushQueue() {
    if (this.flushPromise) return this.flushPromise;
    this.flushPromise = this.performFlush().finally(() => { this.flushPromise = null; });
    return this.flushPromise;
  }

  async performFlush() {
    const pending = this.readQueue();
    if (!pending.length) return 0;
    const failed = [];
    let synced = 0;
    for (const entry of pending) {
      try {
        await this.remote.submit(entry);
        synced += 1;
      } catch {
        failed.push(entry);
      }
    }
    this.writeQueue(failed);
    return synced;
  }

  enqueue(entry) {
    const queue = this.readQueue().filter((item) => item.sessionId !== entry.sessionId);
    queue.push(entry);
    this.writeQueue(queue.slice(-MAX_QUEUE_SIZE));
  }

  removeQueued(sessionId) {
    this.writeQueue(this.readQueue().filter((entry) => entry.sessionId !== sessionId));
  }

  readQueue() {
    try {
      const value = JSON.parse(this.storage?.getItem(this.queueKey) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  writeQueue(queue) {
    this.storage?.setItem(this.queueKey, JSON.stringify(queue));
  }
}
