# TVC GENTADOX BIO-NANOSHIELD — OMNI-FLASH (JSON PROMPTS)

## ⚙️ Quy trình 2 bước
1. **Bước 1 – Sinh REF CONTEXT (Phần A):** dùng model tạo ảnh (Imagen/Nano-Banana...) chạy 3 prompt để có **1 nhân vật nữ cố định** + **2 bối cảnh chuồng** (bẩn/bệnh & sạch/khỏe). → khóa gương mặt, tông chuồng, để mọi scene đồng nhất.
2. **Bước 2 – Sinh VIDEO (Phần B):** mỗi scene JSON gắn **tối đa 3 ref** = (ref context + ref sản phẩm).

**Chuẩn chung:** 9:16 dọc · ≤10s/scene · Voice **Filipino/Tagalog** · Text on-screen **Filipino** · realistic farm · bao bì đúng ref, không méo tên/logo · không nói "chữa khỏi 100%", chỉ "suportahan/hỗ trợ".
**Nhân vật cố định:** `Dr. Maria` — nữ chuyên gia thú y, ~30 tuổi, người Philippines, áo blouse trắng, **tóc đen dài buông xõa qua vai** (khớp `Poster-Duoc-Si-Gioi-Thieu-San-Pham-Top-1.png`).

---

# PHẦN A — PROMPT TẠO REF CONTEXT (tạo ảnh trước)

### 🅰️ REF-A · Nhân vật nữ chuyên gia (character sheet)
> Photorealistic character reference sheet, vertical 9:16. A 30-year-old Filipino female veterinary expert named "Dr. Maria": warm friendly face, light-tan skin, long straight black hair worn down loose over the shoulders (not tied), thin modern glasses, clean white lab coat over a light blue shirt, small MEGATECH AgriVet logo on chest. Neutral confident smile. Three views in one image: front close-up portrait, 3/4 medium shot, full-body standing. Soft even studio lighting, plain light-gray background, consistent identity, high detail skin and hair texture. Use as a locked character reference for a video campaign.

### 🅱️ REF-B · Bối cảnh chuồng heo BẨN / BỆNH
> Photorealistic environment plate, vertical 9:16, interior of a real pig farm in the Philippines in a PROBLEM state: damp dirty concrete floor, dim overcast morning light through side openings, metal pen railings, straw scattered, muddy dark tones, humid heavy atmosphere. Empty of clear focal animals (background plate). Documentary realism, cool desaturated grade. Use as a consistent environment reference for the "problem" scenes.

### 🅲️ REF-C · Bối cảnh chuồng heo SẠCH / KHỎE
> Photorealistic environment plate, vertical 9:16, interior of the SAME pig farm but in a HEALTHY state: clean dry floor, bright airy natural daylight, sun rays through openings, fresh straw, tidy metal pens, warm optimistic tones, gentle god-rays and floating dust motes. Background plate. Clean documentary realism, warm grade. Use as the consistent "solution" environment reference.

> 💡 Sau khi có REF-A/B/C, đặt tên file: `REF-A-DrMaria.png`, `REF-B-Chuong-Benh.png`, `REF-C-Chuong-Khoe.png`.

---

# PHẦN B — 8 SCENE VIDEO (JSON)

## 🎬 CẢNH 1 — Hook: quy mô thiệt hại (wide, điện ảnh)
**Ref (2):** `REF-B-Chuong-Benh.png` · `Trieu-Chung-Heo-Bi-Tieu-Chay.png`
```json
{
  "scene_description": "A somber wide establishing shot revealing a dim pig farm where a herd lies weak and motionless. A worried farmer stands small in the frame. A colossal cinematic number '80%' materializes from drifting dust particles in the air, looms over the herd, then fractures and disintegrates — dramatizing the scale of loss.",
  "style": "Cinematic 4K, realistic documentary, film-grain, teal-and-amber somber grade, high dynamic range, premium TVC opener, emotional and tense",
  "camera_direction": "Slow low-angle dolly-in from a wide establishing shot, subtle handheld micro-shake, shallow depth of field, ending on a medium of the worried farmer",
  "lighting": "Natural overcast dawn light through side openings, cool soft key, volumetric light beams with visible dust, deep shadows, moody low-key",
  "voice": "V.O. Dr. Maria: \"Ang matinding pagtatae sa baboy ay maaaring magdulot ng hanggang 80% na pagkalugi kung hindi maaagapan sa tamang oras.\"",
  "SFX": "Low ominous cinematic drone, faint pig grunts, dripping water, a deep sub-bass hit and glassy shatter as the number breaks apart",
  "environment": "Interior of a real pig farm, damp dirty concrete floor, metal pens, humid heavy morning air, overcast weather",
  "element": [
    {
      "element_name_1": "A herd of pigs lying weak and listless across the dirty floor, rough coats, barely moving, conveying sickness",
      "element_name_2": "A Filipino farmer in green work clothes standing small mid-frame, shoulders slumped, looking over the herd with worry",
      "prop_name_1": "A giant volumetric 3D number '80%' formed of glowing dust particles hovering above the herd, then shattering into embers"
    }
  ],
  "motion": "Dust particles swirl in the light beams; the '80%' slowly assembles, pulses once, then violently fractures and rains down as glowing embers; the farmer exhales and lowers his head",
  "ending": "Hold one beat on the farmer's worried face, then a fast light-leak whip transition to the next scene",
  "text": "PAGTATAE = HANGGANG 80% PAGKALUGI",
  "keyword": ["cinematic wide shot", "volumetric dust", "kinetic 3D number", "particle shatter", "somber mood", "documentary realism", "light-leak transition"]
}
```

