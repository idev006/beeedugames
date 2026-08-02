# Quality Scorecards and Hard Gates

## 1. วิธีใช้

Scorecard ใช้ปรับคุณภาพ แต่คะแนนรวมไม่สามารถชดเชย Hard Gate ที่ไม่ผ่าน

เกณฑ์:

- 90–100: release candidate หลัง hard gates ผ่าน
- 80–89: closed beta
- 70–79: internal/classroom pilot
- <70: กลับไปแก้ design/implementation

## 2. Hard Gates

ต้องผ่านทั้งหมดสำหรับ public production:

- correct round invariant 100%
- no impossible/missing answer
- score integrity/server verification หาก public leaderboard
- no secrets in public client
- core Mouse/Touch workflow complete
- replay/resource lifecycle stable
- AR physical acceptance หากโฆษณาว่ารองรับ AR
- child privacy/legal owner sign-off หากเก็บ/เผยแพร่ข้อมูลเด็ก
- rollback และ incident owner
- accessibility/safety minimum ของกลุ่มเป้าหมาย

## 3. Learning Quality — 25 คะแนน

| Criterion | Points |
|---|---:|
| objective ชัดและเหมาะกับวัย | 4 |
| core action เป็น evidence | 5 |
| representation ถูก mental model | 4 |
| distractors/feedback จัดการ misconception | 4 |
| adaptive/remediation มีเหตุผล | 3 |
| transfer/reflection | 2 |
| SME/learner validation evidence | 3 |

คะแนน 0 ใน core-action evidence = fail แม้คะแนนรวมสูง

## 4. Game Design — 15 คะแนน

| Criterion | Points |
|---|---:|
| story/core verb สอดคล้อง | 3 |
| goal/next action ชัด | 3 |
| challenge curve | 3 |
| meaningful feedback/game feel | 3 |
| progression/reward ไม่กลบการเรียน | 3 |

## 5. Visual and UX — 15 คะแนน

| Criterion | Points |
|---|---:|
| focal hierarchy | 3 |
| readability/contrast/age suitability | 3 |
| asset consistency/material polish | 3 |
| responsive layout/no clipping | 3 |
| animation/transition มีความหมาย | 3 |

Beauty checklist:

- วัตถุสำคัญแวววาว/เด่นโดยไม่เกิด noise
- glow/pulse บอก state
- background สนับสนุน ไม่แข่งกับ UI
- ไม่มี black halo/crop/stretch
- character gesture ชี้นำ action
- choices เท่าเทียม ไม่ชี้คำตอบ

## 6. Engineering — 20 คะแนน

| Criterion | Points |
|---|---:|
| domain/owner boundaries | 3 |
| lifecycle/disposal/idempotency | 4 |
| SSOT/config/schema | 3 |
| tests/invariants/regression | 4 |
| performance/resource budget | 3 |
| maintainability/UTF-8/files ≤700 | 3 |

## 7. Input and AR — 10 คะแนน

| Criterion | Points |
|---|---:|
| Mouse/Touch baseline | 2 |
| unified intent contract | 2 |
| pointer/hit/dwell feedback | 2 |
| mirror/coordinate/device evidence | 2 |
| fallback/privacy/camera failure | 2 |

หากไม่มี AR ให้ย้าย 8 คะแนนไป Engineering/UX ตาม release plan

## 8. Safety, Data and Operations — 15 คะแนน

| Criterion | Points |
|---|---:|
| privacy/data minimization | 3 |
| security/anti-cheat | 3 |
| moderation/deletion | 2 |
| monitoring/SLO/capacity | 3 |
| release/rollback/runbook | 2 |
| documentation/handoff | 2 |

## 9. Defect Severity

| Severity | Definition | Release effect |
|---|---|---|
| Blocker | เล่น/เรียน/ข้อมูลเสียหาย | stop |
| High | core learning/input/score ผิด | no public release |
| Medium | confusion, layout, performance significant | fix before broad release |
| Low | polish ไม่กระทบ completion | backlog with owner |

## 10. Common Anti-Patterns

- quiz-with-skin: เปลี่ยนเฉพาะฉากแต่ action ยังเป็นข้อสอบ
- decorative mascot: ตัวละครไม่มี functional role
- random distractor: ไม่เชื่อม misconception
- color-answer leakage: เด็กจำสีแทนแนวคิด
- everything pulses: motion ไม่มีความหมาย
- hide-overflow fix: scrollbar หายแต่ content ถูกตัด
- coordinate whack-a-mole: แก้ sprite/AR ด้วยเลขเดาโดยไม่วัด transform
- god scene: scene class ทำทุกอย่าง
- event as state: ต้องไล่ event เพื่อรู้ความจริง
- client-trusted score: leaderboard โกงได้
- online-every-change: combobox/filter ยิง server ซ้ำ
- AR mandatory: core gameพังเมื่อ camera/model ล้มเหลว

## 11. Release Evidence Packet

ต้องมี:

- commit/version
- scorecard
- hard gate matrix
- unit/static results
- browser workflow
- device matrix
- performance samples
- privacy/security status
- known defects
- rollback target
- owner sign-off

