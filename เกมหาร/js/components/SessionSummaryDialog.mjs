import { MonsterSprite, SPRITE_FRAMES } from './MonsterSprite.mjs';

// End-of-session summary: shown when the play-time clock reaches zero. The
// score is the fair sum of per-round scores (mastery + efficiency + difficulty
// bonus, never elapsed time). The celebrating monster frames the moment as the
// garden thanking the caretaker, not a ranking against other children.
export const SessionSummaryDialog = {
  components: { MonsterSprite },
  props: ['stats', 'spriteSrc', 'avatarSrc'],
  emits: ['restart', 'close'],
  computed: {
    frameIndex() {
      return SPRITE_FRAMES.celebrateB;
    },
  },
  template: `
    <section class="settings-modal" role="dialog" aria-modal="true" aria-label="จบเวลาการเล่น">
      <div class="settings-sheet summary-sheet">
        <MonsterSprite class="summary-monster" :src="spriteSrc" :fallback-src="avatarSrc" label="นารากำลังเฉลิมฉลอง" :frame-index="frameIndex" />
        <p class="eyebrow">จบเวลาการเล่นแล้ว</p>
        <h2>สวนขอบคุณผู้ดูแลยอดเยี่ยม <span aria-hidden="true">{{ icon('celebrate').glyph }}</span></h2>
        <div class="summary-grid" aria-label="สรุปผลการเล่น">
          <span><b>{{ stats.completedRounds }}</b><small>รอบที่สำเร็จ</small></span>
          <span><b>{{ stats.totalStars }}</b><small>ดาวรวม</small></span>
          <span><b>{{ stats.totalScore }}</b><small>คะแนนรวม</small></span>
        </div>
        <p class="settings-note">คะแนนคิดจากความแม่นยำ (ดาว, จำนวนครั้งลอง, ใบ้) และความยากโจทย์ — ไม่คิดเวลาต่อโจทย์</p>
        <div class="settings-actions">
          <button class="primary-button compact" type="button" @click="$emit('restart')"><span aria-hidden="true">{{ icon('sprout').glyph }}</span> เริ่มเล่นใหม่</button>
          <button class="secondary-button compact" type="button" @click="$emit('close')">เล่นต่อแบบอิสระ</button>
        </div>
      </div>
    </section>
  `,
};
