# Art Direction และ Asset Handoff

## ทิศทางภาพ

โลกแฟนตาซี 2.5D โทน luminous workshop: เมืองมีเขตแตกต่างกันด้วยวัสดุและแสง ฉากมี depth layers แต่ gameplay object ต้องอ่านง่าย มี silhouette ชัด และไม่กลืนกับพื้นหลัง

## หลักการ

- ตัวละครใหม่ทั้งหมด ไม่ใช้กัปตันอ่างน้อยและไม่ reuse mushroom cast เดิม
- สีของตัวละครต้องไม่เป็นตัวบอกคำตอบเพียงอย่างเดียว
- วัตถุที่ใช้คำนวณต้องมีสถานะว่าง/กำลังเติม/เต็ม/ผิดพลาดที่แยกได้
- มี idle, interact, success, mistake, celebrate และ sleep/disabled อย่างน้อยตามบทบาท
- หลีกเลี่ยงเงาดำหรือวงกลมดำที่เกิดจากพื้นหลังของ asset

## จุดส่งต่อให้ผู้ใช้สร้าง

ก่อนเริ่ม implement actor จริง ผู้ใช้ต้องจัดทำ:

### 1. Character Bible

สำหรับ ลูมิน, พิกซ์, มารุ, เซน และเงาลวง ระบุชื่อ, บทบาท, รูปร่าง, palette, สัดส่วน, สีรองเท้า/อุปกรณ์, อารมณ์, ท่าทาง, มุมมอง, ขนาดมาตรฐาน และสิ่งที่ห้ามเปลี่ยน

### 2. Transparent sprite sheets

- PNG แบบ RGBA พื้นหลังโปร่งใสจริง
- ทุก frame ใช้ grid เท่ากัน เช่น 256x256 หรือ 512x512
- ระบุ `columns`, `rows`, frame names และ pivot ที่ต้องการใน JSON
- แยก `sourceColumns/sourceRows` ออกจาก runtime columns เสมอ; ห้ามใช้จำนวน runtime frames เดาตารางต้นฉบับ
- แยกไฟล์ actor, prop และ effect เพื่อแก้ไขง่าย
- ส่ง idle และ success ก่อนเป็นชุดแรก แล้วจึงเพิ่มท่าอื่น

### 3. ฉากและวัตถุ

- background แยก layer: far, mid, playfield, foreground
- จุดวางพลังงานและเครื่องจักรต้องมี safe area สำหรับ hit test
- export ขนาด desktop และ mobile หรือ artwork ที่ crop ได้โดยไม่ตัด gameplay object

เมื่อได้รับไฟล์ ผมจะทำ asset manifest, sprite map, ตรวจ alpha/pivot/กรอบเกิน, สร้าง animation definitions และนำเข้า Phaser ให้ต่อไป
