# Project Plan V2: เมืองแสงซ่อนกล — Learner-first Document-Driven Delivery

## 1. Project outcome

สร้างเกมผจญภัยการคูณสำหรับเด็กประถมที่ทำให้เด็กเข้าใจว่า:

```text
การคูณ = กลุ่มที่เท่ากัน + การบวกซ้ำ + การจัดรูปแบบใหม่
```

เกมต้องทำให้เด็กสร้างและตรวจสอบความหมายของคำตอบได้ ไม่ใช่เพียงจำผลคูณจากตัวเลือก

## 2. Baseline ที่นำกลับมาใช้

- Vue 3 + Phaser 3 + ES Modules
- `GameStore` เป็น runtime SSOT
- `LuminaraScene` เป็น composition root
- input convergence: Mouse/Touch/AR → `GameStore.submit()`
- processed asset pipeline และ asset manifest
- เมือง ตัวละคร milestone และระบบเสียงที่มีอยู่
- lifecycle cleanup และ session generation ที่พัฒนาไว้แล้ว

## 3. สิ่งที่ต้องออกแบบใหม่

- core mechanic จัดกลุ่ม/เติมพลัง
- repeated-addition presentation
- array rotation และ commutative discovery
- large-number compression สำหรับ `25 × 12`
- scaffold feedback ที่ย้อนกลับไปยังภาพกลุ่ม
- mastery evidence ที่แยกจาก accuracy และ speed
- visual hierarchy ของฉากและ gameplay objects

## 4. Delivery phases

### Phase 0 — Documentation baseline

Deliverables:

- `docs/18-game-design-v2-plan.md`
- `docs/19-project-plan-v2.md`
- wireflow ภารกิจ `7 × 2`
- interaction contract ของกลุ่มพลังงาน
- acceptance criteria และ test cases

Gate: ทีมสามารถอธิบาย mechanic เดียวกันด้วยภาษาเดียวกัน ภาพเดียวกัน และ state เดียวกัน

### Phase 1 — `7 × 2` learning vertical slice

Deliverables:

- data-driven mission หนึ่งภารกิจ
- Energy Pod interaction ที่เด็กจัดกลุ่มได้
- repeated-addition animation
- scaffold feedback ขาด/เกิน
- answer core เป็น verification step
- Mouse/Touch support

Gate: เด็กสามารถตอบได้ว่ามีกี่กลุ่ม กลุ่มละเท่าไร และผลรวมเกิดขึ้นอย่างไร

### Phase 2 — Representation expansion

Deliverables:

- array view
- rotate/rearrange interaction
- discovery ของ `7 × 2` และ `2 × 7`
- hint และ accessibility states
- AR pointer mapping เข้ากับ group targets

Gate: เด็กเห็นผลรวมเท่าเดิมหลังจัด array ใหม่และอธิบายความต่างของจำนวนกลุ่มได้

### Phase 3 — Large-number design

Deliverables:

- `25 × 12` mission
- 5 × 5 station overview
- `12 = 10 + 2` decomposition visual
- batch routing และ return-to-meaning explanation
- object/particle performance budget

Gate: เด็กเข้าใจ 25 กลุ่ม กลุ่มละ 12 แม้เกมไม่สร้างวัตถุ 300 ชิ้น

### Phase 4 — Learning progression

Deliverables:

- mission content แม่ 2–25
- mastery evidence per table × multiplier
- review queue จากข้อผิดพลาด
- Story Mission, Free Workshop, Mastery Repair
- teacher/parent result summary ที่อ่านง่าย

Gate: content ใหม่เพิ่มผ่าน JSON/config ได้โดยไม่คัดลอก scene logic

### Phase 5 — Production hardening

Deliverables:

- responsive/accessibility pass
- AR fallback and performance pass
- asset visual QA
- browser/GitHub Pages smoke test
- regression suite และ release checklist

Gate: ไม่มี console error, stale session, impossible mission หรือ visual obstruction ที่เกี่ยวข้อง

## 5. Workstream ownership

| Workstream | Owner module/document | Output |
|---|---|---|
| Learning rules | `GameStore`, learning design | state, evidence, feedback contract |
| Mission data | JSON/config schema | table, multiplier, representation, scaffold |
| World rendering | `LuminaraScene` + systems | group, array, feedback visuals |
| Input | `AnswerField`, `ARSelectionSystem` | unified intent |
| Story/reward | companion/milestone systems | meaningful progression |
| Art | art direction + processed assets | readable, consistent, performant visuals |
| QA | test plan + playtest protocol | evidence of learning and reliability |

## 6. Risks and controls

| Risk | Control |
|---|---|
| เกมกลับไปเป็น quiz | interaction ต้องสร้าง/แก้กลุ่มก่อน verification |
| ภาพสวยแต่รก | visual playtest และ safe play area gate |
| โจทย์ใหญ่ทำให้เด็กนับทีละจุด | batch/array/decomposition representation |
| AR ทำให้ input ซับซ้อน | Mouse/Touch first, AR optional, shared submit path |
| แก้ feature แล้วกระทบระบบอื่น | narrow contracts, data-driven content, integration tests |
| animation/asset ทำให้ช้า | atlas, object budget, inference budget, profiling |
| เด็กตอบถูกแต่ไม่เข้าใจ | mastery evidence ต้องมี construction/explanation/check |

## 7. Definition of Ready

ก่อนเริ่มแต่ละ task ต้องมี:

- learning objective
- player action
- visual representation
- state/event contract
- config/schema impact
- acceptance criteria
- test and playtest method
- performance and cleanup impact

## 8. Definition of Done

งานจะเสร็จเมื่อ:

- เอกสารและโค้ดสอดคล้องกัน
- ผ่าน static checks และ relevant runtime test
- ผ่าน lifecycle cleanup review
- ผ่าน visual/readability review
- มีหลักฐานว่าเด็กเข้าใจ action หรือ representation ที่เพิ่ม
- ไม่มี regression ของ Mouse/Touch/AR ที่เกี่ยวข้อง
- อัปเดต changelog, cache version และ workflow document แล้ว

## 9. Immediate next task

ยังไม่ implement Phase 1 ทันที ให้จัดทำ wireflow และ interaction contract ของ `7 × 2` ก่อน เพราะเป็น artifact ที่ใช้เชื่อม learning design, art design, Phaser systems และ test plan เข้าด้วยกัน

