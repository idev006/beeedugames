import { createPhaserOrchardPreview } from '../renderers/PhaserOrchardPreview.mjs';

const { onBeforeUnmount, onMounted, ref, watch } = Vue;

export const PhaserStage = {
  props: ['appleSrc', 'characterSrc', 'reducedSensory', 'phase', 'sourceCount', 'basketCounts'],
  setup(props) {
    const host = ref(null);
    let preview = null;
    const mountPreview = () => {
      preview?.destroy();
      preview = createPhaserOrchardPreview(host.value, props);
    };
    onMounted(mountPreview);
    watch(() => [props.appleSrc, props.characterSrc, props.reducedSensory], mountPreview);
    watch(() => [props.phase, props.sourceCount, props.basketCounts], () => preview?.update?.(props));
    onBeforeUnmount(() => preview?.destroy());
    return { host };
  },
  template: `<section class="phaser-stage" aria-hidden="true"><div ref="host" class="phaser-stage-canvas"></div></section>`,
};
