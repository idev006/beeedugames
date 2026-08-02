# Release Gate Report — 2026-08-02

## Decision

**NO-GO สำหรับ Worldwide Production**  
**พร้อมสำหรับ Development/monitored Closed Beta หลัง RG-02 physical smoke ผ่านบนอุปกรณ์ที่จะใช้จริง**

เหตุผลหลักคือ backend p95 latency เกินเกณฑ์, AR ยังไม่มีหลักฐานสามอุปกรณ์ และ child-privacy owner/legal obligations ยังไม่มีผู้ลงนาม

## Evidence

| Gate | Result | Evidence |
|---|---|---|
| RG-01 City progression | Pass | explicit 4-node map, atomic material spend, persisted active district, unit tests and browser inspection |
| RG-02 AR | Conditional | automated index/no-hand tests pass; self-check UI and protocol ready; physical matrix pending |
| RG-03 Hall/UI | Pass | browser 1280×720: document 1280×720, no overflow; Hall loading/data, privacy, city and play rendered |
| RG-04 Operations | Fail | cache improved p95 9,629 → 5,720 ms, but still > 5,000 ms; health samples 4,259/3,789/9,464 ms |
| RG-05 Moderation/data | Conditional | Apps Script v6 deployed; owner-only HIDE/RESTORE/DELETE queue implemented; owner setup/approval pending |
| RG-06 Child privacy | Fail | inventory/notice/local deletion implemented; operator contact, consent decision, retention and legal approval missing |
| RG-07 Regression | Conditional | 53/53 unit tests and static audit pass; API smoke passes; blocked by RG-02/RG-04/RG-06 |

## Test runs

- `npm test`: 54 passed, 0 failed
- `npm run qa:static`: 136 text files, 67 code files, 38 asset references, 0 failures
- `npm run qa:leaderboard`: signed ticket, modified-score rejection, valid submit, idempotent duplicate and exactly-once readback all pass
- Apps Script deployment: production web app updated to version 8 with cache invalidation and a single-request Hall snapshot containing the server board catalogue and public Top 10 for each board
- Browser workflow: Start → Privacy → City → Hall → Play passed
- Layout at 1280×720: document scroll width/height equals viewport; game and HUD remain within bounds

## Required actions before another Go/No-Go

1. Execute `docs/52-ar-device-acceptance.md` on Windows, Android phone and tablet; attach results.
2. Redesign leaderboard hosting or accept a documented beta SLO. Cache was implemented but Apps Script cold-start spikes remain above Gate threshold.
3. `setupLeaderboard()` after v6 completed; verify `Moderation` and `AdminRequests`, then remove QA identities from the public board.
4. Supply operator name/contact, parent request channel, retention period and target-country consent decision; obtain privacy/legal approval.
5. Repeat health three times, load test and complete API smoke. All must pass before owner signs Go.

## Rollback

- Backend: redeploy Apps Script version 4 if moderation v5 causes an incident.
- Frontend: set `leaderboard.online.enabled` false to preserve local play and queued scores while online service is investigated.
- Do not discard local queue during an outage; notify players that Hall is temporarily offline.
