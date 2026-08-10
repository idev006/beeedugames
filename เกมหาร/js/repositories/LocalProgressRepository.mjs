import { collectionUnlockIds } from '../core/CollectionUnlockRules.mjs';
import { challengeBonus, compareEntries, roundScore } from '../core/ScoringRules.mjs';

const STORAGE_KEY = 'sharing-orchard.progress.v1';

export class LocalProgressRepository {
  constructor(storage = globalThis.localStorage, profileRepository = null) {
    this.storage = storage;
    this.profileRepository = profileRepository;
  }

  saveBest(record) {
    const playerId = record.playerId ?? this.#activePlayerId();
    const current = this.#readPlayerProgress(playerId);
    const key = `${record.scenarioId}:${record.bandId}`;
    const previous = current.records[key];
    if (!previous || record.stars > previous.stars) {
      current.records[key] = {
        scenarioId: record.scenarioId,
        bandId: record.bandId,
        stars: record.stars,
        attempts: record.attempts,
        hintsUsed: record.hintsUsed,
        dividend: record.dividend,
        divisor: record.divisor,
        quotient: record.quotient,
        remainder: record.remainder,
        completedAt: record.completedAt,
      };
    }
    current.collection ??= {};
    current.collection.seedBadge = true;
    current.collection.festivalGift = true;
    if (record.chapterId) current.completedChapterIds = [...new Set([...(current.completedChapterIds ?? []), record.chapterId])];
    for (const itemId of collectionUnlockIds(current, record)) current.collection[itemId] = true;
    const hall = this.#updateHallOfFame(current.hallOfFame ?? [], record);
    current.hallOfFame = hall.entries;
    this.#writePlayerProgress(playerId, current);
    return { record: current.records[key], saved: hall.saved, rank: hall.rank, score: roundScore(record) };
  }

  read() {
    return this.#readPlayerProgress(this.#activePlayerId());
  }

  readAll() {
    try {
      const parsed = JSON.parse(this.storage.getItem(STORAGE_KEY));
      if (parsed?.schemaVersion === 2 && parsed.players) return this.#normalizeV2(parsed);
      const migrated = this.#migrateV1(parsed);
      this.storage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      return { schemaVersion: 2, players: {} };
    }
  }

  clear() {
    const all = this.readAll();
    all.players[this.#activePlayerId()] = this.#emptyProgress();
    this.storage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  #readPlayerProgress(playerId) {
    const all = this.readAll();
    return this.#normalizeProgress(all.players?.[playerId]);
  }

  #writePlayerProgress(playerId, progress) {
    const all = this.readAll();
    all.players ??= {};
    all.players[playerId] = this.#normalizeProgress(progress);
    this.storage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  #migrateV1(parsed) {
    const playerId = this.#activePlayerId();
    return { schemaVersion: 2, players: { [playerId]: this.#normalizeProgress(parsed) } };
  }

  #normalizeV2(parsed) {
    const players = {};
    for (const [playerId, progress] of Object.entries(parsed.players ?? {})) {
      players[playerId] = this.#normalizeProgress(progress);
    }
    return { schemaVersion: 2, players };
  }

  #normalizeProgress(progress = {}) {
    return {
      records: progress.records ?? {},
      collection: progress.collection ?? {},
      completedChapterIds: progress.completedChapterIds ?? [],
      hallOfFame: progress.hallOfFame ?? [],
    };
  }

  #emptyProgress() {
    return { records: {}, collection: {}, completedChapterIds: [], hallOfFame: [] };
  }

  #activePlayerId() {
    return this.profileRepository?.activeProfile?.().playerId ?? 'local-default-player';
  }

  #updateHallOfFame(entries, record) {
    const playerName = String(record.playerName ?? '').trim().slice(0, 16) || 'ผู้เล่นสวน';
    const score = roundScore(record);
    const entry = {
      playerName,
      score,
      challengeBonus: challengeBonus(record),
      stars: record.stars,
      attempts: record.attempts,
      hintsUsed: record.hintsUsed,
      dividend: record.dividend,
      divisor: record.divisor,
      quotient: record.quotient,
      remainder: record.remainder,
      completedAt: record.completedAt,
    };
    const next = [...entries, entry].sort(compareEntries).slice(0, 10);
    const position = next.indexOf(entry);
    return { entries: next, saved: position >= 0 ? entry : null, rank: position >= 0 ? position + 1 : null };
  }
}
