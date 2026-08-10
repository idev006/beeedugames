export const OrchardMap = {
  props: ['chapters', 'progress', 'activeChapterId', 'completed', 'nextActionLabel', 'compact'],
  emits: ['continue', 'select-chapter'],
  computed: {
    completedIds() { return new Set(this.progress?.completedChapterIds ?? []); },
    zones() {
      return (this.chapters ?? []).map((chapter, index, chapters) => {
        const restored = this.completedIds.has(chapter.id);
        const active = chapter.id === this.activeChapterId;
        const previous = chapters[index - 1];
        const previousDone = index === 0 || this.completedIds.has(previous.id);
        const previousActive = previous?.id === this.activeChapterId;
        const selectable = restored || active || previousDone;
        const state = restored ? 'restored' : active ? 'playable' : (previousDone || previousActive) ? 'next' : 'locked';
        return { ...chapter, state, selectable };
      });
    },
    activeZone() { return this.zones.find((zone) => zone.id === this.activeChapterId) ?? this.zones[0]; },
    nextZone() { return this.zones.find((zone) => zone.state === 'next') ?? null; },
  },
  methods: {
    select(zone) {
      if (zone.selectable) this.$emit('select-chapter', zone.id);
    },
  },
  template: `
    <section class="orchard-map" :class="{ 'is-compact': compact }" aria-label="แผนที่สวนและเป้าหมายถัดไป">
      <div class="map-heading"><div><p class="eyebrow">แผนที่สวน</p><h2>เส้นทางสู่เทศกาลแบ่งปัน</h2></div><strong>{{ activeZone ? 'กำลังดูแล ' + activeZone.title : 'เลือกโซนสวน' }}</strong></div>
      <div v-if="completed && nextZone" class="next-path-card">
        <span aria-hidden="true">{{ icon('next').glyph }}</span>
        <div><strong>ทางต่อไป: {{ nextZone.title }}</strong><p>{{ nextZone.goal }}</p></div>
        <button class="primary-button compact" type="button" @click="$emit('continue')">{{ nextActionLabel || 'ไปโจทย์ถัดไป' }}</button>
      </div>
      <ol>
        <li v-for="zone in zones" :key="zone.id" :class="'zone-' + zone.state">
          <button class="map-zone-button" type="button" :disabled="!zone.selectable" @click="select(zone)">
            <span>{{ zone.order + 1 }}</span>
            <div><strong>{{ zone.title }}</strong><p>{{ zone.goal }}</p><em v-if="zone.state === 'next'">เป้าหมายถัดไป</em><em v-else-if="zone.state === 'restored'">ผ่านแล้ว</em><em v-else-if="zone.state === 'playable'">กำลังเล่น</em></div>
          </button>
        </li>
      </ol>
    </section>
  `,
};
