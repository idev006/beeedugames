export class LeaderboardService {
  constructor(repository) {
    this.repository = repository;
    this.sessionTickets = new Map();
  }

  buildBoardKey(settings) {
    return [
      settings.mode || "challenge",
      `${settings.seconds}s`,
      `t${settings.tableMin}-${settings.tableMax}`,
      settings.difficulty || "adventure"
    ].join(":");
  }

  calculateScore(result) {
    return Math.max(0, Math.round(Number(result.stars) || 0));
  }

  beginSession(sessionId, player, settings) {
    if (!sessionId || !player?.id) return Promise.resolve(null);
    const request = Promise.resolve(this.repository.beginSession({
      sessionId,
      playerId: player.id,
      boardKey: this.buildBoardKey(settings)
    })).catch(() => null);
    this.sessionTickets.set(sessionId, request);
    return request;
  }

  async submit(result, player, settings) {
    const hasIdentity = typeof result?.sessionId === "string"
      && result.sessionId.length > 0
      && typeof player?.id === "string"
      && player.id.length > 0;
    const hasMeaningfulProgress = hasIdentity
      && result.totalAnswers > 0
      && result.correctAnswers > 0
      && result.correctAnswers <= result.totalAnswers
      && result.repaired > 0
      && this.calculateScore(result) > 0;
    if (!hasMeaningfulProgress) return null;
    const boardKey = this.buildBoardKey(settings);
    const accuracy = result.correctAnswers / result.totalAnswers;
    const ticket = await (this.sessionTickets.get(result.sessionId) || Promise.resolve(null));
    this.sessionTickets.delete(result.sessionId);
    const entry = {
      boardKey,
      sessionId: result.sessionId,
      playerId: player.id,
      displayName: player.displayName,
      score: this.calculateScore(result),
      accuracy,
      correctAnswers: result.correctAnswers,
      totalAnswers: result.totalAnswers,
      elapsedSeconds: result.elapsedSeconds,
      repaired: result.repaired
    };
    if (ticket?.token && result.proof) {
      entry.security = { ticket: ticket.token, proof: result.proof };
    }
    return this.repository.submit(entry);
  }

  getTop(settings, limit = 10) {
    return this.repository.getTop(this.buildBoardKey(settings), limit);
  }

  getServerTop(settings, limit = 10) {
    const boardKey = this.buildBoardKey(settings);
    if (typeof this.repository.getRemoteTop !== "function") {
      throw new Error("SERVER_LEADERBOARD_UNAVAILABLE");
    }
    return this.repository.getRemoteTop(boardKey, limit);
  }

  getServerTopByBoardKey(boardKey, limit = 10) {
    if (typeof this.repository.getRemoteTop !== "function") throw new Error("SERVER_LEADERBOARD_UNAVAILABLE");
    return this.repository.getRemoteTop(boardKey, limit);
  }

  getServerBoards() {
    if (typeof this.repository.getRemoteBoards !== "function") throw new Error("SERVER_LEADERBOARD_UNAVAILABLE");
    return this.repository.getRemoteBoards();
  }

  getServerHallSnapshot() {
    if (typeof this.repository.getRemoteHallSnapshot !== "function") throw new Error("SERVER_LEADERBOARD_UNAVAILABLE");
    return this.repository.getRemoteHallSnapshot();
  }

  describeBoardKey(boardKey) {
    const match = /^(challenge|practice):(\d+)s:t(\d+)-(\d+):([a-z-]+)$/.exec(String(boardKey || ""));
    if (!match) return "กติกาจาก server";
    const mode = match[1] === "practice" ? "ฝึกฝน" : "ท้าทาย";
    const difficulty = { gentle: "ชิล", adventure: "ผจญภัย", rush: "ท้าทาย" }[match[5]] || match[5];
    return `${mode} • ${match[2]} วินาที • แม่ ${match[3]}–${match[4]} • ${difficulty}`;
  }
}
