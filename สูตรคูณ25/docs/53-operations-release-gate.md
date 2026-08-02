# RG-04: Operations, Capacity and Recovery

Google Apps Script มีโควตาและข้อจำกัดด้านการทำงานพร้อมกันที่เปลี่ยนได้ จึงต้องใช้ controlled test และตรวจเอกสารทางการก่อนเพิ่ม traffic จริง

เอกสารอ้างอิงทางการ: https://developers.google.com/apps-script/guides/services/quotas

## คำสั่งตรวจรับ

- `npm run qa:health` — ตรวจ endpoint และ latency; WARN มากกว่า 2.5 วินาที, FAIL มากกว่า 5 วินาที
- `npm run qa:load` — read-only 9 requests, concurrency 3; ไม่เขียนคะแนนและไม่สร้างข้อมูลทดสอบ
- `npm run qa:leaderboard` — workflow จริงหนึ่ง session: ticket, anti-tamper, idempotency และ readback

ปรับ load ได้ด้วย `LOAD_CONCURRENCY` และ `LOAD_WAVES` แต่เครื่องมือจำกัดสูงสุด 10×10 เพื่อไม่ยิงบริการโดยประมาท

## Release criteria

- health PASS ติดต่อกัน 3 รอบ
- controlled load: error rate ≤ 1%, p95 ≤ 5 วินาที
- workflow smoke ผ่านครบ และลบ/ซ่อนชื่อ QA ก่อน Live
- มีผู้รับผิดชอบตรวจ quota, execution failures และ Google Sheet growth รายวันในสัปดาห์แรก
- เมื่อ backend ล่ม เกมยังเล่นได้และเข้าคิว local sync; Hall ต้องบอกว่า offline โดยไม่ทำคะแนนหาย

## Recovery

1. ปิด `online.enabled` ใน config เพื่อ fallback local
2. ตรวจ Apps Script Executions และ quota
3. ทดสอบ `qa:health` แล้ว `qa:leaderboard`
4. เปิด online แบบ staged rollout และเฝ้าดู error/latency
