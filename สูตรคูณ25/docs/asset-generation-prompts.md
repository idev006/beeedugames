# Asset Generation Prompt Pack

เอกสารนี้คือชุดพรอมพ์พร้อมใช้สำหรับสร้างกราฟิกเกม สูตรคูณ 2 ถึง 25 โดยไม่ให้เด็กรู้สึกเหมือนกำลังทำโจทย์คณิตศาสตร์โดยตรง ภาพทั้งหมดควรเป็น asset เกม 2D คุณภาพสูง ใช้ใน Vue/Phaser ได้ และต้องส่งออกเป็น PNG โปร่งใสเมื่อเป็นตัวละครหรือวัตถุ

## Global Art Direction

ใช้แนวทางนี้นำหน้าพรอมพ์ทุกภาพ เพื่อให้สไตล์ทั้งเกมไปทางเดียวกัน

    2D educational adventure game art for children, premium polished fantasy world, warm friendly proportions, clear silhouette, expressive face, readable at small size, soft cinematic lighting, luminous colors, consistent character design, game-ready composition, clean edges, no text, no numbers, no logo, no watermark

Negative prompt ใช้แนบท้ายทุกครั้ง

    black background, dark opaque background, gray matte, checkerboard pattern, white outline, cropped body, cut off feet, cut off hat, extra limbs, extra fingers, duplicate character, distorted face, unreadable details, text, numbers, watermark, logo, frame border, cast shadow circle, black halo, floor ellipse, photography, realistic human, horror, angry face

## Required Image Sizes

ให้กำหนดขนาดใน prompt ทุกครั้ง โดยเฉพาะไฟล์ที่จะตัด sprite หรือวางใน Phaser เพราะขนาดภาพคือส่วนหนึ่งของ contract ระหว่าง art pipeline กับ code

- Character bible: 2048 x 2048 px, PNG, transparent RGBA
- Character sprite sheet: 3072 x 1024 px, PNG, transparent RGBA, 6 columns x 2 rows, frame size 512 x 512 px
- High resolution character sprite sheet: 6144 x 2048 px, PNG, transparent RGBA, 6 columns x 2 rows, frame size 1024 x 1024 px
- VFX sprite sheet: 2048 x 1024 px, PNG, transparent RGBA, 4 columns x 2 rows, frame size 512 x 512 px
- Gameplay props sheet: 2048 x 2048 px, PNG, transparent RGBA, 4 columns x 4 rows, frame size 512 x 512 px
- UI icon sheet: 2048 x 2048 px, PNG, transparent RGBA, 4 columns x 4 rows, frame size 512 x 512 px
- Main background: 2560 x 1440 px, PNG or WEBP, 16:9
- Level background: 2560 x 1440 px, PNG or WEBP, 16:9
- Optional parallax background layers: 2560 x 1440 px per layer, transparent PNG for foreground/mid layers when possible

Prompt line ที่ควรแนบทุกครั้ง:

    Output size [WIDTH] x [HEIGHT] pixels, exact aspect ratio, game-ready PNG, clean alpha channel when transparent is requested, no resizing, no crop, no extra canvas border.

## Important: Bible Sheet Is Not Sprite Sheet

Character bible ใช้ดูหน้าตา มุมมอง สี บุคลิก และ expression เท่านั้น ห้ามเอา character bible ไปใช้ตัด animation ในเกมโดยตรง เพราะมักมีปัญหา frame ไม่เท่ากัน ตัวละคร scale ไม่เท่ากัน และตำแหน่งเท้าไม่ตรงกัน

Sprite sheet สำหรับเกมต้องเป็น grid แบบเข้มงวด:

- ทุก frame ต้องมีขนาดเท่ากัน 512 x 512 px
- sprite sheet ขนาด 3072 x 1024 px ต้องมี 6 columns x 2 rows เท่านั้น
- ไม่มี gutter ไม่มี margin ระหว่างช่อง หรือถ้ามีต้องระบุเป็นตัวเลขชัดเจน
- จุดยืนของตัวละครต้องตรงกันทุก frame
- เท้าต้องอยู่บน baseline เดียวกันทุก frame
- pivot แนะนำอยู่ที่ x 256, y 460 สำหรับ frame 512 x 512
- ตัวละครเต็มตัวควรสูงไม่เกิน 430 px ภายใน frame 512 x 512
- เว้น padding รอบตัวละครอย่างน้อย 32 px
- ห้ามใส่เฉพาะหัวปนกับตัวเต็มใน sprite sheet เดียวกัน

