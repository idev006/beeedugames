# Project Parameters — สวนผลไม้แบ่งปัน (The Sharing Orchard)

> กรอกจาก Game Brief ที่ทำไว้แล้ว + ตัดสินใจ Fast Lane เพราะไม่มี AR ที่จำเป็น
> ไม่เก็บข้อมูลเด็ก และไม่ต้อง publish online

**สิ่งที่ต้องกรอกเอง (ผมไม่ทราบ):** `project_path`, `repository_url` — ใส่ path
โฟลเดอร์จริงในเครื่องคุณก่อนใช้ prompt นี้ (เช่น
`F:/programming/html/edugame2/คณิตศาสตร์/หาร/`)

```yaml
project:
  working_title: "สวนผลไม้แบ่งปัน (The Sharing Orchard)"
  project_path: "[ใส่ path โฟลเดอร์โปรเจกต์ของคุณ]"
  repository_url: ""
  deployment_url: ""
  current_status: "new"
  current_phase: "design"   # Discover + Frame ทำเสร็จแล้วผ่าน Game Brief

education:
  subject: "คณิตศาสตร์"
  topic: "การหาร (partitive & quotative) รวมถึงกรณีมีเศษ"
  target_age: "7-10"
  grade: "ป.2-ป.4"
  locale: "th-TH"
  learning_objective: >
    เด็กสามารถแบ่งจำนวนสิ่งของออกเป็นกลุ่มเท่าๆ กันได้ เข้าใจว่าการหารคือการแบ่งเท่ากัน
    หรือจัดเป็นกลุ่มย่อยขนาดเท่ากัน และเชื่อมโยงกับการคูณย้อนกลับ
  prior_knowledge:
    - "นับจำนวน 1-100"
    - "บวก-ลบพื้นฐาน"
    - "สูตรคูณแม่ 2-5 บางส่วน"
  observable_evidence: >
    แบ่งวัตถุ N ชิ้นเป็น G กลุ่มเท่ากันได้ถูกต้อง, บอกเศษที่เหลือได้ถูกต้อง,
    เขียนประโยคสัญลักษณ์ N ÷ G = ผลลัพธ์ ... เศษ ... ได้
  misconceptions:
    - "เข้าใจว่าหารคือลบซ้ำๆ อย่างเดียว ไม่เห็นภาพการจัดกลุ่ม"
    - "สลับตำแหน่งตัวตั้งกับตัวหาร"
    - "ปัดเศษทิ้งหรือไม่เข้าใจว่าเศษคืออะไร"
  content_min: "ตัวตั้ง 4-12, ตัวหาร 2-3 (ด่านต้น)"
  content_max: "ตัวตั้งถึง 100, ตัวหารถึง 10 (ด่านปลาย) — ต้องให้ SME ยืนยันช่วงตัวเลขจริงตามหลักสูตร"
  mastery_rule: "ตอบถูก >= 4 จาก 5 ข้อติดต่อกัน โดยใช้ hint ไม่เกิน 1 ครั้งต่อด่าน"
  remediation_rule: >
    ผิด 2 ครั้งในข้อเดียวกัน → กลับสู่โหมดภาพช่วยจำ ลดจำนวนตัวเลขลง
    ให้ลากวัตถุแบ่งกลุ่มด้วยมือก่อนกลับมาทำโจทย์เดิม

experience:
  desired_fantasy_or_theme: "สวนผลไม้วิเศษ + สัตว์ป่าเพื่อนบ้านที่รอรับส่วนแบ่งผลไม้"
  forbidden_theme_or_characters: []
  session_duration_seconds: 900
  long_term_motivation: "ปลดล็อกโซนสวนใหม่ (เมืองร้อน/หิมะ/ใต้น้ำ) + สะสมเพื่อนสัตว์"
  emotional_tone: "สนุก อบอุ่น ตื่นเต้น ปลอดภัย"
  reference_images: []
  available_assets_path: ""
  new_assets_allowed: true
  human_creates_transparent_png: true

gameplay:
  baseline_inputs:
    - mouse
    - touch
  optional_inputs: []       # AR อยู่นอกขอบเขตของ vertical slice นี้
  ar_required_for_learning: false
  core_learning_action: "ลากผลไม้แบ่งลงตะกร้าของสัตว์แต่ละตัวให้เท่ากัน แล้วยืนยันจำนวนต่อกลุ่ม+เศษ"
  preferred_fantasy_verb: "แบ่งปัน (Share)"
  score_system: "ดาว 1-3 ตามความแม่นยำและจำนวน hint ที่ใช้ต่อด่าน"
  lives_or_mistake_system: "ไม่มีระบบชีวิต ใช้ remediation mode แทนการลงโทษ"
  progression_system: "ปลดล็อกโซนสวน + สัตว์ใหม่เข้าสวนเมื่อผ่านด่านครบ"
  leaderboard: "none"
  player_data_collected: []   # fast lane — ไม่เก็บข้อมูลส่วนบุคคล

platform:
  product_lane: "fast"
  target_devices:
    - tablet
    - desktop
  orientation: "landscape"
  hosting: "static local/classroom (ปรับเป็น github_pages ได้ภายหลังถ้าต้องการ)"
  offline_fallback_required: false   # ตั้งเป็น true ถ้าใช้ในห้องเรียนที่เน็ตไม่เสถียร

technology:
  frontend: "Vue 3 (CDN, ไม่มี build step) — สอดคล้องกับเกมอื่นในพอร์ตที่ทำไว้"
  state: "Vue reactive state (ไม่ใช้ Pinia เพราะไม่มี build step)"
  game_engine: "ไม่ใช้ game engine เฉพาะทาง — DOM/CSS + Vue พอสำหรับ drag-and-drop 2D"
  styling: "Tailwind CSS + daisyUI (CDN)"
  ar: "ไม่ใช้ในสไลซ์นี้"
  audio: "HTML5 audio / Web Audio API"
  architecture:
    - OOP
    - component_based
    - config_driven
    - event_bus
    - repository_interface
  max_lines_per_file: 700
  encoding: "UTF-8"
  ssot_config_required: true

quality:
  minimum_scorecard: 80    # เป้าหมาย closed beta / ใช้จริงในห้องเรียน ไม่ใช่แค่ internal pilot
  mouse_touch_must_work_without_ar: true
  responsive_no_clipping: true
  replay_test_count: 2
  required_browsers:
    - Chrome
    - Edge
  required_devices: []     # ใส่รุ่นแท็บเล็ตจริงที่จะทดสอบ ถ้ามี
  performance_target_fps: 55
  automated_tests_required: true
  browser_workflow_required: true
  physical_ar_test_required: false

scope:
  task_this_session: >
    สร้าง Vertical Slice ของ "สวนผลไม้แบ่งปัน" — ฉากแบ่งแอปเปิ้ล 12 ผล
    ให้กระต่าย 3 ตัวเท่าๆ กัน (12 ÷ 3) ตาม Vertical Slice ที่ระบุใน Game Brief
  allowed_changes:
    - "สร้างไฟล์ใหม่เฉพาะในโฟลเดอร์โปรเจกต์เกมนี้"
    - "ใช้ placeholder art (shape/emoji) แทนกราฟิกจริงได้ในขั้นนี้"
  forbidden_changes:
    - "ห้ามแก้ไฟล์ของเกมอื่นในพอร์ต"
    - "ห้าม commit/push/deploy"
  out_of_scope:
    - "การหารทศนิยม"
    - "long division algorithm"
    - "โจทย์ปัญหาหลายขั้นตอน"
    - "AR mode"
  expected_deliverables:
    - "Phase wireflow + state machine"
    - "SSOT config draft"
    - "Vertical slice ที่เล่นได้จริงในเบราว์เซอร์ (มี 1 ฉากครบ orient→feedback)"
    - "Unit tests สำหรับ domain rules (คำนวณผลหาร/เศษ)"
    - "Kanban backlog สำหรับด่านถัดไป"
  acceptance_criteria:
    - "แบ่งถูกต้อง → feedback ถูกต้องและ progression consequence ทำงาน"
    - "แบ่งผิด → เข้าสู่ remediation path ตามที่ระบุใน Game Brief"
    - "ใช้งานได้ด้วย mouse และ touch โดยไม่ต้องพึ่ง AR"
    - "ไม่มี hard gate ที่เกี่ยวข้องกับ fast lane ล้มเหลว"

authority:
  may_edit_files: true
  may_create_assets: true     # จำกัดแค่ placeholder art สำหรับ vertical slice เท่านั้น
  may_install_dependencies: false
  may_commit: false
  may_push: false
  may_deploy: false
  release_branch: ""
  human_approval_required_for:
    - learning_design
    - privacy
    - production_release
```

