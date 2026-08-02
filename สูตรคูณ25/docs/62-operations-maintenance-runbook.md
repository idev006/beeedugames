# Operations and Maintenance Runbook

## 1. Environments

| Environment | URL/path | Purpose |
|---|---|---|
| Development source | `F:\programming\html\edugame2\คณิตศาสตร์\สูตรคูณ25` | authoritative code/docs/tests |
| Local HTTP | `http://127.0.0.1:8025/` | browser/AR development |
| Publish checkout | `F:\programming\html\edugame\beeedugames-publish` | GitHub Pages staging |
| Production web | `https://idev006.github.io/beeedugames/สูตรคูณ25/` | public static runtime |
| Production leaderboard | Google Apps Script Web App | signed score API |
| Score storage | Google Sheet | leaderboard/moderation data |

ห้ามใช้ `file://` เพราะ ES module, fetch และ camera security context จะล้มเหลว

## 2. Daily Development

```powershell
cd "F:\programming\html\edugame2\คณิตศาสตร์\สูตรคูณ25"
python -m http.server 8025 --bind 127.0.0.1
```

ก่อนแก้:

- อ่าน current Kanban/feature document
- ตรวจว่าไฟล์มี user changes หรือไม่
- บันทึก reproducible symptom

หลังแก้:

```powershell
npm test
npm run qa:static
```

ทดสอบอย่างน้อย Start → Play → Wrong → Correct → Next round → Result → Replay → Hall

## 3. Runtime Publish Procedure

Production repository เก็บ runtime เท่านั้น:

- `index.html`
- `README.md`
- `config/`
- `css/`
- `js/`
- `assets/processed/`

อย่า publish:

- `_qa-*.png`
- `assets/processed-backup-*`
- source artwork ที่ runtime ไม่อ้าง
- `tools/__pycache__`
- local logs/temp/server files
- credentials หรือ clasp auth files

ขั้นตอน:

1. run all tests ใน authoritative source
2. sync runtime ไป `beeedugames-publish/สูตรคูณ25`
3. ตรวจ `git status -sb` และ staged diff
4. scan secret patterns และ file >95 MB
5. serve repository root locallyและเปิด portal → game
6. ทดสอบ app mount, images, start และ Hall
7. commit เฉพาะ intended paths
8. push `main` เมื่อเจ้าของขอ deploy สด
9. ตรวจ GitHub Pages build status
10. เปิด production URL และ repeat smoke

## 4. Apps Script Deployment

Source อยู่ใน `google-apps-script/` และใช้ `clasp`

Pre-deploy:

- `clasp status`
- ตรวจ `.clasp.json` ว่าไม่ได้ถูก publish ไป public runtime
- run Apps Script security tests
- backup deployment/version ที่ rollback ได้

Deploy:

```powershell
clasp push
clasp deploy --description "describe change"
```

หลัง deploy:

- health endpoint
- signed start
- forged score rejection
- valid submit
- duplicate submit idempotency
- top/hall snapshot readback
- update deployment version ใน operations document

หากเปลี่ยน deployment URL ต้องแก้ `config/game.config.json` และ publish frontend ใหม่

## 5. Hall of Fame Runtime Contract

เมื่อเข้าหน้า Hall:

1. ล้าง snapshot จาก visit ก่อน
2. แสดง full-screen data loading
3. request `action=hall` หนึ่งครั้ง
4. รับ board catalog + public Top 10 ต่อ board
5. เลือก current board หรือ latest active board
6. filter combobox ที่ client โดยไม่ request ซ้ำ
7. ออกจาก Hall แล้วเข้าใหม่ต้อง request snapshot ใหม่

ห้ามโหลด raw Sheet ทั้งหมดเข้า client

## 6. Incident: Hall ว่างหรือโหลดไม่ได้

ตรวจตามลำดับ:

1. browser network: URL/status/timeout/CORS
2. config `leaderboard.online.enabled` และ `webAppUrl`
3. Apps Script `/exec?action=health`
4. `/exec?action=hall`
5. response schema `boards`, `entriesByBoard`
6. moderation status ของ rows
7. board key ตรงกับ mode/time/table/difficulty
8. Apps Script execution log/quota/cold start

อย่า fallback local score เข้า public Hall โดยไม่บอกผู้เล่น

## 7. Incident: Score ผิดหรือถูกโกง

- เก็บ session ID, player ID, board key และ timestamp
- ตรวจ signed ticket และ transcript
- server recompute score จาก evidence
- ตรวจ duplicate session และ impossible answer rate
- hide row ผ่าน moderation ก่อนสืบสวน
- ห้ามแก้ Sheet โดยไม่มี audit note
- rotate secret/deploy หาก signing secret รั่ว

