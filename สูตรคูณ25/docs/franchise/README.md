# Bee Edu Game Franchise Guidebook

เวอร์ชัน 1.0 — Education Game Production Operating System

## 1. จุดประสงค์

Guidebook นี้เปลี่ยนบทเรียนจากโครงการ “เมืองแสงซ่อนกล” ให้เป็นระบบผลิตเกมการศึกษาที่ทำซ้ำได้ เป้าหมายคือให้ทีมงานหรือ AI ที่ไม่เคยอยู่ในโครงการเดิมสามารถ:

- สร้าง vertical slice ที่สอนได้จริงอย่างรวดเร็ว
- รักษาคุณภาพด้าน learning design, game feel, visual polish และ software engineering
- ใช้ asset/interaction contracts ที่ชัดเจน ลดการแก้ crop, layout, lifecycle และ AR ซ้ำ
- รู้ว่าอะไรตัดสินใจเองได้ อะไรต้องให้เจ้าของผลิตภัณฑ์/ผู้เชี่ยวชาญอนุมัติ
- วัดความพร้อมด้วย scorecard และ hard release gates ไม่ใช้ความรู้สึก
- ส่งต่องานระหว่างคนกับ AI โดยบริบทไม่สูญหาย

Guidebook ไม่ได้บังคับให้ทุกเกมหน้าตาเหมือนกัน แต่กำหนด “ระบบคุณภาพ” ที่เหมือนกัน

## 2. Franchise Contract

### 2.1 สิ่งที่ต้องคงที่

- learning objective มาก่อน theme และเทคโนโลยี
- core action ต้องเป็นหลักฐานของความเข้าใจ ไม่ใช่เพียงการเลือกคำตอบ
- story ต้องอธิบายว่าทำไม action ทางการเรียนจึงเกิดในโลกเกม
- Mouse/Touch เป็น baseline; AR เป็น enhancement
- config เป็น SSOT และ domain rules มี owner เดียว
- Vue/UI, game world และ domain state แยก ownership
- object ที่สร้าง resource ต้องมี lifecycle/dispose
- distractor มาจาก misconception และห้ามใช้ visual cue ชี้คำตอบ
- score ที่ผู้เล่นเห็นต้องอธิบายและตรวจสอบได้
- automated tests, browser workflow และ release gates เป็น Definition of Done
- ข้อมูลเด็ก, online score และ camera ต้องมี privacy/security boundary

### 2.2 สิ่งที่เปลี่ยนได้

- วิชา เนื้อหา อายุ และ learning standard
- โลก เรื่องราว ตัวละคร ฉาก และ visual language
- learning representation เช่น กลุ่ม, timeline, sentence blocks, ecosystem
- progression เช่น ซ่อมเมือง, สร้างพิพิธภัณฑ์, สำรวจอวกาศ
- input enhancement เช่น AR hand, voice, motion
- reward theme และ economy โดยไม่เปลี่ยน score semantics แบบลับ

## 3. เริ่มเกมใหม่ใน 30 นาที

1. Copy `templates/game-brief-template.md`
2. เขียน learning objective หนึ่งประโยค
3. ระบุ observable action ที่พิสูจน์ความเข้าใจ
4. ระบุ misconception 3–5 ข้อ
5. เลือก fantasy verb ที่มีโครงสร้างเดียวกับ learning action
6. กำหนดหนึ่ง vertical slice เท่านั้น
7. เลือก input baseline: Mouse + Touch
8. ตัดสินใจ AR ด้วย AR suitability gate
9. สร้าง Kanban card จาก `templates/kanban-feature-loop-template.md`
10. ส่ง asset request ด้วย `templates/asset-production-request-template.md`

ห้ามเริ่มเขียนเกมทั้งระบบก่อนข้อ 1–8 ชัดเจน

## 4. Golden Path

```mermaid
flowchart LR
  A["Discover: learning evidence"] --> B["Frame: story + core verb"]
  B --> C["Design: phase wireflow"]
  C --> D["Prototype: one vertical slice"]
  D --> E["Validate: child comprehension"]
  E --> F["Productize: content + progression"]
  F --> G["Harden: QA, privacy, operations"]
  G --> H["Release: monitored rollout"]
```

### Phase 0 — Discover

Deliverables:

- target learner and prior knowledge
- one learning objective
- observable evidence
- misconception map
- success criteria

Exit gate: ผู้เชี่ยวชาญเนื้อหายืนยันว่าการกระทำในเกมเป็นหลักฐานการเรียนรู้

### Phase 1 — Frame

Deliverables:

- one-sentence fantasy
- player role, world problem, stakes
- core verb mapping
- motivation loop
- visual moodboard/character role

Exit gate: อธิบายเกมให้เด็กเข้าใจได้ภายใน 20 วินาทีโดยไม่ใช้คำว่า “ทำแบบฝึกหัด”

### Phase 2 — Design

Deliverables:

- phase wireflow
- state machine
- input contract
- feedback timing
- adaptive/remediation rule
- SSOT config draft

