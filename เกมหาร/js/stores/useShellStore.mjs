const { defineStore } = Pinia;

export const useShellStore = defineStore('orchardShell', {
  state: () => ({
    currentRouteName: 'play',
    settingsOpen: false,
    handoffOpen: false,
  }),
  actions: {
    syncRoute(route) {
      this.currentRouteName = route?.name ?? 'play';
    },
    openSettings() { this.settingsOpen = true; },
    closeSettings() { this.settingsOpen = false; },
    openHandoff() { this.handoffOpen = true; },
    closeHandoff() { this.handoffOpen = false; },
  },
});
