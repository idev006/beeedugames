import { ProfilePolicy } from "./ProfilePolicy.js?v=20260801-01";

export function createProgressStoreDefinition(PiniaRef, repository) {
  return PiniaRef.defineStore("playerProgress", {
    state: () => ({ snapshot: null, loaded: false, lastRewards: [] }),
    getters: {
      player: (state) => state.snapshot?.player || {},
      inventory: (state) => state.snapshot?.inventory || {},
      city: (state) => state.snapshot?.city || { districts: {} },
      preferences: (state) => state.snapshot?.preferences || {}
    },
    actions: {
      async initialize() {
        this.snapshot = await repository.load();
        this.loaded = true;
      },
      async persist() {
        this.snapshot = await repository.save(this.snapshot);
      },
      async setDisplayName(value) {
        this.snapshot.player.displayName = ProfilePolicy.sanitizeDisplayName(value);
        await this.persist();
      },
      async savePreferences(preferences) {
        Object.assign(this.snapshot.preferences, preferences);
        await this.persist();
      },
      hasProcessedEvent(eventId) {
        return this.snapshot.processedRewardEvents.includes(eventId);
      },
      async applyRewardEvent(eventId, rewards) {
        if (this.hasProcessedEvent(eventId)) return false;
        rewards.forEach(({ type, amount }) => {
          if (Object.hasOwn(this.snapshot.inventory, type)) {
            this.snapshot.inventory[type] += Math.max(0, Number(amount) || 0);
          }
        });
        this.snapshot.processedRewardEvents.push(eventId);
        this.lastRewards = rewards;
        await this.persist();
        return true;
      },
      async recordMastery(key, stats) {
        this.snapshot.mastery[key] = { ...stats };
        await this.persist();
      },
      async recordSession(result, boardKey) {
        const sessionId = result?.sessionId;
        if (!sessionId || this.snapshot.records.some((record) => record.sessionId === sessionId)) return false;
        this.snapshot.records.push({ ...result, boardKey, recordedAt: new Date().toISOString() });
        await this.persist();
        return true;
      },
      async recordCityRepair(districtId, eventId, maxNodes) {
        const cityEvent = `${eventId}:city`;
        if (this.hasProcessedEvent(cityEvent)) return false;
        const district = this.snapshot.city.districts[districtId] || { restoredNodes: 0 };
        district.restoredNodes = Math.min(maxNodes, district.restoredNodes + 1);
        this.snapshot.city.districts[districtId] = district;
        this.snapshot.processedRewardEvents.push(cityEvent);
        await this.persist();
        return true;
      },
      async repairCityNode(districtId, node, nodeIndex, recipe, eventId) {
        const cityEvent = `${eventId}:repair-node`;
        if (this.hasProcessedEvent(cityEvent)) return { ok: false, reason: "DUPLICATE_REPAIR" };
        const district = this.snapshot.city.districts[districtId] || { restoredNodes: 0, restoredNodeIds: [] };
        const restoredNodeIds = Array.isArray(district.restoredNodeIds) ? [...district.restoredNodeIds] : [];
        if (restoredNodeIds.includes(node.id)) return { ok: false, reason: "ALREADY_RESTORED" };
        if (restoredNodeIds.length !== nodeIndex) return { ok: false, reason: "NODE_LOCKED" };
        const costs = Object.entries(recipe || {}).map(([type, amount]) => [type, Math.max(0, Math.round(Number(amount) || 0))]);
        if (costs.some(([type, amount]) => !Object.hasOwn(this.snapshot.inventory, type) || this.snapshot.inventory[type] < amount)) {
          return { ok: false, reason: "MISSING_MATERIALS" };
        }
        const previousInventory = { ...this.snapshot.inventory };
        const previousDistrict = this.snapshot.city.districts[districtId];
        try {
          costs.forEach(([type, amount]) => { this.snapshot.inventory[type] -= amount; });
          restoredNodeIds.push(node.id);
          this.snapshot.city.districts[districtId] = {
            restoredNodes: restoredNodeIds.length,
            restoredNodeIds
          };
          this.snapshot.processedRewardEvents.push(cityEvent);
          await this.persist();
          return { ok: true, districtId, nodeId: node.id, restoredNodes: restoredNodeIds.length };
        } catch (error) {
          this.snapshot.inventory = previousInventory;
          if (previousDistrict) this.snapshot.city.districts[districtId] = previousDistrict;
          else delete this.snapshot.city.districts[districtId];
          this.snapshot.processedRewardEvents = this.snapshot.processedRewardEvents.filter((id) => id !== cityEvent);
          throw error;
        }
      },
      async setActiveDistrict(districtId) {
        this.snapshot.city.activeDistrictId = String(districtId || "") || null;
        await this.persist();
      },
      async resetLocalProgress() {
        this.snapshot = await repository.reset();
        this.lastRewards = [];
        this.loaded = true;
      }
    }
  });
}