Prompt line สำหรับล็อก frame:

    Every animation frame must be inside its own invisible 512 x 512 pixel cell. Use a strict 6 columns x 2 rows grid. No gutters, no margins, no mixed-size drawings. Keep the character full body centered at x=256 in each cell, feet aligned to baseline y=460, maximum character height 430 pixels, minimum 32 pixels padding, consistent scale and pivot across all frames.

## Character Bible 1: ลูมิน

บทบาท: หัวหน้าทีมช่างพลังคูณ ตัวเอกที่ชวนเด็กออกสำรวจเมืองแสง

พรอมพ์:

    Output size 2048 x 2048 pixels. Create an original cute fantasy game character named Lumin, a young fox-like inventor hero for a children educational adventure game. Lumin has orange and cream fur, large curious eyes, a teal utility jacket, tiny brass goggles on the head, and a warm amber energy tool that looks magical but safe. Show a character bible sheet with front view, three-quarter view, side view, back view, and expression heads: curious, thinking, happy, encouraging, surprised. Premium 2D game art, soft lighting, clear silhouette, readable at small size, child friendly, no text, no numbers, no logo, no watermark, transparent RGBA background.

หมายเหตุ: ลูมินไม่ใช่ผู้สอนแบบถือป้ายโจทย์ แต่เป็นเพื่อนร่วมทีมที่ชี้ให้เห็นรูปแบบพลังงาน

## Character Bible 2: พิกซ์

บทบาท: หุ่นลอยจิ๋วที่แสดงกลุ่มพลังงานเท่า ๆ กันแทนแนวคิดการคูณ

พรอมพ์:

    Output size 2048 x 2048 pixels. Create an original cute floating cube robot named Pix for a children adventure game about hidden multiplication patterns. Pix has a rounded cube body, cyan glowing core, friendly digital eyes, tiny magnetic hands, and a magical ring projector that visualizes equal groups of energy. Show a character bible sheet with idle, pointing, grouping energy orbs, giving hint, success, and confused poses. Premium 2D game art, clean silhouette, luminous cyan and gold accents, readable at small size, no text, no numbers, no logo, no watermark, transparent RGBA background.

## Character Bible 3: มารุ

บทบาท: ช่างขนส่งที่ทำให้การคูณกลายเป็นภารกิจส่งพลังงานเป็นชุด

พรอมพ์:

    Output size 2048 x 2048 pixels. Create an original cute armadillo-like delivery mechanic named Maru for a children fantasy adventure game. Maru has a round soft body, warm brown shell, turquoise scarf, small backpack with glowing power cells, and cheerful hardworking personality. Show a character bible sheet with walking, carrying energy crates, dropping a crate gently, cheering, tired but smiling, and celebrating poses. Premium 2D game art, safe and friendly, clear silhouette, readable at small size, no text, no numbers, no logo, no watermark, transparent RGBA background.

## Character Bible 4: เซน

บทบาท: นักทำแผนที่เมืองแสง ใช้เป็นผู้เปิดด่านและรางวัลความคืบหน้า

พรอมพ์:

    Output size 2048 x 2048 pixels. Create an original cute owl cartographer named Zen for a children fantasy adventure game. Zen has soft round feathers, navy and gold explorer cape, tiny satchel, and a glowing magical map. The personality is calm, clever, and playful. Show a character bible sheet with observing, revealing map, giving hint, celebrating, surprised, and flying hover poses. Premium 2D game art, clear silhouette, readable at small size, no text, no numbers, no logo, no watermark, transparent RGBA background.

## Character Bible 5: เงาลวง

บทบาท: สิ่งรบกวนที่ทำให้พลังงานในเมืองสับสน ไม่ใช่ตัวร้ายให้น่ากลัว แต่เป็นความเข้าใจผิดที่เด็กช่วยแก้

พรอมพ์:

    Output size 2048 x 2048 pixels. Create an original non-scary magical fog creature named Glimshade for a children fantasy adventure game. Glimshade is made of soft violet-blue mist, has gentle worried eyes, small floating fragments, and changes shape when equal groups are restored. Show poses: confused, scattered, listening, clearing away, relieved, friendly. Premium 2D game art, magical but safe, soft edges, readable at small size, no horror, no text, no numbers, no logo, no watermark, transparent RGBA background.

