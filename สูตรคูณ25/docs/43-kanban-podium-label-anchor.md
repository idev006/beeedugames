# Kanban — Podium Label Anchor Loop

วันที่: 2026-08-02

## เป้าหมาย

ย้ายชื่อและคะแนนผู้ชนะออกจากตัวโพเดียม เพื่อรักษาความสวยงามของภาพฉาก โดยให้ชื่อเริ่มที่ขอบบันไดขั้นแรก

| Card | งาน | สถานะ |
|---|---|---|
| PLA-01 | ตรวจภาพต้นฉบับ 2560 × 1440 และวัดแนวขอบบันไดขั้นแรก | Done |
| PLA-02 | แยก medal anchor ออกจาก label anchor ใน `PodiumLayout` | Done |
| PLA-03 | เพิ่ม `labelAnchorYPercent` ใน SSOT config | Done |
| PLA-04 | ปรับ CSS ให้ชื่อและคะแนนไม่บังโพเดียมทุกอันดับ | Done |
| PLA-05 | เพิ่ม regression test สำหรับ anchor ร่วมของป้ายชื่อ | Done |
| PLA-06 | Automated tests 44/44 และ browser visual QA | Done |

## Coordinate contract

- เหรียญอันดับ 1–3 ใช้ anchor ของขอบบนโพเดียมแต่ละแท่นตามเดิม
- ชื่อทุกอันดับใช้ `labelAnchorYPercent: 64.3` ซึ่งตรงกับขอบบันไดขั้นแรกของภาพฉาก
- คะแนนวางต่อจากชื่อด้วยระยะ responsive ที่ CSS ควบคุม
- แกน X ของชื่อ คะแนน และเหรียญในอันดับเดียวกันต้องตรงกัน

## ผลตรวจ

- โพเดียมไม่ถูกชื่อหรือคะแนนบดบัง
- เหรียญยังอยู่เหนือแท่นตามอันดับ
- console error: 0
- automated tests: 44/44 ผ่าน
