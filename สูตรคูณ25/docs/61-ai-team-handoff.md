# AI and Team Handoff Guide

เอกสารนี้ใช้เป็น entry point ให้ developer, designer, QA หรือ AI session ใหม่ทำงานต่อโดยไม่ต้องย้อนอ่านทุกบทสนทนา

## 1. Mission

รักษาเกม “เมืองแสงซ่อนกล” ให้เป็นเกมเรียนรู้การคูณผ่าน equal groups, visual reasoning และ commutative property โดยไม่ถอยกลับไปเป็นแบบทดสอบเลือกตอบที่ตกแต่งด้วยฉากสวย

## 2. Source of Truth Priority

เมื่อข้อมูลขัดกัน ให้ใช้ลำดับ:

1. automated tests และโค้ด runtime ปัจจุบัน
2. `config/game.config.json`
3. เอกสาร closeout `59`–`62`
4. ADR ใน `docs/adr/`
5. เอกสาร feature/report ล่าสุด
6. เอกสารแผนช่วงต้น `00`–`19`
7. ข้อความจากบทสนทนาเก่า

เหตุผล: เอกสารช่วงต้นมี exploratory stack ที่ไม่ได้ใช้ใน final runtime

## 3. Recommended Reading Order

1. `README.md`
2. `docs/59-project-closeout-report.md`
3. `docs/60-reusable-education-game-playbook.md`
4. `docs/15-module-architecture.md`
5. `docs/18-game-design-v2-plan.md`
6. `docs/38-answer-distractor-policy.md`
7. `docs/45-worldwide-leaderboard-anticheat.md`
8. `docs/52-ar-device-acceptance.md`
9. `docs/62-operations-maintenance-runbook.md`

อ่านเอกสารเฉพาะ feature เมื่อทำงานส่วนนั้น

## 4. Workspace

- authoritative development folder: `F:\programming\html\edugame2\คณิตศาสตร์\สูตรคูณ25`
- GitHub publish checkout: `F:\programming\html\edugame\beeedugames-publish`
- deployed runtime folder in repository: `สูตรคูณ25/`
- Apps Script source: `google-apps-script/`
- processed runtime assets: `assets/processed/`

อย่าแก้เฉพาะ publish checkout แล้วลืม authoritative source

## 5. Module Map

| Area | Owner files |
|---|---|
| App composition | `js/app.js` |
| Session rules | `js/core/GameStore.js` |
| Round generation | `RoundFactory.js`, `AnswerGenerator.js`, `RepresentationStrategy.js` |
| Phaser lifecycle | `PhaserGameBridge.js`, `LuminaraScene.js` |
| Grouping model | `EnergyPodField.js`, `CommutativeModel.js`, `BatchChargeSequencer.js` |
| Answer objects | `AnswerField.js`, `AnswerLayoutEngine.js` |
| Input selection | `ARSelectionSystem.js`, `ARController.js` |
| Feedback/actors | `FeedbackDirector.js`, `MilestoneDirector.js`, `CompanionActor.js` |
| Progress/city | `ProgressStore.js`, `RewardService.js`, `CityProgressService.js` |
| Leaderboard | `LeaderboardService.js`, `progression/leaderboard/`, repositories |
| Backend | `google-apps-script/*.gs` |
| Runtime SSOT | `config/game.config.json` |

## 6. Change Workflow

```text
1. Reproduce and capture evidence
2. Identify state owner and lifecycle owner
3. Write/update acceptance test
4. Update design/sequence/config if behavior changes
5. Implement in the smallest responsible module
6. Run unit + static audit
7. Test browser workflow from local HTTP server
8. Test replay and alternate input
9. Update report/Kanban
10. Publish runtime-only files and verify live URL
```

ห้ามแก้ symptom ด้วย CSS/coordinates ก่อนหา state owner และ root cause

## 7. Commands

```powershell
cd "F:\programming\html\edugame2\คณิตศาสตร์\สูตรคูณ25"
npm test
npm run qa:static
python -m http.server 8025 --bind 127.0.0.1
```

Live leaderboard smoke สร้างข้อมูลจริงใน Sheet:

```powershell
npm run qa:leaderboard
```

ต้องใช้เฉพาะเมื่อยอมรับว่ามี QA row และต้อง moderation ภายหลัง