Client-side obfuscation ไม่ใช่ anti-cheat boundary

## 8. Incident: AR เปิดกล้องแต่ควบคุมไม่ได้

ตรวจ pipeline:

```text
camera frame → MediaPipe result → hand present → index classifier
→ normalized coordinate → mirror transform → viewport coordinate
→ pointer visibility → hit test → dwell → select intent
```

Diagnostic:

- แสงด้านหน้าและเห็นปลายนิ้วถึงข้อมือ
- camera permission และ HTTPS
- no-hand ต้องไม่มี pointer
- palm ต้องไม่เลือก
- index vertical/horizontal ต้องผ่าน
- video mirror และ landmark flip ไม่ซ้ำ
- target bounds ต้องตรง Phaser canvas หลัง responsive scale
- inference loop ต้องไม่ชน destroyed scene

เมื่อ AR fail ให้ Mouse/Touch เล่นต่อได้

## 9. Incident: Scene ว่าง, flicker หรือ replay พัง

สาเหตุที่พบบ่อย:

- async callback ทำงานหลัง scene destroy
- event listener/timer/tween จาก session เก่าไม่ dispose
- renderRound ถูกเรียกก่อน scene ready
- texture ยังไม่ preload
- transition ถูก emit ซ้ำ

แก้ที่ lifecycle owner:

- generation/session token ปฏิเสธ callback เก่า
- idempotent finish/transition
- `DisposableBag` สำหรับ cleanup
- clear world objects ก่อนสร้างรอบใหม่
- lock input ระหว่าง feedback/transition

## 10. Incident: Asset 404/Crop/Black Halo

- path และ case ต้องตรง GitHub Pages
- runtime อ้าง `assets/processed` เท่านั้น
- inspect source dimensions และ alpha ก่อนแก้ JSON
- frame grid ต้องตรง manifest
- pivot/baseline ต้องสม่ำเสมอ
- black circle อาจมาจาก debug/focus overlay ไม่ใช่ PNG เสมอ
- `200 OK` แต่ decode fail มักเป็นไฟล์ผิด format/เสีย ไม่ใช่ CORS

## 11. Performance Budgets

ควรวัดแยก:

- portal HTML/CSS
- initial app shell
- first playable scene
- optional backgrounds/characters
- MediaPipe model/WASM
- Hall Apps Script latency

ข้อเสนอสำหรับรอบถัดไป:

- convert large PNG backgrounds to WebP/AVIF พร้อม PNG fallback
- lazy-load district backgrounds และ non-current character sprites
- preload เฉพาะ hero portrait/first scene
- cache immutable assets ด้วย hashed filename เมื่อมี build pipeline
- วัด Largest Contentful Paint และ first interaction บน mobile network
- ห้าม preload artwork ทั้ง 126 MB

## 12. Backup and Rollback

Frontend rollback:

```powershell
git revert <bad-commit>
git push origin main
```

อย่าใช้ `reset --hard` กับ shared repository

Backend rollback:

- redeploy known-good Apps Script version
- หาก backend มี incident ให้ disable online leaderboard ใน config และ publish frontend fallback
- เก็บ local queue; ห้ามทิ้งคะแนนที่ยัง sync ไม่สำเร็จ

Data:

- export Sheet ก่อน schema migration
- migrations ต้อง idempotent
- moderation/deletion มี audit trail

## 13. Privacy and Moderation Operations

ก่อน worldwide launch ต้องกำหนด:

- operator identity/contact
- parent/guardian request channel
- retention period
- consent/legal basis ต่อประเทศ
- deletion SLA
- moderation owner และ response SLA
- prohibited display-name policy

กล้องประมวลผลในอุปกรณ์และไม่บันทึกภาพ แต่ต้องเขียนให้ผู้ปกครองเข้าใจใน privacy notice

## 14. Monitoring Checklist

อย่างน้อยรายสัปดาห์ในช่วง beta:

- GitHub Pages availability
- Apps Script health/cold-start/p95
- Sheet row growth และ quota
- rejected/duplicate/forged submission rate
- moderation queue
- client error reports
- AR device matrix regressions
- first-load asset performance

## 15. Post-Release Change Record

ทุก release ควรบันทึก:

```text
Version/commit:
Date:
Behavior changed:
Learning impact:
Config/schema change:
Backend deployment:
Tests:
Browser/device evidence:
Known risks:
Rollback target:
Owner:
```

