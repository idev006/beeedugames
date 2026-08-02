# Improvement Plan: Learning Workflow และ Session Reliability

## เป้าหมายของรอบนี้

ปรับ vertical slice ให้สอดคล้องกับเป้าหมายการเรียนรู้และ workflow ที่มีอยู่ โดยยังรักษาโครงสร้าง composition เดิมของเกมไว้ รอบนี้เน้นสิ่งที่ส่งผลต่อความถูกต้องของ session และคุณค่าการเรียนรู้โดยตรง:

1. ทำให้ lifecycle ของ session, timeout และ result มี owner ชัดเจน
2. เพิ่ม learning telemetry ราย `table × multiplier` เพื่อเป็นฐานของ mastery/adaptive practice
3. ปรับ feedback ผิดจากการเฉลยทันทีเป็นคำใบ้แบบ scaffold
4. ทำให้เอกสารสถาปัตยกรรมตรงกับ runtime จริง ซึ่งปัจจุบันใช้ `GameStore + Vue reactive` ไม่ได้ใช้ Pinia

## ขอบเขตที่ไม่ทำในรอบนี้

- ยังไม่เพิ่ม Free Workshop หรือ Signal Hunt เป็นหน้าจอใหม่
- ยังไม่เปลี่ยน answer-selection mechanic ให้เป็นระบบลาก/หมุน/เชื่อมเต็มรูปแบบ
- ยังไม่ย้ายไปใช้ Pinia เพราะไม่จำเป็นต่อ vertical slice ปัจจุบัน
- ยังไม่ทำ persistent save repository เต็มรูปแบบ แต่จะเก็บ telemetry ไว้ใน runtime เพื่อให้ระบบต่อยอดได้

## แผนดำเนินการ

### Phase A — Session contract

- เพิ่ม `sessionState` และ `finishReason` ใน `GameStore`
- ป้องกัน `submit()` ระหว่าง feedback, milestone และหลังจบเกม
- ให้ `start()` ยกเลิก transition เดิมและสร้าง session generation ใหม่
- ให้ result แยกเหตุผล `time`, `lives`, `exit`

### Phase B — Learning telemetry

- เก็บสถิติรายคู่คูณด้วย key รูปแบบ `table×multiplier`
- เก็บ attempts, correct, accuracy, total response time และ lastSeen
- ส่งข้อมูล summary ใน `game:finish`
- ยังไม่ใช้ telemetry เปลี่ยนความยากอัตโนมัติจนกว่าจะมี acceptance test รองรับ

### Phase C — Feedback scaffold

- แสดงคำใบ้ว่า “ขาด/เกิน” ก่อน
- แสดงกลุ่มพลังงานและแนวคิด `จำนวนแท่น × แสงต่อแท่น`
- เฉลยคำตอบเฉพาะเมื่อเปิด hint หรือผิดซ้ำในรอบเดียวกัน
- ให้ feedback ใช้ภาษาที่ไม่ตีตราผู้เล่น

### Phase D — Cleanup และ documentation

- เพิ่ม owner สำหรับ app-level timeout และ audio note timeout
- ยกเลิก timeout ทั้งหมดเมื่อจบ session หรือ unmount
- ปรับ ADR/module architecture ให้ตรงกับ runtime
- อัปเดต cache version เป็น `v=20260731-36`

## Acceptance criteria

- เล่นซ้ำระหว่าง feedback/milestone แล้วไม่มี callback จาก session เก่ามาสร้างรอบหรือเล่นเสียง
- `game:finish` มี `reason` และ learning summary
- คู่คูณที่ตอบถูก/ผิดถูกบันทึกแยกกันโดยไม่เพิ่ม mastery เมื่อผิด
- feedback ผิดครั้งแรกไม่เฉลยคำตอบทันที
- Mouse, Touch และ AR ยังคงส่งคำตอบผ่าน `GameStore.submit()` เส้นทางเดียว
- ไม่มีไฟล์ JS/CSS/HTML เกิน 700 บรรทัด
- syntax, JSON parse และ UTF-8 ผ่าน

## ลำดับการส่งมอบ

```text
เอกสารแผน
  -> GameStore contract + telemetry
  -> app/audio cleanup
  -> scaffold feedback
  -> เอกสาร architecture/workflow
  -> static checks
  -> browser smoke test เมื่อ local server พร้อม
```

