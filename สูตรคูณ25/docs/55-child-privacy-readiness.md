# RG-06: Child Privacy Readiness (Not Legal Certification)

เกมมุ่งผู้เล่นอายุ 8–12 ปี จึงต้องถือว่าเป็น child-directed service และให้ผู้เชี่ยวชาญ/เจ้าของบริการรับรองข้อกฎหมายก่อน Live ทั่วโลก เอกสารนี้เป็น engineering readiness ไม่ใช่คำปรึกษากฎหมาย

## Data inventory

| ข้อมูล | ที่เก็บ | วัตถุประสงค์ | การลบ |
|---|---|---|---|
| player ID แบบสุ่ม, ชื่อเล่น, preferences, mastery, inventory, city | localStorage | เล่นต่อในเครื่อง | ปุ่มลบข้อมูลในเกม |
| player ID, ชื่อเล่น, board, score, accuracy, session stats, timestamp | Google Sheet | Hall of Fame | `DELETE_PLAYER` ผ่าน owner queue |
| ภาพกล้อง/hand landmarks | memory ใน browser | AR pointer | ไม่บันทึกและไม่ส่งไป leaderboard |
| signed session proof | browser/Apps Script ชั่วคราว | ป้องกันโกง | หมดอายุอัตโนมัติ |

## Human-owned blockers before public launch

- ชื่อ/ที่อยู่/ช่องทางติดต่อของ operator และ privacy contact
- นโยบายความเป็นส่วนตัวฉบับเต็มที่วางลิงก์เด่นชัดก่อนเก็บข้อมูล
- การพิจารณาฐานกฎหมายและ verifiable parental consent สำหรับประเทศเป้าหมาย
- ขั้นตอนยืนยันผู้ปกครองเพื่อดู/แก้ไข/ลบข้อมูลออนไลน์
- retention schedule และผู้รับผิดชอบลบข้อมูลตามกำหนด
- vendor/data-transfer review สำหรับ GitHub Pages, Google Apps Script/Sheets และ CDN ทุกตัว
- incident response และการแจ้งเหตุข้อมูลรั่วไหล

FTC ระบุว่าบริการที่มุ่งเด็กอายุต่ำกว่า 13 และเก็บ personal information อาจต้องมี privacy policy, direct parental notice, verifiable parental consent, parental access/deletion, security และ retention/deletion procedures. ฝั่ง EU อายุที่ต้องขอ parental consent อาจต่างกัน 13–16 ปีตามประเทศ และข้อความสำหรับเด็กต้องชัดเจนเข้าใจง่าย ดังนั้น RG-06 ยังเป็น `No-Go` จน owner/legal sign-off รายการข้างต้น

เอกสารอ้างอิงทางการ:

- https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-six-step-compliance-plan-your-business
- https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/legal-grounds-processing-data/are-there-any-specific-safeguards-data-about-children_en
