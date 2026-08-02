# Kanban Agile Backlog

## Columns

`Backlog` → `Ready` → `In Progress` → `Code Review` → `Playtest` → `Bug Fix` → `Done` → `Released`

จำกัด WIP ที่ `In Progress` ไม่เกิน 2 งาน เพื่อให้ feedback และการทดสอบไม่ค้างสะสม

## Epics และลำดับงาน

### E0 Product foundation

- [x] Project charter และ design documents
- [x] Story, learning goals และ gameplay loop
- [x] Technical ADR และ SSOT schema

### E1 Asset Gate A0 — ต้องรอผู้ใช้

- [ ] ผู้ใช้ส่ง Character Bible ของตัวละครใหม่
- [ ] ผู้ใช้ส่ง transparent PNG sprite sheets ชุดแรก
- [ ] ผู้ใช้ส่งฉาก background layers และ props
- [ ] ทีมตรวจ alpha, pivot, frame map และ naming

ห้ามปิด E1 ด้วย placeholder แล้วอ้างว่าเป็น art production; placeholder ใช้ได้เฉพาะการทดสอบระบบหลังได้รับอนุมัติ

### E2 Vertical slice

- [ ] Home → Mission → Result ทำงานครบหนึ่งภารกิจ
- [ ] หนึ่ง mechanic จัดกลุ่มและ feedback ถูกต้อง
- [ ] save/load และ pause/resume
- [ ] no soft-lock / no impossible mission

### E3 Learning engine

- [ ] adaptive selection
- [ ] mastery per table × multiplier
- [ ] remediation และ spaced review
- [ ] สรุปผลที่อ่านง่ายสำหรับเด็กและผู้ปกครอง

### E4 Content

- [ ] เขต 2–5
- [ ] เขต 6–10
- [ ] เขต 11–15
- [ ] เขต 16–20
- [ ] เขต 21–25

### E5 Polish and release

- [ ] motion/audio/accessibility pass
- [ ] responsive pass
- [ ] performance and asset loading pass
- [ ] GitHub Pages smoke test
- [x] milestone announcement ก่อนเปลี่ยนเขต พร้อมชื่อ/บทบาทสมาชิกและ transition

## Definition of Done

งานหนึ่งชิ้นต้องมี acceptance criteria, ทดสอบบนจอเป้าหมาย, ไม่มี console error ที่เกี่ยวข้อง, มี fallback เมื่อ asset/audio/camera ใช้ไม่ได้ และมีเอกสารหรือ config ที่อัปเดตแล้ว

## Active Sprint — Adaptive Two-Phase Learning

รายละเอียด state, sequence, acceptance criteria และสถานะรายงานอยู่ที่ `docs/24-adaptive-two-phase-sprint.md`

- [x] A2P-01 Analysis and design documentation
- [x] A2P-02 Domain phase state and adaptive policy — Done
- [x] A2P-03 Same-dot regroup animation — Done
- [x] A2P-04 Phase-aware input routing — Done
- [x] A2P-05 Neutral answer graphics — Done
- [x] A2P-06 Mascot guidance — Done
- [x] A2P-07 Automated QA and browser smoke test — Done
- [x] A2P-08 Report and document reconciliation — Done

Sprint status: `Done` (manual AR camera playtest remains a release-gate check, not an implementation blocker).

## Completed Fix Loop — Choice Discoverability

- [x] DCF-01 Analyze hidden-choice confusion and define locked-preview behavior
- [x] DCF-02 Implement visible locked choices with explicit guidance
- [x] DCF-03 Keep locked choices out of Mouse, Touch and AR targets
- [x] DCF-04 Add neutral number plate to hide the baked question-mark artwork
- [x] DCF-05 Automated tests, browser visual QA and console check
- [x] DCF-06 Documentation and report reconciliation

## Active Sprint — Tables 13–25 Representation

รายละเอียดอยู่ที่ `docs/25-tables-13-25-representation-sprint.md`

- [x] R25-01 Analysis, architecture and acceptance criteria
- [x] R25-02 RepresentationStrategy and SSOT config — Done
- [x] R25-03 RoundFactory integration and tests — Done
- [x] R25-04 Responsive 1–12 group-card layout — Done
- [x] R25-05 Place-value glyphs and weighted transformation — Done
- [x] R25-06 Table-25 hundred anchor — Done
- [x] R25-07 Automated and browser QA — Done
- [x] R25-08 Report and document reconciliation — Done

