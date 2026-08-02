# Local Test Runbook

## Automated domain tests

จากโฟลเดอร์โครงการ:

```powershell
.\tools\run-tests.ps1
```

หรือ:

```powershell
node --test tests/*.test.mjs
```

`npm test` เป็น alias ที่ประกาศไว้ใน `package.json` แต่หากเครื่องมีปัญหา npm installation ให้ใช้คำสั่ง Node โดยตรง

## Static server

หาก Python launcher ใช้งานไม่ได้ ให้ใช้:

```powershell
node tools/static-server.mjs
```

จากนั้นเปิด `http://127.0.0.1:8025/`

สามารถเปลี่ยนค่าได้ด้วย environment variables:

```powershell
$env:GAME_HOST = "127.0.0.1"
$env:GAME_PORT = "8025"
node tools/static-server.mjs
```

## Quality gates

1. Domain tests ต้องผ่านทั้งหมด
2. เปิดหน้า start และตรวจว่าไม่มี initialization error
3. เริ่มภารกิจและตรวจ Phase 1: grouping
4. ชาร์จกลุ่มครบ ตรวจ transforming และ Phase 2: answering
5. ตอบถูก/ผิด ตรวจ score, heart, feedback และ remediation
6. ออกจากเกมแล้วเล่นใหม่ ตรวจว่า canvas มีเพียงหนึ่งตัวและไม่มี event จาก session เดิม
7. ทดสอบ AR บน localhost หรือ HTTPS ด้วยกล้องจริง
