# Hall of Fame Podium Anchor Layout

วันที่: 2026-08-02

## หลักการ

เหรียญทุกอันดับอ้างอิงพิกัดขอบบนของแท่นที่ฝังอยู่ในภาพ `hall-of-fame/background.png` ขนาด 2560 × 1440 โดยใช้พิกัดแบบร้อยละ เพื่อรักษาตำแหน่งเมื่อหน้าจอ responsive

## SSOT

ค่าพิกัดอยู่ที่ `leaderboard.presentation` ใน `config/game.config.json`

- Gold anchor: `x=50%`, `y=42.1%`
- ระยะจากทองตามแกน X: `12.5%` เท่ากันทั้งสองด้าน
- Silver: `x=50-12.5%`, `y=42.1+3.8%`
- Bronze: `x=50+12.5%`, `y=42.1+6.4%`

`PodiumLayout` รับผิดชอบคำนวณ anchor และส่ง CSS custom properties `--podium-x`, `--podium-y` ให้แต่ละ article ส่วน CSS วางขอบล่างของเหรียญเหนือ anchor และวางชื่อ/คะแนนบนหน้าของแท่น

## Responsive contract

- Coordinate plane ใช้อัตราส่วนเดียวกับภาพต้นฉบับ `16:9`
- ภาพแสดงด้วย `background-size: 100% 100%` ภายใน plane 16:9 จึงไม่มี crop และพิกัดไม่เคลื่อน
- ขนาดเหรียญใช้ `clamp()` โดยอันดับ 1 ใหญ่ที่สุด ตามด้วยอันดับ 2 และ 3
- Hall screen เริ่มจัดวางจากด้านบนและใช้ vertical scrolling เมื่อเนื้อหาสูงกว่าหน้าจอ

## Verification

- Automated tests ตรวจ gold anchor, ระยะ X สมมาตร และ Y drop ของ silver/bronze
- Browser visual QA ตรวจตำแหน่งจริงและ console errors

