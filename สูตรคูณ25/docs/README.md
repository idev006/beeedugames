# Project Knowledge Base

สารบัญองค์ความรู้ของเกม “เมืองแสงซ่อนกล” สำหรับทีมพัฒนา นักออกแบบการเรียนรู้ QA/Operations และ AI session ใหม่

## Start Here

| เอกสาร | ใช้เมื่อ |
|---|---|
| `59-project-closeout-report.md` | ต้องการรู้ผลลัพธ์ สถานะจริง และสิ่งที่ยังไม่พร้อม production |
| `60-reusable-education-game-playbook.md` | เริ่มเกมการศึกษาโครงการใหม่หรือนำบทเรียนไปใช้ซ้ำ |
| `61-ai-team-handoff.md` | developer/AI ใหม่ต้องทำงานต่ออย่างปลอดภัย |
| `62-operations-maintenance-runbook.md` | deploy, monitor, debug incident และ rollback |

## Franchise Guidebook — สร้างเกมใหม่อย่างรวดเร็ว

เริ่มที่ `franchise/README.md` หากเป้าหมายคือสร้างเกมการศึกษาโครงการใหม่ ไม่ใช่เพียงบำรุงรักษาเกมนี้

| Module | Outcome |
|---|---|
| `franchise/README.md` | Golden Path และ Franchise Contract |
| `franchise/01-product-blueprint.md` | แปลงบทเรียนเป็น core loop/story/vertical slice |
| `franchise/02-production-operating-system.md` | Kanban, architecture, lifecycle และ asset pipeline |
| `franchise/03-quality-scorecards.md` | quality bar, anti-patterns และ hard release gates |
| `franchise/04-ai-execution-protocol.md` | protocol/prompt สำหรับ AI ที่ตรวจสอบได้ |
| `franchise/templates/` | brief, feature loop, asset request และ release templates |

## Document Status

เอกสารแบ่งเป็นสามประเภท:

- **Final truth:** เอกสาร 59–62, config, tests และ runtime code
- **Decision record:** `docs/adr/` อธิบายเหตุผลของขอบเขตสถาปัตยกรรม
- **Historical plan/report:** เอกสาร 00–58 แสดงวิวัฒนาการ, sprint และหลักฐาน ณ เวลานั้น บาง stack/ตัวเลขอาจถูกแทนที่แล้ว

อย่าใช้ historical plan เป็นความจริงปัจจุบันโดยไม่เทียบ final truth

## Product and Learning

- `00-project-charter.md` — จุดเริ่มต้นและขอบเขต
- `01-game-story.md` — โลกและแรงจูงใจ
- `02-learning-design.md` — เป้าหมายการเรียนรู้
- `03-gameplay-loop.md` — core loop
- `16-ar-and-large-number-design.md` — AR และจำนวนมาก
- `18-game-design-v2-plan.md` — learner-first redesign
- `20-vertical-slice-7x2-wireflow.md` — phase wireflow
- `21-vertical-slice-7x2-interaction-contract.md` — interaction contract
- `24-adaptive-two-phase-sprint.md` — adaptive scaffold
- `25-tables-13-25-representation-sprint.md` — การแทนแม่ 13–25
- `26-visual-material-polish.md` — visual affordance
- `28-dual-charge-interaction.md` — interaction ทางเลือก
- `38-answer-distractor-policy.md` — misconception-based distractors

## Architecture and Data

- `04-technical-architecture.md` — historical architecture proposal
- `08-data-schema.md` — SSOT/data model
- `14-workflow-sequence.md` — sequence diagrams
- `15-module-architecture.md` — module boundaries
- `22-system-analysis-and-design.md` — testable system design
- `adr/ADR-001-engine-choice.md`
- `adr/ADR-002-state-and-config.md`
- `adr/ADR-003-asset-handoff.md`
- `adr/ADR-004-scene-composition-and-performance.md`
- `adr/ADR-005-progress-and-leaderboard-ports.md`

## Art and Assets

- `06-art-direction.md`
- `asset-generation-prompts.md`
- `asset-handoff-template.md`
- `30-hall-of-fame-asset-pipeline.md`
- `40-podium-anchor-layout.md`
- `41-hall-scene-loading-lifecycle.md`

## Progression and Hall of Fame

- `31-session-reward-progression-plan.md`
- `32-progression-system-analysis-and-roadmap.md`
- `33-progression-implementation-report.md`
- `35-hollywood-hall-score-fix-report.md`
- `36-score-recording-integrity-audit.md`
- `39-google-sheets-leaderboard.md`
- `45-worldwide-leaderboard-anticheat.md`
- `54-moderation-data-runbook.md`
- `58-server-hall-flow.md`

## Testing and Release

- `10-test-plan.md`
- `11-release-checklist.md`
- `23-test-implementation-plan.md`
- `25-local-test-runbook.md`
- `47-workflow-test-strategy.md`
- `49-workflow-test-report-2026-08-02.md`
- `50-release-readiness-program.md`
- `51-kanban-release-gates.md`
- `52-ar-device-acceptance.md`
- `53-operations-release-gate.md`
- `55-child-privacy-readiness.md`
- `56-release-gate-report-2026-08-02.md`

## Agile History

- `09-kanban.md` — backlog หลักและ loops
- `19-project-plan-v2.md` — document-driven delivery
- `42`–`44`, `46`, `48`, `51` — Kanban loops ราย feature/release gate
- `34`, `35`, `43`, `57` — diagnosis/fix reports

## Minimum Context for a New AI

ให้อ่านตามลำดับ:

```text
README.md
docs/franchise/README.md
docs/59-project-closeout-report.md
docs/60-reusable-education-game-playbook.md
docs/61-ai-team-handoff.md
docs/62-operations-maintenance-runbook.md
config/game.config.json
relevant ADR and tests
```

จากนั้นจึง inspect runtime code ที่เป็น owner ของงาน ห้ามแก้จากภาพหน้าจอโดยเดาสาเหตุ
