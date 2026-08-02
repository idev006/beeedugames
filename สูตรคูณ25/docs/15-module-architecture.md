# Module Architecture

The game is split into small ES modules so every file stays easy to read, test, and replace. No runtime JavaScript file should exceed 700 lines.

## Layers

### App Layer

- `js/app.js`

Bootstraps Vue, loads config, wires UI state to game systems, and owns screen transitions.

### Core Domain Layer

- `js/core/EventBus.js`
- `js/core/DisposableBag.js`
- `js/core/GameStore.js`
- `js/core/RoundFactory.js`
- `js/core/AnswerGenerator.js`

Owns educational game rules: round creation, answer generation, scoring, hearts, time, and progression.

### Game Rendering Layer

- `js/game/constants.js`
- `js/game/PhaserGameBridge.js`
- `js/game/scenes/LuminaraScene.js`
- `js/game/entities/CompanionActor.js`
- `js/game/entities/RewardPresenter.js`
- `js/game/systems/AnswerField.js`
- `js/game/systems/EnergyPodField.js`
- `js/game/systems/ARSelectionSystem.js`
- `js/game/systems/CommutativeModel.js`
- `js/game/systems/FeedbackDirector.js`

`LuminaraScene` is a composition root and frame-loop coordinator. Entities own individual actors. Systems own answer rendering, energy groups, AR dwell, and feedback.

## Human-body composition model

The body metaphor clarifies communication and ownership without forcing every visual particle into a class:

- Memory: `GameStore` is the SSOT for durable session state.
- `GameStore.learningStats` stores telemetry per `table × multiplier` and is the base for future mastery/adaptive practice.
- Nervous system: `EventBus` carries domain events without direct subsystem coupling.
- Brain coordinator: `LuminaraScene` creates organs, connects events, and forwards the frame pulse.
- Sensory organ: `ARController` converts camera input into fingertip signals.
- Sensorimotor loop: `ARSelectionSystem` converts fingertip position and dwell into answer intent.
- Visual organs: `AnswerField` and `EnergyPodField` own their layers and game objects.
- Emotional response: `FeedbackDirector` coordinates poses, VFX, pod state, and rewards.
- Musculoskeletal actors: `CompanionActor` and `RewardPresenter` own sprites, tweens, and reactions.
- Concept visualization: `CommutativeModel` owns equal-groups arrays, swapped arrays, progress, and symbolic summary without writing scoring state.
- Immune/cleanup system: `DisposableBag` releases every subscription exactly once.

Communication follows one direction:

`ARController -> PhaserGameBridge -> ARSelectionSystem -> GameStore -> EventBus -> visual systems`

No child system writes Vue state or reaches into another child system's internals.

Input converges on the same two domain actions:

- `Mouse/Touch -> EnergyPodField -> GameStore.chargeGroup`
- `Mouse/Touch -> AnswerField -> GameStore.submit`
- `Camera/Finger -> ARController -> ARSelectionSystem -> CompositeTargetField -> chargeGroup/submit`

`CompositeTargetField` exposes Energy Pods and Answer Cores together. Pods are an optional equal-groups scaffold; children may charge them to visualize repeated addition or select an answer immediately. Mouse, touch, and AR therefore share the same available choices and never enter a hidden hard-gate state.

### AR Layer

- `js/ar/ARController.js`

Owns camera permission, MediaPipe Hands loading, index fingertip tracking, and fallback-safe AR status events.

### Audio Layer

- `js/audio/AudioEngine.js`

Owns Web Audio music and SFX.

## OOP Policy

- Use classes for systems with lifecycle or state.
- Prefer composition over inheritance; every object has one owner responsible for destruction.
- Keep pure generation logic in small domain classes.
- Keep the scene as orchestration rather than an all-purpose renderer.
- Vue should not contain game rules directly; it should call store/controller methods.
- Config remains SSOT through `config/game.config.json`.

## Performance policy

- AR progress is quantized to 5% steps before crossing EventBus into Vue, preventing redundant 60 FPS UI updates.
- Phaser-local animation remains inside Phaser and does not trigger Vue reactivity.
- Runtime uses normalized sprite atlases to reduce decoder work and network requests.
- Round objects are destroyed by their owning field; long-lived actors remain stable for the scene lifetime.
- Teardown is synchronous before `Phaser.Game.destroy()` to prevent stale listeners and canvas races.

## Maintenance Rule

When a file approaches 500 lines, split it before it reaches 700 lines. Current ownership boundaries are:

- `LuminaraScene`: composition and lifecycle only.
- `AnswerField`: answer visuals and hit zones only.
- `EnergyPodField`: multiplication-group visuals only.
- `ARSelectionSystem`: dwell state machine only.
- `FeedbackDirector`: cross-organ feedback sequencing only.
- `MilestoneDirector`: district reward announcement and new-member presentation only.
- `app.js`: split settings UI bindings if Vue logic grows.
- `GameStore`: split progression and scoring if level systems become deeper.
