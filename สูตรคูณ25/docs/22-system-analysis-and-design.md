# System Analysis and Design: Phase 1 Testability

## 1. เป้าหมาย

ปิดช่องว่างระหว่างเอกสารการทดสอบกับ repository จริง เพื่อให้ vertical slice `7 × 2` ตรวจสอบซ้ำได้ด้วยคำสั่งเดียว และให้กฎการเรียนรู้ถูกทดสอบโดยไม่ต้องพึ่ง Phaser หรือกล้อง AR

## 2. ผลการวิเคราะห์

### จุดแข็ง

- `GameStore` เป็นเจ้าของ session, score, lives, progression และ round lifecycle
- `RoundFactory` สร้างข้อมูล round แยกจาก renderer
- `EnergyPodField` และ `AnswerField` ส่ง intent ผ่าน callback เข้าสู่ domain
- `EventBus` ตรวจ event contract ได้โดยไม่ผูกกับ Vue
- config JSON เป็น SSOT ของกติกาและค่าปรับแต่ง

### ช่องว่าง

- ไม่มี `package.json` และไม่มีคำสั่ง test ที่รันซ้ำได้
- domain assertion เดิมเป็นการทดสอบชั่วคราว ไม่ได้เก็บเป็น artifact
- ยังไม่มี regression test สำหรับ stale transition และการตอบก่อนสร้างกลุ่มครบ
- browser smoke test ยังเป็น manual evidence
- AR และ visual usability ยังต้องใช้อุปกรณ์/ผู้เรียนจริง

## 3. ขอบเขต phase นี้

### In scope

- Node built-in test runner เพื่อลด dependency และคง static deployment
- test fixture ของ config และ Phaser surface ขั้นต่ำสำหรับ domain tests
- tests สำหรับ round contract, group lifecycle, correct/wrong answer และ stale transition
- test artifact และ npm script ที่รันซ้ำได้

### Out of scope

- ไม่ย้ายเกมไป bundler
- ไม่ mock MediaPipe ใน phase นี้
- ไม่ถือว่า unit tests แทน child playtest หรือ AR device test
- ไม่ขยายโจทย์จาก `7 × 2` ไปแม่ 2–25 ใน phase เดียวกัน

## 4. Testable architecture

```text
config JSON
    ↓
GameStore ← RoundFactory ← AnswerGenerator
    ↓ events / public state
Phaser systems, Vue HUD, telemetry adapters
```

Test ตรวจผลลัพธ์ผ่าน public methods และ events ไม่เข้าถึง private renderer object โดยตรง ส่วน timer ตรวจผ่าน session state และการยกเลิก transition เมื่อ `finish()` ทำงาน

## 5. Definition of Done

- `npm test` ผ่านทุก test
- ทดสอบก่อน/หลัง group complete
- ทดสอบ duplicate group ไม่เพิ่ม progress
- ทดสอบ correct และ wrong answer
- ทดสอบ stale transition หลัง finish
- ไม่เพิ่ม global state ใน runtime production
- เอกสารและ test artifact ใช้ UTF-8