Exit gate: ทุก screen/phase มีคำถามหลักหนึ่งข้อและ state transition อธิบายได้

### Phase 3 — Vertical Slice

Deliverables:

- one scenario from start to feedback
- Mouse/Touch support
- placeholder art allowed
- unit tests for domain rules
- browser smoke

Exit gate: ผู้เล่นเรียนรู้ได้แม้ยังไม่มี AR, progression หรือ leaderboard

### Phase 4 — Validate

Deliverables:

- observation protocol
- child/teacher feedback
- error patterns
- revised representation/feedback

Exit gate: เด็กเข้าใจ action และเหตุผล ไม่ใช่เดาจากสี/ตำแหน่ง

### Phase 5 — Productize

Deliverables:

- content range and generator
- difficulty/adaptive rules
- story progression and rewards
- production assets
- settings/accessibility

Exit gate: content ทุกค่าผ่าน bounds/invariant tests และไม่มี impossible round

### Phase 6 — Harden

Deliverables:

- replay/resource lifecycle tests
- responsive and device matrix
- AR physical acceptance หากใช้
- performance budget
- anti-cheat/privacy/moderation หาก online
- operations/rollback

Exit gate: ผ่าน hard gates ใน `03-quality-scorecards.md`

### Phase 7 — Release

Deliverables:

- staged rollout
- analytics/feedback channel ที่เหมาะกับเด็ก
- incident owner
- release record
- lessons learned

Exit gate: owner ลงนาม Go/No-Go จากหลักฐาน

## 5. Time-box Model

| เป้าหมาย | เวลาที่ควรใช้ | สิ่งที่ต้องได้ |
|---|---:|---|
| Concept sprint | 0.5–1 วัน | brief + evidence + story verb |
| Design sprint | 1–2 วัน | wireflow + state + architecture |
| Vertical slice | 2–5 วัน | one playable learning loop |
| Child validation | 1–3 sessions | evidence และ revisions |
| Productization | 1–3 สัปดาห์ | content/progression/assets |
| Hardening | 3–7 วัน | QA, devices, security, operations |

เวลาเป็น baseline ไม่ใช่สัญญา หาก learning objective ยังไม่ชัด ห้ามชดเชยด้วยการเร่ง coding

## 6. Fast Lane vs Full Lane

### Fast Lane — classroom/local game

- Mouse/Touch
- local progress
- no public leaderboard
- no personal data
- static hosting
- simplified operations

### Full Lane — worldwide/AR/online

- Fast Lane ทุกข้อ
- physical AR matrix
- server score validation
- moderation/deletion
- child privacy/legal review
- SLO/capacity/monitoring
- staged rollout/rollback

อย่าเลือก Full Lane เพราะ “ดูว้าว” หาก learning value ไม่ต้องใช้ AR/online

## 7. Product Recipe Matrix

| Subject | Learning action | Fantasy verb | Representation |
|---|---|---|---|
| Multiplication | compose equal groups | charge energy stations | clusters/arrays/tens |
| Fractions | partition/compare wholes | brew balanced potions | bars/circles/number line |
| Thai consonant classes | classify by rule | rescue/categorize spirits | visual categories + sound |
| Spelling | construct word patterns | repair magical signals | draggable grapheme blocks |
| Science systems | predict cause/effect | stabilize habitat | interactive system diagram |
| Geography | locate/relate regions | navigate expedition | map layers/routes |

Recipe เป็นจุดเริ่ม ไม่ใช่ข้อสรุป ผู้เชี่ยวชาญเนื้อหาต้องตรวจ mental model

## 8. Standard Repository Shape

```text
game/
  index.html
  README.md
  config/
    game.config.json
  css/
  js/
    core/
    game/entities/
    game/systems/
    game/scenes/
    input/
    progression/
    repositories/
  assets/
    source/
    processed/
  tests/
  tools/
  docs/
    adr/
    franchise/
```

Production publish ใช้เฉพาะ runtime และ processed assets

## 9. Guidebook Modules

- `01-product-blueprint.md` — แปลงเนื้อหาเป็นเกม
- `02-production-operating-system.md` — architecture, process และ pipeline
- `03-quality-scorecards.md` — quality bar และ release gates
- `04-ai-execution-protocol.md` — วิธีให้ AI ทำงานเร็วโดยไม่เสียคุณภาพ
- `templates/` — แบบฟอร์มพร้อม copy

## 10. Success Definition

Franchise Guidebook ประสบความสำเร็จเมื่อทีมใหม่สามารถ:

- สร้าง brief และ vertical-slice plan โดยไม่ต้องถามเจ้าของเดิมทุกขั้น
- อธิบาย learning evidence และ misconception ได้
- ส่ง asset prompt ที่มี dimensions/grid/pivot ครบ
- ใช้ module ownership หา root cause แทนแก้มั่ว
- ผ่าน scorecard และ hard gates ด้วยหลักฐาน
- ส่งต่อ AI session ใหม่ได้ในหนึ่ง context packet
- สร้างเกมใหม่ที่มีเอกลักษณ์โดยยังรักษาคุณภาพร่วมกัน

