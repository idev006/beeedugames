# Server Hall of Fame flow

Hall of Fame uses server data only. Local records and offline queues are never merged into the public podium.

1. Show a full-screen loading overlay immediately.
2. Request a fresh `hall` snapshot from Apps Script exactly once on every entry into the Hall screen.
3. The snapshot contains the public board catalogue and the public Top 10 entries for every board. It never exposes the raw Sheet.
4. Store `boards` and `entriesByBoard` in HallController memory for the lifetime of the Hall screen.
5. Use the current rules when that board has records; otherwise select the most recently active server board.
6. Let the player switch server boards through a labelled dropdown. A selection change filters `entriesByBoard` locally and performs no network request. Leaving and entering Hall again discards the previous in-memory snapshot and downloads a new one.
7. On timeout/error, show a connection error. Never describe a failed request as an empty leaderboard.

Browser acceptance found three server boards and nine public entries in the snapshot. Switching from the 30-second board to the 180-second board changed the rendered list immediately without showing the loading overlay again. Apps Script deployment version: 8.