## 🎬 CẢNH 2 — Triệu chứng: macro lâm sàng (khác hẳn Cảnh 1)
**Ref (2):** `REF-B-Chuong-Benh.png` · `Trieu-Chung-Heo-Bi-Tieu-Chay.png`
```json
{
  "scene_description": "A clinical, up-close montage of diarrhea symptoms. Three rapid macro shots — a pig turning away from feed, a dehydrated trembling pig breathing hard, watery gray stool — each punctuated by an animated diagnostic HUD that draws thin lines and red warning ticks onto the symptom, like a vet's scan.",
  "style": "Cinematic macro, clinical realism, cool clinical grade, crisp high-detail, modern medical-tech overlay, fast-paced premium infomercial",
  "camera_direction": "Series of extreme close-ups and macro shots with fast rack-focus pulls between subjects, quick micro jump-cuts, slight snap-zoom into each symptom",
  "lighting": "Cool clinical daylight, soft directional key, subtle rim light separating the pig from the dark pen, crisp and even",
  "voice": "V.O. Dr. Maria: \"Kapag nagkaroon ng pagtatae, mabilis na nawawalan ng tubig ang katawan, humihina, at nawawalan ng gana sa pagkain.\"",
  "SFX": "Soft digital UI blips and scan sweeps, labored pig breathing, faint metallic feeder clink, subtle heartbeat pulse under the mix",
  "environment": "Same pig pen interior, tight framing on details, dark blurred background isolating each symptom",
  "element": [
    {
      "element_name_1": "A pig at the feeder turning its head away, refusing to eat, dull eyes",
      "element_name_2": "A dehydrated pig trembling, ribs faintly visible, sides heaving with heavy breathing",
      "prop_name_1": "Animated diagnostic HUD overlay — thin scan lines, circular reticles and glowing red warning ticks that snap onto each symptom"
    }
  ],
  "motion": "Rack focus snaps from one symptom to the next; HUD lines draw themselves and lock with a tick; the trembling pig's flank rises and falls; a bead of moisture drips in slow motion",
  "ending": "Quick glitch-cut on the final red tick, then a smooth match-dissolve pushing into the microscopic world of the next scene",
  "text": "Dehydration · Kawalan ng gana · Panghihina",
  "keyword": ["macro close-up", "rack focus", "diagnostic HUD overlay", "clinical grade", "micro jump-cut", "slow-motion detail", "medical tech"]
}
```

## 🎬 CẢNH 3 — Heo con trở nặng + nguyên nhân vi sinh
**Ref (2):** `REF-B-Chuong-Benh.png` · `Cuu-Heo-Con-Khoi-Tieu-Chay.png`
```json
{
  "scene_description": "Inside a farrowing pen, frail piglets huddle in a corner while one lies alone, dangerously weak. The camera drifts into a microscopic layer where semi-transparent 3D bacteria and viruses (E. coli, parasites) float menacingly, pulsing red, revealing the hidden cause.",
  "style": "Cinematic realism blended with elegant 3D micro-biology visualization, cool tense grade, shallow depth of field, premium science-documentary look",
  "camera_direction": "Slow tracking push-in from the huddled piglets, then a seamless scale transition (dolly-zoom feel) into a macro/microscopic layer with drifting particles",
  "lighting": "Dim cool natural light on the piglets, contrasted with an internal red-tinged glow illuminating the floating microbes, soft volumetric haze",
  "voice": "V.O. Dr. Maria: \"Lalo na sa mga biik, mabilis lumala. Karaniwang sanhi nito ang E. coli, mga virus, at parasito na sumisira sa sistema ng pagtunaw.\"",
  "SFX": "Faint weak piglet squeals, low tense ambient hum, subtle wet organic microscopic textures, a soft warning pulse",
  "environment": "Warm-but-dirty farrowing pen with straw, transitioning into an abstract dark microscopic space with depth and particles",
  "element": [
    {
      "element_name_1": "Newborn piglets huddling weakly in a corner, shivering, rough coats",
      "element_name_2": "One very frail piglet lying apart from the group, breathing shallowly",
      "prop_name_1": "Semi-transparent glowing 3D microorganisms (E. coli rods, spherical viruses, parasites) drifting with realistic depth of field, pulsing red"
    }
  ],
  "motion": "Piglets tremble and press together; camera glides into the micro-layer where microbes rotate and drift; red pulses ripple outward with each 'threat'",
  "ending": "The red micro-particles swirl and coalesce into a single bright point, which flares out into the bright product-reveal of the next scene",
  "text": "Delikado sa mga BIIK",
  "keyword": ["farrowing pen", "3D microbiology", "scale transition", "depth of field", "red warning glow", "science documentary", "particle coalesce"]
}
```