Sprint status: `Done`.
# Visual Material Polish Loop (2026-07-31)

| Card | งาน | สถานะ |
|---|---|---|
| VPL-01 | กำหนด visual hierarchy และภาษาวัสดุ | Done |
| VPL-02 | เพิ่ม glass highlight, halo และ staggered glint ให้หลอดพลังงาน | Done |
| VPL-03 | ทำหน่วยสิบเป็นคริสตัลฟ้าและหน่วยย่อยเป็นอัญมณีทอง | Done |
| VPL-04 | นำวัสดุเดียวกันไปใช้ในภาพอธิบายการสลับที่ | Done |
| VPL-05 | ตรวจ syntax, test, browser และ performance budget | Done |

## Group Visualization Revision (2026-07-31)

| Card | งาน | สถานะ |
|---|---|---|
| GVR-01 | วิเคราะห์พื้นที่ว่างและการเรียงตัวแบบเสา | Done |
| GVR-02 | สร้าง `EnergyBeadFactory` แบบ reusable component | Done |
| GVR-03 | เปลี่ยน matrix เป็น adaptive grouped-card layout | Done |
| GVR-04 | ย้ายแผงสลับที่ขึ้นและจัดสัดส่วนใหม่ | Done |
| GVR-05 | Automated test และ browser visual QA | Done |

## AR Hand Acquisition Reliability (2026-08-01)

| Card | งาน | สถานะ |
|---|---|---|
| ARH-01 | แยกสถานะไม่พบมือ/พบฝ่ามือ/พบนิ้วชี้ | Done |
| ARH-02 | ปรับ CPU profile, 15 FPS และ confidence ผ่าน config | Done |
| ARH-03 | ตรวจ video dimensions ก่อนเริ่ม inference | Done |
| ARH-04 | เพิ่ม visual guide ระบุขนาดมือในภาพ | Done |
| ARH-05 | เพิ่ม regression tests สำหรับ pointer activation | Done |

## AR Latency Optimization (2026-08-01)

| Card | งาน | สถานะ |
|---|---|---|
| ARP-01 | วิเคราะห์ inference, smoothing, CSS และ dwell latency | Done |
| ARP-02 | ย่อ inference frame เป็น 640 × 360 โดยคง preview 1280 × 720 | Done |
| ARP-03 | ใช้ GPU ก่อนและ fallback CPU | Done |
| ARP-04 | เพิ่ม adaptive pointer smoothing และลด CSS transition | Done |
| ARP-05 | แยก dwell หลอด 180 ms / คำตอบ 500 ms | Done |
| ARP-06 | Regression tests และ browser startup test | Done |

## AR GPU Recovery (2026-08-01)

| Card | งาน | สถานะ |
|---|---|---|
| ARG-01 | วิเคราะห์ WebGL framebuffer failure จาก console | Done |
| ARG-02 | บังคับ CPU เพื่อไม่พึ่ง GPU framebuffer | Done |
| ARG-03 | เปลี่ยน inference frame เป็น 512 × 512 เพื่อแก้ ROI warning | Done |
| ARG-04 | รองรับนิ้วชี้แนวนอนและมุมเข้าหากล้อง | Done |
| ARG-05 | เพิ่ม regression test สำหรับ horizontal pointing | Done |

## Dual Charge Interaction (2026-08-01)

| Card | งาน | สถานะ |
|---|---|---|
| DCI-01 | วิเคราะห์ความรำคาญจากการเลือกแท่งทีละอัน | Done |
| DCI-02 | เพิ่ม Mouse/Touch sweep ลากผ่านเพื่อชาร์จทีละกลุ่ม | Done |
| DCI-03 | เพิ่มคันโยกสายฟ้าสำหรับชาร์จแท่งที่เหลือ | Done |
| DCI-04 | ทำ sequential charge เพื่อคงภาพการนับและหลักฐานการคูณ | Done |
| DCI-05 | รองรับ AR dwell แยกสำหรับคำสั่งชาร์จครบ | Done |
| DCI-06 | เพิ่ม regression tests และ browser QA | Done |

## Energy Pod Excitement Polish (2026-08-01)

