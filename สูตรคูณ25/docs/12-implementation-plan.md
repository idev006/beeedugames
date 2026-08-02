# Implementation Plan

## Objective

Build a playable AR educational game for multiplication tables 2 to 25, multiplier 1 to 12. The game must feel like an adventure repair mission, not a worksheet.

## Current Asset Decision

The project uses generated source assets from `assets/` and normalized production assets from `assets/processed/`.

Runtime must use:

- `assets/processed/backgrounds/*.png`
- `assets/processed/characters/*/*-spritesheet.png`
- `assets/processed/objects/energy-pods/*.png`
- `assets/processed/objects/answer-cores/*.png`
- `assets/processed/rewards/*.png`
- `assets/processed/atlases/gameplay-objects-rewards.png`
- `assets/processed/ui/ui-icon-set.png`
- `assets/processed/vfx/energy-vfx-spritesheet.png`
- `assets/processed/asset-manifest.json`

Source assets remain available for reference and future regeneration.

### Sprite normalization contract

- Character source sheets use an explicit declared grid. Lumin, Pix, Maru, and Zen are 6 columns x 2 rows with 12 source poses; Glimshade is a true 7 columns x 2 rows sheet with 14 poses. Never infer the source grid from the runtime frame count.
- The asset pipeline crops each source cell independently from the real canvas dimensions and fits it into a 512 x 512 runtime cell with safe transparent padding.
- The 12-pose sources map explicitly to the game's 14-frame animation contract. The two extra runtime slots reuse semantically compatible celebration and gentle-mistake poses; no source pose is split or inferred from a wrong grid.
- Runtime character sheets are therefore 3584 x 1024 pixels, 7 columns x 2 rows.
- The pipeline also exports runtime frame 0 as `lumin-idle.png`, keeping the start screen and gameplay character artwork synchronized.
- The original AI VFX sheet contains artwork clipped at its source-cell boundaries and is retained only as an art reference.
- Runtime energy VFX is generated deterministically by `tools/build-vfx-spritesheet.py` as a clean 3072 x 1024 sheet, 6 columns x 2 rows.
- `tools/normalize-assets.ps1` validates every produced frame and fails the build when visible pixels are too close to a frame edge.
- Gameplay-object sources are retained at 2048 x 2048. Runtime energy pods and answer cores are normalized to 1024 x 1024; collectible rewards are normalized to 512 x 512.
- Normalization is object-aware: it reads the true alpha bounds, scales only the visible object, and applies a category contract instead of blindly resizing the whole source canvas.
- Energy pods use a center-bottom anchor and a shared baseline at y=950. Answer cores and rewards use a stable center pivot so selection and reward animation do not wobble between variants.
- `asset-manifest.json` records source bounds, runtime bounds, safe padding, anchor, and pivot for QA and future automated placement.
- `tools/optimize-runtime-pngs.py` applies lossless PNG optimization after normalization. Source artwork is never overwritten.
- The 4 x 4 `gameplay-objects-rewards` atlas is normalized by cell and used by `RewardPresenter` for the persistent repair console and earned repair-part celebrations.
- The 4 x 4 `ui-icon-set` atlas supplies play, settings, star, heart, timer, gift, replay, and home icons through CSS sprite coordinates.
- The start screen introduces all five team members using generated idle portraits. During play, `CompanionActor` rotates Pix, Maru, Zen, and Glimshade by district and gives each success/mistake reactions.

## Gameplay Core

Story: Luminara city has lost its energy rhythm. Children join a repair team and restore each district by finding the correct energy core.

Round loop:

1. Select a multiplication table range and session settings.
2. Spawn one mission: groups x energy per group.
3. Show equal-group visual hints as glowing energy clusters.
4. Spawn 4 answer cores. One answer is correct, the others are plausible mistakes.
   `AnswerLayoutEngine` generates new constrained-random positions each round while enforcing target spacing and exclusion zones for characters and the AR camera preview.
5. Player taps or AR-points at a core.
6. Correct answer repairs a node, awards stars, combo, and advances the district.
7. Wrong answer reduces heart and gives a gentle visual correction.
8. Session ends when time runs out or hearts reach zero.

