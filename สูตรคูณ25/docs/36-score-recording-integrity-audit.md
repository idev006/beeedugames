# Score Recording Integrity Audit

วันที่: 2026-08-02  
สถานะ: Done

## เส้นทางข้อมูล

`GameStore.submit()` → เพิ่มดาว/คำตอบถูก/งานซ่อม → `GameStore.finish()` สร้าง immutable result snapshot → `LeaderboardService.submit()` ตรวจสิทธิ์ → `LocalLeaderboardRepository.submit()` validate, deduplicate และ sort → `ProgressStore.recordSession()` เก็บประวัติ → Hall of Fame โหลดด้วย board key เดียวกัน

## กติกาคะแนนปัจจุบัน

- ดาวต่อคำตอบถูก = `2 + min(5, combo)`
- คะแนน Hall = จำนวนดาวที่เด็กเห็นบนหน้าจอ ไม่ใช้คะแนนลับ
- ต้องมีคำตอบอย่างน้อย 1 ครั้ง, ตอบถูกอย่างน้อย 1 ครั้ง, ซ่อมอย่างน้อย 1 จุด และมีดาวมากกว่า 0 จึงบันทึก
- กระดานแยกตาม `mode`, `seconds`, `tableMin-tableMax` และ `difficulty`
- เรียงตามดาวมาก → accuracy มาก → เวลาน้อย → เวลาส่งก่อน
- จำกัด 10 อันดับต่อกระดาน

## Integrity fixes

1. `finish()` เป็น one-shot ป้องกัน event ซ้ำจากเวลา หัวใจ และปุ่มออกที่เกิดใกล้กัน
2. session history เป็น idempotent ด้วย `sessionId`
3. leaderboard commits ต่อคิวแบบอนุกรม ป้องกัน lost update เมื่อจบหลายเกมติดกัน
4. repository บังคับ session ID, player ID, คะแนนบวก, accuracy 0–1 และ elapsed time อย่างน้อย 1 วินาที
5. กรองแถว LocalStorage ที่เสียรูปก่อนแสดง Hall
6. deduplicate ซ้ำด้วย session ID ทั้งตอน submit และตอน read
7. จำกัดผลลัพธ์สูงสุด 10 รายการแม้ caller ขอมากกว่า

## Verification

- Automated tests: 33/33 ผ่าน
- ครอบคลุม duplicate finish, duplicate session, missing identity, zero score, corrupt storage, invalid accuracy และ inconsistent answer totals
- Browser E2E: Hall เริ่มด้วย 1 รายการ จากนั้นจบเซสชันใหม่ด้วย 0 ดาว Hall ยังคง 1 รายการ
- Browser console errors: 0

## ข้อจำกัดที่ยังคงตั้งใจไว้

- รุ่นปัจจุบันเป็น Local Hall of Fame: ข้อมูลอยู่ใน browser/device เดียว
- ผู้ใช้ที่แก้ LocalStorage ด้วยตนเองยังสามารถปลอมข้อมูลได้ การแข่งขันออนไลน์ต้อง validate และจัดอันดับบน server
- Repository interface แยกไว้แล้ว จึงสามารถเพิ่ม online implementation โดยไม่เปลี่ยน GameStore หรือหน้าจอ Hall
