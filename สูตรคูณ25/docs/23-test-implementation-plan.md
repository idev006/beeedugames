# Test Implementation Plan: Vertical Slice to Production QA

## Phase A — Domain regression

- สร้าง `package.json` แบบไม่เพิ่ม runtime dependency
- สร้าง `tests/game-store.test.mjs`
- ครอบคลุม `7 × 2`, group gating, duplicate protection, repeated addition, correct/wrong answer และ stale transition
- รันด้วย `npm test`

## Phase B — Browser smoke automation

- เพิ่ม Playwright เป็น dev dependencyเมื่อ project พร้อมจัดการ dependency
- เปิด local server แบบ isolated
- เริ่มเกมและตรวจ accessible HUD
- คลิกกลุ่มพลังทั้ง 7 กลุ่ม
- ตรวจว่า answer core ถูกเปิดหลัง `group:complete`
- เลือก 14 และตรวจ score/combo/repaired
- ทำ reload/replay และ assert จำนวน canvas เท่ากับ 1

## Phase C — Component contract tests

- `AnswerGenerator`: จำนวนตัวเลือก, คำตอบถูกต้อง, ไม่มีค่าซ้ำ
- `AnswerLayoutEngine`: ไม่มี overlap และอยู่ใน safe play area
- `ARSelectionSystem`: dwell, reset เมื่อออก target, park pointer และไม่ submit ซ้ำ
- `DisposableBag`: listener, timer, tween และ Phaser object ถูกทำลาย

## Phase D — Educational acceptance

- สังเกตว่าเด็กอธิบาย `7 × 2` จากภาพได้หรือไม่
- ตรวจความเชื่อมโยงระหว่างกลุ่มพลังกับการบวกซ้ำ
- ตรวจ feedback เมื่อผิดโดยไม่ให้เด็กหยุดเล่น
- เก็บ evidence ก่อนขยายไป `25 × 12`

## Quality gates

1. Static gate: syntax, JSON, UTF-8, line count
2. Domain gate: `npm test`
3. Browser gate: local smoke test, no console error, one canvas after replay
4. Learning gate: child playtest evidence
5. Release gate: AR fallback, performance และ GitHub Pages smoke test
