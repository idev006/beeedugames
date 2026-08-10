// IconLanguage — the single source of truth for the game's iconic language (R4).
//
// Every UI glyph or image the templates render comes from this registry, so a
// meaning keeps one consistent icon and one canonical Thai label across the
// whole game. Glyph entries render as text emoji (templates mark them
// aria-hidden); image entries carry `srcKey` into the runtime asset map (e.g.
// `itemAssets`) plus the canonical label. The map is frozen and read-only.
//
// Usage in templates (registered as a global property in app.mjs):
//   <span aria-hidden="true">{{ icon('pause').glyph }}</span>
//   <img :src="itemAssets[icon('gardenHeart').srcKey]" alt="">
//   {{ icon('gardenHeart').label }}
export const ICONS = Object.freeze({
  // Navigation / actions
  brand: { glyph: '🍏', label: 'สวนผลไม้แบ่งปัน' },
  mission: { glyph: '☀', label: 'ภารกิจ' },
  story: { glyph: '📖', label: 'เรื่องราว' },
  profile: { glyph: '👤', label: 'ผู้เล่น' },
  rank: { glyph: '★', label: 'อันดับ' },
  settings: { glyph: '⚙', label: 'ตั้งค่า' },
  pause: { glyph: '⏸', label: 'พัก' },
  resume: { glyph: '▶', label: 'เล่นต่อ' },
  restart: { glyph: '↺', label: 'เริ่มแบ่งใหม่' },
  replay: { glyph: '↻', label: 'ฝึกโจทย์ใหม่' },
  start: { glyph: '✋', label: 'เริ่มแบ่งปัน' },
  next: { glyph: '➜', label: 'ไปโจทย์ถัดไป' },
  collection: { glyph: '▣', label: 'เปิดสมุดสะสม' },
  handoff: { glyph: '🍃', label: 'ส่งต่อผู้เล่น' },

  // Gameplay support
  guided: { glyph: '☝', label: 'ช่วยแบ่งทีละรอบ' },
  hint: { glyph: '💡', label: 'ขอคำใบ้' },
  check: { glyph: '✓', label: 'ตรวจคำตอบ' },
  feedbackWrong: { glyph: '≠', label: 'ยังไม่เท่ากัน' },
  remediation: { glyph: '🍵', label: 'มาลองแบ่งทีละรอบ' },
  statusPending: { glyph: '◎', label: 'ยังไม่ตรวจคำตอบ' },
  countBullet: { glyph: '●', label: '' },

  // Reward / celebration
  star: { glyph: '⭐', label: 'คะแนนรอบนี้' },
  hofBadge: { glyph: '🌼', label: 'สวนบันทึกคุณแล้ว' },
  celebrate: { glyph: '🎉', label: 'เฉลิมฉลอง' },
  sprout: { glyph: '🌱', label: 'เริ่มเล่นใหม่' },
  leaf: { glyph: '🌿', label: 'พักผ่อน' },
  sparkle: { glyph: '✦', label: 'เป้าหมาย' },
  bloom: { glyph: '🌼', label: 'สวนผลิบาน' },
  back: { glyph: '◀', label: 'กลับไปยังกองกลาง' },
  error: { glyph: '🌧', label: 'เปิดสวนไม่ได้' },

  // Item images (srcKey resolves against the runtime asset map)
  gardenHeart: { srcKey: 'gardenHeart', label: 'หัวใจสวน' },
  dewDrop: { srcKey: 'dewDrop', label: 'น้ำค้างใบ้' },
  seedBadge: { srcKey: 'seedBadge', label: 'ตราเมล็ดแบ่งปัน' },
  festivalGift: { srcKey: 'festivalGift', label: 'ของขวัญเทศกาล' },
});

// Look up one entry; unknown keys fail loudly so a typo can never silently
// render an empty icon.
export function icon(key) {
  const entry = ICONS[key];
  if (!entry) throw new Error(`IconLanguage: unknown icon key "${key}"`);
  return entry;
}

export function iconGlyph(key) {
  return icon(key).glyph;
}

// Resolve an image entry against the runtime asset map (e.g. itemAssets).
export function iconSrc(key, assets) {
  return assets?.[icon(key).srcKey];
}

export function iconLabel(key) {
  return icon(key).label;
}
