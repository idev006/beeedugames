# Layout, Leaderboard, and Heart Feedback Fix Report

วันที่: 2026-08-01  
สถานะ: Done

## Kanban loop

| Card | Work | Status |
|---|---|---|
| FLH-01 | Reproduce start-screen clipping and inspect viewport bounds | Done |
| FLH-02 | Diagnose missing Hall of Fame entries | Done |
| FLH-03 | Fix score contract and async commit ordering | Done |
| FLH-04 | Add semantic heart colors and mistake state | Done |
| FLH-05 | Automated and browser end-to-end QA | Done |

## Root causes

### Start-screen clipping

The start screen combined viewport-based minimum height with a fixed 620 px hero minimum. The new player profile row increased the content height, while the application shell still hid overflow. The bottom row could therefore extend beyond short desktop viewports.

Fix:

- Use a dynamic viewport-height contract for the start and result screens.
- Let the hero fill the available grid height instead of enforcing 620 px.
- Add a compact desktop-height layout below 900 px that reduces spacing and control sizes without cropping content.

### Hall of Fame did not record

`LeaderboardService.calculateScore()` read `tableMin` and `tableMax` from the result object, but those values belong to the session-settings snapshot. The calculation produced `NaN`, and the repository correctly rejected the invalid entry.

A second issue allowed the result screen to open before the asynchronous leaderboard commit had completed.

Fix:

- Calculate breadth from the immutable session-settings snapshot.
- Keep a leaderboard commit promise and await it before reading/opening Hall of Fame.
- Keep repository validation so invalid scores still fail closed.

### Heart state

The heart glyph inherited white HUD text.

Fix:

- Healthy hearts are saturated red with a soft red glow.
- A mistake temporarily changes the hearts to amber/yellow while the HUD shakes gently.
- The feedback avoids aggressive flashing and returns to red after 620 ms.

## Verification

- Automated tests: 28/28 passing.
- 1280×720: start screen has no clipping or document overflow.
- 1838×900: profile and action controls remain fully inside the viewport.
- Healthy heart computed color: `rgb(255, 85, 127)`.
- Browser end-to-end: complete one correct repair, exit, open Hall of Fame, and verify rank #1 with a finite score.
- Browser console: no warning or error.

