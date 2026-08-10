export const SettingsDialog = {
  props: ['settings', 'config', 'tab'],
  emits: ['update:tab', 'close', 'persist', 'change-grade', 'reset-turn-seconds', 'clear-progress'],
  methods: {
    factDivisors() {
      const range = this.config.factPractice?.divisor ?? { min: 2, max: 25 };
      return Array.from({ length: range.max - range.min + 1 }, (_, index) => range.min + index);
    },
    toggleFactDivisor(divisor) {
      const selected = new Set(this.settings.selectedFactDivisors ?? []);
      selected.has(divisor) && selected.size > 1 ? selected.delete(divisor) : selected.add(divisor);
      this.settings.selectedFactDivisors = [...selected].sort((a, b) => a - b);
      this.$emit('persist');
    },
  },
  template: `
    <Teleport to="body">
    <section class="settings-modal" role="dialog" aria-modal="true" aria-label="ตั้งค่าเกม">
      <div class="settings-sheet">
        <div class="settings-header">
          <h2>ตั้งค่า</h2>
          <button class="secondary-button compact" type="button" @click="$emit('close')">ปิด</button>
        </div>
        <div class="settings-tabs" role="tablist" aria-label="หมวดตั้งค่า">
          <button type="button" role="tab" :aria-selected="tab === 'player'" :class="{ active: tab === 'player' }" @click="$emit('update:tab', 'player')">ผู้เล่น</button>
          <button type="button" role="tab" :aria-selected="tab === 'audio'" :class="{ active: tab === 'audio' }" @click="$emit('update:tab', 'audio')">เสียง/ภาพ</button>
          <button type="button" role="tab" :aria-selected="tab === 'data'" :class="{ active: tab === 'data' }" @click="$emit('update:tab', 'data')">ข้อมูล</button>
        </div>
        <div class="settings-scroll">
          <fieldset v-show="tab === 'player'"><legend>ผู้เล่นและห้องเรียน</legend>
            <label>ชื่อเล่นในเครื่องนี้ <input v-model="settings.playerName" maxlength="16" @change="$emit('persist')"></label>
            <label>ระดับชั้น
              <select v-model="settings.gradeLevel" @change="$emit('change-grade')">
                <option v-for="(profile, id) in config.practiceProfiles" :key="id" :value="id">{{ profile.label }}</option>
              </select>
            </label>
            <div class="fact-table-picker" aria-label="เลือกแม่สูตรคูณ">
              <strong>เลือกแม่สูตรคูณสำหรับสุ่มโจทย์</strong>
              <div><button v-for="divisor in factDivisors()" :key="divisor" type="button" :class="{ active: settings.selectedFactDivisors?.includes(divisor) }" :aria-pressed="settings.selectedFactDivisors?.includes(divisor)" @click="toggleFactDivisor(divisor)">แม่ {{ divisor }}</button></div>
              <p class="settings-note">เกมสุ่มจาก แม่ × ตัวคูณ 2-12 แล้วกลับเป็นโจทย์หาร</p>
            </div>
            <label><input type="checkbox" v-model="settings.allowRemainderMode" @change="$emit('persist')"> อนุญาตโจทย์หารแบบมีเศษ</label>
            <label class="duration-slider">เวลาการเล่น <input type="range" min="30" max="600" step="30" v-model.number="settings.classroomTurnSeconds" @change="$emit('reset-turn-seconds')" aria-label="เวลาการเล่น"> <output>{{ settings.classroomTurnSeconds }} วินาที</output></label>
            <p class="settings-note">เมื่อหมดเวลา เกมจะคำนวณคะแนนรวมของรอบที่ทำสำเร็จ</p>
          </fieldset>
          <fieldset v-show="tab === 'audio'"><legend>เสียงและภาพ</legend>
            <label><input type="checkbox" v-model="settings.soundOn" @change="$emit('persist')"> เปิด SFX</label>
            <label><input type="checkbox" v-model="settings.musicOn" @change="$emit('persist')"> เปิดเพลงพื้นหลังเบา ๆ</label>
            <label>ระดับเสียง SFX <input type="range" min="0" max="1" step="0.1" v-model.number="settings.sfxVolume" @input="$emit('persist')"></label>
            <label>ระดับเสียงเพลง <input type="range" min="0" max="1" step="0.1" v-model.number="settings.musicVolume" @input="$emit('persist')"></label>
            <label><input type="checkbox" v-model="settings.reducedSensory" @change="$emit('persist')"> ลดเสียง/การเคลื่อนไหว</label>
            <label><input type="checkbox" v-model="settings.largeText" @change="$emit('persist')"> ตัวอักษรใหญ่</label>
            <label><input type="checkbox" v-model="settings.highContrast" @change="$emit('persist')"> คอนทราสต์สูง</label>
            <label><input type="checkbox" v-model="settings.showStoryShots" @change="$emit('persist')"> แสดงลำดับฉากเรื่องราว</label>
            <label><input type="checkbox" v-model="settings.showEquation" @change="$emit('persist')"> แสดงประโยคหาร</label>
          </fieldset>
          <fieldset v-show="tab === 'data'"><legend>ข้อมูลในเครื่องนี้</legend>
            <p class="settings-note">สถิติและอันดับอยู่ในเครื่องนี้เท่านั้น ไม่ส่งออนไลน์ และไม่ใช้ชื่อจริงของเด็ก</p>
            <button class="secondary-button compact danger-lite" type="button" @click="$emit('clear-progress')">ล้างสถิติในเครื่อง</button>
          </fieldset>
        </div>
        <div class="settings-actions">
          <button class="primary-button compact" type="button" @click="$emit('persist'); $emit('close')">เสร็จสิ้น</button>
        </div>
      </div>
    </section>
    </Teleport>
  `,
};