---

## Starter Prompt พร้อมใช้ (คัดลอกทั้งหมดด้านล่างนี้ไปวางให้ AI)

```text
You are a senior education game product team: learning designer, game designer,
art director, software architect, QA and operations engineer.

Use the Bee Edu Game Franchise Guidebook in docs/franchise/.
Follow the Golden Path and Agile Kanban loop. The Game Brief, learning evidence,
and misconception map are already complete (see Project Parameters below) —
do not redo Phase 0 (Discover) or Phase 1 (Frame). Begin at Phase 2 (Design):
produce the phase wireflow, state machine, input contract, feedback timing, and
SSOT config draft before writing any implementation code.

Create a distinct game world and characters, but preserve franchise contracts:
learning action as game action, Mouse/Touch baseline, optional AR, config SSOT,
component/OOP boundaries, explicit lifecycle, misconception-based distractors,
tests, quality scorecards and release gates.

Project: สวนผลไม้แบ่งปัน (The Sharing Orchard) — teaching division (การหาร) for
grade ป.2-ป.4 in Thai.

First deliverable:
Phase wireflow, state machine, SSOT config draft, then the vertical slice
(12 ÷ 3 apples-and-rabbits scenario) with unit tests and browser smoke test.
Do not implement Productize/Harden/Release scope yet.

PROJECT PARAMETERS
[วาง YAML ทั้งก้อนด้านบนต่อท้ายตรงนี้]
```

---

**หมายเหตุการใช้งาน:**
- อย่าลืมกรอก `project_path` ก่อนส่ง ไม่งั้น AI จะหา `docs/franchise/` ไม่เจอ
- ถ้ายังไม่มีโฟลเดอร์ `docs/franchise/` ในโปรเจกต์เกมหารนี้ ต้อง copy ไฟล์ทั้ง 5
  (README + 01-04) เข้าไปวางที่ `[project_path]/docs/franchise/` ก่อน
- ทำ Phase 2 (Design) เสร็จแล้วค่อยส่ง Kanban prompt สั้นสำหรับ Phase 3 (Vertical Slice) ต่อ ไม่ต้องส่ง Starter Prompt ซ้ำอีก