## Main Character Sprite Sheet

ใช้สำหรับตัวละครหลักแต่ละตัว แนะนำสร้างแยกไฟล์ต่อตัวละคร

พรอมพ์:

    Create a production-ready 2D game sprite sheet for the character [CHARACTER NAME], matching the provided reference image for character design only. The final image must be exactly 3072 x 1024 pixels. The canvas must contain exactly 6 columns and 2 rows, total 12 frames. Each frame must be exactly 512 x 512 pixels. Use a strict invisible grid. No outer margin. No gutter. No extra empty space around the whole sheet. No auto-layout character sheet. No turnaround sheet. Every pose must fit fully inside its own 512 x 512 cell. Full body only in every cell. Do not include portrait heads, close-up faces, labels, frame numbers, guide lines, visible grid lines, or mixed-size drawings. Keep the character scale consistent across all frames. Character pivot should be center-bottom, x=256 and y=460 inside each 512 x 512 cell. For standing poses, feet aligned to baseline y=460. For non-standing poses such as sleep, keep the full body inside the same 512 x 512 cell and keep the visual center consistent with the other frames. Maximum standing character height 430 pixels, minimum 32 pixels transparent padding inside each cell. Transparent RGBA background. Animation frames from left to right, top row then bottom row: idle 1, idle 2, interact, hint, mistake soft reaction, success, celebrate 1, celebrate 2, walk 1, walk 2, tired, sleep. Premium polished children adventure game style, clean edges, no ground shadow, no black halo, no frame border, no text, no numbers, no logo, no watermark.

ข้อกำหนดไฟล์:

- ขนาดบังคับสำหรับ production: 3072 x 1024 px
- จำนวนช่อง: 6 columns x 2 rows
- frame หลัก: 512 x 512 px
- gutter: 0 px
- margin: 0 px
- pivot: center-bottom, x 256, y 460 สำหรับ frame 512 x 512
- baseline เท้า: y 460 สำหรับ frame 512 x 512
- ทุกช่องต้องเท่ากัน
- ตัวละครต้องไม่ถูกตัดเท้า หมวก มือ หรืออุปกรณ์
- พื้นหลังต้องเป็น alpha จริง ไม่ใช่สีดำ ไม่ใช่ checkerboard ที่ฝังในภาพ

ถ้า AI ยังสร้างขนาดผิด เช่น 3584 x 1184 ให้เปลี่ยน workflow เป็นสร้างทีละ pose:

    Create one full-body transparent PNG animation frame for [CHARACTER NAME]. Output size exactly 512 x 512 pixels. Character pivot center-bottom x=256 y=460. Feet baseline y=460 for standing poses. Maximum character height 430 pixels. Minimum 32 pixels padding. Transparent RGBA background. No shadow, no text, no frame, no watermark. Pose: [POSE NAME].

## Equal Group Energy VFX

ใช้แทนความหมายของการคูณ เช่น กลุ่มพลังงาน 4 กลุ่ม กลุ่มละ 3 ดวง โดยเกมจะเป็นคนวางจำนวนเอง

พรอมพ์:

    Output size 2048 x 1024 pixels. Create a transparent 2D VFX sprite sheet for a children fantasy game: magical equal-group energy effect, small glowing orbs forming tidy groups, cyan gold magenta sparkles, soft pulse, success burst, gentle correction shimmer, combo trail. Exactly 4 columns and 2 rows, 8 equal square frames, each frame exactly 512 x 512 pixels, centered effect, transparent RGBA background, no black circle, no opaque shadow, no text, no numbers, no logo, no watermark.

## Main Background

ฉากหลักควรมีพื้นที่กลางจอให้วาง gameplay และรายละเอียดสวยอยู่ริมภาพ เพื่อไม่ให้ UI ชนกับตัวเล่น

พรอมพ์:

    Output size 2560 x 1440 pixels. Wide 16:9 fantasy city named Luminara at dusk, a playful magical workshop city powered by glowing crystals and friendly machines, floating bridges, warm lanterns, crystal conduits, small power stations, lush plants, cinematic depth, colorful but readable. Leave a clear central play area for game objects, add richer details near the edges and corners, no characters, no text, no numbers, no UI, no watermark. Premium 2D game background, children adventure style.

## Level Background Variations

สร้าง 5 ฉากด้วยกล้องและ horizon ใกล้เคียงกัน เพื่อให้เกมเปลี่ยนด่านได้โดยไม่เสีย layout

