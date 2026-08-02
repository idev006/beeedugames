# RG-05: Moderation and Data Operations

Public web app ไม่มี admin endpoint และไม่มี admin secret ใน JavaScript ของเกม การจัดการข้อมูลทำผ่าน Google Sheet และฟังก์ชัน owner-only ใน Apps Script editor

## เริ่มใช้

1. Deploy โค้ด Apps Script รุ่นใหม่
2. Run `setupLeaderboard()` หนึ่งครั้ง เพื่อสร้างชีต `Moderation` และ `AdminRequests`
3. ใน `AdminRequests` เพิ่มแถว: `action`, `playerId`, `reason`
4. Run `processAdminRequests()` แล้วตรวจ `status` และ `processedAt`

## คำสั่ง

- `HIDE_PLAYER` — ซ่อนทุกคะแนนของ player ID และปฏิเสธคะแนนใหม่
- `RESTORE_PLAYER` — ยกเลิกการซ่อน
- `DELETE_PLAYER` — ลบทุกแถวของ player ID และ block ไว้เพื่อไม่ให้ข้อมูลเด้งกลับจาก offline queue

ทุกคำขอต้องอ้างอิง player ID ไม่ใช่ชื่อที่อาจซ้ำกัน ผู้ดูแลต้องสำรอง Sheet และตรวจแถวก่อน DELETE_PLAYER
