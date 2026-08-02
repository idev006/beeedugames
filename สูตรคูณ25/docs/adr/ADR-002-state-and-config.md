# ADR-002: GameStore และ JSON เป็น SSOT

## สถานะ

Accepted

## การตัดสินใจ

ใช้ JSON versioned เป็นแหล่งข้อมูลกติกา/เนื้อหา และ `GameStore` เป็นแหล่งสถานะ runtime เดียวของ Vue กับ Phaser ผ่าน adapter/event

## เหตุผล

ปรับแม่คูณ ความยาก เวลา ชีวิต รางวัล และเนื้อหาได้โดยไม่กระจายค่าคงที่ใน code ลดความเสี่ยงที่ข้อความหน้าเลือกกับ logic ในเกมไม่ตรงกัน โดยไม่เพิ่ม state library ที่ vertical slice ยังไม่จำเป็นต้องใช้

## ข้อบังคับ

ทุกการเปลี่ยน schema ต้องเพิ่ม `schemaVersion` และ migration หรือปฏิเสธ save เก่าด้วยข้อความที่เข้าใจได้
