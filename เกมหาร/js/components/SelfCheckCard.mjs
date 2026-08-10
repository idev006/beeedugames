export const SelfCheckCard = {
  props: ['expectedShare', 'expectedRemainder', 'selfCheck'],
  template: `
    <aside class="self-check-card" aria-label="ตรวจเองก่อนส่งคำตอบ">
      <strong>ตรวจเองก่อนส่งคำตอบ</strong>
      <span :class="{ ready: selfCheck.everyBasketReady }">ทุกตะกร้าควรมี {{ expectedShare }} ผล</span>
      <span :class="{ ready: selfCheck.sourceReady }">กองกลางควรเหลือ {{ expectedRemainder }} ผล</span>
      <small>ตอนนี้ตะกร้ามี: {{ selfCheck.countText }}</small>
    </aside>
  `,
};
