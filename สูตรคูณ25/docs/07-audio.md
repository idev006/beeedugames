# Audio Direction

## หลักการ

เสียงเป็นตัวเพิ่มอารมณ์ ไม่ใช่ตัวบังคับการเรียนรู้ ผู้เล่นปิดเสียงหรือใช้หูฟังได้โดย gameplay ยังเข้าใจครบ

## ชุดเสียง MVP

- `ui-tap`, `ui-open`, `ui-close`
- `group-place`, `group-snap`, `machine-charge`
- `success-chime`, `mistake-soft`, `mission-complete`
- ambient loop แยกตามเขตเมือง

## เพลง

ใช้ loop สั้นแบบ seamless มี stem แยก ambience และ rhythm เพื่อปรับ intensity ตามสถานะภารกิจ ไม่ใช้เพลงที่ดังทับ feedback สำคัญ

## Voice

ไม่พึ่ง text-to-speech เป็นเงื่อนไขของ MVP หากมีเสียงพูดภายหลังต้องตรวจความถูกต้องของภาษาไทยและมี captions ทุกครั้ง