## AR Flow

AR is optional but first-class.

1. User clicks AR.
2. Browser requests camera permission.
3. MediaPipe Tasks Vision 1.0 loads a pinned WASM runtime and Hand Landmarker model.
4. The Hand Landmarker runs in VIDEO mode; index fingertip landmark 8 controls a large glowing pointer.
5. Camera readiness alone never displays or activates the pointer. The pointer exists only while the current inference frame contains a detected index fingertip; losing the hand or an inference failure hides it and cancels dwell immediately.
6. The AR pointer becomes active only inside the circular center zone of an answer core. Entering only its outer edge shows a "เล็งกลาง" hint; holding inside the center zone for 0.5 seconds selects it.
7. After a correct selection, the visible pointer parks in the reserved lower-right safe zone for at least 700 ms while feedback plays. The safe zone is excluded from answer placement.
8. A new dwell cannot begin until the real fingertip has left every answer target. This prevents a newly spawned answer under a stationary finger from being selected automatically. Losing hand tracking cancels the current dwell immediately.
9. The browser build benchmarks showed GPU inference to be about three times faster than CPU on the target machine. It therefore uses GPU with CPU fallback, caps inference at 10 FPS, and adapts the interval to a main-thread budget.
10. Model warm-up completes before a new AR session timer begins. Enabling AR during a running session temporarily pauses the timer.
11. Inference errors are surfaced to the player instead of being silently discarded.
12. `tools/ar-model-smoke.html` verifies module, WASM, model loading, inference, and warm-up/steady timing without requiring camera permission.

## OOP Model

- `GameStore`: SSOT runtime state.
- `RoundFactory`: creates multiplication missions.
- `AnswerGenerator`: creates plausible answer choices.
- `PhaserGameBridge`: connects Vue state to Phaser.
- `LuminaraScene`: renders gameplay, sprites, particles, and hit zones.
- `CompanionActor`: owns district character selection, left-side stage position, idle frame cycle, floating motion, group-observation reaction, success/mistake reaction, transition, timers, and cleanup. Characters that face right stay on the upper-left so their gaze leads into the playfield.
- `RewardPresenter`: owns the gameplay-object atlas, persistent repair console, reward animation, and cleanup.
- `MilestoneDirector`: owns the between-district reward announcement, new-member introduction, role label, input shield, and transition cleanup.

## District milestone implementation

- Every `progression.repairsPerDistrict` correct repairs creates a milestone when another district exists.
- The timer pauses and answer input remains locked during the milestone.
- The current district remains visible while the game announces the achievement.
- The next companion enters with their name, role, and one short story line.
- Only after the announcement does `GameStore` commit `levelIndex`, emit `district:changed`, and create the next round.
- Progression timing and character copy come from `config/game.config.json`; rendering systems do not duplicate these rules.
- Replays cancel pending transition timers so an old session cannot create a round in a new session.
- `ARController`: camera and MediaPipe hand pointer.
- `AudioEngine`: web audio music and SFX.

### Phaser lifecycle contract

- A scene detaches every store subscription synchronously before `Phaser.Game.destroy()`.
- Cleanup is idempotent and runs for both Phaser `SHUTDOWN` and `DESTROY`.
- Store-driven render handlers verify that the scene is active and still owns a display list before creating game objects.
- Replay must create exactly one canvas; destroyed scenes must never receive `round:new` or answer-feedback events.

## Screens

- Start screen: choose table range, time, AR preference, difficulty.
- Play screen: Phaser game area, compact mission panel, AR control, hearts/stars/timer.
- Result screen: stars, repaired nodes, accuracy, table range practiced, restart.
- Settings modal: volume, SFX, motion, difficulty, time.

## Definition Of Done

- Game runs from `http://localhost`.
- Normal mouse/touch gameplay works.
- AR button starts camera on localhost/HTTPS when permission is granted.
- MediaPipe failure does not break the game.
- Processed assets load without Thai path or spaces.
- Timer, hearts, score, combo, round progression, and result screen work.
- Documentation describes workflow and risks.
