export class LeaderboardRepository {
  async beginSession() { return null; }
  async submit() { throw new Error("NOT_IMPLEMENTED"); }
  async getTop() { throw new Error("NOT_IMPLEMENTED"); }
  async getPersonalBest() { throw new Error("NOT_IMPLEMENTED"); }
  async removePlayerData() { throw new Error("NOT_IMPLEMENTED"); }
}
