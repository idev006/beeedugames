# Asset Handoff Template

เอกสารนี้เป็นแบบฟอร์มที่ผู้ใช้กรอกและส่งพร้อมไฟล์ภาพก่อนเริ่ม production implementation

## Character Bible

| Field | ลูมิน | พิกซ์ | มารุ | เซน | เงาลวง |
|---|---|---|---|---|---|
| บทบาท |  |  |  |  |  |
| รูปร่าง/เงาร่าง |  |  |  |  |  |
| สีหลัก |  |  |  |  |  |
| ขนาดในฉาก |  |  |  |  |  |
| บุคลิก |  |  |  |  |  |
| สิ่งที่ห้ามเปลี่ยน |  |  |  |  |  |

## Sprite map

```json
{
  "image": "lumin.png",
  "frameSize": 256,
  "columns": 6,
  "rows": 2,
  "frames": {
    "idle": { "x": 0, "y": 0, "w": 256, "h": 256 },
    "interact": { "x": 256, "y": 0, "w": 256, "h": 256 },
    "success": { "x": 512, "y": 0, "w": 256, "h": 256 },
    "mistake": { "x": 768, "y": 0, "w": 256, "h": 256 },
    "celebrate": { "x": 1024, "y": 0, "w": 256, "h": 256 },
    "sleep": { "x": 1280, "y": 0, "w": 256, "h": 256 }
  }
}
```

ค่าตัวอย่างเป็นเพียงโครง ไม่ใช่ข้อบังคับ ผู้ใช้สามารถเปลี่ยนขนาด frame ได้ แต่ทุก frame ใน sheet เดียวกันต้องมีขนาดเท่ากัน

## รายการไฟล์ที่ส่ง

- `assets/characters/<id>/<id>.png`
- `assets/characters/<id>/<id>.json`
- `assets/backgrounds/<district-id>/far.png`
- `assets/backgrounds/<district-id>/mid.png`
- `assets/backgrounds/<district-id>/playfield.png`
- `assets/props/<prop-id>.png`

