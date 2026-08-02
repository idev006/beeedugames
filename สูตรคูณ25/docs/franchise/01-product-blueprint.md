# Product Blueprint — จากบทเรียนสู่เกม

## 1. Education Game Canvas

ตอบให้ครบก่อน production:

| ช่อง | คำถาม |
|---|---|
| Learner | อายุ ความรู้เดิม ภาษา อุปกรณ์ และข้อจำกัด |
| Learning objective | หลังเล่นเด็กเข้าใจ/ทำอะไรได้ |
| Evidence | action ใดพิสูจน์ความเข้าใจ |
| Misconceptions | เด็กมักคิดผิดอย่างไร |
| Representation | ภาพ/วัตถุใดทำให้แนวคิดมองเห็นได้ |
| Core verb | ผู้เล่นทำอะไรซ้ำ ๆ |
| Fantasy | ทำไม core verb จึงสำคัญในโลกเกม |
| Feedback | โลกเกมตอบสนองอย่างไรและสอนอะไร |
| Mastery | เมื่อใดลดตัวช่วย/เพิ่ม transfer |
| Failure | พลาดแล้วเรียนต่ออย่างปลอดภัยอย่างไร |
| Motivation | อะไรเปลี่ยนแปลงเมื่อเล่นต่อ |
| Assessment | เก็บหลักฐานโดยไม่เปลี่ยนเกมเป็นข้อสอบอย่างไร |

## 2. Core Verb Mapping

ใช้สมการ:

```text
Learning action + Fantasy consequence = Meaningful game action
```

ตัวอย่างที่ดี:

```text
จัดกลุ่มเท่ากัน + ชาร์จแท่นพลัง = ซ่อมเครือข่ายเมือง
```

ตัวอย่างที่อ่อน:

```text
เลือกคำตอบ A/B/C + ได้เหรียญ = แบบทดสอบใส่ฉาก
```

Validation questions:

- หากเอาตัวเลข/คำถามออก action ยังมีโครงสร้างของแนวคิดหรือไม่
- เด็กชนะด้วยความเข้าใจหรือ visual shortcut
- feedback แสดง consequence ของแนวคิดหรือแค่ “ถูก/ผิด”

## 3. Phase Design

Standard learning loop:

```text
Orient → Manipulate/Observe → Explain/Choose → Consequence → Reflect → Advance
```

ทุก phase ต้องระบุ:

- objective
- visible objects
- allowed inputs
- success/exit condition
- feedback
- timeout/cancel behavior
- state owner

## 4. Difficulty Design

Difficulty ไม่ควรเพิ่มด้วยเวลาเร็วขึ้นอย่างเดียว

ใช้หลายแกน:

- content complexity
- representation abstraction
- distractor similarity
- scaffold amount
- number of steps
- working-memory load
- transfer novelty
- optional time pressure

Difficulty ladder:

```text
Supported recognition
→ guided construction
→ independent construction
→ explanation/comparison
→ transfer in new context
```

## 5. Adaptive Scaffolding

Minimum model:

```text
if recent accuracy and evidence >= mastery threshold:
  reduce one scaffold
if misconception or repeated mistake:
  restore relevant representation
```

ห้ามลด scaffold จากคะแนนรวมอย่างเดียว ต้องอิงชนิด evidence และ misconception

## 6. Motivation System

ใช้สามชั้น:

1. Moment-to-moment: animation, sound, responsive consequence
2. Session: combo, repairs, immediate mission completion
3. Long-term: world restoration, character/team unlock, collection with meaning

Reward rules:

- reward ต้องตามหลัง learning evidence
- ไม่ให้รางวัลใหญ่กับการเดาสุ่ม
- progression ต้องมองเห็นและมี next goal
- ไม่ใช้ punishment ทำให้เด็กอับอาย
- competitive leaderboard เป็น optional; mastery/progress ต้องอยู่ได้โดยไม่มีการแข่งขัน

## 7. Story Blueprint

```text
World:
Player role:
System problem:
Why the learning action fixes it:
Guide character:
First visible goal:
Escalation:
Milestone reveal:
Ending/continuation:
```

Guide character ต้องมี function เช่น:

- orient attention
- model a strategy
- react to misconception
- celebrate consequence
- introduce new mechanic

## 8. AR Suitability Gate

ใช้ AR เมื่อทุกข้อสำคัญเป็นจริง:

- body/gesture action เพิ่มความเข้าใจหรือ engagement อย่างมีเหตุผล
- camera space ปลอดภัยและไม่ต้องเคลื่อนไหวเร็ว
- target ใหญ่และ dwell เหมาะกับ motor control
- core game เล่นโดยไม่ใช้ AR ได้
- มีอุปกรณ์และเวลาทดสอบ physical devices
- privacy notice อธิบาย camera processing ได้

หาก AR แค่แทน mouse โดยเพิ่ม latency มาก ให้คงเป็น optional mode

## 9. Content Generator Contract

Generator ต้องรับประกัน:

- valid round ทุกครั้ง
- correct answer อยู่ใน choices
- choices unique
- misconception coverage ตาม policy
- no visual/position leakage
- content bounds ตาม selected settings
- deterministic seed สำหรับ reproduce defect
- evidence schema พร้อม server verification หาก online

## 10. Vertical Slice Definition

Vertical slice ที่ดีประกอบด้วย:

- start/context สั้น
- one learning scenario
- representation interaction
- answer/decision
- correct + wrong feedback
- one progression consequence
- next-round transition
- replay/cleanup
- Mouse/Touch tests

ยังไม่ต้องมี:

- content ครบทุกบท
- AR หาก core input ยังไม่เสถียร
- leaderboard
- final art ทุกฉาก
- economy ซับซ้อน

