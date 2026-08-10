export const StoryDialog = {
  props: ['assets'],
  emits: ['close'],
  template: `
    <Teleport to="body">
      <section class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="story-title">
        <div class="settings-sheet story-sheet">
          <div class="settings-header">
            <div><p class="eyebrow">เรื่องราวของเกม</p><h2 id="story-title">สวนผลไม้แบ่งปัน</h2></div>
            <button class="secondary-button compact" type="button" @click="$emit('close')">ปิด</button>
          </div>
          <div class="story-scroll">
            <div class="story-hero" aria-hidden="true">
              <img :src="assets.characterAvatars['nara-sprout-monster']" alt="">
              <span>÷</span>
              <img :src="assets.characterAvatars['teebo-moss-monster']" alt="">
            </div>
            <p><strong>ปีละครั้ง สวนเมฆอุ่นจะจัดเทศกาลแบ่งปัน</strong> แต่สายลมเก็บเกี่ยวพัดตะกร้าและป้ายทางกระจัดกระจาย เส้นทางสวนจึงยังไม่เปิด</p>
            <ol class="story-beats">
              <li><b>เราเป็นผู้ดูแลลานแบ่งปัน</b><small>ช่วยนาราจัดผลไม้ให้เพื่อนมอนเมล็ดอย่างยุติธรรม</small></li>
              <li><b>การหารคือการแบ่งให้เท่ากัน</b><small>ลากผลไม้ สังเกตจำนวน แล้วตรวจว่าทุกตะกร้าได้เท่ากันหรือไม่</small></li>
              <li><b>ทีโบช่วยคิดย้อนกลับ</b><small>เมื่อแบ่งถูก เกมจะพาเห็นว่า หารสัมพันธ์กับสูตรคูณ เช่น 5 × 12 = 60</small></li>
              <li><b>สวนฟื้นขึ้นจากความเข้าใจ</b><small>ของสะสมและเส้นทางใหม่เปิดจากหลักฐานการแบ่งจริง ไม่ใช่รางวัลสุ่ม</small></li>
            </ol>
            <p class="story-goal"><span aria-hidden="true">{{ icon('sparkle').glyph }}</span> เป้าหมายใหญ่คือฟื้นฟูทุกโซน เตรียมเทศกาลแบ่งปัน และเข้าใจว่าการหารคือส่วนกลับของการคูณ</p>
          </div>
        </div>
      </section>
    </Teleport>
  `,
};
