// SessionMilestoneToast — the mid-session pacing beat (P1-2, GAME-DESIGN-THEORY
// AUDIT): every 3rd completed round (deterministic, count-only) the shell
// celebrates "the feast table is ready". Pure information, no interaction —
// the small confetti burst is a decorative aria-hidden layer and all motion is
// gated by the global reduced-sensory class and the prefers-reduced-motion
// media query, so the message itself is never lost for motion-sensitive kids.
export const SessionMilestoneToast = {
  props: ['count'],
  template: `
    <aside class="milestone-toast" role="status" aria-live="polite">
      <span class="milestone-confetti" aria-hidden="true"><span class="c1">{{ icon('sparkle').glyph }}</span><span class="c2">{{ icon('celebrate').glyph }}</span><span class="c3">{{ icon('sparkle').glyph }}</span></span>
      <p class="eyebrow">รอบที่ {{ count }}</p>
      <strong>{{ icon('celebrate').glyph }} โต๊ะงานเลี้ยงพร้อมแล้ว!</strong>
      <p>แบ่งปันครบ {{ count }} โต๊ะ — งานเลี้ยงใกล้พร้อมเต็มที</p>
    </aside>
  `,
};
