export const CloudLayer = {
  props: ['src'],
  template: `
    <div v-if="src" class="cloud-layer" aria-hidden="true">
      <span v-for="index in 3" :key="index" class="cloud-sprite" :style="{ backgroundImage: 'url(' + src + ')' }"></span>
    </div>
  `,
};
