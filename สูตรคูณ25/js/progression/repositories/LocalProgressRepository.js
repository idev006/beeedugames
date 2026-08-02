import { ProgressRepository } from "./ProgressRepository.js?v=20260801-01";
import { ProfilePolicy } from "../ProfilePolicy.js?v=20260801-01";

const DEFAULT_KEY = "luminara.progress.v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createId() {
  return globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createDefaultProgress(config = {}) {
  const now = new Date().toISOString();
  const districtStartIndex = Math.max(0, Number(config.progression?.cityRepair?.districtStartIndex) || 1);
  const activeDistrictId = config.assets?.backgrounds?.[districtStartIndex]?.id || null;
  return {
    schemaVersion: 2,
    player: { id: createId(), displayName: "นักซ่อมแสง", createdAt: now, updatedAt: now },
    preferences: {
      seconds: config.session?.defaultSeconds || 180,
      mode: "challenge",
      tableMin: config.tables?.defaultMin || 2,
      tableMax: config.tables?.defaultMax || 12,
      difficulty: config.difficulty?.default || "adventure",
      arAnswerDwellMs: config.ar?.answerDwellMs || 500
    },
    inventory: { gear: 0, crystal: 0, energyCell: 0, prism: 0 },
    city: { activeDistrictId, districts: {} },
    mastery: {},
    records: [],
    processedRewardEvents: []
  };
}

export class LocalProgressRepository extends ProgressRepository {
  constructor(storage = globalThis.localStorage, config = {}, key = DEFAULT_KEY) {
    super();
    this.storage = storage;
    this.config = config;
    this.key = key;
  }

  async load() {
    const fallback = createDefaultProgress(this.config);
    try {
      const raw = this.storage?.getItem(this.key);
      if (!raw) return fallback;
      return this.migrate(JSON.parse(raw), fallback);
    } catch {
      return fallback;
    }
  }

  async save(snapshot) {
    const safe = this.migrate(snapshot, createDefaultProgress(this.config));
    safe.player.updatedAt = new Date().toISOString();
    safe.processedRewardEvents = safe.processedRewardEvents.slice(-250);
    safe.records = safe.records.slice(-100);
    this.storage?.setItem(this.key, JSON.stringify(safe));
    return clone(safe);
  }

  async reset() {
    this.storage?.removeItem(this.key);
    return createDefaultProgress(this.config);
  }

  migrate(input, fallback) {
    if (!input || typeof input !== "object") return fallback;
    const source = [1, 2].includes(Number(input.schemaVersion)) ? input : {};
    const nodeIds = (this.config.progression?.cityRepair?.nodes || []).map((node) => node.id);
    const districts = Object.fromEntries(Object.entries(source.city?.districts || {}).map(([id, value]) => {
      const restoredNodes = Math.max(0, Math.min(nodeIds.length || 4, Number(value?.restoredNodes) || 0));
      const restoredNodeIds = Array.isArray(value?.restoredNodeIds)
        ? value.restoredNodeIds.filter((nodeId) => nodeIds.includes(nodeId))
        : nodeIds.slice(0, restoredNodes);
      return [id, { restoredNodes: restoredNodeIds.length, restoredNodeIds }];
    }));
    return {
      ...fallback,
      ...source,
      schemaVersion: 2,
      player: {
        ...fallback.player,
        ...(source.player || {}),
        id: source.player?.id || fallback.player.id,
        displayName: ProfilePolicy.sanitizeDisplayName(source.player?.displayName)
      },
      preferences: { ...fallback.preferences, ...(source.preferences || {}) },
      inventory: Object.fromEntries(Object.entries({ ...fallback.inventory, ...(source.inventory || {}) })
        .map(([type, amount]) => [type, Math.max(0, Math.round(Number(amount) || 0))])),
      city: {
        activeDistrictId: String(source.city?.activeDistrictId || fallback.city.activeDistrictId || "") || null,
        districts
      },
      mastery: { ...(source.mastery || {}) },
      records: Array.isArray(source.records) ? source.records : [],
      processedRewardEvents: Array.isArray(source.processedRewardEvents)
        ? source.processedRewardEvents
        : []
    };
  }
}
