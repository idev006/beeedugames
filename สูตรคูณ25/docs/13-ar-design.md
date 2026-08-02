# AR Design

## Purpose

AR is used to make selection feel physical and playful. The child points at an energy core with the index finger and holds briefly to activate it.

## Selection Rule

- Pointer source: index fingertip landmark.
- Dwell time: 500 ms.
- Target: answer core hit zone.
- Feedback: radial progress ring around the pointer.
- Cancel: moving away from target resets dwell progress.

## Permission Requirements

Camera access works on:

- `localhost`
- HTTPS

Camera access can fail on:

- `file://`
- blocked browser permission
- unavailable webcam
- incompatible MediaPipe CDN load

## Fallback

If AR initialization fails:

1. Stop camera if partially started.
2. Show status message.
3. Keep normal pointer/touch gameplay active.

The game must never become unplayable because AR fails.