## 🎬 CẢNH 4 — Chuyên gia & sản phẩm xuất hiện (bước ngoặt sáng)
**Ref (3):** `REF-A-DrMaria.png` · `REF-C-Chuong-Khoe.png` · `Bao-Bi-San-Pham-Hop-Va-Goi.png`
```json
{
  "scene_description": "A bright tonal shift. Dr. Maria turns toward the camera inside a clean, sunlit farm and confidently presents the GENTADOX BIO-NANOSHIELD box and sachet. A soft anamorphic flare sweeps as the product catches a rim of light, and an elegant lower-third title animates in.",
  "style": "Premium commercial, warm trustworthy cinematic look, glossy 4K, soft bokeh, anamorphic flares, hopeful uplifting tone",
  "camera_direction": "Medium shot on Dr. Maria with a gentle push-in, a subtle focus pull from her face to the product she lifts toward the lens",
  "lighting": "Warm golden natural daylight, soft key on her face, bright airy fill, anamorphic horizontal lens flare as the product enters frame",
  "voice": "Dr. Maria: \"Kaya maraming farm ngayon ang gumagamit ng Gentadox Bio-NanoShield — makabagong produkto na gumagamit ng Bio-Nano Technology.\"",
  "SFX": "Warm uplifting music swell, a soft magical shimmer 'sparkle' as the flare hits the product, calm room tone",
  "environment": "Clean, bright, tidy pig farm interior with healthy pens softly blurred in the background",
  "element": [
    {
      "element_name_1": "Dr. Maria (match REF-A), white lab coat, warm confident smile, holding the product toward camera",
      "element_name_2": "Healthy pigs softly out of focus in the bright background, reinforcing trust",
      "prop_name_1": "GENTADOX BIO-NANOSHIELD box and sachet, packaging razor-sharp and exactly matching the reference, catching a rim of light"
    }
  ],
  "motion": "She turns and raises the product; a subtle sparkle travels across the pack; focus racks from her eyes to the label; lower-third title slides and fades in",
  "ending": "Hold on the crisp product in her hands, then a smooth product-led wipe into the mechanism scene",
  "text": "GENTADOX BIO-NANOSHIELD · Bio-Nano Technology",
  "keyword": ["premium commercial", "anamorphic flare", "focus pull", "product reveal", "warm grade", "character presenter", "lower-third title"]
}
```

