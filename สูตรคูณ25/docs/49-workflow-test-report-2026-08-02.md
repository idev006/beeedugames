# Full Workflow Test Report

โครงการ: เมืองแสงซ่อนกล — เกม AR สูตรคูณ 2–25  
วันที่ทดสอบ: 2026-08-02  
ผลรวม: **Conditional Pass**

## Executive summary

Core learning workflow, Mouse gameplay, score calculation, replay lifecycle, signed anti-cheat protocol, Google Sheet write/readback และ Hall of Fame data flow ทำงานครบวงจร ไม่มี Blocker หรือ High defect

ยังไม่แนะนำให้ประกาศว่า AR ผ่าน acceptance สมบูรณ์ เพราะรอบนี้ยืนยันได้ว่าเปิดกล้อง/โหลด MediaPipe/แสดงสถานะ no-hand ถูกต้อง และ pointer logic ผ่าน automated tests แต่ไม่มีมือจริงอยู่ในภาพเพื่อพิสูจน์ finger dwell selection ตั้งแต่ต้นจนเลือกคำตอบสำเร็จ

## Environment

- App: `http://127.0.0.1:8025/`
- Backend: Google Apps Script Web App, schema version 2
- Storage: Google Sheet leaderboard
- Browser: Codex in-app Chromium browser
- Viewports: default 907×698, desktop 1366×768, mobile 390×844
- Input: Mouse automation; AR camera startup without a visible hand

## Evidence summary

| ชุดทดสอบ | ผล |
|---|---|
| Node unit/integration/regression | 51 passed, 0 failed |
| Static/UTF-8/config/assets | 124 text files valid; 38 asset references found; one module-size failure |
| Live API security smoke | 6/6 checks passed |
| Browser Mouse E2E | Passed |
| Hall of Fame data workflow | Passed with visual defects |
| AR startup | Passed |
| AR real-hand dwell selection | Not executed — no hand visible to camera |

## Workflow result matrix

| ID | ผล | หลักฐาน |
|---|---|---|
| WF-01 โหลดหน้าเริ่มต้น | Pass | Title, player name, Start, AR, Settings และ Hall controls แสดงครบ; no runtime error |
| WF-02 ตั้งชื่อ/เวลา/แม่คูณ | Pass | ตั้ง `QA Browser`, challenge, 2–2 และ 600 วินาที; HUD แสดงค่าตรงกัน |
| WF-03 signed session | Pass | Server ออก ticket 306 ตัวอักษร, schema 2 |
| WF-04 Mouse gameplay | Pass | ปุ่มชาร์จทุกแท่งเปลี่ยน phase จาก grouping เป็น answering |
| WF-05 ตอบผิด | Pass | หัวใจ 5 → 4, score 0, combo 0 |
| WF-06 ตอบถูก | Pass | เลือก 16 สำหรับ 2×8; score 0 → 3, repaired 0 → 1, combo 1 และสร้างรอบใหม่ครั้งเดียว |
| WF-07 AR pointer/dwell | Partial | Startup สำเร็จและ no-hand ไม่แสดง pointer; automated hand tests ผ่าน แต่ยังไม่ได้ใช้มือจริงเลือก target |
| WF-08 จบเซสชัน | Pass | Exit สร้าง result ครั้งเดียว: 3 ดาว, repaired 1, accuracy 50% |
| WF-09 score → Sheet | Pass | `QA Browser`, 3 ดาว, 50% ปรากฏใน Hall ของ board 600s/t2-2 |
| WF-10 คะแนนปลอม | Pass | score 6 ที่ proof คำนวณได้ 7 ถูกปฏิเสธ `SCORE_PROOF_MISMATCH` |
| WF-11 session ซ้ำ | Pass | ส่ง session เดิมซ้ำแล้ว readback มีเพียง 1 แถว |
| WF-12 Hall of Fame | Pass with defect | ข้อมูลเรียงอันดับและ board isolation ถูกต้อง; layout ชื่อบนโพเดียมมีปัญหา |
| WF-13 online failure fallback | Pass (automated) | Resilient repository เก็บ local และ queue เมื่อ online sync ล้มเหลว |
| WF-14 Play Again | Pass | กลับเข้า play ด้วย 0 ดาว, 5 หัวใจ, 600 วินาที และ round ใหม่ |
| WF-15 Responsive/scroll | Partial | 1366×768 และ 390×844 ไม่มี document overflow; default viewport พบ overflow แนวนอน 2px และ Hall labels ซ้อน |

สรุป: Pass 12, Pass with defect 1, Partial 2

## Live security smoke result

Test identity:

- display name ที่ส่ง: `QA51267754` — server เปลี่ยนเป็นชื่อ default เพราะเลข 8 หลักตรง privacy filter ตามที่ออกแบบ
- session: `qa-workflow-1785651267754`
- board: `challenge:30s:t2-2:adventure`

ผล:

- health: pass
- signed ticket: pass
- forged score rejection: pass
- valid score acceptance: pass, 7 ดาว
- duplicate idempotency: pass
- readback exactly once: pass

Google Apps Script top-read latency 3 ตัวอย่าง: 2,846 ms, 2,352 ms, 2,225 ms

## Defect log

### QA-DEF-001 — CSS module exceeds maintenance limit

- Severity: Medium
- Evidence: `css/styles.css` มี 1,039 บรรทัด เกิน SSOT project rule ที่กำหนดไม่เกิน 700
- Impact: เพิ่มความเสี่ยง regression และทำให้ component ownership ไม่ชัด
- Recommendation: แยกเป็น `base.css`, `start.css`, `play.css`, `hall.css`, `responsive.css` โดยคง import order เป็น SSOT

### QA-DEF-002 — Hall podium labels overlap

- Severity: Medium
- Evidence: ที่ viewport 907×698 ชื่ออันดับ 1 และ 2 ซ้อนกันบริเวณขอบบันได แม้เหรียญวางตรงแท่น
- Impact: อ่านชื่อผู้ชนะยากและลดความทรงเกียรติของ Hall of Fame
- Recommendation: คำนวณ label anchors แยกจาก medal anchors, จำกัดความกว้างตาม podium และเพิ่ม collision spacing

### QA-DEF-003 — Hall navigation has no visible network-loading feedback

- Severity: Medium
- Evidence: หลังคลิก Hall หน้าเดิมค้างประมาณ 2–5 วินาทีระหว่างรอ leaderboard ก่อนเปลี่ยน screen; API read วัดได้ 2.2–2.8 วินาที
- Impact: ผู้เล่นอาจคิดว่าปุ่มไม่ทำงานและกดซ้ำ
- Recommendation: เปลี่ยน screen เป็น Hall shell ทันที แล้วโหลดรายการแบบ async พร้อม skeleton/status และ disable repeated action

### QA-DEF-004 — Minor horizontal overflow at default viewport

- Severity: Low
- Evidence: body/app shell มี `scrollWidth 894` ต่อ `clientWidth 892`; เกิด horizontal scrollbar 2px ใน default viewport
- Impact: visual polish และการเลื่อนผิดทิศทางบน touchpad
- Recommendation: ตรวจ border/width ของ `.app-shell` และใช้ `box-sizing: border-box`; ห้ามซ่อนด้วย clip จน content หาย

## AR observations

- Camera/MediaPipe startup สำเร็จและ UI เปลี่ยนจาก `เปิด AR` เป็น `ปิด AR`
- เมื่อไม่พบมือ ระบบแสดงคำแนะนำและไม่แสดง active pointer ซึ่งตรง design
- Console มี MediaPipe/WASM diagnostic warnings ได้แก่ OpenGL checking disabled, feedback tensor disabled และ NORM_RECT projection warning แต่ไม่ทำให้ startup ล้มเหลว
- Automated tests ยืนยัน no-hand, palm rejection, vertical index และ horizontal index logic
- Manual acceptance ที่ยังต้องทำ: วางมือจริง → pointer ปรากฏเฉพาะนิ้วชี้ → drag-charge → dwell 0.5 วินาทีบนคำตอบ → score เปลี่ยนครั้งเดียว

## Release recommendation

**Conditional Pass** สำหรับ development/demo และการทดสอบกับผู้ใช้กลุ่มเล็ก เนื่องจาก core workflow และ anti-cheat ผ่านครบ

ก่อน worldwide production ควร:

1. ทำ AR real-hand acceptance บนอุปกรณ์จริงอย่างน้อย Windows desktop, Android tablet และ Android phone
2. แก้ QA-DEF-002 และ QA-DEF-003 ก่อน เพราะกระทบความเข้าใจและความเชื่อมั่นของผู้เล่น
3. แยก CSS ตาม QA-DEF-001 ก่อนเพิ่ม feature รอบถัดไป
4. ทำ load/quota test แยกต่างหากก่อนเปิด traffic จำนวนมาก

## Reproducible commands

```powershell
npm test
npm run qa:static
npm run qa:leaderboard
```

หมายเหตุ: `qa:leaderboard` เป็น live smoke test และจะสร้างแถวทดสอบหนึ่ง session ที่ระบุชัดใน Google Sheet
