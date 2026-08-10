export const PlayerProfileDialog = {
  props: ['profiles', 'activeProfile', 'draftName'],
  emits: ['update:draftName', 'select', 'create', 'rename', 'close'],
  template: `
    <Teleport to="body">
      <section class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
        <div class="settings-sheet profile-sheet">
          <div class="settings-header">
            <div><p class="eyebrow">บัญชีในเครื่องนี้</p><h2 id="profile-title">เลือกผู้ดูแลสวน</h2></div>
            <button class="secondary-button compact" type="button" @click="$emit('close')">ปิด</button>
          </div>
          <div class="profile-scroll">
            <p class="settings-note">ตอนนี้บันทึกใน localStorage แยกตามผู้เล่น อนาคตสามารถเปลี่ยน repository ไปเก็บบน server ได้โดยไม่ให้แกนเกมรู้เรื่อง network</p>
            <div class="profile-list" aria-label="รายชื่อผู้เล่นในเครื่องนี้">
              <button v-for="profile in profiles" :key="profile.playerId" type="button" :class="{ active: profile.playerId === activeProfile?.playerId }" @click="$emit('select', profile.playerId)">
                <strong>{{ profile.displayName }}</strong>
                <small>{{ profile.playerId === activeProfile?.playerId ? 'กำลังเล่น' : 'แตะเพื่อสลับบัญชี' }}</small>
              </button>
            </div>
            <label class="profile-name-field">ชื่อเล่นผู้เล่น
              <input :value="draftName" maxlength="16" @input="$emit('update:draftName', $event.target.value)" @keydown.enter="$emit('rename')" />
            </label>
          </div>
          <div class="settings-actions">
            <button class="secondary-button compact" type="button" @click="$emit('create')">สร้างผู้เล่นใหม่</button>
            <button class="primary-button compact" type="button" @click="$emit('rename'); $emit('close')">ใช้ชื่อนี้</button>
          </div>
        </div>
      </section>
    </Teleport>
  `,
};
