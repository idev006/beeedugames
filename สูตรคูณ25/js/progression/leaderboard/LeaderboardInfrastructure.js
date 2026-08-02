import { LocalLeaderboardRepository } from "../repositories/LocalLeaderboardRepository.js?v=20260802-05";
import { RemoteLeaderboardRepository } from "../repositories/RemoteLeaderboardRepository.js?v=20260802-04";
import { ResilientLeaderboardRepository } from "../repositories/ResilientLeaderboardRepository.js?v=20260802-05";
import { GoogleAppsScriptClient } from "./GoogleAppsScriptClient.js?v=20260802-04";

function createRepository({ config, storage = globalThis.localStorage, fetchImpl = globalThis.fetch } = {}) {
  const local = new LocalLeaderboardRepository(storage);
  const online = config?.leaderboard?.online || {};
  if (!online.enabled || !String(online.webAppUrl || "").trim()) return local;

  const client = new GoogleAppsScriptClient({
    webAppUrl: online.webAppUrl,
    timeoutMs: online.timeoutMs,
    fetchImpl
  });
  const remote = new RemoteLeaderboardRepository(client);
  return new ResilientLeaderboardRepository(local, remote, storage, {
    queueKey: online.queueKey
  });
}

// Namespace facade: the app imports one stable composition root while concrete
// adapters remain independently replaceable and testable.
export const LeaderboardInfrastructure = Object.freeze({
  createRepository,
  GoogleAppsScriptClient,
  LocalLeaderboardRepository,
  RemoteLeaderboardRepository,
  ResilientLeaderboardRepository
});
