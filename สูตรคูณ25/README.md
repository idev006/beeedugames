# สูตรคูณ 25: เมืองแสงซ่อนกล

เกม AR เพื่อการศึกษาสำหรับฝึกสูตรคูณแม่ 2 ถึง 25 โดยตัวคูณไม่เกิน 12

แนวทางหลักคือให้เด็กรู้สึกว่ากำลังซ่อมเมืองแฟนตาซีด้วยพลังงานที่แบ่งเป็นกลุ่ม ๆ ไม่ใช่กำลังทำข้อสอบคณิตศาสตร์แบบตรงไปตรงมา

เล่นออนไลน์: `https://idev006.github.io/beeedugames/สูตรคูณ25/`

## สถานะโครงการ

- Public web demo / monitored beta
- automated tests ล่าสุด 55/55
- เผยแพร่บน GitHub Pages และเชื่อม Hall of Fame ออนไลน์แล้ว
- ยังไม่รับรอง Worldwide Production จนกว่า AR physical devices, backend SLO และ child-privacy/legal gates จะผ่าน
- เริ่มศึกษาหรือส่งต่องานที่ `docs/README.md` และ `docs/59-project-closeout-report.md`

## วิธีเล่น

1. เปิดผ่าน local server หรือ HTTPS
2. เลือกช่วงแม่คูณ เวลา และระดับความท้าทาย
3. อ่านภารกิจพลังงาน เช่น หลายแท่น แท่นละหลายดวง
4. เลือกแกนพลังงานที่รวมแสงได้พอดี
5. โหมด AR ใช้นิ้วชี้ค้างบนแกนพลัง 0.5 วินาทีเพื่อเลือก

## เปิดทดสอบ

จากโฟลเดอร์นี้:

```powershell
python -m http.server 8025 --bind 127.0.0.1
```

แล้วเปิด:

```text
http://127.0.0.1:8025/
```

AR/camera ต้องใช้ `localhost`, `127.0.0.1` หรือ HTTPS ห้ามเปิดจาก `file://`

## โครงสร้างสำคัญ

- `index.html` แอปหลัก
- `css/styles.css` layout และ visual polish
- `js/app.js` application composition ของ Vue/Pinia และ runtime services
- `js/core/` session rules, round generation และ learning model
- `js/game/` Phaser scenes, entities, systems และ visual objects
- `js/ar/` MediaPipe hand tracking adapter
- `js/progression/` rewards, city, persistence และ leaderboard
- `config/game.config.json` SSOT ของเกม
- `assets/processed/` asset runtime ที่ปรับขนาดแล้ว
- `tools/normalize-assets.ps1` pipeline ปรับ asset จาก AI ให้เป็น production format
- `google-apps-script/` online leaderboard และ anti-cheat backend
- `docs/` เอกสารออกแบบ, workflow, QA, operations และ lessons learned

## Asset Runtime

เกมใช้ไฟล์ใน `assets/processed` เป็นหลัก:

- backgrounds: 2560 x 1440
- character spritesheets: 3072 x 1024, 6 x 2 frames, 512 x 512 per frame
- VFX spritesheet: 3072 x 1024

## Libraries

โหลดผ่าน CDN:

- Vue 3
- Pinia
- Phaser 3
- MediaPipe Tasks Vision Hand Landmarker เมื่อเปิด AR

หาก MediaPipe หรือกล้องล้มเหลว เกมจะกลับไปเล่นด้วยเมาส์/ทัชได้ ไม่ทำให้ flow พัง

## Quality Commands

```powershell
npm test
npm run qa:static
```

`npm run qa:leaderboard` เป็น live integration smoke และจะสร้างข้อมูล QA จริงบน Google Sheet

## Knowledge Pack

- `docs/franchise/README.md` — Franchise Guidebook สำหรับสร้างเกมใหม่อย่างรวดเร็วและเป็นระบบ
- `docs/59-project-closeout-report.md` — final status และ architecture truth
- `docs/60-reusable-education-game-playbook.md` — กระบวนการ/เทคนิคสำหรับเกมถัดไป
- `docs/61-ai-team-handoff.md` — context และข้อห้ามสำหรับทีม/AI ใหม่
- `docs/62-operations-maintenance-runbook.md` — deploy, incident, monitoring และ rollback
