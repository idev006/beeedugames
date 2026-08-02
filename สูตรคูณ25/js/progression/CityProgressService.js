export class CityProgressService {
  constructor(progressStore, cityRepairConfig = {}, backgrounds = []) {
    this.progress = progressStore;
    this.nodes = Array.isArray(cityRepairConfig.nodes) ? cityRepairConfig.nodes : [];
    this.nodesPerDistrict = this.nodes.length || 4;
    this.startIndex = Math.max(0, Number(cityRepairConfig.districtStartIndex) || 1);
    this.backgrounds = backgrounds;
  }

  async recordRepair(districtId, eventId) {
    return this.progress.recordCityRepair(districtId, eventId, this.nodesPerDistrict);
  }

  getStage(districtId) {
    return Math.min(
      this.nodesPerDistrict,
      this.progress.snapshot.city.districts[districtId]?.restoredNodes || 0
    );
  }

  getActiveDistrictId() {
    const fallback = this.backgrounds[this.startIndex]?.id || null;
    const candidate = this.progress.snapshot.city.activeDistrictId || fallback;
    return this.isUnlocked(candidate) ? candidate : fallback;
  }

  getActiveLevelIndex() {
    const id = this.getActiveDistrictId();
    const index = this.backgrounds.findIndex((background) => background.id === id);
    return index >= this.startIndex ? index : this.startIndex;
  }

  isUnlocked(districtId) {
    const districts = this.backgrounds.slice(this.startIndex);
    const index = districts.findIndex((district) => district.id === districtId);
    if (index <= 0) return index === 0;
    return this.getStage(districts[index - 1].id) >= this.nodesPerDistrict;
  }

  getDistricts() {
    const activeId = this.getActiveDistrictId();
    return this.backgrounds.slice(this.startIndex).map((district, index) => {
      const restoredNodeIds = this.progress.snapshot.city.districts[district.id]?.restoredNodeIds || [];
      return {
        ...district,
        index: index + this.startIndex,
        active: district.id === activeId,
        unlocked: this.isUnlocked(district.id),
        restoredNodes: restoredNodeIds.length,
        complete: restoredNodeIds.length >= this.nodesPerDistrict,
        nodes: this.nodes.map((node, nodeIndex) => ({
          ...node,
          index: nodeIndex,
          restored: restoredNodeIds.includes(node.id),
          available: nodeIndex === restoredNodeIds.length
        }))
      };
    });
  }

  canRepair(districtId, nodeId) {
    if (!this.isUnlocked(districtId)) return { ok: false, reason: "DISTRICT_LOCKED" };
    const nodeIndex = this.nodes.findIndex((node) => node.id === nodeId);
    if (nodeIndex < 0) return { ok: false, reason: "UNKNOWN_NODE" };
    const district = this.progress.snapshot.city.districts[districtId] || { restoredNodeIds: [] };
    const restoredNodeIds = district.restoredNodeIds || [];
    if (restoredNodeIds.includes(nodeId)) return { ok: false, reason: "ALREADY_RESTORED" };
    if (restoredNodeIds.length !== nodeIndex) return { ok: false, reason: "NODE_LOCKED" };
    const missing = Object.entries(this.nodes[nodeIndex].recipe || {}).filter(([type, amount]) => (
      (this.progress.snapshot.inventory?.[type] || 0) < amount
    ));
    return missing.length ? { ok: false, reason: "MISSING_MATERIALS", missing } : { ok: true };
  }

  async repairNode(districtId, nodeId) {
    const validation = this.canRepair(districtId, nodeId);
    if (!validation.ok) return validation;
    const nodeIndex = this.nodes.findIndex((node) => node.id === nodeId);
    const node = this.nodes[nodeIndex];
    const result = await this.progress.repairCityNode(
      districtId,
      node,
      nodeIndex,
      node.recipe,
      `city:${districtId}:${nodeId}`
    );
    if (!result.ok || result.restoredNodes < this.nodesPerDistrict) return result;
    const districts = this.backgrounds.slice(this.startIndex);
    const currentIndex = districts.findIndex((district) => district.id === districtId);
    const next = districts[currentIndex + 1];
    if (next) await this.progress.setActiveDistrict(next.id);
    return { ...result, districtComplete: true, nextDistrictId: next?.id || null };
  }

  async selectDistrict(districtId) {
    if (!this.isUnlocked(districtId)) return false;
    await this.progress.setActiveDistrict(districtId);
    return true;
  }
}
