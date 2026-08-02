# Kanban — Worldwide Leaderboard Anti-Cheat Loop

| Card | งาน | สถานะ |
|---|---|---|
| WAC-01 | Audit client-to-Sheet score pipeline and threat model | Done |
| WAC-02 | Design HMAC ticket and score-proof transcript | Done |
| WAC-03 | Implement `SecurityService` namespace | Done |
| WAC-04 | Implement server-authoritative `ScoreProofPolicy` | Done |
| WAC-05 | Collect answer evidence in `GameStore` | Done |
| WAC-06 | Add client start-session and signed-submit flow | Done |
| WAC-07 | Block expired proof from resilient offline queue | Done |
| WAC-08 | Configure anonymous Web App manifest | Done |
| WAC-09 | Security and regression tests 51/51 | Done |
| WAC-10 | Push Apps Script version/deployment with `clasp` | Done |
| WAC-11 | Owner authorizes Spreadsheet scopes and verify `/exec` | Done — health returned schema 2 |
| WAC-12 | Put verified `/exec` URL into game config and live E2E | Done — forged score rejected; valid proof saved |

## Live verification — 2026-08-02

- Public health endpoint returned `ok: true` and `schemaVersion: 2`.
- Signed start-session ticket was issued with a 15-minute expiry.
- A forged score was rejected with `SCORE_PROOF_MISMATCH`.
- A valid one-answer proof was stored as the clearly labelled smoke-test row `SECURITY_TES`, score 3.
- The verified `/exec` deployment URL is now the SSOT value in `config/game.config.json`.
- Automated security and regression suite: 51 passed, 0 failed.
