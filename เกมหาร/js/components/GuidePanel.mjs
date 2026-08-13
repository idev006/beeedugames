import { MonsterSprite } from './MonsterSprite.mjs';

// GuidePanel — Teebo's short spoken hint under the mission board. One message
// per phase, plain verbs, no extra UI; the monster sprite gives it a friendly
// face without covering the counts.
export const GuidePanel = {
  components: { MonsterSprite },
  props: ['state', 'avatarSrc', 'spriteSrc', 'frameIndex', 'expectedShare'],
  computed: {
    message() {
      if (this.state.phase === 'feedbackCorrect') return `เท่ากันทุกตะกร้า! แต่ละตะกร้ามี ${this.expectedShare} ผล ลองคูณกลับดูนะ`;
      if (this.state.phase === 'feedbackWrong') return 'ใกล้แล้ว ลองดูเลขบนตะกร้าทีละใบ — เท่ากันหรือยัง?';
      if (this.state.phase === 'remediation') return 'เราแบ่งทีละรอบได้: ให้ตะกร้าละ 1 ผล แล้ววนใหม่';
      if (this.state.remediationEnabled) return 'กด “ช่วยแบ่งทีละรอบ” เพื่อดูวิธีแบ่งอย่างยุติธรรม';
      return 'ลาก หรือแตะแอปเปิ้ล แล้วแตะตะกร้า เป้าหมายคือทุกตะกร้าได้เท่ากัน';
    },
  },
  template: `
    <aside class="guide-panel" :class="'phase-' + state.phase">
      <MonsterSprite class="guide-avatar" :src="spriteSrc" :fallback-src="avatarSrc" label="ทีโบ" :frame-index="frameIndex" aria-hidden="true" />
      <div><strong>ทีโบ</strong><p>{{ message }}</p></div>
    </aside>
  `,
};
