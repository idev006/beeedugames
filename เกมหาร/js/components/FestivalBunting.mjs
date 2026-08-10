// Festival bunting — the signature element of the orchard festival frame.
// A string of paper festival flags (Thai festival vernacular) hangs across the
// top of the game; each flag "lights" gold as one round completes inside the
// current session, so the string is both decoration and a truthful, quiet
// count of the child's work (never a rank). Pure decoration for screen readers:
// the timer and end-of-session summary carry the real information.
export const FestivalBunting = {
  props: ['litCount', 'total'],
  computed: {
    flags() {
      const total = this.total ?? 8;
      const lit = Math.max(0, Math.min(this.litCount ?? 0, total));
      return Array.from({ length: total }, (_, index) => ({ id: index, lit: index < lit }));
    },
  },
  template: `
    <div class="festival-bunting" aria-hidden="true">
      <span v-for="flag in flags" :key="flag.id" class="bunting-flag" :class="{ lit: flag.lit }" :style="{ animationDelay: (flag.id % 5) * 0.18 + 's' }"></span>
    </div>
  `,
};
