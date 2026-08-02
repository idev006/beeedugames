# สูตรคูณ 25: เมืองแสงซ่อนกล

เกม AR เพื่อการศึกษาสำหรับฝึกสูตรคูณแม่ 2 ถึง 25 โดยตัวคูณไม่เกิน 12

แนวทางหลักคือให้เด็กรู้สึกว่ากำลังซ่อมเมืองแฟนตาซีด้วยพลังงานที่แบ่งเป็นกลุ่ม ๆ ไม่ใช่กำลังทำข้อสอบคณิตศาสตร์แบบตรงไปตรงมา

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
- `js/app.js` Vue, Phaser, game state, AR controller, audio
- `config/game.config.json` SSOT ของเกม
- `assets/processed/` asset runtime ที่ปรับขนาดแล้ว
- `tools/normalize-assets.ps1` pipeline ปรับ asset จาก AI ให้เป็น production format
- `docs/` เอกสารออกแบบ โครงการ AR workflow และ test plan

## Asset Runtime

เกมใช้ไฟล์ใน `assets/processed` เป็นหลัก:

- backgrounds: 2560 x 1440
- character spritesheets: 3072 x 1024, 6 x 2 frames, 512 x 512 per frame
- VFX spritesheet: 3072 x 1024

## Libraries

โหลดผ่าน CDN:

- Vue 3
- Phaser 3
- MediaPipe Hands เมื่อเปิด AR

หาก MediaPipe หรือกล้องล้มเหลว เกมจะกลับไปเล่นด้วยเมาส์/ทัชได้ ไม่ทำให้ flow พัง