## 8. Cache Version Rule

โปรเจ็กต์เป็น static ES modules ไม่มี bundler จึงใช้ query version ใน import และ `<script>`

เมื่อแก้ module:

1. bump version ของ module ที่ import มัน
2. ไล่ bump parent chain ถึง `js/app.js`
3. bump `js/app.js?v=...` ใน `index.html`
4. hard refresh ระหว่าง QA

หากไม่ทำ browser อาจใช้ module เก่าและทำให้ debug ผิดสาเหตุ

## 9. Non-Negotiable Product Rules

- ต้องมีคำตอบถูกเสมอ
- ตัวเลือกห้ามทับกันและต้องสลับตำแหน่ง
- grouping evidence มาก่อน abstract answer เมื่อ scaffold active
- pointer แสดงเฉพาะมือ/นิ้วชี้ที่ผ่าน detector
- Mouse/Touch ต้องทำงานแม้ MediaPipe ล้มเหลว
- score UI และ Hall ต้องมี semantics เดียวกัน
- server ไม่เชื่อคะแนน client
- replay ต้อง dispose scene/tween/listener/timer เก่า
- ไม่มีไฟล์ code เกิน 700 บรรทัดโดยไม่มีเหตุผล/waiver
- text/code เป็น UTF-8
- ห้ามฝัง secret ใน HTML, JS หรือ config public

## 10. Debugging Map

| Symptom | ตรวจที่แรก |
|---|---|
| ตัวเลือกไม่แสดง | phase ใน GameStore → AnswerField create/dispose → scene validity |
| เลือกครบแต่ไม่เปลี่ยนรอบ | transition lock → EventBus duplicate/missing → pending timer invalidation |
| Phaser `null.add/drawImage` | scene destroyed แต่ async callback ยังทำงาน |
| sprite ถูกตัด | processed manifest/frame bounds/pivot ไม่ใช่เดา JSON ทันที |
| วงดำรอบ object | source alpha, VFX graphics fill, overlay/debug focus layer |
| AR เปิดแต่ไม่มี pointer | handDetected → finger classifier → coordinate transform → visibility state |
| AR pointer ตรงแต่เลือกไม่ได้ | CSS/video/canvas scale + target bounds + dwell reset |
| AR mirror | flip video และ landmark เพียงชั้นเดียว |
| Hall ว่างแต่ Sheet มีข้อมูล | deployment URL/schema/moderation/board key/snapshot endpoint |
| Hall เปลี่ยน filter แล้วโหลดใหม่ | combobox ต้องใช้ `entriesByBoard` ใน memory |
| เข้าหน้า Hall ครั้งที่สองข้อมูลเก่า | `open()` ต้องล้าง snapshot และ request server ใหม่ |
| GitHub Pages 404 | branch/path/index case และ build status |
| โหลดช้า | asset size/cold cache/CDN/Apps Script cold start แยกวัดทีละชั้น |

## 11. Prompt Template สำหรับ AI Session ใหม่

```text
You are continuing the education game project at:
F:\programming\html\edugame2\คณิตศาสตร์\สูตรคูณ25

Read completely before changing code:
- README.md
- docs/59-project-closeout-report.md
- docs/60-reusable-education-game-playbook.md
- docs/61-ai-team-handoff.md
- docs/62-operations-maintenance-runbook.md
- relevant ADR and feature documents

Constraints:
- preserve equal-groups and commutative learning design
- Vue owns UI, Phaser owns world, GameStore owns session rules
- use OOP/component boundaries and explicit dispose lifecycle
- code files should remain <=700 lines
- config is SSOT; UTF-8 only
- Mouse/Touch fallback is mandatory for AR
- do not trust client scores
- use Agile Kanban loop: analyze, design, document, implement, test, report

Task:
[describe task]

Required evidence:
- root cause
- files changed
- tests and browser workflow
- remaining risks
```

## 12. Human Decisions AI Must Not Invent

- target countries and child consent model
- legal/privacy approval
- retention period and parent contact channel
- production traffic/SLO acceptance
- moderation owner and escalation policy
- art IP/license approval
- whether a major pedagogy change is acceptable

หากงานต้องใช้การตัดสินใจเหล่านี้ ให้หยุดและขอผู้รับผิดชอบ

