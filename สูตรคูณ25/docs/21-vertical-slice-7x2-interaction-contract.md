# Interaction Contract: Equal Group Builder

## Domain contract

### `GameStore.chargeGroup(index)`

รับ index ของกลุ่มที่ผู้เล่นต้องการชาร์จ และเป็นเจ้าของกฎความก้าวหน้า

ผลลัพธ์:

- ไม่ทำอะไรถ้า session ไม่อยู่ใน `playing`
- ไม่ทำอะไรถ้า index อยู่นอกช่วงกลุ่ม
- ไม่เพิ่มซ้ำเมื่อกลุ่มเดิมถูกชาร์จแล้ว
- เพิ่ม `groupProgress`
- เมื่อครบทุกกลุ่มให้ตั้ง `groupCompleted = true`

Events:

- `group:updated` `{ index, progress, total, completed }`
- `group:complete` `{ table, multiplier, total, repeatedAddition }`

## Rendering contract

`EnergyPodField` เป็นเจ้าของ:

- pod container
- hit area ของ pod
- visual state empty/charging/full
- orb indicators ภายในแต่ละกลุ่ม
- animation ของการชาร์จ

`EnergyPodField` ห้ามแก้ score, lives, answer หรือ Vue state โดยตรง

## Answer gating contract

`AnswerField` เริ่มด้วย `enabled = false`

- `findAt()` ต้องไม่คืน target เมื่อ disabled
- pointerdown ต้องไม่เรียก submit เมื่อ disabled
- เมื่อรับ `group:complete` จึงเปลี่ยนเป็น enabled
- `getPublicTargets()` ส่ง target ให้ AR เฉพาะเมื่อ enabled

## Input contract

Phase 1:

```text
Mouse/Touch -> EnergyPodField -> GameStore.chargeGroup
Mouse/Touch -> AnswerField -> GameStore.submit
```

Phase 2:

```text
AR fingertip -> group selection adapter -> GameStore.chargeGroup
AR fingertip -> ARSelectionSystem -> GameStore.submit
```

## Lifecycle contract

- `render(round)` ต้องล้าง pod และ listener ของ round เดิมก่อนสร้างใหม่
- `destroy()` ต้องลบ interactive objects, tweens และ callback references
- `GameStore.resetRuntime()` ต้อง reset group progress
- scene shutdown ต้อง detach store subscriptions ก่อน Phaser destroy
- stale session ต้องไม่สามารถชาร์จกลุ่มหรือ submit answer ได้

