export const FruitPiece = {
  props: ['fruit', 'selected', 'timing', 'assetSrc', 'transferIds', 'label', 'splitIds', 'dropIds'],
  emits: ['pick-bundle', 'pointer-bundle', 'split-bundle', 'drag-begin', 'drag-complete'],
  data() {
    return { suppressPick: false, suppressPickTimer: null };
  },
  computed: {
    justSplit() {
      return Boolean(this.splitIds?.some((id) => this.fruit.ids.includes(id)));
    },
    justDropped() {
      return Boolean(this.dropIds?.some((id) => this.fruit.ids.includes(id)));
    },
  },
  methods: {
    pick(event) {
      if (this.selected && event?.type === 'mousedown' && !event.ctrlKey && !event.metaKey) return;
      if (!this.suppressPick) this.$emit('pick-bundle', this.fruit.ids, event);
    },
    drag(event) {
      clearTimeout(this.suppressPickTimer);
      this.suppressPick = true;
      this.$emit('drag-begin');
      const ids = this.transferIds?.includes(this.fruit.ids[0]) ? this.transferIds : this.fruit.ids;
      event.dataTransfer.setData('text/plain', this.fruit.ids[0]);
      event.dataTransfer.setData('application/x-orchard-fruit-ids', JSON.stringify(ids));
      if (!this.selected) this.$emit('pick-bundle', this.fruit.ids);
    },
    finishDrag() {
      clearTimeout(this.suppressPickTimer);
      this.suppressPickTimer = setTimeout(() => {
        this.$emit('drag-complete');
        this.suppressPick = false;
      }, 250);
    },
  },
  template: `
    <button
      class="fruit"
      :class="{ 'is-selected': selected, 'fruit-bundle': fruit.value > 1, 'bundle-ten': fruit.value >= 10, 'just-split': justSplit, 'just-dropped': justDropped }"
      :style="{ '--travel-ms': timing + 'ms' }"
      :data-fruit-id="fruit.ids[0]"
      :data-fruit-ids="JSON.stringify(fruit.ids)"
      draggable="true"
      type="button"
      :aria-pressed="selected"
      :aria-label="(label || 'ผลไม้') + ' ' + fruit.value + ' ผล'"
      @click.stop="pick"
      @mousedown.stop="pick"
      @dblclick.stop="fruit.value > 1 && $emit('split-bundle', fruit.ids)"
      @pointerdown.stop="$emit('pointer-bundle', fruit.ids, $event)"
      @pointerup.stop="pick"
      @dragstart="drag"
      @dragend="finishDrag"
    ><img class="fruit-image" :src="assetSrc" alt="" aria-hidden="true"><span v-if="fruit.value > 1" class="bundle-value">{{ fruit.value }}</span></button>
  `,
};