พรอมพ์:

    Output size 2560 x 1440 pixels for each image. Create five 16:9 2D game backgrounds for a children fantasy adventure game, same camera angle and same central safe play area. Theme 1: Spark Workshop Gate. Theme 2: Crystal Canal. Theme 3: Gear Garden. Theme 4: Sky Battery Dock. Theme 5: Festival Core Plaza. Each background should be bright, magical, readable, with detailed edges and a clear center for interactive objects. No characters, no text, no numbers, no UI, no watermark.

แนะนำ export แยกชั้นถ้าทำได้:

- far background
- middle scenic layer
- playfield base
- foreground frame plants or devices

## Gameplay Objects And Rewards

พรอมพ์:

    Output size 2048 x 2048 pixels. Create a transparent PNG sheet of cute fantasy game props for a children adventure game: glowing energy crate, small power cell, crystal cable, lamp node, brass gear, tiny wrench, reward badge, upgrade part, sparkle pickup, soft success star. Exactly 4 columns and 4 rows, 16 equal square cells, each cell exactly 512 x 512 pixels. Isolated objects in equal square cells, consistent style and scale, premium 2D game art, transparent RGBA background, no text, no numbers, no black halo, no watermark.

## UI Icon Set

ไอคอนควรใหญ่ อ่านง่าย เหมาะกับเด็ก และใช้กับ DaisyUI/Tailwind ได้

พรอมพ์:

    Output size 2048 x 2048 pixels. Create a transparent PNG icon set for a children educational adventure game UI: play, settings, sound on, sound off, music volume, back, restart, home, pause, reward, heart, timer, level map, hint. Exactly 4 columns and 4 rows, 16 equal square cells, each cell exactly 512 x 512 pixels. Rounded friendly shapes, bright readable colors, thick clean silhouette, consistent visual language, transparent RGBA background, no text, no numbers, no logo, no watermark.

## Export Naming

ใช้โครงสร้างนี้เพื่อให้ผมทำ sprite map และ config ต่อได้ง่าย

- assets/characters/lumin/lumin-bible.png
- assets/characters/lumin/lumin-spritesheet.png
- assets/characters/pix/pix-bible.png
- assets/characters/pix/pix-spritesheet.png
- assets/characters/maru/maru-bible.png
- assets/characters/maru/maru-spritesheet.png
- assets/characters/zen/zen-bible.png
- assets/characters/zen/zen-spritesheet.png
- assets/characters/glimshade/glimshade-bible.png
- assets/characters/glimshade/glimshade-spritesheet.png
- assets/vfx/equal-group-vfx.png
- assets/backgrounds/luminara-main.png
- assets/backgrounds/level-01-workshop-gate.png
- assets/backgrounds/level-02-crystal-canal.png
- assets/backgrounds/level-03-gear-garden.png
- assets/backgrounds/level-04-sky-battery-dock.png
- assets/backgrounds/level-05-festival-core.png
- assets/props/gameplay-props.png
- assets/ui/ui-icons.png

## Quality Gate ก่อนส่งไฟล์ให้ผม

- PNG ตัวละครและ props ต้องเป็นโปร่งใสจริงแบบ RGBA
- ห้ามมีพื้นดำ วงกลมดำ เงาก้อนใหญ่ หรือ halo สีดำติดมากับภาพ
- ห้ามมีตัวเลข ตัวหนังสือ หรือคำอธิบายในภาพ เพราะเกมจะ render เอง
- ขนาดทุก frame ใน sprite sheet ต้องเท่ากัน
- ตัวละครในทุก frame ต้องอยู่ scale ใกล้กันและจุดยืนใกล้กัน
- ห้ามครอปเท้า มือ หาง หมวก หรืออุปกรณ์
- ถ้ามีการสร้างหลายรอบ ให้ส่ง prompt ที่ใช้จริงมาด้วย เพื่อคุม style ต่อ

## สิ่งที่ผมจะทำต่อเมื่อได้ภาพ

- ตรวจ alpha channel และขอบดำของ PNG
- สร้าง sprite map JSON จากขนาดจริง
- ทำ animation state ให้ actor แต่ละตัว
- ผูก asset กับ config แบบ SSOT
- ทำระบบเลือกด่านและ reward ให้ต่อเนื่องกับ story
- ทดสอบบน browser ด้วย viewport หลายขนาด
