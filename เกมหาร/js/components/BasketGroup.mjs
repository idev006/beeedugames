import { FruitPiece } from './FruitPiece.mjs?v=polish-anim-v1';
import { MonsterSprite } from './MonsterSprite.mjs';
import { fruitBundles } from '../core/FruitBundles.mjs';
import { transferFruitIds } from '../input/DragTransfer.mjs';

export const BasketGroup = {
  components: { FruitPiece, MonsterSprite },
  props: ['basket', 'fruits', 'selectedFruitId', 'selectedFruitIds', 'expandedFruitIds', 'fiveUnitFruitIds', 'timing', 'locked', 'assets', 'targetShare', 'splitIds', 'dropIds'],
  emits: ['place', 'place-selected', 'pick-bundle', 'pointer-bundle', 'split-bundle', 'drag-begin', 'drag-complete'],
  methods: {
    drop(event) {
      if (this.locked) return;
      const fruitId = event.dataTransfer.getData('text/plain');
      const bundleIds = transferFruitIds(event.dataTransfer);
      if (this.selectedFruitIds?.includes(fruitId)) this.$emit('place', this.selectedFruitIds, this.basket.id);
      else if (bundleIds.length) this.$emit('place', bundleIds, this.basket.id);
      else if (fruitId) this.$emit('place', [fruitId], this.basket.id);
    },
    placeSelection() {
      if (this.locked) return;
      if (this.selectedFruitIds?.length) this.$emit('place-selected', this.basket.id);
      else this.$emit('place', this.selectedFruitId, this.basket.id);
    },
  },
  template: `
    <section
      class="basket-zone"
      :class="{ 'can-receive': (selectedFruitIds?.length || selectedFruitId) && !locked }"
      :data-basket-id="basket.id"
      tabindex="0"
      role="button"
      :aria-label="basket.label + ' มีแอปเปิ้ล ' + fruits.length + ' ผล'"
      @click="placeSelection"
      @keydown.enter="placeSelection"
      @keydown.space.prevent="placeSelection"
      @dragover.prevent
      @drop.prevent="drop"
    >
      <MonsterSprite
        class="monster-avatar"
        :src="basket.spriteSrc"
        :fallback-src="basket.avatarSrc"
        :label="basket.label"
        :frame-index="basket.frameIndex"
        aria-hidden="true"
      />
      <h3>{{ basket.label }}</h3>
      <div class="count-badge" aria-hidden="true"><span>{{ icon('countBullet').glyph }}</span> {{ fruits.length }}/{{ targetShare }} ผล</div>
      <img class="basket-image" :src="assets.basket" alt="" aria-hidden="true">
      <div class="basket-fruits">
        <FruitPiece
          v-for="fruit in fruitBundles(fruits, expandedFruitIds, fiveUnitFruitIds)"
          :key="fruit.id"
          :fruit="fruit"
          :selected="fruit.ids.some((id) => selectedFruitIds?.includes(id) || selectedFruitId === id)"
          :transfer-ids="selectedFruitIds"
          :timing="timing"
          :asset-src="assets.fruits?.[fruit.objectType]?.src || assets.apple"
          :label="assets.fruits?.[fruit.objectType]?.label || 'ผลไม้'"
          :split-ids="splitIds"
          :drop-ids="dropIds"
          @pick-bundle="(ids, event) => $emit('pick-bundle', ids, event)"
          @pointer-bundle="(ids, event) => $emit('pointer-bundle', ids, event)"
          @split-bundle="(ids) => $emit('split-bundle', ids)"
          @drag-begin="$emit('drag-begin')"
          @drag-complete="$emit('drag-complete')"
        />
      </div>
    </section>
  `,
  setup() {
    return { fruitBundles };
  },
};
