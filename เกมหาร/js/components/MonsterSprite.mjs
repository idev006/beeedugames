export const SPRITE_FRAMES = Object.freeze({
  idle: 0,
  greet: 2,
  pointGoal: 3,
  count: 5,
  noticeUnequal: 6,
  guide: 7,
  celebrateA: 9,
  celebrateB: 10,
  encourageRetry: 11,
});

export const MonsterSprite = {
  props: ['src', 'fallbackSrc', 'label', 'frameIndex'],
  computed: {
    frameStyle() {
      const index = Number.isInteger(this.frameIndex) ? this.frameIndex : SPRITE_FRAMES.idle;
      const column = index % 4;
      const row = Math.floor(index / 4);
      return {
        backgroundImage: `url("${this.src}")`,
        backgroundPosition: `${(column * 100) / 3}% ${(row * 100) / 3}%`,
      };
    },
  },
  template: `
    <span v-if="src" class="monster-sprite" :style="frameStyle" role="img" :aria-label="label"></span>
    <img v-else :src="fallbackSrc" :alt="label">
  `,
};
