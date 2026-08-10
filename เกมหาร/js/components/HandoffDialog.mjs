export const HandoffDialog = {
  props: ['timerText', 'resources', 'assets'],
  emits: ['close', 'complete'],
  template: `
    <section class="settings-modal" role="dialog" aria-modal="true" aria-label="ส่งต่อผู้เล่น">
      <div class="settings-sheet handoff-sheet">
        <h2><span aria-hidden="true">{{ icon('handoff').glyph }}</span> ส่งตะกร้าให้ผู้เล่นคนถัดไป</h2>
        <p>สวนบันทึกความคืบหน้าไว้ในเครื่องนี้แล้ว และจะเริ่มรอบใหม่โดยไม่เผยข้อมูลส่วนตัวของเด็ก</p>
        <div class="handoff-summary">
          <span>เวลาคงเหลือ {{ timerText }}</span>
          <span><img :src="assets?.[icon('gardenHeart').srcKey]" alt=""> {{ icon('gardenHeart').label }} {{ resources.gardenHearts }}</span>
          <span><img :src="assets?.[icon('dewDrop').srcKey]" alt=""> {{ icon('dewDrop').label }} {{ resources.dewDrops }}</span>
        </div>
        <div class="settings-actions">
          <button class="secondary-button compact" type="button" @click="$emit('close')">กลับไปเล่นต่อ</button>
          <button class="primary-button compact" type="button" @click="$emit('complete')">เริ่มรอบให้ผู้เล่นถัดไป</button>
        </div>
      </div>
    </section>
  `,
};