| Card | งาน | สถานะ |
|---|---|---|
| EPE-01 | เพิ่ม cyan-gold charging burst โดยไม่บดบังตัวเลข | Done |
| EPE-02 | เพิ่ม persistent breathing aura และวงแหวนพลัง | Done |
| EPE-03 | เพิ่มประกาย orbit ความเร็วต่างกันแต่ละแท่ง | Done |
| EPE-04 | fade แท่งพลังเข้าสู่ภาพสลับกลุ่มแทนการหายทันที | Done |
| EPE-05 | Automated และ browser visual QA | Done |

## Hall of Fame Integrity & Spotlight Loop (2026-08-01)

| Card | งาน | สถานะ |
|---|---|---|
| HFS-01 | วิเคราะห์ถ้วยยืด ตำแหน่งแท่น และคะแนน 1345 | Done |
| HFS-02 | เปลี่ยนคะแนนอันดับเป็นดาวที่ผู้เล่นเห็นในเกม | Done |
| HFS-03 | ไม่บันทึกเซสชันที่ไม่มีคำตอบถูก งานซ่อม หรือดาว | Done |
| HFS-04 | แยกข้อมูล leaderboard รุ่นใหม่จากคะแนนลับรุ่นเดิม | Done |
| HFS-05 | วางเหรียญผู้ชนะบนแท่นที่ฝังอยู่ในฉากโดยไม่ยืด sprite | Done |
| HFS-06 | เพิ่ม spotlight, camera flash, winner glow และ reduced-motion fallback | Done |
| HFS-07 | Automated tests และ browser end-to-end visual QA | Done |

## Score Recording Integrity Audit (2026-08-02)

| Card | งาน | สถานะ |
|---|---|---|
| SRI-01 | Trace คะแนนจาก GameStore ถึง Hall of Fame | Done |
| SRI-02 | ทำ finish และ session history ให้ idempotent | Done |
| SRI-03 | Serialize leaderboard commits | Done |
| SRI-04 | Validate และ sanitize local leaderboard rows | Done |
| SRI-05 | Regression tests สำหรับข้อมูลซ้ำ/เสียรูป/คะแนนศูนย์ | Done |
| SRI-06 | Browser E2E และ console audit | Done |

## Anti Last-Digit Guessing Loop (2026-08-02)

| Card | งาน | สถานะ |
|---|---|---|
| ADG-01 | วิเคราะห์ช่องโหว่การเดาคำตอบจากเลขหลักหน่วย | Done |
| ADG-02 | ออกแบบตัวลวงจากเลขหลักหน่วยเดียวกันและความเข้าใจผิดที่สมเหตุผล | Done |
| ADG-03 | ย้ายค่าควบคุมจำนวนตัวลวงเข้า SSOT config | Done |
| ADG-04 | ปรับ AnswerGenerator และ RoundFactory | Done |
| ADG-05 | Property test แม่ 2–25 ตัวคูณ 1–12 จำนวน 864 กรณี | Done |

## Google Sheets Leaderboard Loop (2026-08-02)

| Card | งาน | สถานะ |
|---|---|---|
| GSL-01 | Trace score pipeline และ Repository port | Done |
| GSL-02 | ออกแบบ Local-first, retry queue และ API contract | Done |
| GSL-03 | พัฒนา namespace factory และ Local/Remote/Resilient adapters | Done |
| GSL-04 | พัฒนา Apps Script validation, deduplication, locking และ Sheet schema | Done |
| GSL-05 | Automated tests และ syntax/config validation | Done |
| GSL-06 | Deploy Apps Script Web app และใส่ URL `/exec` ใน config | Waiting for deployment URL |

## Podium Anchor Layout Loop (2026-08-02)

| Card | งาน | สถานะ |
|---|---|---|
| PAL-01 | ตรวจภาพต้นฉบับ 2560 × 1440 และวัดขอบบนแท่น | Done |
| PAL-02 | กำหนด gold anchor และสูตร X/Y ของ silver/bronze ใน SSOT | Done |
| PAL-03 | แยก `PodiumLayout` เป็นโมดูลที่ทดสอบได้ | Done |
| PAL-04 | สร้าง coordinate plane 16:9 ป้องกัน crop และ anchor drift | Done |
| PAL-05 | แก้ Hall overflow ที่ตัดหัวเรื่อง | Done |
| PAL-06 | Automated tests 43/43 และ browser visual QA | Done |
