# Session, Mistake, and Repair Progression Plan

Date: 2026-08-01  
Status: Time selection done; progression design proposed

## Kanban loop

| Card | Work item | Status |
|---|---|---|
| SRP-01 | Make session duration selectable from 30 to 600 seconds | Done |
| SRP-02 | Ensure difficulty never changes the selected duration | Done |
| SRP-03 | Verify wrong answers consume one heart and trigger remediation | Existing / verified |
| SRP-04 | Design persistent repair-material inventory | Proposed |
| SRP-05 | Connect inventory to city restoration and Hall of Fame | Proposed |

## Design rules

### Session duration

- Slider range: 30–600 seconds in 30-second steps.
- Quick presets recommended: 60, 180, 300, and 600 seconds.
- The selected duration is exact and independent from difficulty.
- Hall of Fame scores must be separated or normalized by session duration so a 600-second run does not automatically dominate a 30-second run.

### Wrong answers

- A wrong answer consumes one team-energy heart.
- Use a short heart-drain animation, soft mistake sound, and mascot reaction.
- Keep the same learning relationship visible and provide a grouping scaffold before retrying.
- Do not shame, flash red aggressively, or reveal the answer without showing the reasoning.
- Consider a practice accessibility option where hearts reach one but do not end the session.

### Repair materials

The current game displays repair-part rewards and tracks repaired nodes, but it does not yet maintain a persistent material inventory.

Recommended inventory:

- Gear: earned for completing a correct repair.
- Crystal: earned for accuracy and conceptual grouping.
- Energy cell: earned for a streak without mistakes.
- Prism: earned for mastering a new multiplication pair.

Materials should restore visible city objects, not merely increase counters. Save inventory, restored objects, mastery, and best scores locally through a versioned repository. Avoid random loot or paid-style reward loops.

## Recommended next features

1. Persistent player profile and versioned local save.
2. City restoration map with visible before/after states.
3. Fair Hall of Fame boards by duration, table range, and difficulty.
4. Personal-best and mastery records, not only global score.
5. End-of-session learning report for children and adults.
6. Adaptive review queue for multiplication pairs with repeated mistakes.
7. Practice mode with no game-over pressure and challenge mode with hearts.

