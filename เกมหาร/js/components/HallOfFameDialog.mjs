export const HallOfFameDialog = {
  props: ['entries'],
  emits: ['close'],
  computed: {
    topEntries() {
      return (this.entries ?? []).slice(0, 10);
    },
    latestCompletedAt() {
      return this.topEntries.reduce((latest, entry) => (entry.completedAt && entry.completedAt > latest ? entry.completedAt : latest), '');
    },
  },
  methods: {
    equation(entry) {
      if (!entry.dividend || !entry.divisor) return 'โจทย์เดิม';
      const quotient = entry.quotient ?? Math.floor(entry.dividend / entry.divisor);
      const remainder = entry.remainder ?? entry.dividend % entry.divisor;
      return remainder ? `${entry.dividend} ÷ ${entry.divisor} = ${quotient} เศษ ${remainder}` : `${entry.dividend} ÷ ${entry.divisor} = ${quotient}`;
    },
  },
  template: `
    <Teleport to="body">
      <section class="settings-modal" role="dialog" aria-modal="true" aria-labelledby="hall-title">
        <div class="settings-sheet hall-sheet">
          <div class="settings-header">
            <div>
              <p class="eyebrow">บันทึกในเครื่องนี้เท่านั้น</p>
              <h2 id="hall-title">10 อันดับในเครื่องนี้</h2>
            </div>
            <button class="secondary-button compact" type="button" @click="$emit('close')">ปิด</button>
          </div>
          <ol v-if="topEntries.length" class="hall-rank-list">
            <li v-for="(entry, index) in topEntries" :key="entry.completedAt || index" :class="{ latest: entry.completedAt && entry.completedAt === latestCompletedAt }">
              <span class="rank-medal">{{ index + 1 }}</span>
              <span class="rank-copy">
                <strong>{{ entry.playerName }}</strong><em v-if="entry.completedAt && entry.completedAt === latestCompletedAt" class="latest-tag">รอบล่าสุด</em>
                <small>{{ equation(entry) }} · {{ entry.stars }} ดาว · ลอง {{ entry.attempts }} ครั้ง · ใบ้ {{ entry.hintsUsed }} ครั้ง</small>
              </span>
              <b>{{ entry.score }} คะแนน</b>
            </li>
          </ol>
          <div v-else class="hall-empty">
            <span aria-hidden="true">{{ icon('rank').glyph }}</span>
            <p>ยังไม่มีสถิติ ลองแบ่งผลไม้ให้เท่ากันเพื่อบันทึกอันดับแรก</p>
          </div>
        </div>
      </section>
    </Teleport>
  `,
};
