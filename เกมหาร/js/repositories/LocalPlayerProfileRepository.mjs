const STORAGE_KEY = 'sharing-orchard.players.v1';

export class LocalPlayerProfileRepository {
  constructor(storage = globalThis.localStorage, now = () => new Date().toISOString()) {
    this.storage = storage;
    this.now = now;
  }

  read() {
    try {
      const parsed = JSON.parse(this.storage.getItem(STORAGE_KEY));
      const profiles = Array.isArray(parsed?.profiles) && parsed.profiles.length ? parsed.profiles.map((profile) => this.#normalize(profile)) : [this.#defaultProfile()];
      const activePlayerId = profiles.some((profile) => profile.playerId === parsed?.activePlayerId) ? parsed.activePlayerId : profiles[0].playerId;
      return { schemaVersion: 1, activePlayerId, profiles };
    } catch {
      const profile = this.#defaultProfile();
      const state = { schemaVersion: 1, activePlayerId: profile.playerId, profiles: [profile] };
      this.#write(state);
      return state;
    }
  }

  activeProfile() {
    const state = this.read();
    return state.profiles.find((profile) => profile.playerId === state.activePlayerId) ?? state.profiles[0];
  }

  createProfile(displayName) {
    const state = this.read();
    const now = this.now();
    const profile = this.#normalize({ playerId: `local-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`, displayName, createdAt: now, updatedAt: now });
    state.profiles.push(profile);
    state.activePlayerId = profile.playerId;
    this.#write(state);
    return profile;
  }

  updateActiveDisplayName(displayName) {
    const state = this.read();
    const profile = state.profiles.find((item) => item.playerId === state.activePlayerId) ?? state.profiles[0];
    profile.displayName = this.#name(displayName);
    profile.updatedAt = this.now();
    this.#write(state);
    return profile;
  }

  selectProfile(playerId) {
    const state = this.read();
    if (!state.profiles.some((profile) => profile.playerId === playerId)) return this.activeProfile();
    state.activePlayerId = playerId;
    this.#write(state);
    return state.profiles.find((profile) => profile.playerId === playerId);
  }

  #defaultProfile() {
    const now = this.now();
    return { playerId: 'local-default-player', displayName: 'ผู้เล่นสวน', createdAt: now, updatedAt: now };
  }

  #normalize(profile) {
    return {
      playerId: String(profile.playerId ?? '').trim() || this.#defaultProfile().playerId,
      displayName: this.#name(profile.displayName),
      createdAt: profile.createdAt ?? this.now(),
      updatedAt: profile.updatedAt ?? profile.createdAt ?? this.now(),
    };
  }

  #name(value) {
    return String(value ?? '').trim().slice(0, 16) || 'ผู้เล่นสวน';
  }

  #write(state) {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
