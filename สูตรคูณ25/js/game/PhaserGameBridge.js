import { EventBus } from "../core/EventBus.js?v=20260730-11";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants.js?v=20260730-11";
import { LuminaraScene } from "./scenes/LuminaraScene.js?v=20260801-66";

const PhaserRef = window.Phaser;

export class PhaserGameBridge extends EventBus {
  constructor(config, store) {
    super();
    this.config = config;
    this.store = store;
    this.game = null;
    this.arPointer = { visible: false, x: 0.5, y: 0.5 };
  }

  mount() {
    const parent = document.getElementById("phaser-root");
    if (!parent) throw new Error("PHASER_ROOT_NOT_FOUND");
    if (this.game) {
      if (this.game.canvas?.isConnected && parent.contains(this.game.canvas)) return;
      this.destroy();
    }
    this.game = new PhaserRef.Game({
      type: PhaserRef.AUTO,
      parent: "phaser-root",
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      backgroundColor: "rgba(0,0,0,0)",
      scale: { mode: PhaserRef.Scale.FIT, autoCenter: PhaserRef.Scale.CENTER_BOTH },
      scene: [],
      transparent: true,
      callbacks: {
        postBoot: (game) => {
          game.scene.add("LuminaraScene", LuminaraScene, false);
          game.scene.start("LuminaraScene", {
            store: this.store,
            config: this.config,
            bridge: this
          });
        }
      }
    });
  }

  destroy() {
    const game = this.game;
    this.game = null;
    this.arPointer = { visible: false, x: 0.5, y: 0.5 };
    if (!game) return;

    // Store events are independent from Phaser's lifecycle. Detach the scene
    // synchronously before Phaser nulls its display list during destruction.
    try {
      game.scene?.getScene("LuminaraScene")?.cleanup?.();
    } catch {
      // A partially booted game may not have registered its scene yet.
    }
    game.destroy(true);
  }

  setARPointer(pointer) {
    this.arPointer = pointer;
  }
}
