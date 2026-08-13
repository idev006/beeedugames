// useSessionMilestone — P1-2 glue between SessionDirector's milestone beat and
// the SessionMilestoneToast. The decision logic (every milestoneEvery-th round,
// count-only, never touches score) lives in SessionDirector; this thin
// composable watches the snapshot, opens the toast, auto-dismisses it after a
// few seconds and acknowledges so the same count can never re-fire. The Vue
// API is injected because this project loads Vue as a global, not a module.
export function useSessionMilestone({ session, sessionState, VueApi }) {
  const { ref, watch } = VueApi;
  const milestoneOpen = ref(false);
  let milestoneTimer = null;
  watch(() => sessionState.milestone, (milestone) => {
    window.clearTimeout(milestoneTimer);
    if (!milestone) { milestoneOpen.value = false; return; }
    milestoneOpen.value = true;
    milestoneTimer = window.setTimeout(() => {
      milestoneOpen.value = false;
      session.acknowledgeMilestone();
    }, 3800);
  });
  return { milestoneOpen, dispose: () => window.clearTimeout(milestoneTimer) };
}
