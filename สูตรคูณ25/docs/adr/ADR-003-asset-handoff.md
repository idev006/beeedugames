# ADR-003: เจ้าของโครงการสร้าง Character Bible และ Transparent PNG

## สถานะ

Accepted

## การตัดสินใจ

ผู้ใช้สร้างและอนุมัติ Character Bible, character art, sprite sheets และ background art แบบโปร่งใส/แยก layer ส่วนผู้พัฒนานำเข้า ตรวจคุณภาพ ทำ sprite map และ implement runtime

## เหตุผล

ความสม่ำเสมอของตัวละครและคุณภาพไฟล์ภาพเป็นส่วนสำคัญของแบรนด์เกม และผู้ใช้มี workflow สร้างภาพกับ AI ที่ต้องการควบคุมเอง

## Definition of Ready สำหรับการส่ง asset

- มีชื่อไฟล์และ manifest
- PNG เป็น RGBA จริง ไม่มี matte สีดำ
- มีขนาด frame และ grid ชัดเจน
- มีรายชื่อ animation และลำดับ frame
- มี reference ของ pivot, baseline และ scale ในฉาก
- ระบุ license/source ของภาพที่ใช้

