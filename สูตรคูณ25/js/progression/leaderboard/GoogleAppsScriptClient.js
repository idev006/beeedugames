const DEFAULT_TIMEOUT_MS = 8000;

export class GoogleAppsScriptClient {
  constructor(options = {}) {
    this.webAppUrl = String(options.webAppUrl || "").trim();
    this.timeoutMs = Math.max(1000, Number(options.timeoutMs) || DEFAULT_TIMEOUT_MS);
    this.fetchImpl = options.fetchImpl || globalThis.fetch?.bind(globalThis);
  }

  get available() {
    return Boolean(this.webAppUrl && this.fetchImpl);
  }

  async submit(entry) {
    return this.request("submit", { entry }, "POST");
  }

  async beginSession(session) {
    return this.request("start", { session }, "POST");
  }

  async getTop(boardKey, limit) {
    return this.request("top", { boardKey, limit }, "GET");
  }

  async getBoards() {
    return this.request("boards", {}, "GET");
  }

  async getHallSnapshot() {
    return this.request("hall", {}, "GET");
  }

  async getPersonalBest(playerId, boardKey) {
    return this.request("best", { playerId, boardKey }, "GET");
  }

  async health() {
    return this.request("health", {}, "GET");
  }

  async request(action, payload, method) {
    if (!this.available) throw new Error("ONLINE_LEADERBOARD_UNAVAILABLE");
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timeout = setTimeout(() => controller?.abort(), this.timeoutMs);
    try {
      const url = new URL(this.webAppUrl);
      const options = {
        method,
        redirect: "follow",
        cache: "no-store",
        signal: controller?.signal
      };
      if (method === "GET") {
        url.searchParams.set("action", action);
        Object.entries(payload).forEach(([key, value]) => url.searchParams.set(key, String(value)));
      } else {
        // text/plain is a CORS-simple request and avoids an OPTIONS preflight that
        // Google Apps Script web apps do not handle consistently.
        options.headers = { "Content-Type": "text/plain;charset=UTF-8" };
        options.body = JSON.stringify({ action, ...payload });
      }
      const response = await this.fetchImpl(url.toString(), options);
      if (!response?.ok) throw new Error(`ONLINE_LEADERBOARD_HTTP_${response?.status || 0}`);
      const body = await response.json();
      if (!body?.ok) throw new Error(body?.error || "ONLINE_LEADERBOARD_REJECTED");
      return body.data;
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("ONLINE_LEADERBOARD_TIMEOUT");
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
