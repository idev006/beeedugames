import { MonsterSprite, SPRITE_FRAMES } from './MonsterSprite.mjs';

// Friendly pause overlay: covers the playfield, freezes the session clock and
// lets the player resume with one tap. The monster frame is the guide relaxing
// (idle) so the pause reads as "take a breath", not a failure state.
export const PauseDialog = {
  components: { MonsterSprite },
  props: ['timerText', 'spriteSrc', 'avatarSrc'],
  emits: ['resume'],
  computed: {
    frameIndex() {
      return SPRITE_FRAMES.idle;
    },
  },
  template: `
    <section class="settings-modal" role="dialog" aria-modal="true" aria-label="พักเกม">
      <div class="settings-sheet pause-sheet">
        <MonsterSprite class="pause-monster" :src="spriteSrc" :fallback-src="avatarSrc" label="ทีโบกำลังพัก" :frame-index="frameIndex" />
        <h2>พักสวนกันก่อน <span aria-hidden="true">{{ icon('leaf').glyph }}</span></h2>
        <p>เวลาคงเหลือ <strong>{{ timerText }}</strong> — กดเล่นต่อเมื่อพร้อมนะ</p>
        <div class="settings-actions">
          <button class="primary-button compact" type="button" @click="$emit('resume')"><span aria-hidden="true">{{ icon('resume').glyph }}</span> เล่นต่อ</button>
        </div>
      </div>
    </section>
  `,
};
