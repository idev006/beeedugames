# SSOT และ Data Schema

ทุกกติกาที่เปลี่ยนได้ควรอยู่ใน JSON/config ไม่กระจายเป็น magic number ใน component หรือ scene

## Game config

```json
{
  "schemaVersion": 1,
  "title": "เมืองแสงซ่อนกล: ทีมช่างพลังคูณ",
  "tables": { "min": 2, "max": 25 },
  "multipliers": { "min": 1, "max": 12 },
  "session": { "defaultSeconds": 180, "startingLives": 5 },
  "accessibility": { "reducedMotion": false, "highContrast": false }
}
```

## Mission

```json
{
  "id": "district-01",
  "table": 4,
  "multiplierRange": [1, 6],
  "verb": "charge",
  "targetCount": 6,
  "reward": { "parts": 3, "badge": "first-light" }
}
```

## Save data

```json
{
  "schemaVersion": 1,
  "unlockedDistricts": ["district-01"],
  "mastery": { "4x3": { "accuracy": 1, "attempts": 2, "lastSeen": "" } },
  "inventory": { "parts": 0, "badges": [] },
  "settings": { "musicVolume": 0.7, "sfxVolume": 0.9, "reducedMotion": false }
}
```

## Invariants

- table อยู่ระหว่าง 2 ถึง 25
- multiplier อยู่ระหว่าง 1 ถึง 12
- ภารกิจต้องมีเป้าหมายที่ทำให้เกิดการจัดกลุ่มจริง
- result ทุกครั้งต้องมี `status`, `learningTarget`, `feedback`