## 🎬 CẢNH 5 — Cơ chế Bio-Nano (3D product + hologram)
**Ref (3):** `Hop-San-Pham-GENTADOX-Mat-Truoc.png` · `Poster-Cong-Nghe-Nano-NANOSHIELD.png` · `Poster-Ho-Tro-Ho-Hap-Tieu-Hoa-50G.png`
```json
{
  "scene_description": "A high-end product beauty sequence. The GENTADOX box rotates slowly on a light pedestal as green glowing nano particles form a protective shield around it. Powder pours in slow motion into a bucket of water and into feed; animated icons for digestion, immunity and respiration bloom with light.",
  "style": "Ultra-premium product commercial, glossy CGI-realistic, clean green-and-white brand palette, volumetric glow, 3D motion graphics, modern and hi-tech",
  "camera_direction": "Slow 3D orbit around the floating product, intercut with slow-motion macro of the pouring powder and mixing water, smooth crane moves",
  "lighting": "Bright clean studio key with soft gradient background, green accent glow from the nano shield, crisp highlights and gentle god-rays",
  "voice": "V.O. Dr. Maria: \"Tumutulong itong suportahan ang malusog na pagtunaw, mabawasan ang berde't puting pagtatae, palakasin ang resistensya, at suportahan ang paghinga.\"",
  "SFX": "Clean tech whooshes, sparkling particle chimes, slow-motion water pour and splash, soft synthy brand tone",
  "environment": "Abstract clean studio-like space with a soft green gradient, a subtle farm bokeh far behind",
  "element": [
    {
      "element_name_1": "GENTADOX BIO-NANOSHIELD box, hero-lit, slowly rotating on a glowing pedestal, label crisp and matching reference",
      "element_name_2": "A stream of powder pouring in slow motion into a bucket of clear water and into feed",
      "prop_name_1": "A green translucent 3D nano-shield hologram and drifting nano particles wrapping the product; glowing line-icons of gut, shield/immunity and lungs"
    }
  ],
  "motion": "Product orbits; nano particles swirl inward and lock into a shield; powder ribbons fall and dissolve into water; the three icons pop in sequence with a glow pulse",
  "ending": "The nano shield flares bright and dissolves into sunlight, cross-dissolving into the healthy-herd scene",
  "text": "Pagtunaw · Resistensya · Paghinga",
  "keyword": ["product beauty shot", "3D orbit", "nano particle shield", "slow-motion pour", "motion-graphic icons", "volumetric glow", "hi-tech commercial"]
}
```

## 🎬 CẢNH 6 — Kết quả: đàn heo khỏe (giải pháp)
**Ref (3):** `REF-C-Chuong-Khoe.png` · `Truoc-Va-Sau-Khi-Dung-Cho-Heo-Con.png` · `Cuu-Heo-Con-Khoi-Tieu-Chay.png`
```json
{
  "scene_description": "A joyful payoff. In the bright clean farm, healthy pigs eat eagerly and piglets walk energetically. A cinematic before/after morph-wipe transforms a weak piglet into a strong, lively one as warm sun flares fill the frame.",
  "style": "Uplifting cinematic, warm vibrant realistic grade, glossy 4K, gentle slow-motion, hopeful and lively premium TVC",
  "camera_direction": "Smooth low tracking shot gliding alongside eating pigs, then a slow-motion hero shot of a strong piglet, capped by a before/after morph-wipe",
  "lighting": "Bright warm natural daylight, golden god-rays through openings, soft lens flares, luminous and clean",
  "voice": "V.O. Dr. Maria: \"Dahil dito, mas malakas kumain ang mga baboy, mas mabilis makabawi, at mas maayos ang paglaki.\"",
  "SFX": "Cheerful energetic music, content pig grunts and eating sounds, light airy whoosh on the morph transition",
  "environment": "Clean dry bright pig pen with fresh straw, healthy herd, sunlit optimistic atmosphere",
  "element": [
    {
      "element_name_1": "Healthy active pigs eating eagerly at a clean trough, glossy coats",
      "element_name_2": "Energetic piglets walking and nursing, lively and strong",
      "prop_name_1": "A cinematic before/after morph-wipe visual that transforms a frail piglet into a robust healthy one"
    }
  ],
  "motion": "Camera glides along the feeding line; a piglet trots toward lens in slow motion; the morph-wipe sweeps across, brightening and strengthening the subject; sun flares bloom",
  "ending": "Hold on the strong piglet bathed in warm light, then a soft light-bloom cut to the advice scene",
  "text": "Malakas kumain · Mabilis makabawi",
  "keyword": ["uplifting payoff", "slow motion", "before-after morph", "warm sun flare", "tracking shot", "healthy herd", "vibrant grade"]
}
```

