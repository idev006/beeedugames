# Release Checklist

- `npm run build` ผ่านโดยไม่มี error
- มี `index.html` ที่ root ของเกมสำหรับ GitHub Pages
- path ของ asset ใช้ relative path และ case ตรงกับไฟล์จริง
- ทุก JSON ผ่าน schema validation
- เปิดจาก `http://localhost` หรือ HTTPS ไม่พึ่ง `file://`
- หน้าเริ่มเกม, ภารกิจแรก, ผิด/ถูก, หมดเวลา, result และ restart ผ่าน smoke test
- ไม่มี console error ที่เกิดจาก CDN, audio หรือ camera แล้วทำให้เกมเล่นต่อไม่ได้
- มี fallback เมื่อ MediaPipe/กล้องไม่พร้อม
- ตรวจ keyboard, touch, reduced motion, captions และ contrast
- ตรวจโหลดบน Chrome/Edge และมือถืออย่างน้อยหนึ่งเครื่อง
- อัปเดต version และ changelog

