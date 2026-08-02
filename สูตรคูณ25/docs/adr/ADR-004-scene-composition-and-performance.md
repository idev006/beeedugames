# ADR-004: Scene Composition, Ownership, and Performance

## Status

Accepted and implemented.

## Context

`LuminaraScene` previously owned answer creation, energy pods, AR dwell, feedback, actors, rewards, store subscriptions, and teardown. This made lifecycle bugs possible because state and resource ownership crossed unrelated responsibilities.

## Decision

Use composition-oriented OOP with a thin Phaser scene:

- `LuminaraScene` is the composition root.
- Stateful behavior belongs to focused entity or system classes.
- `DisposableBag` owns store subscription teardown.
- Every Phaser object has exactly one owning component.
- Communication uses domain events and narrow method calls.
- AR progress crossing into Vue is quantized to avoid redundant reactive work.

The human-body model is used only as an ownership aid: memory, nervous system, senses, coordinator, organs, and cleanup. It is not used to create unnecessary inheritance hierarchies.

## Consequences

Positive:

- Replay and destruction are deterministic.
- Systems can be tested and optimized independently.
- Scene code is smaller and easier to audit.
- AR frame traffic no longer causes a Vue update every render frame.
- New answer or feedback variants can be added without editing unrelated systems.

Trade-offs:

- More modules and import versions must be maintained.
- Cross-system sequences require an explicit director.
- Pooling is deferred until profiling shows allocation pressure; premature pooling would increase state-reset risk.

## Verification

- JavaScript syntax check for every module.
- Runtime browser test with a visible round.
- Repeated exit/replay test verifies one canvas and no stale-scene errors.
- Console error/warning audit.
- File-size policy: no JavaScript file over 700 lines.