## 🎬 CẢNH 7 — Hành động sớm + liều dùng (tương tác)
**Ref (3):** `REF-A-DrMaria.png` · `Huong-Dan-Su-Dung-Chi-Tiet-Co-Icon.png` · `Bao-Bi-San-Pham-Hop-Va-Goi.png`
```json
{
  "scene_description": "Dr. Maria stands beside a smiling farmer in the bright farm, handing him a GENTADOX sachet and gesturing toward the healthy pigs. Clean animated dosage graphics (1g = 2L water) draw themselves beside them, reinforcing easy, timely care.",
  "style": "Warm reassuring commercial, natural documentary intimacy with clean motion-graphic overlays, bright hopeful grade, premium",
  "camera_direction": "Intimate medium two-shot, gentle handheld, slow push-in, brief cut to a close-up of the sachet passing between hands",
  "lighting": "Warm soft natural daylight, flattering key on both faces, bright airy fill",
  "voice": "Dr. Maria: \"Huwag hintayin lumala ang sakit. Ang maagap na pangangalaga sa unang senyales ay makababawas ng panganib at gastos.\"",
  "SFX": "Warm friendly music bed, light UI draw-on sounds for the dosage graphic, soft farm ambience",
  "environment": "Clean bright pig farm, healthy pens visible behind the two characters",
  "element": [
    {
      "element_name_1": "Dr. Maria (match REF-A) explaining warmly, handing over the sachet, confident and caring",
      "element_name_2": "A smiling Filipino farmer in green work clothes receiving the sachet, nodding with hope",
      "prop_name_1": "Clean animated dosage motion-graphic: a scoop '1g' equals a '2L' bucket icon, drawn in crisp green line-art"
    }
  ],
  "motion": "The sachet passes between hands; both look toward the healthy pigs; the dosage graphic draws itself and settles with a soft pop",
  "ending": "Warm hold on their confident smiles, then an energetic light-streak transition to the final CTA",
  "text": "Kumilos agad sa unang senyales",
  "keyword": ["character interaction", "handheld intimate", "motion-graphic dosage", "warm grade", "reassuring tone", "line-art icons", "hopeful"]
}
```

## 🎬 CẢNH 8 — End-card & CTA giỏ hàng (hero)
**Ref (3):** `Poster-San-Pham-Chinh-GENTADOX-BIO-NANOSHIELD.png` · `Bao-Bi-San-Pham-Hop-Va-Goi.png` · `REF-A-DrMaria.png`
```json
{
  "scene_description": "A polished end-card. The GENTADOX box and sachet stand hero on a glowing pedestal with a clean bright farm and healthy pigs behind; Dr. Maria smiles beside the product. Volumetric light, drifting particles and a 3D logo shine converge, then an animated shopping-cart icon bounces in with a glow as the CTA appears.",
  "style": "Ultra-premium brand end-card, glossy cinematic 4K, volumetric light, particle sparkle, 3D logo shine, confident and aspirational",
  "camera_direction": "Slow cinematic push-in / slight crane up centering the hero product, then settling into a locked brand lockup frame",
  "lighting": "Bright key with strong volumetric god-rays behind the product, warm rim light, sparkling highlights and gentle flares",
  "voice": "Dr. Maria: \"Gentadox Bio-NanoShield — katuwang sa malusog at matagumpay na pag-aalaga. I-click ang cart, mag-order na!\"",
  "SFX": "Triumphant music button/sting, sparkling particle chimes, a satisfying 'pop' and soft chime as the cart icon bounces in",
  "environment": "Bright clean farm softly blurred behind a hero product pedestal, aspirational and premium",
  "element": [
    {
      "element_name_1": "GENTADOX BIO-NANOSHIELD box and sachet, hero-lit on a glowing pedestal, packaging crisp and exactly matching reference",
      "element_name_2": "Dr. Maria (match REF-A) smiling beside the product, presenting it warmly",
      "prop_name_1": "An animated glowing shopping-cart icon that bounces in, plus a 3D shining brand logo and drifting light particles"
    }
  ],
  "motion": "God-rays and particles drift; the logo catches a traveling shine; the cart icon bounces in with a glow; CTA text kinetically pops on",
  "ending": "Hold on the full brand lockup for a beat, then a clean fade-out to end the TVC",
  "text": "GENTADOX BIO-NANOSHIELD · I-order na! 🛒",
  "keyword": ["brand end-card", "hero product", "volumetric god-rays", "3D logo shine", "animated CTA cart", "kinetic typography", "aspirational"]
}
```

---

## 📋 Bảng gán REF (≤3/scene)
| Cảnh | Nội dung | Ref context | Ref sản phẩm |
|------|----------|-------------|--------------|
| 1 | Hook 80% | REF-B | Trieu-Chung |
| 2 | Triệu chứng macro | REF-B | Trieu-Chung |
| 3 | Heo con + vi sinh | REF-B | Cuu-Heo-Con |
| 4 | Chuyên gia ra mắt | REF-A + REF-C | Bao-Bi |
| 5 | Cơ chế Bio-Nano | — | Hop-Mat-Truoc + Nano + Ho-Hap-50G |
| 6 | Kết quả heo khỏe | REF-C | Truoc-Va-Sau + Cuu-Heo-Con |
| 7 | Hành động + liều dùng | REF-A | Huong-Dan-Icon + Bao-Bi |
| 8 | End-card CTA | REF-A | Poster-Chinh + Bao-Bi |

**Đồng nhất:** REF-A giữ 1 gương mặt/giọng nữ xuyên suốt · REF-B/C giữ 1 chuồng (bẩn→sạch) · ref sản phẩm luôn là ảnh bao bì nét để khóa tên/logo.
