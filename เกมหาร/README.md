# สวนผลไม้แบ่งปัน — Vertical Slice

เกมการหารภาษาไทยสำหรับ ป.2–ป.4 ขอบเขตปัจจุบันคือฉาก `12 ÷ 3`: แบ่งแอปเปิ้ล 12 ผลให้มอนเมล็ดเมฆ 3 ตัวเท่า ๆ กันด้วย drag หรือ tap-select/tap-place

## เปิดเกม

ต้องมี Node.js สำหรับ static server และอินเทอร์เน็ตสำหรับโหลด Vue 3 CDN กับเว็บฟอนต์ (ตัวเกมและข้อมูลความก้าวหน้าไม่มี backend)

```powershell
npm run serve
```

จากนั้นเปิด `http://127.0.0.1:4173/`

## ทดสอบ

```powershell
npm run check
```

คำสั่งนี้ตรวจ UTF-8/ไฟล์ไม่เกิน 700 บรรทัด, Fast Lane config invariants, Project Bible/section contracts และรัน unit tests ด้วย Node test runner โดยไม่ต้องติดตั้ง dependency

## เอกสารหลัก

- Game Bible cover and table of contents: `docs/game-bible/README.md`
- Chapter 1 — vision/governance: `docs/game-bible/chapters/01-project-vision-and-governance.md`
- Chapter 2 — story/world/characters: `docs/game-bible/chapters/02-story-world-and-characters.md`
- Chapter 3 — learning/gameplay: `docs/game-bible/chapters/03-learning-gameplay-and-phase-design.md`
- Chapter 4 — progression/motivation/content: `docs/game-bible/chapters/04-progression-motivation-and-content.md`
- Runtime config SSOT: `config/game.config.json`
- Chapter 6 — end-to-end roadmap: `docs/game-bible/chapters/06-end-to-end-product-roadmap.md`
- Chapter 7 — Kanban: `docs/game-bible/chapters/07-agile-kanban.md`
- Chapter 8 — quality/validation: `docs/game-bible/chapters/08-quality-and-validation.md`
- Chapter 11 — visual development/asset production: `docs/game-bible/chapters/11-visual-development-and-asset-production.md`
- Asset manifest SSOT: `config/assets.manifest.json`
- Appendix A — verification evidence: `docs/game-bible/appendices/A-vertical-slice-verification.md`

## ขอบเขตที่ยังไม่ทำ

13 ÷ 3 remainder round, band อื่นแบบเต็ม, side/daily missions, AR, Hall of Fame UI, final art, Productize, Harden และ Release อยู่ใน backlog. ห้ามถือว่า vertical slice นี้พร้อม production จน human learning/privacy/release gates ผ่าน.
