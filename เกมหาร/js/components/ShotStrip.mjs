// ShotStrip — the story-shot progress rail shown above the playfield while a
// cinematic beat is active. Non-interactive beats are skippable and the
// reflection shot offers a summary view; everything renders through the shell.
export const ShotStrip = {
  props: ['cinematic', 'reducedSensory'],
  emits: ['skip', 'reflect'],
  computed: {
    shot() {
      return this.cinematic?.shot ?? null;
    },
    progressText() {
      if (!this.shot || !this.cinematic?.shotCount) return '';
      return `${this.cinematic.shotIndex + 1}/${this.cinematic.shotCount}`;
    },
  },
  template: `
    <aside v-if="shot" class="shot-strip" :class="{ 'reduced-motion': reducedSensory }" :data-shot-id="shot.id" aria-label="ลำดับฉากปัจจุบัน">
      <div>
        <p class="eyebrow">{{ cinematic.sceneTitle }} · ช็อต {{ progressText }}</p>
        <strong>{{ shot.label }}</strong>
        <p>{{ shot.copy }}</p>
      </div>
      <button v-if="cinematic.skipAllowed && shot.id !== 'reflection'" class="secondary-button compact" type="button" @click="$emit('skip')">ข้ามช็อต</button>
      <button v-if="shot.id === 'reward-bloom'" class="secondary-button compact" type="button" @click="$emit('reflect')">ดูช็อตสรุป</button>
    </aside>
  `,
};
