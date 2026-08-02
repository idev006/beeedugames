# Runtime Sequence Diagrams

## Start, Answer, Finish, and Play Again

```mermaid
sequenceDiagram
    actor Player
    participant Vue as Vue App
    participant Bridge as PhaserGameBridge
    participant Scene as LuminaraScene
    participant Store as GameStore
    participant Audio as AudioEngine

    Player->>Vue: Start game
    Vue->>Vue: Show play screen
    Vue->>Bridge: mount()
    Bridge->>Scene: Create a new Phaser scene
    Vue->>Store: start()
    Store->>Scene: round:new
    Scene->>Scene: Render pods and answer cores
    Vue->>Audio: Start music

    Player->>Scene: Tap or AR-dwell on answer
    Scene->>Store: submit(value)
    Store->>Scene: answer:correct or answer:wrong + learning telemetry
    Scene->>Scene: Local feedback animation

    alt Session continues
        Store->>Scene: round:new
        Scene->>Scene: Replace round objects
    else Session finishes
        Store->>Vue: game:finish(reason + learning summary)
        Vue->>Audio: Stop music
        Vue->>Bridge: destroy()
        Bridge->>Scene: shutdown and unsubscribe
        Vue->>Vue: Show result screen
    end

    Player->>Vue: Play again
    Vue->>Vue: Recreate play-screen DOM
    Vue->>Bridge: mount() with new #phaser-root
    Bridge->>Scene: Create a fresh Phaser scene
    Vue->>Store: start() and reset runtime
    Store->>Scene: round:new
```

## AR Frame and Dwell Budget

```mermaid
sequenceDiagram
    participant Camera
    participant AR as ARController
    participant Model as HandLandmarker GPU/CPU
    participant Vue
    participant Scene as Phaser Scene
    participant Store

    Camera->>AR: New video frame
    AR->>AR: Check adaptive inference interval
    AR-->>Vue: Return to render frame
    AR->>Model: detectForVideo() after paint (max 10 FPS)
    Model-->>AR: 21 hand landmarks
    AR->>AR: Measure inference duration EMA
    AR->>Vue: Pointer from landmark 8
    Vue->>Scene: Normalized pointer

    alt Pointer enters answer
        Scene->>Scene: Start 500 ms dwell
    else Tracking lost or pointer leaves
        Scene->>Scene: Cancel dwell
    end

    Scene->>Store: Submit once after dwell completes
    Scene->>Scene: Disarm selection
    Scene->>Scene: Require pointer exit before re-arm
```

## District Milestone and Character Arrival

```mermaid
sequenceDiagram
    actor Player
    participant Store as GameStore
    participant Scene as LuminaraScene
    participant Milestone as MilestoneDirector
    participant Companion as CompanionActor
    participant Vue as Vue HUD

    Player->>Store: Submit correct answer
    Store->>Store: Increase repaired count
    alt Repaired count reaches configured milestone
        Store->>Store: Lock input and pause session timer
        Store->>Scene: progress:milestone
        Scene->>Milestone: Show achievement
        Milestone->>Companion: transitionTo(next companion)
        Milestone-->>Player: Name, role, arrival line, next district
        Store->>Store: Commit next levelIndex after announcement
        Store->>Vue: district:changed and runtime:update
        Store->>Scene: round:new
        Scene-->>Player: New background and mission
    else Normal correct answer
        Store->>Scene: round:new after feedback
    end
```

## Ownership Rules

- Vue owns screen DOM and destroys Phaser before removing the play screen.
- `PhaserGameBridge` owns the Phaser instance and never reuses a detached canvas.
- `LuminaraScene` owns store subscriptions and removes them on scene shutdown.
- `ARController` owns camera, model, animation frame, and inference timer lifecycle.
- `app.js` owns session-scoped DOM/audio timeout handles and cancels them on finish, replay, or unmount.
- `GameStore` owns `sessionState`, `finishReason`, round timing, and per-pair learning telemetry.
