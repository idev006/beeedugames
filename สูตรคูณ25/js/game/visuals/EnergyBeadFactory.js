const PALETTES = Object.freeze([
  Object.freeze({ halo: 0x63f5e2, rim: 0xc8fff7, core: 0x27c9cf, depth: 0x087ca4 }),
  Object.freeze({ halo: 0x78dfff, rim: 0xe5fbff, core: 0x35b8ed, depth: 0x1767ba })
]);

export class EnergyBeadFactory {
  static create(scene, options = {}) {
    const radius = Math.max(2.4, Number(options.radius) || 6);
    const palette = PALETTES[Math.abs(Number(options.variant) || 0) % PALETTES.length];
    const bead = scene.add.container(options.x || 0, options.y || 0);

    const halo = scene.add.circle(0, 1, radius * 1.72, palette.halo, 0.2);
    const lowerDepth = scene.add.circle(0, radius * 0.16, radius * 1.08, palette.depth, 0.98);
    const core = scene.add.circle(0, -radius * 0.12, radius, palette.core, 1)
      .setStrokeStyle(Math.max(1, radius * 0.2), palette.rim, 1);
    const lens = scene.add.ellipse(
      -radius * 0.3,
      -radius * 0.42,
      radius * 0.72,
      radius * 0.36,
      0xffffff,
      0.82
    ).setAngle(-18);
    const spark = scene.add.star(
      radius * 0.55,
      -radius * 0.55,
      4,
      Math.max(0.7, radius * 0.1),
      Math.max(1.5, radius * 0.28),
      0xffffff,
      radius >= 4.5 ? 0.74 : 0
    ).setAngle(45);

    bead.add([halo, lowerDepth, core, lens, spark]);
    bead.setAlpha(options.alpha ?? 1);
    return bead;
  }
}
